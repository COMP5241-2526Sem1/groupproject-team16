const express = require('express');
const router = express.Router();
const uploadMiddleware = require('../middleware/upload');
const path = require('path');
const fs = require('fs');
const OSSClient = require('../utils/oss-client');
const ossConfig = require('../utils/oss-config');
const { getPrisma } = require('../utils/prisma');
const prisma = getPrisma();
const ossLog=(step,meta={})=>console.log(`[OSS-UPLOAD] ${step}`,meta);

const ossClient = ossConfig.accessKeyId && ossConfig.accessKeySecret && ossConfig.bucket 
  ? new OSSClient(ossConfig.accessKeyId, ossConfig.accessKeySecret, ossConfig.bucket, ossConfig.region, ossConfig.prefix)
  : null;

// 获取基础 URL（根据环境自动判断）
function getBaseUrl(req) {
  // 在 Vercel 环境中，使用请求的 host
  if (process.env.VERCEL) {
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    return `${protocol}://${host}`;
  }
  
  // 使用环境变量（如果设置）
  if (process.env.APP_URL) {
    return process.env.APP_URL;
  }
  
  // 本地开发环境
  return `http://localhost:${process.env.PORT || 3001}`;
}

// 单文件上传
router.post('/single', uploadMiddleware.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '未选择文件' });
    }

    const baseUrl = getBaseUrl(req);
    const filePath = `/uploads/${path.basename(path.dirname(req.file.path))}/${req.file.filename}`;

    res.json({
      success: true,
      message: '文件上传成功',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: filePath,
        url: `${baseUrl}${filePath}`
      }
    });
  } catch (error) {
    res.status(500).json({ error: '上传失败', message: error.message });
  }
});

// 多文件上传
router.post('/multiple', uploadMiddleware.array('files', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: '未选择文件' });
    }

    const baseUrl = getBaseUrl(req);
    const files = req.files.map(file => {
      const filePath = `/uploads/${path.basename(path.dirname(file.path))}/${file.filename}`;
      return {
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: filePath,
        url: `${baseUrl}${filePath}`
      };
    });

    res.json({
      success: true,
      message: `成功上传 ${files.length} 个文件`,
      files: files
    });
  } catch (error) {
    res.status(500).json({ error: '上传失败', message: error.message });
  }
});

// 作业文件上传
router.post('/homework', uploadMiddleware.single('homework'), async (req, res) => {
  try {
    ossLog('homework-start',{courseId:req.body.courseId,homeworkId:req.body.homeworkId,studentId:req.body.studentId,hasFile:!!req.file,ossReady:!!ossClient});
    if (!req.file) return res.status(400).json({ error: '未选择作业文件' });
    if (!ossClient){
      ossLog('homework-missing-oss',{env:Object.keys(process.env).filter(k=>k.startsWith('OSS_'))});
      return res.status(500).json({ error: 'OSS未配置，请设置OSS环境变量' });
    }
    const { studentId, homeworkId, courseId } = req.body;
    if (!studentId || !homeworkId || !courseId) return res.status(400).json({ error: '缺少必填参数' });
    
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return res.status(404).json({ error: '课程不存在' });
    
    const homework = await prisma.homework.findUnique({ where: { id: homeworkId } });
    if (!homework) return res.status(404).json({ error: '作业不存在' });
    
    const courseName = course.name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(req.file.originalname);
    const basename = path.basename(req.file.originalname, ext);
    const ossFileName = `homework/${courseName}/${homeworkId}/${studentId}-${basename}-${uniqueSuffix}${ext}`;
    
    ossLog('homework-uploading',{local:req.file.path,oss:ossFileName});
    const uploadResult = await ossClient.uploadFile(req.file.path, ossFileName);
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    
    const fileUrl = await ossClient.getFileUrl(ossFileName, 3600 * 24 * 7);
    
    res.json({
      success: true,
      message: '作业上传成功',
      submission: {
        studentId,
        homeworkId,
        file: {
          filename: req.file.originalname,
          originalname: req.file.originalname,
          size: req.file.size,
          url: fileUrl,
          ossPath: ossFileName
        },
        submittedAt: new Date().toISOString()
      }
    });
    ossLog('homework-success',{ossPath:ossFileName,url:fileUrl});
  } catch (error) {
    ossLog('homework-error',{msg:error.message,stack:error.stack});
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: '上传失败', message: error.message });
  }
});

// 课程资源上传
router.post('/resource', uploadMiddleware.single('resource'), async (req, res) => {
  try {
    ossLog('resource-start',{courseId:req.body.courseId,name:req.body.name,hasFile:!!req.file,ossReady:!!ossClient});
    if (!req.file) return res.status(400).json({ error: '未选择资源文件' });
    if (!ossClient){
      ossLog('resource-missing-oss',{env:Object.keys(process.env).filter(k=>k.startsWith('OSS_'))});
      return res.status(500).json({ error: 'OSS未配置，请设置OSS环境变量' });
    }
    const { courseId, name, description } = req.body;
    if (!courseId) return res.status(400).json({ error: '课程ID不能为空' });
    
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return res.status(404).json({ error: '课程不存在' });
    
    const courseName = course.name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_'); // 清理课程名作为前缀
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(req.file.originalname);
    const basename = path.basename(req.file.originalname, ext);
    const ossFileName = `${courseName}/${basename}-${uniqueSuffix}${ext}`;
    
    ossLog('resource-uploading',{local:req.file.path,oss:ossFileName});
    const uploadResult = await ossClient.uploadFile(req.file.path, ossFileName);
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path); // 删除临时文件
    
    const fileType = ext.slice(1).toLowerCase() || 'file';
    const fileUrl = await ossClient.getFileUrl(ossFileName, 3600 * 24 * 7); // 7天有效期
    
    const resource = await prisma.courseResource.create({
      data: {
        courseId,
        name: name || req.file.originalname,
        type: fileType,
        fileUrl: ossFileName, // 存储 OSS 路径，用于删除和获取 URL
        size: req.file.size,
        downloads: 0
      }
    });
    
    ossLog('resource-success',{resourceId:resource.id,ossPath:ossFileName});
    res.json({
      success: true,
      message: '资源上传成功',
      resource: {
        id: resource.id,
        courseId: resource.courseId,
        name: resource.name,
        type: resource.type,
        size: resource.size,
        url: fileUrl,
        uploadedAt: resource.uploadedAt.toISOString()
      }
    });
  } catch (error) {
    ossLog('resource-error',{msg:error.message,stack:error.stack});
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: '上传失败', message: error.message });
  }
});

module.exports = router;


const express = require('express');
const router = express.Router();
const uploadMiddleware = require('../middleware/upload');
const path = require('path');

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
router.post('/homework', uploadMiddleware.single('homework'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '未选择作业文件' });
    }

    const { studentId, homeworkId } = req.body;
    const baseUrl = getBaseUrl(req);
    const filePath = `/uploads/${path.basename(path.dirname(req.file.path))}/${req.file.filename}`;

    res.json({
      success: true,
      message: '作业上传成功',
      submission: {
        studentId,
        homeworkId,
        file: {
          filename: req.file.filename,
          originalname: req.file.originalname,
          size: req.file.size,
          url: `${baseUrl}${filePath}`
        },
        submittedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ error: '上传失败', message: error.message });
  }
});

// 课程资源上传
router.post('/resource', uploadMiddleware.single('resource'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '未选择资源文件' });
    }

    const { courseId, name, description } = req.body;
    const baseUrl = getBaseUrl(req);
    const filePath = `/uploads/${path.basename(path.dirname(req.file.path))}/${req.file.filename}`;

    res.json({
      success: true,
      message: '资源上传成功',
      resource: {
        courseId,
        name: name || req.file.originalname,
        description,
        type: req.file.mimetype,
        size: req.file.size,
        url: `${baseUrl}${filePath}`,
        uploadedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ error: '上传失败', message: error.message });
  }
});

module.exports = router;


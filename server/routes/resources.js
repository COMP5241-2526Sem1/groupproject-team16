const express = require('express');
const router = express.Router();
const { getPrisma } = require('../utils/prisma');
const { authenticateToken } = require('../middleware/auth');
const OSSClient = require('../utils/oss-client');
const ossConfig = require('../utils/oss-config');
const prisma = getPrisma();
const ossClient = ossConfig.accessKeyId && ossConfig.accessKeySecret && ossConfig.bucket 
  ? new OSSClient(ossConfig.accessKeyId, ossConfig.accessKeySecret, ossConfig.bucket, ossConfig.region, ossConfig.prefix)
  : null;

// 格式化文件大小
const formatSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

// 获取所有资源
router.get('/', async (req, res) => {
  try {
    const { courseId, type, search } = req.query;
    const where = {};
    
    if (courseId) where.courseId = courseId; // 必须提供 courseId 才能查看资源
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } }
      ];
    }

    const resources = await prisma.courseResource.findMany({
      where,
      include: {
        course: {
          include: {
            teacher: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: { uploadedAt: 'desc' }
    });

    const data = await Promise.all(resources.map(async (resource) => {
      let url = resource.fileUrl;
      try {
        // 如果 fileUrl 是 OSS 路径，生成签名 URL
        if (ossClient && !url.startsWith('http')) {
          url = await ossClient.getFileUrl(resource.fileUrl, 3600 * 24 * 7); // 7天有效期
        }
      } catch (e) {
        console.warn(`生成 OSS URL 失败 (资源ID: ${resource.id}, 路径: ${resource.fileUrl}):`, e.message);
        url = resource.fileUrl; // 使用原始路径
      }
      return {
        id: resource.id,
        courseId: resource.courseId,
        name: resource.name,
        type: resource.type,
        size: resource.size,
        sizeFormatted: formatSize(resource.size),
        url: url,
        course: resource.course.name,
        uploadedBy: resource.course.teacher.name,
        uploadedById: resource.course.teacher.id,
        uploadedAt: resource.uploadedAt.toISOString(),
        downloads: resource.downloads,
        description: ''
      };
    }));

    res.json({ success: true, data, total: data.length });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ error: '获取资源列表失败', message: error.message });
  }
});

// 获取单个资源
router.get('/:id', async (req, res) => {
  try {
    const resource = await prisma.courseResource.findUnique({
      where: { id: req.params.id },
      include: {
        course: {
          include: {
            teacher: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });

    if (!resource) {
      return res.status(404).json({ error: '资源不存在' });
    }

    let url = resource.fileUrl;
    try {
      if (ossClient && !url.startsWith('http')) {
        url = await ossClient.getFileUrl(resource.fileUrl, 3600 * 24 * 7);
      }
    } catch (e) {
      console.warn(`生成 OSS URL 失败 (资源ID: ${resource.id}, 路径: ${resource.fileUrl}):`, e.message);
      url = resource.fileUrl; // 使用原始路径
    }

    const data = {
      id: resource.id,
      courseId: resource.courseId,
      name: resource.name,
      type: resource.type,
      size: resource.size,
      sizeFormatted: formatSize(resource.size),
      url: url,
      course: resource.course.name,
      uploadedBy: resource.course.teacher.name,
      uploadedById: resource.course.teacher.id,
      uploadedAt: resource.uploadedAt.toISOString(),
      downloads: resource.downloads,
      description: ''
    };

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).json({ error: '获取资源详情失败', message: error.message });
  }
});

// 创建资源（上传后创建记录）
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, type, size, url, courseId, description } = req.body;
    if (!name || !url) {
      return res.status(400).json({ error: '资源名称和URL不能为空' });
    }

    const resource = await prisma.courseResource.create({
      data: {
        courseId: courseId || req.user?.courseId || '1',
        name,
        type: type || 'file',
        fileUrl: url,
        size: size || 0,
        downloads: 0
      },
      include: {
        course: {
          include: {
            teacher: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });

    const data = {
      id: resource.id,
      courseId: resource.courseId,
      name: resource.name,
      type: resource.type,
      size: resource.size,
      sizeFormatted: formatSize(resource.size),
      url: resource.fileUrl,
      course: resource.course.name,
      uploadedBy: resource.course.teacher.name,
      uploadedById: resource.course.teacher.id,
      uploadedAt: resource.uploadedAt.toISOString(),
      downloads: 0,
      description: description || ''
    };

    res.status(201).json({ success: true, data, message: '资源创建成功' });
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({ error: '资源创建失败', message: error.message });
  }
});

// 更新资源
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    const updateData = {};
    
    if (name) updateData.name = name;

    const resource = await prisma.courseResource.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        course: {
          include: {
            teacher: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });

    const data = {
      id: resource.id,
      courseId: resource.courseId,
      name: resource.name,
      type: resource.type,
      size: resource.size,
      sizeFormatted: formatSize(resource.size),
      url: resource.fileUrl,
      course: resource.course.name,
      uploadedBy: resource.course.teacher.name,
      uploadedById: resource.course.teacher.id,
      uploadedAt: resource.uploadedAt.toISOString(),
      downloads: resource.downloads,
      description: ''
    };

    res.json({ success: true, data, message: '资源更新成功' });
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({ error: '资源更新失败', message: error.message });
  }
});

// 删除资源
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const resource = await prisma.courseResource.findUnique({ where: { id: req.params.id } });
    if (!resource) return res.status(404).json({ error: '资源不存在' });
    
    // 从 OSS 删除文件
    if (ossClient) {
      try {
        let ossPath = resource.fileUrl;
        // 如果 fileUrl 是完整 URL，提取路径
        if (ossPath.startsWith('http')) {
          try {
            const url = new URL(ossPath);
            const pathParts = url.pathname.split('/').filter(p => p);
            ossPath = pathParts.slice(-2).join('/'); // 获取课程名/文件名
          } catch {}
        }
        await ossClient.deleteFile(ossPath);
      } catch (e) {
        console.warn('OSS删除失败，继续删除数据库记录:', e.message);
      }
    }
    
    await prisma.courseResource.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: '资源删除成功' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ error: '资源删除失败', message: error.message });
  }
});

// 记录下载
router.post('/:id/download', async (req, res) => {
  try {
    const resource = await prisma.courseResource.update({
      where: { id: req.params.id },
      data: {
        downloads: { increment: 1 }
      }
    });
    res.json({ success: true, data: { downloads: resource.downloads }, message: '下载成功' });
  } catch (error) {
    console.error('Error recording download:', error);
    res.status(500).json({ error: '记录下载失败', message: error.message });
  }
});

// 下载文件（从OSS获取文件流）
router.get('/:id/download', async (req, res) => {
  try {
    const resource = await prisma.courseResource.findUnique({ where: { id: req.params.id } });
    if (!resource) return res.status(404).json({ error: '资源不存在' });
    
    if (!ossClient) {
      return res.status(500).json({ error: 'OSS未配置' });
    }
    
    // 从OSS获取文件流
    const ossPath = resource.fileUrl; // fileUrl存储的是OSS路径（如：课程名/文件名）
    console.log(`尝试从OSS下载文件，路径: ${ossPath}`);
    
    try {
      const fileStream = await ossClient.getFileStream(ossPath);
      
      // 设置下载响应头
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(resource.name)}"`);
      res.setHeader('Content-Type', fileStream.res.headers['content-type'] || 'application/octet-stream');
      if (fileStream.res.headers['content-length']) {
        res.setHeader('Content-Length', fileStream.res.headers['content-length']);
      }
      
      // 将OSS文件流管道到响应
      fileStream.stream.pipe(res);
      
      // 记录下载次数（异步，不阻塞响应）
      prisma.courseResource.update({
        where: { id: req.params.id },
        data: { downloads: { increment: 1 } }
      }).catch(e => console.warn('记录下载次数失败:', e.message));
    } catch (ossError) {
      console.error(`OSS获取文件流失败 (路径: ${ossPath}):`, ossError.message);
      // 如果OSS获取失败，尝试生成签名URL并重定向
      try {
        const fileUrl = await ossClient.getFileUrl(ossPath, 3600);
        res.redirect(fileUrl);
      } catch (urlError) {
        console.error('生成下载URL也失败:', urlError.message);
        res.status(500).json({ error: '下载失败', message: `OSS错误: ${ossError.message}` });
      }
    }
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: '下载失败', message: error.message });
  }
});

// 获取资源统计
router.get('/stats/overview', async (req, res) => {
  try {
    const { courseId } = req.query;
    const where = courseId ? { courseId } : {};

    const resources = await prisma.courseResource.findMany({ where });

    const stats = {
      total: resources.length,
      pdf: resources.filter(r => r.type === 'pdf').length,
      video: resources.filter(r => r.type === 'video').length,
      ppt: resources.filter(r => r.type === 'ppt' || r.type === 'pptx').length,
      doc: resources.filter(r => r.type === 'doc' || r.type === 'docx').length,
      other: resources.filter(r => !['pdf', 'video', 'ppt', 'pptx', 'doc', 'docx'].includes(r.type)).length,
      totalDownloads: resources.reduce((sum, r) => sum + r.downloads, 0),
      totalSize: resources.reduce((sum, r) => sum + r.size, 0)
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching resource stats:', error);
    res.status(500).json({ error: '获取统计失败', message: error.message });
  }
});

module.exports = router;

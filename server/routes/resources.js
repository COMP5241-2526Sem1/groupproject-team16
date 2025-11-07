const express = require('express');
const router = express.Router();
const { getPrisma } = require('../utils/prisma');
const { authenticateToken } = require('../middleware/auth');
const prisma = getPrisma();

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
    
    if (courseId) where.courseId = courseId;
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

    const data = resources.map(resource => ({
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
      description: '' // schema中没有description字段
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

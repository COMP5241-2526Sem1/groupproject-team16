const express = require('express');
const router = express.Router();
const { getPrisma } = require('../utils/prisma');
const { authenticateToken } = require('../middleware/auth');
const prisma = getPrisma();

// 获取所有讨论（只获取主帖子，不包含回复）
router.get('/', async (req, res) => {
  try {
    const { courseId } = req.query;
    const where = {
      parentId: null, // 只获取主帖子
      ...(courseId && { courseId })
    };

    const posts = await prisma.discussionPost.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, avatar: true }
        },
        replies: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true }
            }
          }
        }
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    const data = posts.map(post => ({
      id: post.id,
      courseId: post.courseId,
      title: post.title,
      content: post.content,
      author: post.user.name,
      authorId: post.user.id,
      avatar: post.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user.id}`,
      createdAt: post.createdAt.toISOString(),
      isPinned: post.isPinned,
      likes: post.likes,
      replies: post.replies.length,
      tags: [], // schema中没有tags字段，可以后续扩展
      replyList: post.replies.map(reply => ({
        id: reply.id,
        author: reply.user.name,
        authorId: reply.user.id,
        avatar: reply.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.user.id}`,
        content: reply.content,
        createdAt: reply.createdAt.toISOString(),
        likes: reply.likes
      }))
    }));

    res.json({ success: true, data, total: data.length });
  } catch (error) {
    console.error('Error fetching discussions:', error);
    res.status(500).json({ error: '获取讨论列表失败', message: error.message });
  }
});

// 获取单个讨论
router.get('/:id', async (req, res) => {
  try {
    const post = await prisma.discussionPost.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: { id: true, name: true, avatar: true }
        },
        replies: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!post) {
      return res.status(404).json({ error: '讨论不存在' });
    }

    const data = {
      id: post.id,
      courseId: post.courseId,
      title: post.title,
      content: post.content,
      author: post.user.name,
      authorId: post.user.id,
      avatar: post.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user.id}`,
      createdAt: post.createdAt.toISOString(),
      isPinned: post.isPinned,
      likes: post.likes,
      replies: post.replies.length,
      tags: [],
      replyList: post.replies.map(reply => ({
        id: reply.id,
        author: reply.user.name,
        authorId: reply.user.id,
        avatar: reply.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.user.id}`,
        content: reply.content,
        createdAt: reply.createdAt.toISOString(),
        likes: reply.likes
      }))
    };

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching discussion:', error);
    res.status(500).json({ error: '获取讨论详情失败', message: error.message });
  }
});

// 创建讨论
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, content, tags, courseId } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: '标题和内容不能为空' });
    }

    const userId = req.user?.userId;
    if (!userId) {
      return res.status(400).json({ error: '缺少用户ID' });
    }

    const post = await prisma.discussionPost.create({
      data: {
        courseId: courseId || req.user?.courseId || '1',
        userId,
        title,
        content,
        isPinned: false,
        likes: 0
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });

    const data = {
      id: post.id,
      courseId: post.courseId,
      title: post.title,
      content: post.content,
      author: post.user.name,
      authorId: post.user.id,
      avatar: post.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user.id}`,
      createdAt: post.createdAt.toISOString(),
      isPinned: post.isPinned,
      likes: post.likes,
      replies: 0,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()).filter(t => t)) : [],
      replyList: []
    };

    res.status(201).json({ success: true, data, message: '讨论发布成功' });
  } catch (error) {
    console.error('Error creating discussion:', error);
    res.status(500).json({ error: '发布讨论失败', message: error.message });
  }
});

// 更新讨论
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, content } = req.body;
    const updateData = {};
    
    if (title) updateData.title = title;
    if (content) updateData.content = content;

    const post = await prisma.discussionPost.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, avatar: true }
        },
        replies: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true }
            }
          }
        }
      }
    });

    const data = {
      id: post.id,
      courseId: post.courseId,
      title: post.title,
      content: post.content,
      author: post.user.name,
      authorId: post.user.id,
      avatar: post.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user.id}`,
      createdAt: post.createdAt.toISOString(),
      isPinned: post.isPinned,
      likes: post.likes,
      replies: post.replies.length,
      tags: [],
      replyList: []
    };

    res.json({ success: true, data, message: '讨论更新成功' });
  } catch (error) {
    console.error('Error updating discussion:', error);
    res.status(500).json({ error: '更新讨论失败', message: error.message });
  }
});

// 删除讨论
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // 删除所有回复
    await prisma.discussionPost.deleteMany({
      where: { parentId: req.params.id }
    });
    
    // 删除主帖子
    await prisma.discussionPost.delete({
      where: { id: req.params.id }
    });

    res.json({ success: true, message: '讨论删除成功' });
  } catch (error) {
    console.error('Error deleting discussion:', error);
    res.status(500).json({ error: '删除讨论失败', message: error.message });
  }
});

// 点赞讨论
router.post('/:id/like', async (req, res) => {
  try {
    const post = await prisma.discussionPost.update({
      where: { id: req.params.id },
      data: {
        likes: { increment: 1 }
      }
    });

    res.json({ success: true, data: { likes: post.likes }, message: '点赞成功' });
  } catch (error) {
    console.error('Error liking discussion:', error);
    res.status(500).json({ error: '点赞失败', message: error.message });
  }
});

// 取消点赞讨论
router.post('/:id/unlike', async (req, res) => {
  try {
    const post = await prisma.discussionPost.update({
      where: { id: req.params.id },
      data: {
        likes: { decrement: 1 }
      }
    });

    res.json({ success: true, data: { likes: Math.max(0, post.likes) }, message: '取消点赞成功' });
  } catch (error) {
    console.error('Error unliking discussion:', error);
    res.status(500).json({ error: '取消点赞失败', message: error.message });
  }
});

// 置顶/取消置顶讨论
router.post('/:id/pin', authenticateToken, async (req, res) => {
  try {
    const post = await prisma.discussionPost.findUnique({
      where: { id: req.params.id }
    });

    if (!post) {
      return res.status(404).json({ error: '讨论不存在' });
    }

    const updated = await prisma.discussionPost.update({
      where: { id: req.params.id },
      data: {
        isPinned: !post.isPinned
      }
    });

    res.json({
      success: true,
      data: { isPinned: updated.isPinned },
      message: updated.isPinned ? '已置顶' : '已取消置顶'
    });
  } catch (error) {
    console.error('Error pinning discussion:', error);
    res.status(500).json({ error: '操作失败', message: error.message });
  }
});

// 回复讨论
router.post('/:id/reply', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: '回复内容不能为空' });
    }

    const userId = req.user?.userId;
    if (!userId) {
      return res.status(400).json({ error: '缺少用户ID' });
    }

    // 检查主帖子是否存在
    const parentPost = await prisma.discussionPost.findUnique({
      where: { id: req.params.id }
    });

    if (!parentPost) {
      return res.status(404).json({ error: '讨论不存在' });
    }

    const reply = await prisma.discussionPost.create({
      data: {
        courseId: parentPost.courseId,
        userId,
        title: '', // 回复没有标题
        content,
        parentId: req.params.id,
        isPinned: false,
        likes: 0
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });

    const data = {
      id: reply.id,
      author: reply.user.name,
      authorId: reply.user.id,
      avatar: reply.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.user.id}`,
      content: reply.content,
      createdAt: reply.createdAt.toISOString(),
      likes: reply.likes
    };

    res.status(201).json({ success: true, data, message: '回复成功' });
  } catch (error) {
    console.error('Error replying to discussion:', error);
    res.status(500).json({ error: '回复失败', message: error.message });
  }
});

// 点赞回复
router.post('/:id/reply/:replyId/like', async (req, res) => {
  try {
    const reply = await prisma.discussionPost.update({
      where: { id: req.params.replyId },
      data: {
        likes: { increment: 1 }
      }
    });

    res.json({ success: true, data: { likes: reply.likes }, message: '点赞成功' });
  } catch (error) {
    console.error('Error liking reply:', error);
    res.status(500).json({ error: '点赞失败', message: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();

// 模拟课程数据
const courses = [
  {
    id: '1',
    name: '机器学习基础',
    description: '深入学习机器学习的核心算法与应用',
    teacherId: '1',
    teacherName: '张教授',
    students: 45,
    startDate: '2025-09-01',
    status: 'ACTIVE',
    progress: 65
  },
  {
    id: '2',
    name: '数据结构与算法',
    description: '掌握常用数据结构及算法设计技巧',
    teacherId: '1',
    teacherName: '李老师',
    students: 52,
    startDate: '2025-09-01',
    status: 'ACTIVE',
    progress: 78
  },
  {
    id: '3',
    name: 'Web全栈开发',
    description: '从前端到后端的完整Web开发实战',
    teacherId: '1',
    teacherName: '王老师',
    students: 38,
    startDate: '2025-09-15',
    status: 'ACTIVE',
    progress: 42
  }
];

// 获取所有课程
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: courses,
      total: courses.length
    });
  } catch (error) {
    res.status(500).json({ error: '获取课程列表失败', message: error.message });
  }
});

// 获取单个课程
router.get('/:id', (req, res) => {
  try {
    const course = courses.find(c => c.id === req.params.id);
    
    if (!course) {
      return res.status(404).json({ error: '课程不存在' });
    }

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(500).json({ error: '获取课程详情失败', message: error.message });
  }
});

// 创建课程
router.post('/', (req, res) => {
  try {
    const { name, description, startDate } = req.body;

    if (!name) {
      return res.status(400).json({ error: '课程名称不能为空' });
    }

    const newCourse = {
      id: String(courses.length + 1),
      name,
      description: description || '',
      teacherId: '1', // 应从JWT token获取
      teacherName: '张教授',
      students: 0,
      startDate: startDate || new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      progress: 0
    };

    courses.push(newCourse);

    res.status(201).json({
      success: true,
      message: '课程创建成功',
      data: newCourse
    });
  } catch (error) {
    res.status(500).json({ error: '创建课程失败', message: error.message });
  }
});

// 更新课程
router.put('/:id', (req, res) => {
  try {
    const courseIndex = courses.findIndex(c => c.id === req.params.id);
    
    if (courseIndex === -1) {
      return res.status(404).json({ error: '课程不存在' });
    }

    const { name, description, status } = req.body;

    if (name) courses[courseIndex].name = name;
    if (description) courses[courseIndex].description = description;
    if (status) courses[courseIndex].status = status;

    res.json({
      success: true,
      message: '课程更新成功',
      data: courses[courseIndex]
    });
  } catch (error) {
    res.status(500).json({ error: '更新课程失败', message: error.message });
  }
});

// 删除课程
router.delete('/:id', (req, res) => {
  try {
    const courseIndex = courses.findIndex(c => c.id === req.params.id);
    
    if (courseIndex === -1) {
      return res.status(404).json({ error: '课程不存在' });
    }

    courses.splice(courseIndex, 1);

    res.json({
      success: true,
      message: '课程删除成功'
    });
  } catch (error) {
    res.status(500).json({ error: '删除课程失败', message: error.message });
  }
});

// 加入课程
router.post('/:id/enroll', (req, res) => {
  try {
    const course = courses.find(c => c.id === req.params.id);
    
    if (!course) {
      return res.status(404).json({ error: '课程不存在' });
    }

    course.students += 1;

    res.json({
      success: true,
      message: '加入课程成功',
      data: course
    });
  } catch (error) {
    res.status(500).json({ error: '加入课程失败', message: error.message });
  }
});

module.exports = router;


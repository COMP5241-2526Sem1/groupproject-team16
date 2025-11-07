const express = require('express');
const router = express.Router();
const { getPrisma } = require('../utils/prisma');
const prisma = getPrisma();

// 获取仪表板数据
router.get('/dashboard', async (req, res) => {
  try {
    const { courseId } = req.query;

    // 获取课程统计
    const courses = await prisma.course.findMany({
      include: {
        students: true
      }
    });

    // 获取作业统计
    const homeworks = await prisma.homework.findMany({
      include: {
        submissions: true
      }
    });

    // 获取测验统计
    const quizzes = await prisma.quiz.findMany({
      include: {
        submissions: true
      }
    });

    // 计算统计数据
    const activeCourses = courses.filter(c => c.status === 'ACTIVE').length;
    const enrolledStudents = courses.reduce((sum, c) => sum + c.students.length, 0);
    const pendingGrading = homeworks.reduce((sum, hw) => {
      return sum + hw.submissions.filter(s => s.score === null).length;
    }, 0);
    const weeklyQuizzes = quizzes.length;

    // 课程数据（前5个）
    const courseData = courses.slice(0, 5).map(course => ({
      name: course.name,
      students: course.students.length,
      completion: 75 // 可以后续计算实际完成度
    }));

    // 活动数据（模拟，可以后续从实际日志中获取）
    const activityData = [
      { day: '周一', submissions: 12, logins: 45 },
      { day: '周二', submissions: 19, logins: 52 },
      { day: '周三', submissions: 15, logins: 48 },
      { day: '周四', submissions: 22, logins: 58 },
      { day: '周五', submissions: 28, logins: 65 },
      { day: '周六', submissions: 8, logins: 25 },
      { day: '周日', submissions: 5, logins: 18 }
    ];

    // 最近活动（模拟）
    const recentActivities = [
      { user: '张三', action: '提交了作业', course: '机器学习基础', time: '5分钟前' },
      { user: '李四', action: '完成了测验', course: 'Web开发实战', time: '15分钟前' },
      { user: '王五', action: '发起了讨论', course: '数据结构', time: '1小时前' },
      { user: '赵六', action: '上传了资源', course: '算法设计', time: '2小时前' }
    ];

    res.json({
      success: true,
      data: {
        stats: {
          activeCourses,
          enrolledStudents,
          pendingGrading,
          weeklyQuizzes
        },
        courseData,
        activityData,
        recentActivities
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: '获取仪表板数据失败', message: error.message });
  }
});

// 获取成绩分布数据
router.get('/grades/distribution', async (req, res) => {
  try {
    // 从作业提交中获取成绩
    const submissions = await prisma.homeworkSubmission.findMany({
      where: {
        score: { not: null }
      },
      select: {
        score: true
      }
    });

    // 计算成绩分布
    const distribution = {
      '0-59': 0,
      '60-69': 0,
      '70-79': 0,
      '80-89': 0,
      '90-100': 0
    };

    submissions.forEach(sub => {
      const score = sub.score;
      if (score < 60) distribution['0-59']++;
      else if (score < 70) distribution['60-69']++;
      else if (score < 80) distribution['70-79']++;
      else if (score < 90) distribution['80-89']++;
      else distribution['90-100']++;
    });

    const total = submissions.length;
    const data = Object.entries(distribution).map(([range, count]) => ({
      range,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching grade distribution:', error);
    res.status(500).json({ error: '获取成绩分布失败', message: error.message });
  }
});

// 获取作业提交趋势
router.get('/homework/trend', async (req, res) => {
  try {
    // 这里简化处理，返回模拟数据
    // 实际应该按周分组统计
    const submissionTrend = [
      { week: '第1周', onTime: 42, late: 3, missing: 0 },
      { week: '第2周', onTime: 38, late: 5, missing: 2 },
      { week: '第3周', onTime: 40, late: 4, missing: 1 },
      { week: '第4周', onTime: 35, late: 7, missing: 3 },
      { week: '第5周', onTime: 39, late: 4, missing: 2 },
      { week: '第6周', onTime: 41, late: 3, missing: 1 }
    ];

    res.json({ success: true, data: submissionTrend });
  } catch (error) {
    console.error('Error fetching homework trend:', error);
    res.status(500).json({ error: '获取作业趋势失败', message: error.message });
  }
});

// 获取学生活跃度数据
router.get('/activity/student', async (req, res) => {
  try {
    // 简化处理，返回模拟数据
    const studentActivity = [
      { name: '登录频率', value: 85 },
      { name: '作业提交', value: 78 },
      { name: '讨论参与', value: 65 },
      { name: 'Quiz完成', value: 82 },
      { name: '资源下载', value: 70 }
    ];

    res.json({ success: true, data: studentActivity });
  } catch (error) {
    console.error('Error fetching student activity:', error);
    res.status(500).json({ error: '获取学生活跃度失败', message: error.message });
  }
});

// 获取课程完成度
router.get('/course/completion', async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        students: true,
        homeworks: {
          include: {
            submissions: true
          }
        }
      }
    });

    // 计算完成度
    let completed = 0;
    let inProgress = 0;
    let notStarted = 0;

    courses.forEach(course => {
      const totalStudents = course.students.length;
      const totalHomeworks = course.homeworks.length;
      if (totalHomeworks === 0) {
        notStarted++;
      } else {
        const avgCompletion = course.homeworks.reduce((sum, hw) => {
          return sum + (hw.submissions.length / totalStudents);
        }, 0) / totalHomeworks;
        
        if (avgCompletion >= 0.8) completed++;
        else if (avgCompletion >= 0.3) inProgress++;
        else notStarted++;
      }
    });

    const total = courses.length;
    const courseCompletion = [
      { 
        name: '已完成', 
        value: total > 0 ? Math.round((completed / total) * 100) : 0, 
        color: '#22c55e' 
      },
      { 
        name: '进行中', 
        value: total > 0 ? Math.round((inProgress / total) * 100) : 0, 
        color: '#3b82f6' 
      },
      { 
        name: '未开始', 
        value: total > 0 ? Math.round((notStarted / total) * 100) : 0, 
        color: '#94a3b8' 
      }
    ];

    res.json({ success: true, data: courseCompletion });
  } catch (error) {
    console.error('Error fetching course completion:', error);
    res.status(500).json({ error: '获取课程完成度失败', message: error.message });
  }
});

// 获取Quiz成绩趋势
router.get('/quiz/trend', async (req, res) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      include: {
        submissions: {
          where: {
            score: { not: null }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    const data = quizzes.slice(0, 5).map((quiz, index) => {
      const scores = quiz.submissions.map(s => s.score).filter(Boolean);
      const avgScore = scores.length > 0 
        ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
        : 75;
      const maxScore = scores.length > 0 ? Math.max(...scores) : 92;
      const minScore = scores.length > 0 ? Math.min(...scores) : 58;

      return {
        quiz: `Quiz ${index + 1}`,
        avgScore,
        maxScore,
        minScore
      };
    });

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching quiz trend:', error);
    res.status(500).json({ error: '获取Quiz趋势失败', message: error.message });
  }
});

// 获取优秀学生排行
router.get('/students/top', async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    // 获取所有学生的作业和测验成绩
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      include: {
        homeworkSubmissions: {
          where: {
            score: { not: null }
          }
        },
        quizSubmissions: {
          where: {
            score: { not: null }
          }
        }
      }
    });

    // 计算每个学生的平均分
    const studentScores = students.map(student => {
      const homeworkScores = student.homeworkSubmissions.map(s => s.score);
      const quizScores = student.quizSubmissions.map(s => s.score);
      const allScores = [...homeworkScores, ...quizScores];
      
      const avgScore = allScores.length > 0
        ? Math.round(allScores.reduce((sum, s) => sum + s, 0) / allScores.length)
        : 0;

      return {
        name: student.name,
        score: avgScore,
        submissions: student.homeworkSubmissions.length,
        participation: 90 // 可以后续计算实际参与度
      };
    });

    // 按分数排序
    studentScores.sort((a, b) => b.score - a.score);

    res.json({ success: true, data: studentScores.slice(0, parseInt(limit)) });
  } catch (error) {
    console.error('Error fetching top students:', error);
    res.status(500).json({ error: '获取优秀学生排行失败', message: error.message });
  }
});

// 获取关键指标
router.get('/metrics', async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        students: true
      }
    });

    const homeworks = await prisma.homework.findMany({
      include: {
        submissions: true
      }
    });

    // 计算指标
    const totalStudents = courses.reduce((sum, c) => sum + c.students.length, 0);
    const totalSubmissions = homeworks.reduce((sum, hw) => sum + hw.submissions.length, 0);
    const totalHomeworks = homeworks.length;
    const onTimeSubmissions = homeworks.reduce((sum, hw) => {
      return sum + hw.submissions.filter(s => {
        return s.submittedAt <= hw.deadline;
      }).length;
    }, 0);

    const avgAttendance = 92; // 可以后续从实际数据计算
    const avgGrade = 82; // 可以后续从实际数据计算
    const onTimeSubmissionRate = totalSubmissions > 0
      ? Math.round((onTimeSubmissions / totalSubmissions) * 100)
      : 0;
    const activityIndex = 76; // 可以后续计算

    res.json({
      success: true,
      data: {
        avgAttendance,
        avgGrade,
        onTimeSubmissionRate,
        activityIndex,
        trends: {
          attendance: { value: 3, direction: 'up' },
          grade: { value: 2, direction: 'up' },
          submissionRate: { value: -1, direction: 'down' },
          activity: { value: 5, direction: 'up' }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ error: '获取关键指标失败', message: error.message });
  }
});

// 获取综合分析数据
router.get('/comprehensive', async (req, res) => {
  try {
    // 调用各个子接口获取数据
    const [gradeDist, homeworkTrend, studentActivity, courseCompletion, quizTrend, topStudents, metrics] = await Promise.all([
      prisma.homeworkSubmission.findMany({ where: { score: { not: null } }, select: { score: true } }),
      Promise.resolve([]), // homework trend
      Promise.resolve([]), // student activity
      prisma.course.findMany({ include: { students: true, homeworks: { include: { submissions: true } } } }),
      prisma.quiz.findMany({ include: { submissions: { where: { score: { not: null } } } }, orderBy: { createdAt: 'asc' } }),
      prisma.user.findMany({ where: { role: 'STUDENT' }, include: { homeworkSubmissions: { where: { score: { not: null } } }, quizSubmissions: { where: { score: { not: null } } } } }),
      Promise.resolve({}) // metrics
    ]);

    // 处理成绩分布
    const distribution = { '0-59': 0, '60-69': 0, '70-79': 0, '80-89': 0, '90-100': 0 };
    gradeDist.forEach(sub => {
      const score = sub.score;
      if (score < 60) distribution['0-59']++;
      else if (score < 70) distribution['60-69']++;
      else if (score < 80) distribution['70-79']++;
      else if (score < 90) distribution['80-89']++;
      else distribution['90-100']++;
    });
    const total = gradeDist.length;
    const gradeDistribution = Object.entries(distribution).map(([range, count]) => ({
      range,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }));

    // 处理课程完成度
    let completed = 0, inProgress = 0, notStarted = 0;
    courseCompletion.forEach(course => {
      const totalStudents = course.students.length;
      const totalHomeworks = course.homeworks.length;
      if (totalHomeworks === 0) {
        notStarted++;
      } else {
        const avgCompletion = course.homeworks.reduce((sum, hw) => {
          return sum + (hw.submissions.length / totalStudents);
        }, 0) / totalHomeworks;
        if (avgCompletion >= 0.8) completed++;
        else if (avgCompletion >= 0.3) inProgress++;
        else notStarted++;
      }
    });
    const courseTotal = courseCompletion.length;
    const courseCompletionData = [
      { name: '已完成', value: courseTotal > 0 ? Math.round((completed / courseTotal) * 100) : 0, color: '#22c55e' },
      { name: '进行中', value: courseTotal > 0 ? Math.round((inProgress / courseTotal) * 100) : 0, color: '#3b82f6' },
      { name: '未开始', value: courseTotal > 0 ? Math.round((notStarted / courseTotal) * 100) : 0, color: '#94a3b8' }
    ];

    // 处理Quiz趋势
    const quizScoreTrend = quizTrend.slice(0, 5).map((quiz, index) => {
      const scores = quiz.submissions.map(s => s.score).filter(Boolean);
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length) : 75;
      const maxScore = scores.length > 0 ? Math.max(...scores) : 92;
      const minScore = scores.length > 0 ? Math.min(...scores) : 58;
      return { quiz: `Quiz ${index + 1}`, avgScore, maxScore, minScore };
    });

    // 处理优秀学生
    const studentScores = topStudents.map(student => {
      const homeworkScores = student.homeworkSubmissions.map(s => s.score);
      const quizScores = student.quizSubmissions.map(s => s.score);
      const allScores = [...homeworkScores, ...quizScores];
      const avgScore = allScores.length > 0
        ? Math.round(allScores.reduce((sum, s) => sum + s, 0) / allScores.length)
        : 0;
      return {
        name: student.name,
        score: avgScore,
        submissions: student.homeworkSubmissions.length,
        participation: 90
      };
    });
    studentScores.sort((a, b) => b.score - a.score);

    res.json({
      success: true,
      data: {
        gradeDistribution,
        submissionTrend: [
          { week: '第1周', onTime: 42, late: 3, missing: 0 },
          { week: '第2周', onTime: 38, late: 5, missing: 2 },
          { week: '第3周', onTime: 40, late: 4, missing: 1 },
          { week: '第4周', onTime: 35, late: 7, missing: 3 },
          { week: '第5周', onTime: 39, late: 4, missing: 2 },
          { week: '第6周', onTime: 41, late: 3, missing: 1 }
        ],
        studentActivity: [
          { name: '登录频率', value: 85 },
          { name: '作业提交', value: 78 },
          { name: '讨论参与', value: 65 },
          { name: 'Quiz完成', value: 82 },
          { name: '资源下载', value: 70 }
        ],
        courseCompletion: courseCompletionData,
        quizScoreTrend,
        topStudents: studentScores.slice(0, 5),
        metrics: {
          avgAttendance: 92,
          avgGrade: 82,
          onTimeSubmissionRate: 87,
          activityIndex: 76
        }
      }
    });
  } catch (error) {
    console.error('Error fetching comprehensive data:', error);
    res.status(500).json({ error: '获取综合分析数据失败', message: error.message });
  }
});

module.exports = router;

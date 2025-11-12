const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('开始填充数据库...')

  // 清理现有数据
  await prisma.voteResult.deleteMany()
  await prisma.vote.deleteMany()
  await prisma.courseResource.deleteMany()
  await prisma.quizSubmission.deleteMany()
  await prisma.quizQuestion.deleteMany()
  await prisma.quiz.deleteMany()
  await prisma.homeworkSubmission.deleteMany()
  await prisma.homework.deleteMany()
  await prisma.discussionPost.deleteMany()
  await prisma.courseStudent.deleteMany()
  await prisma.course.deleteMany()
  await prisma.user.deleteMany()

  // 创建用户
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const teacher1 = await prisma.user.create({
    data: {
      email: 'teacher1@example.com',
      password: hashedPassword,
      name: '张教授',
      role: 'TEACHER',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher1'
    }
  })

  const teacher2 = await prisma.user.create({
    data: {
      email: 'teacher2@example.com',
      password: hashedPassword,
      name: '李老师',
      role: 'TEACHER',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher2'
    }
  })

  const student1 = await prisma.user.create({
    data: {
      email: 'student1@example.com',
      password: hashedPassword,
      name: '张三',
      role: 'STUDENT',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1'
    }
  })

  const student2 = await prisma.user.create({
    data: {
      email: 'student2@example.com',
      password: hashedPassword,
      name: '李四',
      role: 'STUDENT',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2'
    }
  })

  const student3 = await prisma.user.create({
    data: {
      email: 'student3@example.com',
      password: hashedPassword,
      name: '王五',
      role: 'STUDENT',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3'
    }
  })

  const student4 = await prisma.user.create({
    data: {
      email: 'student4@example.com',
      password: hashedPassword,
      name: '赵六',
      role: 'STUDENT',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4'
    }
  })

  // 创建课程
  const course1 = await prisma.course.create({
    data: {
      name: '机器学习基础',
      description: '介绍机器学习的基本概念和算法',
      teacherId: teacher1.id,
      startDate: new Date('2025-09-01'),
      status: 'ACTIVE'
    }
  })

  const course2 = await prisma.course.create({
    data: {
      name: '数据结构与算法',
      description: '学习常用数据结构和算法设计',
      teacherId: teacher2.id,
      startDate: new Date('2025-09-01'),
      status: 'ACTIVE'
    }
  })

  // 学生选课
  await prisma.courseStudent.createMany({
    data: [
      { courseId: course1.id, studentId: student1.id },
      { courseId: course1.id, studentId: student2.id },
      { courseId: course1.id, studentId: student3.id },
      { courseId: course2.id, studentId: student1.id },
      { courseId: course2.id, studentId: student2.id },
    ]
  })

  // 创建作业
  const homework1 = await prisma.homework.create({
    data: {
      courseId: course1.id,
      title: '第三章编程作业 - 链表实现',
      description: '实现单链表的基本操作，包括插入、删除、查找等功能',
      deadline: new Date('2025-10-20T23:59:00')
    }
  })

  const homework2 = await prisma.homework.create({
    data: {
      courseId: course1.id,
      title: '算法分析报告',
      description: '分析快速排序和归并排序的时间复杂度，并进行实验验证',
      deadline: new Date('2025-10-25T23:59:00')
    }
  })

  // 创建作业提交
  await prisma.homeworkSubmission.create({
    data: {
      homeworkId: homework1.id,
      studentId: student1.id,
      fileUrl: '/uploads/submissions/homework1.py',
      note: '',
      score: null
    }
  })

  await prisma.homeworkSubmission.create({
    data: {
      homeworkId: homework1.id,
      studentId: student2.id,
      fileUrl: '/uploads/submissions/solution.cpp',
      note: '完成得很好，代码结构清晰',
      score: 95
    }
  })

  // 创建测验
  const quiz1 = await prisma.quiz.create({
    data: {
      courseId: course1.id,
      title: '第三章测验 - 数据结构基础',
      duration: 30
    }
  })

  // 创建测验题目
  await prisma.quizQuestion.createMany({
    data: [
      {
        quizId: quiz1.id,
        type: 'SINGLE_CHOICE',
        question: '栈的特点是什么?',
        options: ['先进先出', '先进后出', '随机访问', '顺序访问'],
        answer: '1'
      },
      {
        quizId: quiz1.id,
        type: 'MULTIPLE_CHOICE',
        question: '以下哪些是线性数据结构?',
        options: ['数组', '链表', '树', '栈'],
        answer: JSON.stringify([0, 1, 3])
      },
      {
        quizId: quiz1.id,
        type: 'TRUE_FALSE',
        question: '队列是一种后进先出的数据结构',
        options: ['True', 'False'],
        answer: 'false'
      }
    ]
  })

  // 创建讨论帖子
  const post1 = await prisma.discussionPost.create({
    data: {
      courseId: course1.id,
      userId: student1.id,
      title: '关于第三章作业的疑问',
      content: '请问第三章的递归算法作业中，如何优化时间复杂度?',
      isPinned: true,
      likes: 15
    }
  })

  // 创建回复
  await prisma.discussionPost.create({
    data: {
      courseId: course1.id,
      userId: teacher1.id,
      title: '',
      content: '可以考虑使用动态规划来优化，避免重复计算。',
      parentId: post1.id,
      likes: 5
    }
  })

  await prisma.discussionPost.create({
    data: {
      courseId: course1.id,
      userId: student2.id,
      title: '',
      content: '我也遇到了同样的问题，期待老师的解答!',
      parentId: post1.id,
      likes: 2
    }
  })

  await prisma.discussionPost.create({
    data: {
      courseId: course1.id,
      userId: student3.id,
      title: '课程项目小组招募',
      content: '我们小组还缺2名成员，希望擅长前端开发的同学加入!',
      isPinned: false,
      likes: 23
    }
  })

  await prisma.discussionPost.create({
    data: {
      courseId: course1.id,
      userId: student4.id,
      title: '期中考试复习资料分享',
      content: '整理了一份期中考试的复习大纲和重点题目，分享给大家。',
      isPinned: true,
      likes: 45
    }
  })

  // 创建资源
  await prisma.courseResource.createMany({
    data: [
      {
        courseId: course1.id,
        name: '机器学习算法详解.pdf',
        type: 'pdf',
        fileUrl: '/uploads/resources/ml-algorithms.pdf',
        size: 5452595,
        downloads: 45
      },
      {
        courseId: course1.id,
        name: '神经网络入门视频.mp4',
        type: 'video',
        fileUrl: '/uploads/resources/neural-network-intro.mp4',
        size: 134217728,
        downloads: 38
      },
      {
        courseId: course2.id,
        name: '数据结构课件.pptx',
        type: 'ppt',
        fileUrl: '/uploads/resources/data-structure-ppt.pptx',
        size: 3984588,
        downloads: 52
      },
      {
        courseId: course1.id,
        name: 'React组件设计模式.pdf',
        type: 'pdf',
        fileUrl: '/uploads/resources/react-patterns.pdf',
        size: 2202009,
        downloads: 29
      },
      {
        courseId: course2.id,
        name: '算法可视化演示.mp4',
        type: 'video',
        fileUrl: '/uploads/resources/algorithm-demo.mp4',
        size: 99614720,
        downloads: 41
      }
    ]
  })

  // 创建投票
  const vote1 = await prisma.vote.create({
    data: {
      courseId: course1.id,
      title: '下周实验课时间安排',
      type: 'SINGLE',
      options: [
        { id: '1', text: '周三下午 2:00-4:00', votes: 15 },
        { id: '2', text: '周四上午 10:00-12:00', votes: 12 },
        { id: '3', text: '周五下午 3:00-5:00', votes: 11 }
      ],
      deadline: new Date('2025-10-18T23:59:00')
    }
  })

  const vote2 = await prisma.vote.create({
    data: {
      courseId: course2.id,
      title: '期末考试形式调查',
      type: 'SINGLE',
      options: [
        { id: '1', text: '闭卷笔试', votes: 18 },
        { id: '2', text: '开卷笔试', votes: 12 },
        { id: '3', text: '上机考试', votes: 19 }
      ],
      deadline: new Date('2025-10-20T23:59:00')
    }
  })

  const vote3 = await prisma.vote.create({
    data: {
      courseId: course1.id,
      title: '希望增加的教学内容',
      type: 'MULTIPLE',
      options: [
        { id: '1', text: 'NoSQL数据库', votes: 28 },
        { id: '2', text: '数据库性能调优', votes: 35 },
        { id: '3', text: '分布式数据库', votes: 22 },
        { id: '4', text: '数据仓库技术', votes: 18 }
      ],
      deadline: new Date('2025-10-22T23:59:00')
    }
  })

  // 创建投票结果
  await prisma.voteResult.createMany({
    data: [
      {
        voteId: vote1.id,
        studentId: student1.id,
        selectedOptions: ['1']
      },
      {
        voteId: vote1.id,
        studentId: student2.id,
        selectedOptions: ['2']
      },
      {
        voteId: vote2.id,
        studentId: student1.id,
        selectedOptions: ['3']
      },
      {
        voteId: vote3.id,
        studentId: student1.id,
        selectedOptions: ['1', '2']
      }
    ]
  })

  console.log('数据库填充完成!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


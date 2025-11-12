# Agent Teaching Platform

A comprehensive teaching management system powered by AI agents, built with React and modern web technologies.

## 🌟 Features

### Core Modules

- **📚 Course Management** - Create, edit, and manage courses with role-based access control
- **💬 Discussion Forum** - Interactive discussion board with posts, replies, and likes
- **📝 Homework System** - Publish assignments, collect submissions, and grade student work
- **✅ Quiz Module** - Create quizzes with multiple question types and automatic grading
- **📁 Resource Library** - Organize and share course materials
- **📊 Polls & Surveys** - Create polls and collect student feedback
- **📈 Data Analytics** - Visualize course statistics and student performance
- **🤖 AI Generator** - Generate course content using AI agents

### User Roles

- **👨‍🏫 Teacher** - Create and manage own courses, publish assignments, grade submissions
- **👨‍🎓 Student** - Join courses, participate in discussions, submit homework and quizzes
- **👑 Administrator** - Full access to all courses and system management

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/agent-teaching-platform.git
cd agent-teaching-platform

# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

Visit http://localhost:5173

### Demo Accounts

Use quick login buttons on the login page:

- **Teacher** - Prof. Zhang (can create and manage courses)
- **Student** - Li Ming (can join courses and participate)
- **Administrator** - Full system access

## 📦 Tech Stack

- React 18 + Vite
- React Router
- Tailwind CSS + shadcn/ui
- Recharts (data visualization)
- Lucide Icons

## 🏗️ Project Structure

```
agent-teaching-platform/
├── src/
│   ├── components/           # React components
│   │   ├── Dashboard.jsx
│   │   ├── CourseManagement.jsx
│   │   ├── DiscussionModule.jsx
│   │   ├── HomeworkModule.jsx
│   │   ├── QuizModule.jsx
│   │   └── ...
│   ├── App.jsx               # Main app
│   └── main.jsx              # Entry point
├── server/                   # Backend (optional)
├── package.json
└── README.md
```

## 🔨 Build

```bash
# Build for production
pnpm run build

# Preview production build
pnpm run preview
```

## 🌐 Deployment

### Vercel (Recommended)
```bash
npm i -g vercel
vercel
```

### Netlify
Deploy the `dist/` folder after running `pnpm run build`

### GitHub Pages
```bash
pnpm add -D gh-pages
# Add to package.json: "deploy": "gh-pages -d dist"
pnpm run deploy
```

## 📚 Documentation

- **[数据库说明.md](./数据库说明.md)** - 数据库位置、结构、查看方法
- **[功能实现清单.md](./功能实现清单.md)** - 各页面功能按钮及实现状态
- **[项目说明.md](./项目说明.md)** - 项目详细说明
- **[权限系统说明.md](./权限系统说明.md)** - 权限系统说明

## 📄 License

MIT License

## 🙏 Acknowledgments

- React, Vite, Tailwind CSS, shadcn/ui, Recharts

---

**Built with ❤️ for modern education**


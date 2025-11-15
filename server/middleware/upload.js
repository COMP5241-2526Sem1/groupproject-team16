const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Upload middleware for file handling
// Last updated: 2025-11-12 12:20 UTC - Fixed serverless directory creation

// 确保上传目录存在
// 在 Vercel 等 serverless 环境中使用 /tmp 目录
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT;
const uploadDir = isServerless ? '/tmp/uploads' : path.join(__dirname, '../uploads');

// 延迟目录创建 - 不在模块加载时创建，而是在实际使用时创建
function ensureUploadDir(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    return true;
  } catch (error) {
    console.error('Unable to create upload directory:', dirPath, error.message);
    return false;
  }
}

// 配置存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 首先确保基础上传目录存在
    if (!ensureUploadDir(uploadDir)) {
      return cb(new Error('Unable to create upload directory'));
    }

    // 根据文件类型分类存储
    let subfolder = 'others';
    
    if (file.mimetype.startsWith('image/')) {
      subfolder = 'images';
    } else if (file.mimetype.startsWith('video/')) {
      subfolder = 'videos';
    } else if (file.mimetype === 'application/pdf') {
      subfolder = 'pdfs';
    } else if (file.mimetype.includes('word') || file.mimetype.includes('document')) {
      subfolder = 'documents';
    }

    const targetDir = path.join(uploadDir, subfolder);
    if (!ensureUploadDir(targetDir)) {
      return cb(new Error('Unable to create target directory'));
    }

    cb(null, targetDir);
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名: timestamp-randomstring-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 允许的文件类型
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'application/zip',
    'application/octet-stream', // 通用二进制文件类型
    'application/x-zip-compressed',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`不支持的文件类型: ${file.mimetype}`), false);
  }
};

// 创建multer实例
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 200 * 1024 * 1024, // 200MB
  }
});

// 导出不同的上传配置
module.exports = {
  // 单文件上传
  single: (fieldName) => upload.single(fieldName),
  
  // 多文件上传 (同一字段)
  array: (fieldName, maxCount) => upload.array(fieldName, maxCount),
  
  // 多文件上传 (不同字段)
  fields: (fields) => upload.fields(fields),
  
  // 任意文件上传
  any: () => upload.any(),
  
  // 上传目录路径
  uploadDir: uploadDir
};


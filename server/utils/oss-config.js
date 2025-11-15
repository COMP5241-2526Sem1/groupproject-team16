module.exports = {
  accessKeyId: process.env.OSS_ACCESS_KEY_ID || '',
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET || '',
  bucket: process.env.OSS_BUCKET || '',
  region: process.env.OSS_REGION || 'oss-cn-hangzhou',
  prefix: process.env.OSS_PREFIX || 'uploads' // 默认前缀
}


const OSS = require('ali-oss')

class OSSClient {
  constructor(accessKeyId, accessKeySecret, bucket, region, prefix = '') {
    if (!accessKeyId || !accessKeySecret || !bucket) {
      this.client = null
      this.prefix = prefix || ''
      return
    }
    this.client = new OSS({ accessKeyId, accessKeySecret, bucket, region })
    this.prefix = prefix || ''
  }

  _checkClient() {
    if (!this.client) throw new Error('OSS未配置，请设置OSS_ACCESS_KEY_ID、OSS_ACCESS_KEY_SECRET和OSS_BUCKET环境变量')
  }

  async uploadFile(localPath, ossFileName) {
    this._checkClient()
    const objectName = this.prefix ? `${this.prefix}/${ossFileName}` : ossFileName
    const result = await this.client.put(objectName, localPath)
    return { url: result.url, name: objectName }
  }

  async getFileUrl(objectName, expires = 3600) {
    this._checkClient()
    const fullName = this.prefix ? `${this.prefix}/${objectName}` : objectName
    return this.client.signatureUrl(fullName, { expires })
  }

  async deleteFile(objectName) {
    this._checkClient()
    const fullName = this.prefix ? `${this.prefix}/${objectName}` : objectName
    await this.client.delete(fullName)
  }

  async fileExists(objectName) {
    this._checkClient()
    try {
      const fullName = this.prefix ? `${this.prefix}/${objectName}` : objectName
      await this.client.head(fullName)
      return true
    } catch {
      return false
    }
  }

  async getFileStream(objectName) {
    this._checkClient()
    const fullName = this.prefix ? `${this.prefix}/${objectName}` : objectName
    const result = await this.client.getStream(fullName)
    return result
  }
}

module.exports = OSSClient


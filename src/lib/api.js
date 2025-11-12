import axios from 'axios'

// 在 Vercel 部署时，使用相对路径 /api
// 在本地开发时，使用完整的 localhost URL
const baseURL = import.meta.env.VITE_API_BASE_URL || (
  import.meta.env.DEV ? 'http://localhost:3001/api' : '/api'
)

export const api = axios.create({ baseURL })

export async function getHealth() {
	// 健康检查端点在 /api/health
	const url = import.meta.env.VITE_API_BASE_URL || (
    import.meta.env.DEV ? 'http://localhost:3001' : ''
  )
	const healthUrl = `${url}/api/health`
	const { data } = await axios.get(healthUrl)
	return data
}








import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

export const api = axios.create({ baseURL })

export async function getHealth() {
	const url = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api').replace(/\/$/, '')
	const healthUrl = url.endsWith('/api') ? url.replace(/\/api$/, '/health') : `${url}/health`
	const { data } = await axios.get(healthUrl)
	return data
}







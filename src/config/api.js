// API 配置
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// 创建完整的 API URL
export function getApiUrl(endpoint) {
  // 移除开头的斜杠以避免双斜杠
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // 如果 API_BASE_URL 以斜杠结尾，移除它
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  
  return `${baseUrl}/${cleanEndpoint}`;
}

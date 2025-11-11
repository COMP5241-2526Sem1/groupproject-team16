import { useState } from 'react';
import { GraduationCap, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { getApiUrl } from '@/config/api';

export default function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'TEACHER'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : { email: formData.email, password: formData.password, name: formData.name, role: formData.role };

      console.log('🔐 提交登录/注册:', endpoint, payload);

      const response = await fetch(getApiUrl(endpoint), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      console.log('📨 登录响应:', result);

      if (!response.ok) {
        throw new Error(result.error || result.message || '操作失败');
      }

      if (result.token && result.user) {
        // 保存token和用户信息到localStorage
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));

        console.log('✅ 登录成功, Token已保存');

        // 调用登录回调
        onLogin(result.user);
      } else {
        throw new Error('服务器返回数据格式错误');
      }
    } catch (err) {
      console.error('❌ 登录失败:', err);
      setError(err.message || '登录失败,请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 快速登录 - 使用真实API
  const quickLogin = async (role) => {
    setLoading(true);
    setError('');
    
    try {
      const demoUsers = {
        TEACHER: {
          email: 'teacher@example.com',
          password: 'password123',
          name: 'Prof. Zhang',
          role: 'TEACHER'
        },
        STUDENT: {
          email: 'student@example.com',
          password: 'password123',
          name: 'Li Ming',
          role: 'STUDENT'
        },
        ADMIN: {
          email: 'admin@example.com',
          password: 'password123',
          name: 'Administrator',
          role: 'ADMIN'
        }
      };

      const demoUser = demoUsers[role];
      
      console.log('🚀 快速登录尝试:', demoUser.email);

      // 先尝试登录
      let response = await fetch(getApiUrl('/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: demoUser.email,
          password: demoUser.password
        })
      });

      let result = await response.json();

      // 如果登录失败(用户不存在)，则先注册
      if (!response.ok) {
        console.log('⚠️ 用户不存在，尝试注册...');
        
        response = await fetch(getApiUrl('/auth/register'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(demoUser)
        });

        result = await response.json();
      }

      if (!response.ok) {
        throw new Error(result.error || result.message || '快速登录失败');
      }

      if (result.token && result.user) {
        // 保存token和用户信息
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));

        console.log('✅ 快速登录成功');

        onLogin(result.user);
      } else {
        throw new Error('服务器返回数据格式错误');
      }
    } catch (err) {
      console.error('❌ 快速登录失败:', err);
      setError(err.message || '快速登录失败,请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo和标题 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Agent Teaching Platform
          </h1>
          <p className="text-gray-600">
            Smart teaching management for better education
          </p>
        </div>

        {/* 登录/注册表单 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          {/* 切换标签 */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                isLogin
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              登录
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                !isLogin
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              注册
            </button>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 姓名 (仅注册) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  姓名
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Enter your name"
                  required={!isLogin}
                />
              </div>
            )}

            {/* 邮箱 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                邮箱
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            {/* 密码 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-11 pr-11 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* 角色选择 (仅注册) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  角色
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                >
                  <option value="TEACHER">Teacher</option>
                  <option value="STUDENT">Student</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
            )}

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : isLogin ? '登录' : '注册'}
            </button>
          </form>

          {/* 忘记密码 */}
          {isLogin && (
            <div className="mt-4 text-center">
              <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
                Forgot password?
              </a>
            </div>
          )}
        </div>

        {/* 快速登录 */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <p className="text-sm text-gray-600 mb-4 text-center">
            Quick Demo (Test Accounts)
          </p>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => quickLogin('TEACHER')}
              className="py-2 px-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
            >
              Teacher
            </button>
            <button
              onClick={() => quickLogin('STUDENT')}
              className="py-2 px-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
            >
              Student
            </button>
            <button
              onClick={() => quickLogin('ADMIN')}
              className="py-2 px-3 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
            >
              Administrator
            </button>
          </div>
        </div>

        {/* 版权信息 */}
        <p className="text-center text-sm text-gray-500 mt-8">
          © 2025 Agent Teaching Platform. All rights reserved.
        </p>
      </div>
    </div>
  );
}


import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { api } from '@/lib/api.js'

const Section = ({ title, countLabel, meta = [], children }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between gap-4">
      <CardTitle className="text-lg">{title}</CardTitle>
      {countLabel && <Badge variant="secondary">{countLabel}</Badge>}
    </CardHeader>
    <CardContent className="space-y-3">
      {meta.length > 0 && (
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          {meta.map((item, idx) => (
            <Badge key={idx} variant="outline">{item}</Badge>
          ))}
        </div>
      )}
      {children}
    </CardContent>
  </Card>
)

export default function StudentOverview() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [course, setCourse] = useState(() => {
    try {
      const saved = localStorage.getItem('selectedCourse')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('user')
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved))
      } catch {
        setCurrentUser(null)
      }
    }
  }, [])

  const loadOverview = async () => {
    if (!course?.id) return
    if (currentUser?.role !== 'STUDENT') return
    try {
      setLoading(true)
      setError('')
      const token = localStorage.getItem('token')
      const res = await api.get(`/courses/${course.id}/overview`, token ? { headers: { Authorization: `Bearer ${token}` } } : {})
      setData(res.data?.data || null)
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || '加载概览失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOverview()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course?.id, currentUser?.role])

  const basicInfo = useMemo(() => {
    if (!data?.course) return []
    const { teacherName, studentCount, startDate } = data.course
    return [
      teacherName ? `授课教师：${teacherName}` : null,
      typeof studentCount === 'number' ? `课程人数：${studentCount}` : null,
      startDate ? `开课日期：${new Date(startDate).toLocaleDateString()}` : null
    ].filter(Boolean)
  }, [data])

  if (currentUser?.role !== 'STUDENT') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>教师/管理员概览</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground">
            当前为 {currentUser?.role || '用户'} 角色，学生版概览暂不可见。
          </p>
          <Button onClick={() => navigate('/course/overview', { replace: true })}>
            返回教师概览
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!course) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>尚未选择课程</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">请先在课程列表中选择一门课程以查看概览。</p>
          <Button onClick={() => window.location.assign('/')}>前往课程列表</Button>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>加载概览中...</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">正在获取最新课程概览，请稍候。</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>加载失败</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={loadOverview}>重试</Button>
        </CardContent>
      </Card>
    )
  }

  const homework = data?.homework || { total: 0, pending: 0, upcoming: [] }
  const quiz = data?.quiz || { total: 0, pending: 0, upcoming: [] }
  const vote = data?.vote || { total: 0, active: 0, activeList: [] }
  const resources = data?.resources || { total: 0, latest: [] }

  return (
    <div className="space-y-6">
      <Section
        title={course.name || '课程概览'}
        countLabel={basicInfo.length ? '信息' : null}
        meta={basicInfo}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-dashed hover:shadow cursor-pointer" onClick={() => navigate('/course/homework')}>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-2">作业总数</p>
              <div className="text-3xl font-semibold">{homework.total}</div>
              <p className="text-xs text-muted-foreground mt-2">待提交 {homework.pending}</p>
              <div className="mt-3">
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); navigate('/course/homework') }}>查看作业</Button>
              </div>
            </CardContent>
          </Card>
          <Card className="border-dashed hover:shadow cursor-pointer" onClick={() => navigate('/course/quiz')}>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-2">测验总数</p>
              <div className="text-3xl font-semibold">{quiz.total}</div>
              <p className="text-xs text-muted-foreground mt-2">待参加 {quiz.pending}</p>
              <div className="mt-3">
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); navigate('/course/quiz') }}>查看测验</Button>
              </div>
            </CardContent>
          </Card>
          <Card className="border-dashed hover:shadow cursor-pointer" onClick={() => navigate('/course/resources')}>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-2">课程资源</p>
              <div className="text-3xl font-semibold">{resources.total}</div>
              <p className="text-xs text-muted-foreground mt-2">最近更新 {resources.latest?.[0]?.uploadedAt ? new Date(resources.latest[0].uploadedAt).toLocaleDateString() : '无'}</p>
              <div className="mt-3">
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); navigate('/course/resources') }}>查看资源</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Section
          title="作业信息"
          countLabel={`共 ${homework.total} 项`}
          meta={[`待提交 ${homework.pending}`]}
        >
          {homework.upcoming?.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {homework.upcoming.map(item => (
                <li key={item.id} className="p-3 border rounded-lg flex items-center justify-between">
                  <div className="font-medium">{item.title}</div>
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-muted-foreground">截止：{item.deadline ? new Date(item.deadline).toLocaleString() : '—'}</div>
                    <Button size="xs" variant="outline" onClick={() => navigate('/course/homework')}>去提交</Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">暂无待提交作业。</p>
          )}
          <div className="pt-3">
            <Button size="sm" onClick={() => navigate('/course/homework')}>查看全部作业</Button>
          </div>
        </Section>

        <Section
          title="测试信息"
          countLabel={`共 ${quiz.total} 场`}
          meta={[`待参加 ${quiz.pending}`]}
        >
          {quiz.upcoming?.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {quiz.upcoming.map(item => (
                <li key={item.id} className="p-3 border rounded-lg flex items-center justify-between">
                  <div className="font-medium">{item.title}</div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>时长：{item.duration} 分钟</span>
                    <span>开始：{item.date ? new Date(item.date).toLocaleString() : '—'}</span>
                    <Button size="xs" variant="outline" onClick={() => navigate('/course/quiz')}>去参加</Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">暂无待参加测验。</p>
          )}
          <div className="pt-3">
            <Button size="sm" onClick={() => navigate('/course/quiz')}>查看全部测验</Button>
          </div>
        </Section>

        <Section
          title="投票信息"
          countLabel={`共 ${vote.total} 项`}
          meta={[`进行中 ${vote.active}`]}
        >
          {vote.activeList?.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {vote.activeList.map(item => (
                <li key={item.id} className="p-3 border rounded-lg flex items-center justify-between">
                  <div className="font-medium">{item.title}</div>
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-muted-foreground">截止：{item.deadline ? new Date(item.deadline).toLocaleString() : '—'}</div>
                    <Button size="xs" variant="outline" onClick={() => navigate('/course/vote')}>去投票</Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">暂无进行中的投票。</p>
          )}
          <div className="pt-3">
            <Button size="sm" onClick={() => navigate('/course/vote')}>查看全部投票</Button>
          </div>
        </Section>
      </div>

      <Section
        title="课程资源"
        countLabel={`共 ${resources.total} 项`}
      >
        {resources.latest?.length > 0 ? (
          <div className="space-y-2">
            {resources.latest.map(item => (
              <div key={item.id} className="p-3 border rounded-lg flex justify-between text-sm">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-muted-foreground">{item.type?.toUpperCase()} · {item.uploader || '未知'}</div>
                </div>
                <div className="text-xs text-muted-foreground text-right">
                  <div>{item.uploadedAt ? new Date(item.uploadedAt).toLocaleDateString() : '—'}</div>
                  <div>{item.downloads != null ? `${item.downloads} 次下载` : ''}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">暂无资源或尚未同步。</p>
        )}
        <div className="pt-3">
          <Button size="sm" onClick={() => navigate('/course/resources')}>查看全部资源</Button>
        </div>
      </Section>
    </div>
  )
}



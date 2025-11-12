import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'

export default function Notifications() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>通知中心（预留）</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">这里将展示系统通知、课程动态等。当前为占位页面，后续接入通知接口。</p>
        </CardContent>
      </Card>
    </div>
  )
}



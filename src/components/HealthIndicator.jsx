import { useEffect, useState } from 'react'
import { getHealth } from '@/lib/api.js'

export default function HealthIndicator() {
	const [status, setStatus] = useState({ loading: true })

	useEffect(() => {
		let mounted = true
		getHealth()
			.then((data) => {
				if (!mounted) return
				setStatus({ loading: false, ok: data?.status === 'ok', db: data?.dbConnected, msg: data?.dbMessage })
			})
			.catch((e) => {
				if (!mounted) return
				setStatus({ loading: false, ok: false })
			})
		return () => { mounted = false }
	}, [])

	if (status.loading) {
		return (
			<span className="inline-flex items-center text-xs text-muted-foreground">后端检查中…</span>
		)
	}

	return (
		<div className="flex items-center gap-2 text-xs">
			<span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${status.ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
				<span className="h-2 w-2 rounded-full" style={{ backgroundColor: status.ok ? '#16a34a' : '#dc2626' }}></span>
				API
			</span>
			<span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${status.db ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`} title={status.msg || ''}>
				<span className="h-2 w-2 rounded-full" style={{ backgroundColor: status.db ? '#16a34a' : '#f59e0b' }}></span>
				DB
			</span>
		</div>
	)
}








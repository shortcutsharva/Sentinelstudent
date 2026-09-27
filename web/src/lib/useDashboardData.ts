import { useEffect, useState } from 'react'
import { fetchDashboardData } from './api'
import type { DashboardData } from './types'

type Status = 'loading' | 'ready' | 'error'

export function useDashboardData() {
  const [status, setStatus] = useState<Status>('loading')
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let active = true

    fetchDashboardData()
      .then((payload) => {
        if (!active) return
        setData(payload)
        setStatus('ready')
      })
      .catch((cause: Error) => {
        if (!active) return
        setError(cause)
        setStatus('error')
      })

    return () => {
      active = false
    }
  }, [])

  return { status, data, error }
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function useAdminAuthRedirect() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin')
    if (isAdmin !== 'true') {
      router.replace('/admin/login')
      return
    }
    setLoading(false)
  }, [router])

  return loading
}

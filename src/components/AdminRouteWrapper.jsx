'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminRouteWrapper({ children }) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    const checkAdminStatus = () => {
      const isAdmin = localStorage.getItem('isAdmin')
      if (isAdmin === 'true') {
        setIsAuthorized(true)
      } else {
        router.replace('/admin/login') // Redirect to admin login if not authorized
      }
      setCheckingAuth(false)
    }

    checkAdminStatus()
  }, [router])

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Checking admin access...</p>
      </div>
    )
  }

  return isAuthorized ? children : null
}

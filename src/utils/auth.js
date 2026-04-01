export const getStoredAuth = () => {
  try {
    const raw = localStorage.getItem('auth_user')
    const token = localStorage.getItem('access_token')
    // We also support the old 'auth_token' for backward compatibility during transition if needed,
    // but prefer the native access_token used by the backend.
    const oldToken = localStorage.getItem('auth_token')
    
    return raw && (token || oldToken) ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const getIsSuperAdmin = (data) => {
  if (data?.data?.user?.is_super_admin !== undefined) {
    return Boolean(data.data.user.is_super_admin)
  }
  return Boolean(
    data?.is_super_admin ??
      data?.user?.is_super_admin ??
      data?.data?.is_super_admin,
  )
}

export const getDefaultRouteForRole = () => '/pos'
export const getDefaultRoute = () => '/pos'

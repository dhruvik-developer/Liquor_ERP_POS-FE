export const getStoredAuth = () => {
  try {
    const raw = localStorage.getItem('auth_user')
    return raw ? JSON.parse(raw) : null
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

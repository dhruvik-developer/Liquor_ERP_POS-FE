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

export const getUserRoleName = (authData) => {
  const roleValue = authData?.role ?? authData?.user?.role ?? authData?.data?.user?.role

  if (typeof roleValue === 'string') return roleValue.trim()
  if (roleValue && typeof roleValue === 'object') {
    return (
      roleValue.name ||
      roleValue.label ||
      roleValue.code ||
      roleValue.title ||
      ''
    ).trim()
  }

  return (
    authData?.role_name ||
    authData?.user?.role_name ||
    authData?.data?.user?.role_name ||
    ''
  ).trim()
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

export const getIsAdminUser = (authData) => {
  if (getIsSuperAdmin(authData)) return true
  const roleName = getUserRoleName(authData).toLowerCase()
  return roleName === 'admin' || roleName === 'system admin' || roleName === 'administrator'
}

export const getDefaultRouteForRole = (authData) => {
  if (getIsAdminUser(authData)) return '/admin/dashboard'
  return '/pos/terminal'
}

export const getDefaultRoute = () => '/pos'

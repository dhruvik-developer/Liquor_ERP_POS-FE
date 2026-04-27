const getNumericId = (...candidates) => {
  for (const candidate of candidates) {
    if (typeof candidate === 'number' && Number.isFinite(candidate)) {
      return candidate
    }

    if (typeof candidate === 'string') {
      const trimmedCandidate = candidate.trim()
      if (!trimmedCandidate) continue

      const directNumber = Number(trimmedCandidate)
      if (Number.isFinite(directNumber)) {
        return directNumber
      }

      const matchedDigits = trimmedCandidate.match(/\d+/)
      if (matchedDigits) {
        return Number(matchedDigits[0])
      }
    }

    if (candidate && typeof candidate === 'object') {
      const nestedId = getNumericId(
        candidate.id,
        candidate.pk,
        candidate.value,
        candidate.active_store_id,
        candidate.activeStoreId,
        candidate.store_id,
        candidate.storeId,
        candidate.active_shift_id,
        candidate.activeShiftId,
        candidate.shift_id,
        candidate.shiftId,
        candidate.current_shift,
        candidate.currentShift,
        candidate.current_shift_id,
        candidate.currentShiftId,
      )

      if (nestedId !== null) {
        return nestedId
      }
    }
  }

  return null
}

const setOptionalStorageId = (key, value) => {
  if (value === null || value === undefined || value === '') {
    localStorage.removeItem(key)
    return
  }

  localStorage.setItem(key, String(value))
}

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

export const resolveStoredStoreId = (authData = getStoredAuth()) => getNumericId(
  authData?.active_store,
  authData?.activeStore,
  authData?.active_store_id,
  authData?.activeStoreId,
  authData?.store,
  authData?.store_id,
  authData?.storeId,
  authData?.user?.active_store,
  authData?.user?.activeStore,
  authData?.user?.active_store_id,
  authData?.user?.activeStoreId,
  authData?.user?.store,
  authData?.user?.store_id,
  authData?.user?.storeId,
  authData?.data?.active_store,
  authData?.data?.activeStore,
  authData?.data?.active_store_id,
  authData?.data?.activeStoreId,
  authData?.data?.store,
  authData?.data?.store_id,
  authData?.data?.storeId,
  authData?.data?.user?.active_store,
  authData?.data?.user?.activeStore,
  authData?.data?.user?.active_store_id,
  authData?.data?.user?.activeStoreId,
  authData?.data?.user?.store,
  authData?.data?.user?.store_id,
  authData?.data?.user?.storeId,
  authData?.stores?.[0],
  authData?.user?.stores?.[0],
  authData?.data?.stores?.[0],
  authData?.data?.user?.stores?.[0],
  localStorage.getItem('active_store_id'),
  localStorage.getItem('store_id'),
)

export const resolveStoredShiftId = (authData = getStoredAuth()) => getNumericId(
  authData?.active_shift,
  authData?.activeShift,
  authData?.active_shift_id,
  authData?.activeShiftId,
  authData?.shift,
  authData?.shift_id,
  authData?.shiftId,
  authData?.current_shift,
  authData?.currentShift,
  authData?.current_shift_id,
  authData?.currentShiftId,
  authData?.user?.active_shift,
  authData?.user?.activeShift,
  authData?.user?.active_shift_id,
  authData?.user?.activeShiftId,
  authData?.user?.shift,
  authData?.user?.shift_id,
  authData?.user?.shiftId,
  authData?.user?.current_shift,
  authData?.user?.currentShift,
  authData?.user?.current_shift_id,
  authData?.user?.currentShiftId,
  authData?.data?.active_shift,
  authData?.data?.activeShift,
  authData?.data?.active_shift_id,
  authData?.data?.activeShiftId,
  authData?.data?.shift,
  authData?.data?.shift_id,
  authData?.data?.shiftId,
  authData?.data?.current_shift,
  authData?.data?.currentShift,
  authData?.data?.current_shift_id,
  authData?.data?.currentShiftId,
  authData?.data?.user?.active_shift,
  authData?.data?.user?.activeShift,
  authData?.data?.user?.active_shift_id,
  authData?.data?.user?.activeShiftId,
  authData?.data?.user?.shift,
  authData?.data?.user?.shift_id,
  authData?.data?.user?.shiftId,
  authData?.data?.user?.current_shift,
  authData?.data?.user?.currentShift,
  authData?.data?.user?.current_shift_id,
  authData?.data?.user?.currentShiftId,
  localStorage.getItem('active_shift_id'),
  localStorage.getItem('shift_id'),
  localStorage.getItem('current_shift_id'),
)

export const persistAuthSession = (responseData, fallbackRole = 'staff') => {
  const apiUser = responseData?.user
  const normalizedUser = apiUser
    ? {
        ...apiUser,
        role: apiUser.role ?? apiUser.role_name ?? fallbackRole,
      }
    : {
        name: 'Admin User',
        role: fallbackRole,
      }

  const normalizedAuth = {
    ...responseData,
    ...normalizedUser,
    user: normalizedUser,
    data: responseData,
    role: normalizedUser.role,
  }

  localStorage.setItem('auth_user', JSON.stringify(normalizedAuth))

  setOptionalStorageId('active_store_id', resolveStoredStoreId(normalizedAuth))
  setOptionalStorageId('store_id', resolveStoredStoreId(normalizedAuth))
  setOptionalStorageId('active_shift_id', resolveStoredShiftId(normalizedAuth))
  setOptionalStorageId('shift_id', resolveStoredShiftId(normalizedAuth))
  setOptionalStorageId('current_shift_id', resolveStoredShiftId(normalizedAuth))

  return normalizedAuth
}

export const clearStoredAuthSession = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('auth_user')
  localStorage.removeItem('auth_token')
  localStorage.removeItem('active_store_id')
  localStorage.removeItem('store_id')
  localStorage.removeItem('active_shift_id')
  localStorage.removeItem('shift_id')
  localStorage.removeItem('current_shift_id')
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

export const getPortalBasePath = (authData) => (
  getIsAdminUser(authData) ? '/admin' : '/pos'
)

export const getDefaultRoute = () => '/pos'

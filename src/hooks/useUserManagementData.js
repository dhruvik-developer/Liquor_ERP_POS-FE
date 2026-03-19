import { useCallback, useEffect, useMemo, useState } from 'react'
import { userManagementApi } from '../services/userManagementApi'

const ACCESS_CODES = ['users_view', 'users_create', 'users_edit', 'users_delete']

const getRoleName = (user, rolesMap) => {
  const roleId = user?.role?.id ?? user?.role_id ?? user?.role
  if (roleId && rolesMap[roleId]) {
    return rolesMap[roleId].name
  }
  return user?.role?.name || user?.role_name || 'Unassigned'
}

const getUserStores = (user, storesMap) => {
  const userStores = user?.stores || user?.assigned_stores || []
  if (Array.isArray(userStores) && userStores.length > 0) {
    return userStores.map(store => {
      if (typeof store === 'object') {
        return store.name || store.store_name || `${store.id}`
      }
      return storesMap[store]?.name || `${store}`
    })
  }
  return []
}

const mapUsers = (users, rolesMap, storesMap) => users.map(user => ({
  id: user.id,
  name: user.name || user.full_name || user.username || '-',
  email: user.email || '-',
  roleName: getRoleName(user, rolesMap),
  storeNames: getUserStores(user, storesMap),
  isActive: Boolean(user.is_active ?? user.active ?? true),
  createdAt: user.created_at || user.date_joined || null,
  updatedAt: user.updated_at || null,
  raw: user,
}))

export const useUserManagementData = () => {
  const [permissions, setPermissions] = useState({})
  const [isCheckingAccess, setIsCheckingAccess] = useState(true)

  const [roles, setRoles] = useState([])
  const [stores, setStores] = useState([])
  const [permissionsList, setPermissionsList] = useState([])
  const [users, setUsers] = useState([])

  const [filters, setFilters] = useState({
    search: '',
    role: 'all',
    store: 'all',
  })
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  })
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [isLoadingMeta, setIsLoadingMeta] = useState(true)
  const [error, setError] = useState('')

  const rolesMap = useMemo(
    () => Object.fromEntries(roles.map(role => [role.id, role])),
    [roles],
  )

  const storesMap = useMemo(
    () => Object.fromEntries(stores.map(store => [store.id, store])),
    [stores],
  )

  const checkAccess = useCallback(async () => {
    setIsCheckingAccess(true)
    try {
      const accessPairs = await Promise.all(
        ACCESS_CODES.map(async code => [code, await userManagementApi.checkAccess(code)]),
      )
      setPermissions(Object.fromEntries(accessPairs))
    } catch {
      setPermissions(Object.fromEntries(ACCESS_CODES.map(code => [code, false])))
    } finally {
      setIsCheckingAccess(false)
    }
  }, [])

  const loadMeta = useCallback(async () => {
    setIsLoadingMeta(true)
    try {
      const [nextRoles, nextPermissions, nextStores] = await Promise.all([
        userManagementApi.getRoles(),
        userManagementApi.getPermissions(),
        userManagementApi.getStores(),
      ])
      setRoles(nextRoles)
      setPermissionsList(nextPermissions)
      setStores(nextStores)
    } catch (metaError) {
      setError(metaError?.message || 'Failed to load user management metadata.')
    } finally {
      setIsLoadingMeta(false)
    }
  }, [])

  const loadUsers = useCallback(async () => {
    if (!permissions.users_view) {
      setIsLoadingUsers(false)
      return
    }

    setIsLoadingUsers(true)
    setError('')

    try {
      const response = await userManagementApi.getUsers({
        page: pagination.page,
        page_size: pagination.pageSize,
        search: filters.search || undefined,
        role: filters.role !== 'all' ? filters.role : undefined,
        store: filters.store !== 'all' ? filters.store : undefined,
      })

      const mapped = mapUsers(response.items, rolesMap, storesMap)
      setUsers(mapped)
      setPagination(current => ({ ...current, total: response.count }))
    } catch (usersError) {
      setError(usersError?.message || 'Failed to load users.')
      setUsers([])
    } finally {
      setIsLoadingUsers(false)
    }
  }, [filters, pagination.page, pagination.pageSize, permissions.users_view, rolesMap, storesMap])

  const userStats = useMemo(() => {
    const activeUsers = users.filter(user => user.isActive).length
    const roleDistribution = users.reduce((acc, user) => {
      acc[user.roleName] = (acc[user.roleName] || 0) + 1
      return acc
    }, {})

    const storeDistribution = users.reduce((acc, user) => {
      if (user.storeNames.length === 0) {
        acc.Unassigned = (acc.Unassigned || 0) + 1
        return acc
      }
      user.storeNames.forEach(storeName => {
        acc[storeName] = (acc[storeName] || 0) + 1
      })
      return acc
    }, {})

    const created = users
      .filter(user => user.createdAt)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6)

    const updated = users
      .filter(user => user.updatedAt)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 6)

    return {
      totalUsers: pagination.total || users.length,
      activeUsers,
      totalRoles: roles.length,
      totalPermissions: permissionsList.length,
      usersPerStoreAverage: stores.length ? Number((users.length / stores.length).toFixed(1)) : 0,
      roleDistribution: Object.entries(roleDistribution).map(([name, value]) => ({ name, value })),
      storeDistribution: Object.entries(storeDistribution).map(([storeName, value]) => ({ storeName, value })),
      recentCreated: created,
      recentUpdated: updated,
    }
  }, [users, pagination.total, roles.length, permissionsList.length, stores.length])

  useEffect(() => {
    checkAccess()
  }, [checkAccess])

  useEffect(() => {
    if (!isCheckingAccess && permissions.users_view) {
      loadMeta()
    }
  }, [isCheckingAccess, permissions.users_view, loadMeta])

  useEffect(() => {
    if (!isLoadingMeta) {
      loadUsers()
    }
  }, [isLoadingMeta, loadUsers])

  const setPage = page => setPagination(current => ({ ...current, page }))
  const setPageSize = pageSize => setPagination(current => ({ ...current, pageSize, page: 1 }))

  const refresh = () => loadUsers()

  return {
    permissions,
    isCheckingAccess,
    users,
    roles,
    stores,
    permissionsList,
    filters,
    setFilters,
    pagination,
    setPage,
    setPageSize,
    isLoadingUsers,
    isLoadingMeta,
    error,
    userStats,
    refresh,
  }
}


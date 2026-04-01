import { getJson, postJson } from './http'

const parseList = payload => payload?.data || payload?.results || payload || []

const parsePaginatedUsers = payload => {
  if (Array.isArray(payload)) {
    return {
      items: payload,
      count: payload.length,
      next: null,
      previous: null,
    }
  }

  if (payload?.results) {
    return {
      items: payload.results,
      count: payload.count ?? payload.results.length,
      next: payload.next ?? null,
      previous: payload.previous ?? null,
    }
  }

  const items = parseList(payload)
  return {
    items,
    count: payload?.count ?? items.length,
    next: payload?.next ?? null,
    previous: payload?.previous ?? null,
  }
}

const parseAccessAllowed = payload => Boolean(
  payload?.allowed ??
    payload?.access ??
    payload?.data?.allowed ??
    payload?.data?.access ??
    payload?.status,
)

export const userManagementApi = {
  getUsers: async params => {
    const response = await getJson('/users/', params)
    return parsePaginatedUsers(response)
  },

  getRoles: async () => {
    const response = await getJson('/roles/')
    return parseList(response)
  },

  getPermissions: async () => {
    const response = await getJson('/permissions/')
    return parseList(response)
  },

  getStores: async () => {
    const response = await getJson('/stores/')
    return parseList(response)
  },

  checkAccess: async permissionCode => {
    const response = await getJson('/auth/access-check/', { permission: permissionCode })
    return parseAccessAllowed(response)
  },

  createUser: payload => postJson('/users/', payload),
  assignRole: (userId, roleId) => postJson(`/users/${userId}/assign-role/`, { role_id: roleId }),
  assignPermissionOverrides: (userId, permissionIds) => postJson(`/users/${userId}/permission-overrides/`, {
    permission_ids: permissionIds,
  }),
  assignStores: (userId, storeIds) => postJson(`/users/${userId}/assign-stores/`, {
    store_ids: storeIds,
  }),
}

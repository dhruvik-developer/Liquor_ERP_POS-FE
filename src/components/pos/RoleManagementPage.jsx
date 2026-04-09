import React, { useMemo, useState } from 'react'
import { Edit3, Plus, ShieldCheck, Trash2, X } from 'lucide-react'
import Card from '../common/Card'
import Button from '../common/Button'
import Loader from '../common/Loader'
import useFetch from '../../hooks/useFetch'
import useApi from '../../hooks/useApi'

const parseList = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.results)) return payload.results
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.results)) return payload.data.results
  return []
}

const normalizeId = (value) => String(value)

const getRolePermissionIds = (role) => {
  if (Array.isArray(role?.permission_ids)) return role.permission_ids
  if (Array.isArray(role?.permissions)) {
    return role.permissions
      .map((permission) => permission?.id)
      .filter((permissionId) => permissionId !== undefined && permissionId !== null)
  }
  return []
}

const extractApiError = (err, fallbackMessage) => {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.detail ||
    err?.message ||
    fallbackMessage
  )
}

const RoleManagementPage = () => {
  const {
    data: rolesData,
    loading: rolesLoading,
    error: rolesError,
    refetch: refetchRoles,
  } = useFetch('/roles/')
  const {
    data: permissionsData,
    loading: permissionsLoading,
    error: permissionsError,
  } = useFetch('/permissions/')
  const { post, put, del, loading: saving, error: saveError } = useApi()

  const roles = useMemo(() => parseList(rolesData), [rolesData])
  const permissions = useMemo(() => parseList(permissionsData), [permissionsData])

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingRole, setEditingRole] = useState(null)
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    permission_ids: [],
  })

  const [editForm, setEditForm] = useState({
    id: '',
    name: '',
    description: '',
    permission_ids: [],
  })

  const openCreateModal = () => {
    setFormError('')
    setSuccessMessage('')
    setCreateForm({
      name: '',
      description: '',
      permission_ids: [],
    })
    setShowCreateModal(true)
  }

  const openEditPermissions = (role) => {
    setFormError('')
    setSuccessMessage('')
    const rolePermissionIds = getRolePermissionIds(role)
    setEditForm({
      id: role.id,
      name: role.name || '',
      description: role.description || '',
      permission_ids: rolePermissionIds.map((id) => normalizeId(id)),
    })
    setEditingRole(role)
  }

  const toggleCreatePermission = (permissionId) => {
    const normalizedId = normalizeId(permissionId)
    setCreateForm((current) => ({
      ...current,
      permission_ids: current.permission_ids.includes(normalizedId)
        ? current.permission_ids.filter((id) => id !== normalizedId)
        : [...current.permission_ids, normalizedId],
    }))
  }

  const toggleEditPermission = (permissionId) => {
    const normalizedId = normalizeId(permissionId)
    setEditForm((current) => ({
      ...current,
      permission_ids: current.permission_ids.includes(normalizedId)
        ? current.permission_ids.filter((id) => id !== normalizedId)
        : [...current.permission_ids, normalizedId],
    }))
  }

  const handleCreateRole = async () => {
    setFormError('')
    setSuccessMessage('')
    if (!createForm.name.trim()) {
      setFormError('Role name is required.')
      return
    }

    try {
      await post('/roles/', {
        name: createForm.name.trim(),
        description: createForm.description.trim(),
        permission_ids: createForm.permission_ids.map((id) => Number(id)).filter((id) => !Number.isNaN(id)),
      })
      setShowCreateModal(false)
      refetchRoles()
      setSuccessMessage('Role created successfully.')
    } catch (err) {
      setFormError(extractApiError(err, 'Failed to create role.'))
    }
  }

  const handleUpdateRole = async () => {
    if (!editForm?.id) return
    setFormError('')
    setSuccessMessage('')
    if (!editForm.name.trim()) {
      setFormError('Role name is required.')
      return
    }

    const normalizedPermissionIds = editForm.permission_ids
      .map((id) => Number(id))
      .filter((id) => !Number.isNaN(id))

    try {
      await put(`/roles/${editForm.id}/`, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        permission_ids: normalizedPermissionIds,
      })
      await post(`/roles/${editForm.id}/assign-permissions/`, {
        permission_ids: normalizedPermissionIds,
      })
      setEditingRole(null)
      refetchRoles()
      setSuccessMessage('Role updated successfully.')
    } catch (err) {
      setFormError(extractApiError(err, 'Failed to update role.'))
    }
  }

  const handleDeleteRole = async (roleId) => {
    setFormError('')
    setSuccessMessage('')
    const shouldDelete = window.confirm('Are you sure you want to delete this role?')
    if (!shouldDelete) return

    try {
      await del(`/roles/${roleId}/`)
      refetchRoles()
      setSuccessMessage('Role deleted successfully.')
    } catch (err) {
      setFormError(extractApiError(err, 'Failed to delete role.'))
    }
  }

  const isPageLoading = rolesLoading || permissionsLoading
  const combinedError = formError || saveError || rolesError || permissionsError

  return (
    <div className="flex flex-col min-h-full space-y-6 animate-in fade-in duration-500 pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[26px] sm:text-[28px] font-black text-[#1E293B] tracking-tight">Role Management</h1>
          <p className="text-[#64748B] font-bold text-[14px] mt-1 uppercase tracking-wider">
            Add roles and manage permissions
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-2 w-full sm:w-auto">
          <Plus size={18} />
          Add Role
        </Button>
      </div>

      {combinedError && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-lg border border-rose-100 font-bold">
          {combinedError}
        </div>
      )}
      {successMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 font-bold">
          {successMessage}
        </div>
      )}

      <Card className="!overflow-visible">
        {isPageLoading ? (
          <div className="h-[320px] flex items-center justify-center">
            <Loader size={64} />
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-left border-collapse text-[14px] min-w-[760px]">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <tr>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider text-center">Permissions</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {roles.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-[#94A3B8] font-bold italic">
                      No roles found.
                    </td>
                  </tr>
                )}
                {roles.map((role) => (
                  <tr key={role.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#1E293B]">{role.name || '-'}</p>
                    </td>
                    <td className="px-6 py-4 text-[#475569]">{role.description || '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1 text-[12px] font-bold text-[#0EA5E9]">
                        {getRolePermissionIds(role).length}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditPermissions(role)}
                          className="gap-2"
                        >
                          <Edit3 size={14} />
                          Update
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteRole(role.id)}
                          className="gap-1 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 size={14} />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {(showCreateModal || editingRole) && (
        <div className="fixed inset-0 z-[90] bg-slate-900/40 p-4 flex items-center justify-center">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <div>
                <h2 className="text-[20px] font-black text-[#1E293B]">
                  {showCreateModal ? 'Create Role' : `Update Role: ${editingRole?.name || ''}`}
                </h2>
                <p className="text-[12px] font-bold uppercase tracking-wider text-[#64748B] mt-1">
                  {showCreateModal ? 'Create a new role and assign permissions' : 'Update role details and assign permissions'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false)
                  setEditingRole(null)
                }}
                className="h-8 w-8 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]"
              >
                <X size={16} className="mx-auto" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {showCreateModal && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[14px] font-bold text-[#1E293B] ml-0.5">Role Name</label>
                      <input
                        value={createForm.name}
                        onChange={(e) => setCreateForm((current) => ({ ...current, name: e.target.value }))}
                        placeholder="e.g. Manager"
                        className="w-full h-10 rounded-lg border border-[#E2E8F0] px-4 text-[14px] font-medium text-[#1E293B] outline-none focus:border-[#0EA5E9] focus:ring-4 focus:ring-[#0EA5E91A]"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[14px] font-bold text-[#1E293B] ml-0.5">Description</label>
                      <input
                        value={createForm.description}
                        onChange={(e) => setCreateForm((current) => ({ ...current, description: e.target.value }))}
                        placeholder="Store manager role"
                        className="w-full h-10 rounded-lg border border-[#E2E8F0] px-4 text-[14px] font-medium text-[#1E293B] outline-none focus:border-[#0EA5E9] focus:ring-4 focus:ring-[#0EA5E91A]"
                      />
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#E2E8F0] p-4">
                    <p className="text-[12px] font-black uppercase tracking-wider text-[#64748B] mb-3">Permissions</p>
                    <PermissionChecklist
                      permissions={permissions}
                      selectedIds={createForm.permission_ids}
                      onToggle={toggleCreatePermission}
                    />
                  </div>
                </>
              )}

              {editingRole && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[14px] font-bold text-[#1E293B] ml-0.5">Role Name</label>
                      <input
                        value={editForm.name}
                        onChange={(e) => setEditForm((current) => ({ ...current, name: e.target.value }))}
                        placeholder="e.g. Senior Manager"
                        className="w-full h-10 rounded-lg border border-[#E2E8F0] px-4 text-[14px] font-medium text-[#1E293B] outline-none focus:border-[#0EA5E9] focus:ring-4 focus:ring-[#0EA5E91A]"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[14px] font-bold text-[#1E293B] ml-0.5">Description</label>
                      <input
                        value={editForm.description}
                        onChange={(e) => setEditForm((current) => ({ ...current, description: e.target.value }))}
                        placeholder="Updated role"
                        className="w-full h-10 rounded-lg border border-[#E2E8F0] px-4 text-[14px] font-medium text-[#1E293B] outline-none focus:border-[#0EA5E9] focus:ring-4 focus:ring-[#0EA5E91A]"
                      />
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#E2E8F0] p-4">
                    <p className="text-[12px] font-black uppercase tracking-wider text-[#64748B] mb-3">Permissions</p>
                    <PermissionChecklist
                      permissions={permissions}
                      selectedIds={editForm.permission_ids}
                      onToggle={toggleEditPermission}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="px-6 py-4 border-t border-[#E2E8F0] flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false)
                  setEditingRole(null)
                }}
                className="w-full sm:w-auto"
                disabled={saving}
              >
                Cancel
              </Button>
              {showCreateModal && (
                <Button onClick={handleCreateRole} className="w-full sm:w-auto gap-2" disabled={saving}>
                  <ShieldCheck size={16} />
                  {saving ? 'Creating...' : 'Create Role'}
                </Button>
              )}
              {editingRole && (
                <Button onClick={handleUpdateRole} className="w-full sm:w-auto gap-2" disabled={saving}>
                  <ShieldCheck size={16} />
                  {saving ? 'Updating...' : 'Update Role'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const PermissionChecklist = ({ permissions, selectedIds, onToggle }) => {
  if (permissions.length === 0) {
    return (
      <p className="text-[13px] font-medium text-[#94A3B8] italic">
        Permission list empty hai.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {permissions.map((permission) => {
        const permissionId = permission?.id
        if (permissionId === undefined || permissionId === null) return null
        const label = permission?.name || permission?.code || `Permission ${permissionId}`
        const checked = selectedIds.includes(normalizeId(permissionId))

        return (
          <label
            key={permissionId}
            className="flex items-center gap-3 rounded-lg border border-[#E2E8F0] px-3 py-2 bg-white hover:bg-[#F8FAFC] cursor-pointer"
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => onToggle(permissionId)}
              className="h-4 w-4 accent-[#0EA5E9] cursor-pointer"
            />
            <span className="text-[13px] font-semibold text-[#1E293B]">{label}</span>
          </label>
        )
      })}
    </div>
  )
}

export default RoleManagementPage

import React, { useMemo, useState } from 'react'
import { Edit3, Plus, Shield, Trash2, X } from 'lucide-react'
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

const normalizePermissionForm = (permission = null) => ({
  id: permission?.id || '',
  module: permission?.module || '',
  action: permission?.action || '',
  code: permission?.code || '',
})

const extractApiError = (err, fallbackMessage) => {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.detail ||
    err?.message ||
    fallbackMessage
  )
}

const PermissionManagementPage = () => {
  const {
    data: permissionsData,
    loading: permissionsLoading,
    error: permissionsError,
    refetch: refetchPermissions,
  } = useFetch('/permissions/')
  const { post, put, del, loading: saving, error: saveError } = useApi()

  const permissions = useMemo(() => parseList(permissionsData), [permissionsData])

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPermission, setEditingPermission] = useState(null)
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [form, setForm] = useState(normalizePermissionForm())

  const openCreateModal = () => {
    setFormError('')
    setSuccessMessage('')
    setEditingPermission(null)
    setForm(normalizePermissionForm())
    setShowCreateModal(true)
  }

  const openEditModal = (permission) => {
    setFormError('')
    setSuccessMessage('')
    setShowCreateModal(false)
    setEditingPermission(permission)
    setForm(normalizePermissionForm(permission))
  }

  const closeModal = () => {
    setShowCreateModal(false)
    setEditingPermission(null)
    setFormError('')
    setForm(normalizePermissionForm())
  }

  const validateForm = () => {
    if (!form.module.trim()) {
      setFormError('Module is required.')
      return false
    }
    if (!form.action.trim()) {
      setFormError('Action is required.')
      return false
    }
    if (!form.code.trim()) {
      setFormError('Code is required.')
      return false
    }
    return true
  }

  const handleCreatePermission = async () => {
    setFormError('')
    setSuccessMessage('')
    if (!validateForm()) return

    try {
      await post('/permissions/', {
        module: form.module.trim(),
        action: form.action.trim(),
        code: form.code.trim(),
      })
      closeModal()
      refetchPermissions()
      setSuccessMessage('Permission created successfully.')
    } catch (err) {
      setFormError(extractApiError(err, 'Failed to create permission.'))
    }
  }

  const handleUpdatePermission = async () => {
    if (!form.id) return
    setFormError('')
    setSuccessMessage('')
    if (!validateForm()) return

    try {
      await put(`/permissions/${form.id}/`, {
        module: form.module.trim(),
        action: form.action.trim(),
        code: form.code.trim(),
      })
      closeModal()
      refetchPermissions()
      setSuccessMessage('Permission updated successfully.')
    } catch (err) {
      const statusCode = err?.response?.status
      if (statusCode === 404 || statusCode === 405) {
        setFormError('Permission update API abhi backend me implemented nahi hai.')
        return
      }
      setFormError(extractApiError(err, 'Failed to update permission.'))
    }
  }

  const handleDeletePermission = async (permissionId) => {
    setFormError('')
    setSuccessMessage('')
    const shouldDelete = window.confirm('Are you sure you want to delete this permission?')
    if (!shouldDelete) return

    try {
      await del(`/permissions/${permissionId}/`)
      refetchPermissions()
      setSuccessMessage('Permission deleted successfully.')
    } catch (err) {
      const statusCode = err?.response?.status
      if (statusCode === 404 || statusCode === 405) {
        setFormError('Permission delete API abhi backend me implemented nahi hai.')
        return
      }
      setFormError(extractApiError(err, 'Failed to delete permission.'))
    }
  }

  const isPageLoading = permissionsLoading
  const combinedError = formError || saveError || permissionsError
  const isEditMode = Boolean(editingPermission)

  return (
    <div className="flex flex-col min-h-full space-y-6 animate-in fade-in duration-500 pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[26px] sm:text-[28px] font-black text-[#1E293B] tracking-tight">Permission Management</h1>
          <p className="text-[#64748B] font-bold text-[14px] mt-1 uppercase tracking-wider">
            Add and review permission controls
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-2 w-full sm:w-auto">
          <Plus size={18} />
          Add Permission
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
                  <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Module</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Action</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Code</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {permissions.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-[#94A3B8] font-bold italic">
                      No permissions found.
                    </td>
                  </tr>
                )}
                {permissions.map((permission) => (
                  <tr key={permission.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#1E293B]">{permission.module || '-'}</p>
                    </td>
                    <td className="px-6 py-4 text-[#475569] font-semibold">{permission.action || '-'}</td>
                    <td className="px-6 py-4 text-[#0EA5E9] font-bold">{permission.code || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(permission)}
                          className="gap-2"
                        >
                          <Edit3 size={14} />
                          Update
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeletePermission(permission.id)}
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

      {(showCreateModal || editingPermission) && (
        <div className="fixed inset-0 z-[90] bg-slate-900/40 p-4 flex items-center justify-center">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <div>
                <h2 className="text-[20px] font-black text-[#1E293B]">
                  {isEditMode ? `Update Permission: ${editingPermission?.code || ''}` : 'Create Permission'}
                </h2>
                <p className="text-[12px] font-bold uppercase tracking-wider text-[#64748B] mt-1">
                  {isEditMode ? 'Update permission fields' : 'Create a new permission'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="h-8 w-8 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]"
              >
                <X size={16} className="mx-auto" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[14px] font-bold text-[#1E293B] ml-0.5">Module</label>
                  <input
                    value={form.module}
                    onChange={(e) => setForm((current) => ({ ...current, module: e.target.value }))}
                    placeholder="e.g. users"
                    className="w-full h-10 rounded-lg border border-[#E2E8F0] px-4 text-[14px] font-medium text-[#1E293B] outline-none focus:border-[#0EA5E9] focus:ring-4 focus:ring-[#0EA5E91A]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[14px] font-bold text-[#1E293B] ml-0.5">Action</label>
                  <input
                    value={form.action}
                    onChange={(e) => setForm((current) => ({ ...current, action: e.target.value }))}
                    placeholder="e.g. view"
                    className="w-full h-10 rounded-lg border border-[#E2E8F0] px-4 text-[14px] font-medium text-[#1E293B] outline-none focus:border-[#0EA5E9] focus:ring-4 focus:ring-[#0EA5E91A]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[14px] font-bold text-[#1E293B] ml-0.5">Code</label>
                  <input
                    value={form.code}
                    onChange={(e) => setForm((current) => ({ ...current, code: e.target.value }))}
                    placeholder="e.g. users_view"
                    className="w-full h-10 rounded-lg border border-[#E2E8F0] px-4 text-[14px] font-medium text-[#1E293B] outline-none focus:border-[#0EA5E9] focus:ring-4 focus:ring-[#0EA5E91A]"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#E2E8F0] flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <Button variant="outline" onClick={closeModal} className="w-full sm:w-auto" disabled={saving}>
                Cancel
              </Button>
              {isEditMode ? (
                <Button onClick={handleUpdatePermission} className="w-full sm:w-auto gap-2" disabled={saving}>
                  <Shield size={16} />
                  {saving ? 'Updating...' : 'Update Permission'}
                </Button>
              ) : (
                <Button onClick={handleCreatePermission} className="w-full sm:w-auto gap-2" disabled={saving}>
                  <Shield size={16} />
                  {saving ? 'Creating...' : 'Create Permission'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PermissionManagementPage

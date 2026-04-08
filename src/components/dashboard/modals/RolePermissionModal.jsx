import { useEffect, useState } from 'react'
import ModalShell from './ModalShell'
import StyledDropdown from '../../common/StyledDropdown'

const RolePermissionModal = ({
  isOpen,
  onClose,
  users,
  roles,
  permissions,
  selectedUser,
  onAssignRole,
  onAssignPermissions,
  isSubmitting,
}) => {
  const [userId, setUserId] = useState('')
  const [roleId, setRoleId] = useState('')
  const [permissionIds, setPermissionIds] = useState([])

  useEffect(() => {
    if (selectedUser) {
      setUserId(selectedUser.id)
      setRoleId('')
      setPermissionIds([])
    }
  }, [selectedUser])

  if (!isOpen) {
    return null
  }

  const togglePermission = permissionId => {
    setPermissionIds(current => (
      current.includes(permissionId)
        ? current.filter(id => id !== permissionId)
        : [...current, permissionId]
    ))
  }

  const submitRole = async event => {
    event.preventDefault()
    if (!userId || !roleId) {
      return
    }
    await onAssignRole(userId, roleId)
    onClose()
  }

  const submitPermissions = async event => {
    event.preventDefault()
    if (!userId) {
      return
    }
    await onAssignPermissions(userId, permissionIds)
    onClose()
  }

  return (
    <ModalShell title="System Hierarchy & Access" onClose={onClose}>
      <div className="grid gap-8 md:grid-cols-2">
        <form className="space-y-6 rounded-[24px] border border-neutral-100 bg-neutral-50/20 p-6 relative overflow-hidden group" onSubmit={submitRole}>
          <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-focus-within:bg-primary transition-colors"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Section A: Role Authority</p>
          <div className="space-y-4">
             <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">Operator</label>
                <StyledDropdown
                  value={userId}
                  onChange={event => setUserId(event.target.value)}
                  triggerClassName="border-neutral-200 bg-white !text-neutral-800 !font-bold rounded-xl !h-11"
                  placeholder="Select User..."
                >
                  <option value="">Select User...</option>
                  {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                </StyledDropdown>
             </div>
             <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">Protocol Level</label>
                <StyledDropdown
                  value={roleId}
                  onChange={event => setRoleId(event.target.value)}
                  triggerClassName="border-neutral-200 bg-white !text-neutral-700 !font-black rounded-xl !h-11"
                  placeholder="Select Role..."
                >
                  <option value="">Select Role...</option>
                  {roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
                </StyledDropdown>
             </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-xl bg-neutral-800 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-neutral-200 transition-all hover:bg-neutral-900 active:scale-95 disabled:opacity-30"
          >
            Assign Role Authority
          </button>
        </form>

        <form className="space-y-6 rounded-[24px] border border-neutral-100 bg-neutral-50/20 p-6 relative overflow-hidden group" onSubmit={submitPermissions}>
          <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-focus-within:bg-primary transition-colors"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Section B: Access Overrides</p>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">Entity User</label>
              <StyledDropdown
                value={userId}
                onChange={event => setUserId(event.target.value)}
                triggerClassName="border-neutral-200 bg-white !text-neutral-800 !font-bold rounded-xl !h-11"
                placeholder="Select User..."
              >
                <option value="">Select User...</option>
                {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
              </StyledDropdown>
            </div>
            <div className="space-y-2">
               <label className="text-[9px] font-black uppercase text-neutral-400 ml-1">Individual Permissions</label>
               <div className="max-h-32 space-y-2 overflow-auto rounded-xl border border-neutral-100 bg-white p-3 shadow-inner">
                {permissions.map(permission => (
                  <label key={permission.id} className="flex items-center gap-3 text-[11px] font-bold text-neutral-600 group cursor-pointer hover:text-primary transition-colors">
                    <input
                      type="checkbox"
                      checked={permissionIds.includes(permission.id)}
                      onChange={() => togglePermission(permission.id)}
                      className="w-4 h-4 rounded-md border-neutral-300 text-primary focus:ring-primary cursor-pointer appearance-none checked:bg-primary checked:border-primary border-2 transition-all"
                    />
                    <span className="uppercase tracking-wide">{permission.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-xl bg-primary text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-medium active:scale-95 disabled:opacity-30"
          >
            Update Permissions
          </button>
        </form>
      </div>
    </ModalShell>
  )
}

export default RolePermissionModal
 Greenland

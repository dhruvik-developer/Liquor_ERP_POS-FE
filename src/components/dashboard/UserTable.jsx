import SectionCard from './SectionCard'

const statusClass = isActive => (
  isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-neutral-100 text-neutral-500 border-neutral-200'
)

const UserTable = ({
  users,
  roles,
  stores,
  filters,
  onFiltersChange,
  pagination,
  onPageChange,
  onPageSizeChange,
  canEdit,
  canDelete,
  onAssignRole,
  onManagePermissions,
  onAssignStores,
}) => (
  <SectionCard title="User Overview" subtitle="System access control and registry management">
    <div className="mb-8 grid gap-4 md:grid-cols-4">
      <div className="group flex flex-col gap-2">
         <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1 group-focus-within:text-primary transition-colors">Find Person</label>
         <input
          value={filters.search}
          onChange={event => onFiltersChange({ search: event.target.value })}
          placeholder="Search name or email..."
          className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm font-bold text-neutral-700 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
        />
      </div>
      <div className="group flex flex-col gap-2">
         <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1 group-focus-within:text-primary transition-colors">By Access Level</label>
        <select
          value={filters.role}
          onChange={event => onFiltersChange({ role: event.target.value })}
          className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm font-bold text-neutral-700 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
        >
          <option value="all">All Roles Defined</option>
          {roles.map(role => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </div>
      <div className="group flex flex-col gap-2">
         <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1 group-focus-within:text-primary transition-colors">By Branch Office</label>
        <select
          value={filters.store}
          onChange={event => onFiltersChange({ store: event.target.value })}
          className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm font-bold text-neutral-700 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
        >
          <option value="all">All Licensed Stores</option>
          {stores.map(store => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>
      </div>
      <div className="group flex flex-col gap-2">
         <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1 group-focus-within:text-primary transition-colors">Display Volume</label>
        <select
          value={pagination.pageSize}
          onChange={event => onPageSizeChange(Number(event.target.value))}
          className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm font-bold text-neutral-700 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
        >
          {[10, 20, 50].map(size => <option key={size} value={size}>{size} Records / Page</option>)}
        </select>
      </div>
    </div>

    <div className="overflow-x-auto rounded-2xl border border-neutral-50">
      <table className="min-w-full text-left text-sm">
        <thead className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 bg-neutral-50/50">
          <tr>
            <th className="px-6 py-5">System Entity Name</th>
            <th className="px-6 py-5">Secure Email</th>
            <th className="px-6 py-5">System Role</th>
            <th className="px-6 py-5">Licensed Stores</th>
            <th className="px-6 py-5 text-center">Status</th>
            <th className="px-6 py-5 text-center">Protocol Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-50">
          {users.map(user => (
            <tr key={user.id} className="hover:bg-neutral-50/50 transition-colors group">
              <td className="px-6 py-5 text-sm font-black text-neutral-800 group-hover:text-primary transition-colors">{user.name}</td>
              <td className="px-6 py-5 text-sm font-bold text-neutral-500">{user.email}</td>
              <td className="px-6 py-5">
                 <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-neutral-100 rounded-md text-neutral-600 border border-neutral-200/50">{user.roleName}</span>
              </td>
              <td className="px-6 py-5 text-sm font-bold text-neutral-500 italic">
                {user.storeNames.length ? user.storeNames.join(', ') : 'No Stores Assigned'}
              </td>
              <td className="px-6 py-5 text-center">
                <span className={`inline-flex rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest border ${statusClass(user.isActive)}`}>
                  {user.isActive ? 'Verified' : 'Bypassed'}
                </span>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center justify-center gap-2">
                  {canEdit ? (
                    <>
                      <button
                        type="button"
                        onClick={() => onAssignRole(user)}
                        className="h-8 px-3 rounded-lg border border-neutral-200 text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:bg-white hover:text-primary hover:border-primary transition-all active:scale-95 shadow-sm"
                      >
                        Role
                      </button>
                      <button
                        type="button"
                        onClick={() => onManagePermissions(user)}
                        className="h-8 px-3 rounded-lg border border-neutral-200 text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:bg-white hover:text-primary hover:border-primary transition-all active:scale-95 shadow-sm"
                      >
                        Access
                      </button>
                      <button
                        type="button"
                        onClick={() => onAssignStores(user)}
                        className="h-8 px-3 rounded-lg border border-neutral-200 text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:bg-white hover:text-primary hover:border-primary transition-all active:scale-95 shadow-sm"
                      >
                        Stores
                      </button>
                    </>
                  ) : null}
                  {canDelete ? (
                    <button
                      type="button"
                      className="h-8 px-3 rounded-lg border border-rose-100 bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-500 opacity-50 cursor-not-allowed"
                      title="Deletions require root bypass"
                    >
                      Delete
                    </button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="mt-8 flex items-center justify-between px-2">
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-neutral-400">
        Page {pagination.page} <span className="text-neutral-200 mx-2">/</span> {Math.max(1, Math.ceil((pagination.total || 1) / pagination.pageSize))}
      </p>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
          disabled={pagination.page <= 1}
          className="h-10 px-6 rounded-xl border border-neutral-200 text-xs font-black uppercase tracking-widest text-neutral-500 hover:bg-neutral-50 transition-all disabled:opacity-20 active:scale-95"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={pagination.page * pagination.pageSize >= pagination.total}
          className="h-10 px-6 rounded-xl border border-neutral-200 text-xs font-black uppercase tracking-widest text-neutral-500 hover:bg-neutral-50 transition-all disabled:opacity-20 active:scale-95"
        >
          Next
        </button>
      </div>
    </div>
  </SectionCard>
)

export default UserTable

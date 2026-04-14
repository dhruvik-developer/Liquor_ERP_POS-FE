import SectionCard from './SectionCard'

const buttonClass = 'rounded-xl border px-3 py-2 text-sm font-semibold transition'

const QuickUserActionsPanel = ({
  canCreate,
  canEdit,
  onAddUser,
  onManageRoles,
  onManagePermissions,
}) => (
  <SectionCard title="Quick User Actions" subtitle="User administration shortcuts">
    <div className="grid gap-2">
      {canCreate ? (
        <button
          type="button"
          onClick={onAddUser}
          className={`${buttonClass} border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100`}
        >
          Add User
        </button>
      ) : null}
      {canEdit ? (
        <>
          <button
            type="button"
            onClick={onManageRoles}
            className={`${buttonClass} border-slate-300 bg-white text-slate-700 hover:bg-slate-50`}
          >
            Manage Roles
          </button>
          <button
            type="button"
            onClick={onManagePermissions}
            className={`${buttonClass} border-slate-300 bg-white text-slate-700 hover:bg-slate-50`}
          >
            Manage Permissions
          </button>
        </>
      ) : null}
      {!canCreate && !canEdit ? (
        <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
          You do not have user management permissions.
        </p>
      ) : null}
    </div>
  </SectionCard>
)

export default QuickUserActionsPanel


import { getStoredAuth } from '../../utils/auth'

const formatRange = (from, to) => `${from} -> ${to}`

const AdminTopbar = ({ filters, onRefresh }) => {
  const auth = getStoredAuth()
  const userName = auth?.data?.name || auth?.data?.user?.name || 'Admin'

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">Admin Dashboard</h1>
        <p className="text-sm text-slate-500">
          Welcome back, {userName}. Showing data for {formatRange(filters.from, filters.to)}.
        </p>
      </div>
      <button
        type="button"
        onClick={onRefresh}
        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
      >
        Refresh Data
      </button>
    </div>
  )
}

export default AdminTopbar


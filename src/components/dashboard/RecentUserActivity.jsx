import SectionCard from './SectionCard'
import { formatDateTime } from '../../utils/dateUtils'


const RecentUserActivity = ({ createdUsers, updatedUsers }) => (
  <SectionCard title="Recent User Activity" subtitle="Recently created users and permission updates">
    <div className="grid gap-3 md:grid-cols-2">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Recently Created</p>
        <div className="space-y-2">
          {createdUsers.map(user => (
            <div key={`created-${user.id}`} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
              <p className="font-semibold text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500">{formatDateTime(user.createdAt)}</p>

            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Recently Updated</p>
        <div className="space-y-2">
          {updatedUsers.map(user => (
            <div key={`updated-${user.id}`} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
              <p className="font-semibold text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500">{formatDateTime(user.updatedAt)}</p>

            </div>
          ))}
        </div>
      </div>
    </div>
  </SectionCard>
)

export default RecentUserActivity


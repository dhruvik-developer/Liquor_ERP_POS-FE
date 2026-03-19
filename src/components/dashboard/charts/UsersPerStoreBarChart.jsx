import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import SectionCard from '../SectionCard'

const shortName = value => (value.length > 14 ? `${value.slice(0, 14)}...` : value)

const UsersPerStoreBarChart = ({ data }) => (
  <SectionCard title="Users per Store" subtitle="Assigned users by store">
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
          <XAxis dataKey="storeName" tickFormatter={shortName} tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#1d4ed8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </SectionCard>
)

export default UsersPerStoreBarChart


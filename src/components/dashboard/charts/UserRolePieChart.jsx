import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import SectionCard from '../SectionCard'

const COLORS = ['#1d4ed8', '#0ea5e9', '#0284c7', '#2563eb', '#14b8a6', '#06b6d4']

const UserRolePieChart = ({ data }) => (
  <SectionCard title="User Distribution by Role" subtitle="Current visible users grouped by role">
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={92} label>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </SectionCard>
)

export default UserRolePieChart


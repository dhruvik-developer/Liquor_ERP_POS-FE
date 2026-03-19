import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import SectionCard from '../SectionCard'

const COLORS = ['#2563eb', '#0ea5e9', '#3b82f6', '#6366f1', '#14b8a6']

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #e2e8f0',
}

const CategoryPieChart = ({ data = [] }) => (
  <SectionCard title="Category Mix" subtitle="Category-wise liquor sales share">
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={92} label>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </SectionCard>
)

export default CategoryPieChart


import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import SectionCard from '../SectionCard'

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #e2e8f0',
}

const shortName = value => (value.length > 14 ? `${value.slice(0, 14)}...` : value)

const StoreBarChart = ({ data = [] }) => (
  <SectionCard title="Store Comparison" subtitle="Revenue comparison by store">
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
          <XAxis dataKey="storeName" tickFormatter={shortName} tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="sales" radius={[8, 8, 0, 0]} fill="#0ea5e9" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </SectionCard>
)

export default StoreBarChart


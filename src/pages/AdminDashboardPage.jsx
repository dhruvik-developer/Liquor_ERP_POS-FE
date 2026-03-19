import { AnimatePresence, motion as Motion } from 'framer-motion'
import AdminSidebar from '../components/dashboard/AdminSidebar'
import DashboardShell from '../components/dashboard/DashboardShell'
import AdminTopbar from '../components/dashboard/AdminTopbar'
import FilterBar from '../components/dashboard/FilterBar'
import KpiCard from '../components/dashboard/KpiCard'
import SkeletonBlock from '../components/dashboard/SkeletonBlock'
import StorePerformanceTable from '../components/dashboard/StorePerformanceTable'
import SalesLineChart from '../components/dashboard/charts/SalesLineChart'
import StoreBarChart from '../components/dashboard/charts/StoreBarChart'
import CategoryPieChart from '../components/dashboard/charts/CategoryPieChart'
import RecentOrdersTable from '../components/dashboard/RecentOrdersTable'
import PendingOrdersPanel from '../components/dashboard/PendingOrdersPanel'
import InventoryAlertsTable from '../components/dashboard/InventoryAlertsTable'
import { useDashboardData } from '../hooks/useDashboardData'
import {
  AlertIcon,
  OrderIcon,
  PendingIcon,
  RevenueIcon,
  SalesIcon,
  StoreIcon,
} from '../components/dashboard/icons'

const cardMotion = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
}

const AdminDashboardPage = () => {
  const {
    filters,
    setFilters,
    storeOptions,
    isLoading,
    error,
    dashboard,
    refresh,
  } = useDashboardData()

  const summaryCards = [
    {
      title: 'Total Stores',
      value: dashboard.summary.totalStores,
      icon: <StoreIcon />,
    },
    {
      title: 'Total Revenue',
      value: dashboard.summary.totalRevenue,
      trend: dashboard.summary.trends?.totalRevenue,
      icon: <RevenueIcon />,
      isCurrency: true,
    },
    {
      title: 'Total Orders',
      value: dashboard.summary.totalOrders,
      trend: dashboard.summary.trends?.totalOrders,
      icon: <OrderIcon />,
    },
    {
      title: 'Pending Orders',
      value: dashboard.summary.pendingOrders,
      trend: dashboard.summary.trends?.pendingOrders,
      icon: <PendingIcon />,
    },
    {
      title: "Today's Sales",
      value: dashboard.summary.todaySales,
      trend: dashboard.summary.trends?.todaySales,
      icon: <SalesIcon />,
      isCurrency: true,
    },
    {
      title: 'Low Stock Items',
      value: dashboard.summary.lowStockItems,
      trend: dashboard.summary.trends?.lowStockItems,
      icon: <AlertIcon />,
    },
  ]

  return (
    <DashboardShell
      sidebar={<AdminSidebar />}
      topbar={<AdminTopbar filters={filters} onRefresh={refresh} />}
    >
      <div className="space-y-5">
        <FilterBar
          filters={filters}
          onChange={next => setFilters(current => ({ ...current, ...next }))}
          storeOptions={storeOptions}
        />

        {error ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => <SkeletonBlock key={index} className="h-32 w-full" />)
            : summaryCards.map(card => (
              <Motion.div key={card.title} {...cardMotion}>
                <KpiCard {...card} />
              </Motion.div>
            ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2">
            {isLoading ? <SkeletonBlock className="h-96 w-full" /> : <StorePerformanceTable rows={dashboard.stores} />}
          </div>
          <div>{isLoading ? <SkeletonBlock className="h-96 w-full" /> : <PendingOrdersPanel rows={dashboard.pendingOrders} />}</div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {isLoading ? <SkeletonBlock className="h-96 w-full" /> : <SalesLineChart data={dashboard.dailySales} />}
          {isLoading ? <SkeletonBlock className="h-96 w-full" /> : <StoreBarChart data={dashboard.storeSalesComparison} />}
          {isLoading ? <SkeletonBlock className="h-96 w-full" /> : <CategoryPieChart data={dashboard.categorySales} />}
        </div>

        <AnimatePresence mode="wait">
          <Motion.div key={isLoading ? 'loading-tables' : 'loaded-tables'} {...cardMotion} className="grid gap-4 xl:grid-cols-2">
            <div>{isLoading ? <SkeletonBlock className="h-80 w-full" /> : <RecentOrdersTable rows={dashboard.recentOrders} />}</div>
            <div>{isLoading ? <SkeletonBlock className="h-80 w-full" /> : <InventoryAlertsTable rows={dashboard.lowStock} />}</div>
          </Motion.div>
        </AnimatePresence>
      </div>
    </DashboardShell>
  )
}

export default AdminDashboardPage



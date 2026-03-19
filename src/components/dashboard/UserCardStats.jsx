import KpiCard from './KpiCard'
import {
  ActiveUsersIcon,
  PermissionIcon,
  RoleIcon,
  UserGroupIcon,
  UsersPerStoreIcon,
} from './icons'

const UserCardStats = ({ stats }) => {
  const cards = [
    { title: 'Total Users', value: stats.totalUsers, icon: <UserGroupIcon /> },
    { title: 'Active Users', value: stats.activeUsers, icon: <ActiveUsersIcon /> },
    { title: 'Total Roles', value: stats.totalRoles, icon: <RoleIcon /> },
    { title: 'Total Permissions', value: stats.totalPermissions, icon: <PermissionIcon /> },
    { title: 'Users / Store', value: stats.usersPerStoreAverage, icon: <UsersPerStoreIcon /> },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map(card => <KpiCard key={card.title} {...card} />)}
    </div>
  )
}

export default UserCardStats


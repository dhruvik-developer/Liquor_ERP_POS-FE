import { Routes, Route, Navigate } from 'react-router-dom'
import { CalculatorProvider } from './context/CalculatorContext'
import SplashScreen from './pages/SplashScreen'
import LoginPage from './pages/LoginPage'
import ForgotPassword from './pages/ForgotPassword'
import PosLayout from './components/PosLayout'
import DashboardOverview from './components/pos/DashboardOverview'
import InventoryManagement from './components/pos/InventoryManagement'
import AddProduct from './components/pos/AddProduct'
import LowStockReport from './components/pos/LowStockReport'
import StockAdjustment from './components/pos/StockAdjustment'
import PurchaseBills from './components/pos/PurchaseBills'
import CreatePurchaseBill from './components/pos/CreatePurchaseBill'
import PurchaseOrders from './components/pos/PurchaseOrders'
import CreatePurchaseOrder from './components/pos/CreatePurchaseOrder'
import ReceivePurchaseOrder from './components/pos/ReceivePurchaseOrder'
import PurchaseReturns from './components/pos/PurchaseReturns'
import CreatePurchaseReturn from './components/pos/CreatePurchaseReturn'
import PeopleManagement from './components/pos/PeopleManagement'
import AddUserPage from './components/pos/AddUserPage'
import AddCustomerPage from './components/pos/AddCustomerPage'
import AddVendorPage from './components/pos/AddVendorPage'
import CashDrawerPage from './components/pos/CashDrawerPage'
import StoresManagement from './components/pos/StoresManagement'
import AddStorePage from './components/pos/AddStorePage'
import SettingsPage from './components/pos/SettingsPage'
import PosTerminalView from './components/pos/PosTerminalView'
import SalesHistory from './components/pos/SalesHistory'
import SalesManagement from './components/pos/SalesManagement'
import ReportsDashboard from './components/pos/ReportsDashboard'
import UserProfile from './components/pos/UserProfile'
import ItemMasterManagement from './components/pos/ItemMasterManagement'
import RoleManagementPage from './components/pos/RoleManagementPage'
import PermissionManagementPage from './components/pos/PermissionManagementPage'
import ProtectedRoute from './components/routing/ProtectedRoute'
import ToastHost from './components/common/ToastHost'

function App() {
  return (
    <CalculatorProvider>
      <ToastHost />
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
        path="/pos"
        element={(
          <ProtectedRoute>
            <PosLayout />
          </ProtectedRoute>
        )}
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardOverview />} />
        
        {/* Inventory Module */}
        <Route path="products" element={<InventoryManagement />} />
        <Route path="products/add" element={<AddProduct />} />
        <Route path="inventory/low-stock" element={<LowStockReport />} />
        <Route path="inventory/adjust" element={<StockAdjustment />} />
        
        {/* Purchase Module */}
        <Route path="purchase-bills" element={<PurchaseBills />} />
        <Route path="purchase-bills/create" element={<CreatePurchaseBill />} />
        <Route path="purchase-orders" element={<PurchaseOrders />} />
        <Route path="purchase-orders/create" element={<CreatePurchaseOrder />} />
        <Route path="purchase-orders/edit/:id" element={<CreatePurchaseOrder />} />
        <Route path="purchase-orders/receive" element={<ReceivePurchaseOrder />} />
        <Route path="purchase-return" element={<PurchaseReturns />} />
        <Route path="purchase-return/create" element={<CreatePurchaseReturn />} />
        
        {/* Sales Module */}
        <Route path="terminal" element={<PosTerminalView />} />
        <Route path="sales" element={<SalesManagement />} />
        <Route path="sales/history" element={<SalesHistory />} />
        
        {/* Other Modules */}
        <Route path="people" element={<PeopleManagement />} />
        <Route path="people/users/add" element={<AddUserPage />} />
        <Route path="people/users/edit/:id" element={<AddUserPage />} />
        <Route path="people/customers/add" element={<AddCustomerPage />} />
        <Route path="people/customers/edit/:id" element={<AddCustomerPage />} />
        <Route path="people/vendors/add" element={<AddVendorPage />} />
        <Route path="people/vendors/edit/:id" element={<AddVendorPage />} />
        <Route path="stores" element={<StoresManagement />} />
        <Route path="stores/add" element={<AddStorePage />} />
        <Route path="stores/edit/:id" element={<AddStorePage />} />
        <Route path="item-master" element={<ItemMasterManagement />} />
        <Route path="cash-drawer" element={<CashDrawerPage />} />
        <Route path="reports" element={<ReportsDashboard />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="roles" element={<RoleManagementPage />} />
        <Route path="permissions" element={<PermissionManagementPage />} />
        <Route path="profile" element={<UserProfile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </CalculatorProvider>
  )
}

export default App

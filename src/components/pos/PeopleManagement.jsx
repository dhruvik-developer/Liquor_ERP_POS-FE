import { useSearchParams, useNavigate } from "react-router-dom";
import { formatDate, formatDateTime, formatDateTimeAmPm } from "../../utils/dateUtils";

import {
  Search,
  Plus,
  Key,
  Pencil,
  Trash2,
  User,
  Users,
  Building2,
} from "lucide-react";
import Loader from "../common/Loader";
import Button from "../common/Button";
import Input from "../common/Input";
import useFetch from "../../hooks/useFetch";
import useApi from "../../hooks/useApi";
import Toggle from "../common/Toggle";
import StyledDropdown from "../common/StyledDropdown";
import { getPortalBasePath, getStoredAuth } from "../../utils/auth";



const getUserRoleLabel = (user) => {
  const roleValue = user?.role;
  if (typeof roleValue === "string") return roleValue;
  if (typeof roleValue === "number") return String(roleValue);
  if (roleValue && typeof roleValue === "object") {
    return (
      roleValue.name ||
      roleValue.label ||
      roleValue.code ||
      roleValue.title ||
      "User"
    );
  }
  return user?.role_name || "User";
};

const PeopleManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "users";
  const portalBasePath = getPortalBasePath(getStoredAuth());

  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };

  const tabs = [
    { id: "users", label: "Users", icon: User },
    { id: "customers", label: "Customers", icon: Users },
    { id: "vendors", label: "Vendors", icon: Building2 },
  ];

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500 pb-8 pr-2">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm p-1 flex items-center gap-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-2 rounded-md text-[14px] font-bold transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-[#0EA5E91A] text-[#0EA5E9]"
                : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]"
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0">
        {activeTab === "users" ? (
          <UsersTab portalBasePath={portalBasePath} />
        ) : activeTab === "customers" ? (
          <CustomersTab portalBasePath={portalBasePath} />
        ) : (
          <VendorsTab portalBasePath={portalBasePath} />
        )}
      </div>
    </div>
  );
};

const UsersTab = ({ portalBasePath }) => {
  const { data: responseData, loading, error, refetch } = useFetch("/users/");
  const { del, put } = useApi();
  const navigate = useNavigate();

  // Defensive check mapping in case Pagination is active
  const users = Array.isArray(responseData)
    ? responseData
    : responseData?.results || [];

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await del(`/users/${id}/`);
        refetch();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await put(`/users/${user.id}/`, {
        ...user,
        is_active: !user.is_active,
      });
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <input
            placeholder="User Name or Email"
            className="w-64 h-10 px-4 rounded-lg bg-[#F1F5F9] border-none text-[14px] font-medium text-[#1E293B] outline-none placeholder:text-[#94A3B8] focus:bg-white focus:ring-2 focus:ring-[#0EA5E933] transition-all"
          />
          <StyledDropdown
            className="w-48"
            triggerClassName="!h-10 !rounded-lg border-none bg-[#F1F5F9] !font-bold !text-[#1E293B] !px-4"
            placeholder="Filter By Role"
          >
            <option>Filter By Role</option>
          </StyledDropdown>
          <input
            placeholder="Filter Value"
            className="w-48 h-10 px-4 rounded-lg bg-[#F1F5F9] border-none text-[14px] font-medium text-[#1E293B] outline-none placeholder:text-[#94A3B8] focus:bg-white focus:ring-2 focus:ring-[#0EA5E933] transition-all"
          />
          <Button className="h-10 px-8">Filter</Button>
          <div className="flex-1" />
          <Button
            className="h-10 gap-2 px-6"
            onClick={() => navigate(`${portalBasePath}/people/users/add`)}
          >
            <Plus size={18} />
            Add User
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="overflow-auto flex-1 text-[14px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <tr>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">
                  User
                </th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap text-center">
                  Role
                </th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap text-center">
                  Phone Number
                </th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap text-center">
                  Status
                </th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap text-center">
                  Stores
                </th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap text-center">
                  Created On
                </th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {loading && (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-8 text-center text-[#64748B]"
                  >
                    <Loader size={48} className="mx-auto mb-2" />
                    Loading users...
                  </td>
                </tr>
              )}
              {error && (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-8 text-center text-rose-500 font-bold"
                  >
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && users.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-8 text-center text-[#64748B] font-medium"
                  >
                    No users found.
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                users.map((user, idx) => (
                  <tr
                    key={user.id || idx}
                    className="hover:bg-[#F8FAFC] transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-[#0EA5E933] text-[#0EA5E9] flex items-center justify-center font-black text-xs">
                          {(user.first_name || user.username || "?")
                            .charAt(0)
                            .toUpperCase()}
                          {(user.last_name || "").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p
                            className="font-bold text-[#0EA5E9] cursor-pointer hover:underline"
                            onClick={() =>
                              navigate(`${portalBasePath}/people/users/edit/${user.id}`)
                            }
                          >
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-[12px] text-[#94A3B8]">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-[#475569]">
                      {getUserRoleLabel(user)}
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-[#475569]">
                      {user.mobile_number || user.phone || "-"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <Toggle
                          checked={user.is_active !== false}
                          onChange={() => handleToggleStatus(user)}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-[#0EA5E9] font-bold cursor-pointer hover:underline">
                        {user.stores_count || "0"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="flex flex-col items-center">
                        {(() => {
                          const dt = formatDateTimeAmPm(user.created_at);
                          return dt ? (
                            <>
                              <span className="text-[14px] font-bold text-[#1E293B]">{dt.time}</span>
                              <span className="text-[12px] text-[#94A3B8]">{dt.date}</span>
                            </>
                          ) : <span className="text-[12px] text-[#94A3B8]">-</span>;
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <Key
                          size={14}
                          className="text-amber-500 hover:scale-125 transition cursor-pointer"
                        />
                        <Pencil
                          size={14}
                          className="text-[#0EA5E9] hover:scale-125 transition cursor-pointer"
                          onClick={() =>
                            navigate(`${portalBasePath}/people/users/edit/${user.id}`)
                          }
                        />
                        <Trash2
                          size={14}
                          className="text-rose-500 hover:scale-125 transition cursor-pointer"
                          onClick={() => handleDelete(user.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const CustomersTab = ({ portalBasePath }) => {
  const {
    data: responseData,
    loading,
    error,
    refetch,
  } = useFetch("/people/customers/");
  const { del } = useApi();
  const navigate = useNavigate();
  const customers = Array.isArray(responseData)
    ? responseData
    : responseData?.results || [];

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await del(`/people/customers/${id}/`);
        refetch();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <Input
            placeholder="Customer Name or Email"
            icon={Search}
            className="w-72"
          />
          <Button
            className="gap-2"
            onClick={() => navigate(`${portalBasePath}/people/customers/add`)}
          >
            <Plus size={18} />
            Create Customer
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="overflow-auto flex-1 text-[14px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <tr>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">
                  Customer
                </th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap text-center">
                  Phone Number
                </th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap text-center">
                  DOB
                </th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap text-center">
                  Created On
                </th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {loading && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-[#64748B]"
                  >
                    <Loader size={48} className="mx-auto mb-2" />
                    Loading customers...
                  </td>
                </tr>
              )}
              {error && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-rose-500 font-bold"
                  >
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && customers.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-[#64748B] font-medium"
                  >
                    No customers found.
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                customers.map((customer, idx) => (
                  <tr
                    key={customer.id || idx}
                    className="hover:bg-[#F8FAFC] transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p
                        className="font-bold text-[#0EA5E9] hover:underline cursor-pointer"
                        onClick={() =>
                          navigate(`${portalBasePath}/people/customers/edit/${customer.id}`)
                        }
                      >
                        {customer.name || customer.full_name}
                      </p>
                      <p className="text-[12px] text-[#94A3B8]">
                        {customer.email}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-[#475569]">
                      {customer.phone || customer.mobile_number}
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-[#475569] whitespace-nowrap">
                      {formatDate(customer.dob || customer.date_of_birth)}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="flex flex-col items-center">
                        {(() => {
                          const dt = formatDateTimeAmPm(customer.created_at);
                          return dt ? (
                            <>
                              <span className="text-[14px] font-bold text-[#1E293B]">{dt.time}</span>
                              <span className="text-[12px] text-[#94A3B8]">{dt.date}</span>
                            </>
                          ) : <span className="text-[12px] text-[#94A3B8]">-</span>;
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-4">
                        <Pencil
                          size={14}
                          className="text-[#0EA5E9] hover:scale-125 transition cursor-pointer"
                          onClick={() =>
                            navigate(
                              `${portalBasePath}/people/customers/edit/${customer.id}`,
                            )
                          }
                        />
                        <Trash2
                          size={14}
                          className="text-rose-500 hover:scale-125 transition cursor-pointer"
                          onClick={() => handleDelete(customer.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const VendorsTab = ({ portalBasePath }) => {
  const {
    data: responseData,
    loading,
    error,
    refetch,
  } = useFetch("/people/vendors/");
  const { del } = useApi();
  const navigate = useNavigate();
  const vendors = Array.isArray(responseData)
    ? responseData
    : responseData?.results || [];

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this vendor?")) {
      try {
        await del(`/people/vendors/${id}/`);
        refetch();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <Input
            placeholder="Vendor or Company"
            icon={Search}
            className="w-72"
          />
          <Button
            className="gap-2"
            onClick={() => navigate(`${portalBasePath}/people/vendors/add`)}
          >
            <Plus size={18} />
            Add Vendor
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="overflow-auto flex-1 text-[14px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <tr>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">
                  Vendor
                </th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">
                  Company
                </th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap text-center">
                  Invoice Amt
                </th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap text-center">
                  Paid Amt
                </th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap text-center">
                  Balance
                </th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {loading && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-[#64748B]"
                  >
                    <Loader size={48} className="mx-auto mb-2" />
                    Loading vendors...
                  </td>
                </tr>
              )}
              {error && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-rose-500 font-bold"
                  >
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && vendors.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-[#64748B] font-medium"
                  >
                    No vendors found.
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                vendors.map((vendor, idx) => (
                  <tr
                    key={vendor.id || idx}
                    className="hover:bg-[#F8FAFC] transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p
                        className="font-bold text-[#0EA5E9] underline cursor-pointer hover:text-[#38BDF8]"
                        onClick={() =>
                          navigate(`${portalBasePath}/people/vendors/edit/${vendor.id}`)
                        }
                      >
                        {vendor.name || vendor.vendor_name}
                      </p>
                    </td>
                    <td className="px-6 py-4 font-medium text-[#475569]">
                      {vendor.company || vendor.company_name}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-[#1E293B]">
                      ${vendor.invoice_amt || "0.00"}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-[#1E293B]">
                      ${vendor.paid_amt || "0.00"}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-[#1E293B]">
                      ${vendor.balance || "0.00"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-4">
                        <Pencil
                          size={14}
                          className="text-[#0EA5E9] hover:scale-125 transition cursor-pointer"
                          onClick={() =>
                            navigate(`${portalBasePath}/people/vendors/edit/${vendor.id}`)
                          }
                        />
                        <Trash2
                          size={14}
                          className="text-rose-500 hover:scale-125 transition cursor-pointer"
                          onClick={() => handleDelete(vendor.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PeopleManagement;

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import Loader from '../common/Loader';
import useFetch from '../../hooks/useFetch';
import useApi from '../../hooks/useApi';

const StoresManagement = () => {
  const { data: responseData, loading, error, refetch } = useFetch('/stores/');
  const { del } = useApi();
  const navigate = useNavigate();

  const stores = Array.isArray(responseData)
    ? responseData
    : responseData?.results || [];

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this store?")) {
      try {
        await del(`/stores/${id}/`);
        refetch();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-500 pb-8 pr-2">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-[#1E293B]">Stores Management</h1>
      </div>

      <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <Input
            placeholder="Search Store"
            icon={Search}
            className="w-72"
          />
          <Link to="/pos/stores/add">
            <Button className="gap-2">
              <Plus size={18} />
              Add Store
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="overflow-auto flex-1 text-[14px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <tr>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">
                  Store Name
                </th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap text-center">
                  Location / Address
                </th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap text-center">
                  Phone
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
                  <td colSpan="5" className="px-6 py-8 text-center text-[#64748B]">
                    <Loader size={48} className="mx-auto mb-2" />
                    Loading stores...
                  </td>
                </tr>
              )}
              {error && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-rose-500 font-bold">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && stores.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-[#64748B] font-medium">
                    No stores found.
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                stores.map((store, idx) => (
                  <tr key={store.id || idx} className="hover:bg-[#F8FAFC] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p
                        className="font-bold text-[#0EA5E9] hover:underline cursor-pointer"
                        onClick={() => navigate(`/pos/stores/edit/${store.id}`)}
                      >
                        {store.name || store.store_name}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-[#475569]">
                      {store.address || store.location || "-"}
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-[#475569]">
                       {store.phone || store.mobile_number || "-"}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="flex flex-col items-center">
                        <span className="text-[14px] font-bold text-[#1E293B]">
                          {store.created_at
                            ? new Date(store.created_at).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })
                            : "-"}
                        </span>
                        <span className="text-[12px] text-[#94A3B8]">
                          {store.created_at
                            ? new Date(store.created_at)
                                .toLocaleDateString("en-US", {
                                  month: "2-digit",
                                  day: "2-digit",
                                  year: "numeric",
                                })
                                .replace(/\//g, "-")
                            : "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-4">
                        <Pencil
                          size={14}
                          className="text-[#0EA5E9] hover:scale-125 transition cursor-pointer"
                          onClick={() => navigate(`/pos/stores/edit/${store.id}`)}
                        />
                        <Trash2
                          size={14}
                          className="text-rose-500 hover:scale-125 transition cursor-pointer"
                          onClick={() => handleDelete(store.id)}
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

export default StoresManagement;

import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Filter,
  Search,
  RefreshCcw,
  Plus,
  Trash2,
  CheckCircle,
  ChevronDown,
  Check,
} from "lucide-react";
import Loader from "../common/Loader";
import Card from "../common/Card";
import useFetch from "../../hooks/useFetch";
import StyledDropdown from "../common/StyledDropdown";
import { getRouteBaseFromPath } from "../../utils/url";
import { formatDateTime } from "../../utils/dateUtils";

const PERIOD_MONTHS = {
  "Last Month": 1,
  "Last 3 Months": 3,
  "Last 6 Months": 6,
};
const FILTER_BY_OPTIONS = [
  "SKU/UPC",
  "Product Code",
  "Vendor",
  "Date Range",
  "Status",
];

const getFirstDefined = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const toDateValue = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};



const formatAmount = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toFixed(2) : "0.00";
};

const getPeriodRange = (period, now = new Date()) => {
  const months = PERIOD_MONTHS[period];
  if (!months) return null;

  const rangeEnd = new Date(now);
  rangeEnd.setHours(23, 59, 59, 999);

  const rangeStart = new Date(now);
  rangeStart.setMonth(rangeStart.getMonth() - months);
  rangeStart.setDate(rangeStart.getDate() + 1);
  rangeStart.setHours(0, 0, 0, 0);

  return { rangeStart, rangeEnd };
};

const PurchaseOrders = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const routeBase = getRouteBaseFromPath(location.pathname);
  const [filterPeriod, setFilterPeriod] = useState("Last Month");
  const [filterBy, setFilterBy] = useState("SKU/UPC");
  const [filterValue, setFilterValue] = useState("");
  const [selectedVendorFilter, setSelectedVendorFilter] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("");
  const [fromDateFilter, setFromDateFilter] = useState("");
  const [toDateFilter, setToDateFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);

  const {
    data: responseData,
    loading,
    error,
    refetch,
  } = useFetch("/purchasing/orders/");

  const { purchaseOrders, totalOrders } = React.useMemo(() => {
    if (Array.isArray(responseData)) {
      return { purchaseOrders: responseData, totalOrders: responseData.length };
    }

    if (Array.isArray(responseData?.results)) {
      return {
        purchaseOrders: responseData.results,
        totalOrders: Number(responseData.count) || responseData.results.length,
      };
    }

    if (Array.isArray(responseData?.data?.results)) {
      return {
        purchaseOrders: responseData.data.results,
        totalOrders:
          Number(responseData.data.count) || responseData.data.results.length,
      };
    }

    if (Array.isArray(responseData?.data)) {
      return {
        purchaseOrders: responseData.data,
        totalOrders: responseData.data.length,
      };
    }

    return { purchaseOrders: [], totalOrders: 0 };
  }, [responseData]);

  const mappedOrders = React.useMemo(() => {
    return purchaseOrders.map((order, index) => {
      const poNumber = getFirstDefined(
        order.po_number,
        order.po_no,
        order.number,
        order.order_number,
        order.id,
      );
      const orderDateRaw = getFirstDefined(
        order.expected_date,
        order.order_date,
        order.po_date,
        order.created_at,
        order.date,
      );
      const vendorName = getFirstDefined(
        order.vendor_details?.vendor_name,
        order.vendor_details?.company_name,
        order.vendor?.company_name,
        order.vendor?.name,
        order.vendor_name,
        order.vendor,
      );
      const status = getFirstDefined(order.status, order.po_status, "Pending");
      const overallStatus = getFirstDefined(
        order.overall_status,
        order.status,
        order.po_status,
        "Pending",
      );
      const total = getFirstDefined(
        order.total_amount,
        order.estimated_total,
        order.total,
        order.net_total,
      );
      const lineItems = Array.isArray(order.items_detail)
        ? order.items_detail
        : Array.isArray(order.items)
          ? order.items
          : Array.isArray(order.po_items)
            ? order.po_items
            : [];
      const skuUpcText = lineItems
        .map((item) => getFirstDefined(item?.sku, item?.upc, item?.barcode, ""))
        .join(" ");
      const productCodeText = lineItems
        .map((item) =>
          getFirstDefined(
            item?.product_code,
            item?.vendor_code,
            item?.code,
            "",
          ),
        )
        .join(" ");

      return {
        key: getFirstDefined(order.id, order.uuid, poNumber, index),
        id: order.id,
        po: poNumber || `PO-${index + 1}`,
        dateRaw: orderDateRaw,
        dateValue: toDateValue(orderDateRaw),
        date: formatDateTime(orderDateRaw),
        vendor: vendorName || "N/A",
        vendorOrder:
          getFirstDefined(
            order.vendor_order_ref,
            order.vendor_order_number,
            order.vendor_order_no,
            "-",
          ) || "-",
        status,
        total: formatAmount(total),
        overallStatus,
        skuUpcText: String(skuUpcText || "").toLowerCase(),
        productCodeText: String(productCodeText || "").toLowerCase(),
      };
    });
  }, [purchaseOrders]);

  const vendorFilterOptions = React.useMemo(() => {
    const values = Array.from(
      new Set(
        mappedOrders
          .map((record) => String(record.vendor || "").trim())
          .filter(Boolean),
      ),
    );
    return values.sort((a, b) => a.localeCompare(b));
  }, [mappedOrders]);

  const statusFilterOptions = React.useMemo(() => {
    const values = Array.from(
      new Set(
        mappedOrders
          .map((record) => String(record.status || "").trim())
          .filter(Boolean),
      ),
    );
    return values.sort((a, b) => a.localeCompare(b));
  }, [mappedOrders]);

  const displayedOrders = React.useMemo(() => {
    const normalizedFilterValue = String(filterValue || "")
      .trim()
      .toLowerCase();
    const normalizedSearch = String(searchQuery || "")
      .trim()
      .toLowerCase();

    return mappedOrders.filter((order) => {
      if (filterPeriod !== "All") {
        const periodRange = getPeriodRange(filterPeriod);
        if (!order.dateValue || !periodRange) return false;
        if (
          order.dateValue < periodRange.rangeStart ||
          order.dateValue > periodRange.rangeEnd
        )
          return false;
      }

      let matchesFilterBy = true;

      if (filterBy === "SKU/UPC") {
        matchesFilterBy =
          !normalizedFilterValue ||
          order.skuUpcText.includes(normalizedFilterValue);
      } else if (filterBy === "Product Code") {
        matchesFilterBy =
          !normalizedFilterValue ||
          order.productCodeText.includes(normalizedFilterValue);
      } else if (filterBy === "Vendor") {
        matchesFilterBy =
          !selectedVendorFilter || order.vendor === selectedVendorFilter;
      } else if (filterBy === "Status") {
        matchesFilterBy =
          !selectedStatusFilter || order.status === selectedStatusFilter;
      } else if (filterBy === "Date Range") {
        const rowDate = order.dateValue;
        if (!rowDate) {
          matchesFilterBy = false;
        } else {
          const fromDate = fromDateFilter ? new Date(fromDateFilter) : null;
          const toDate = toDateFilter ? new Date(toDateFilter) : null;
          if (fromDate && Number.isFinite(fromDate.getTime()))
            fromDate.setHours(0, 0, 0, 0);
          if (toDate && Number.isFinite(toDate.getTime()))
            toDate.setHours(23, 59, 59, 999);
          matchesFilterBy =
            (!fromDate || rowDate >= fromDate) &&
            (!toDate || rowDate <= toDate);
        }
      }

      if (!matchesFilterBy) return false;

      if (!normalizedSearch) return true;

      const searchableText = [
        order.po,
        order.date,
        order.vendor,
        order.vendorOrder,
        order.status,
        order.total,
        order.overallStatus,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [
    mappedOrders,
    filterPeriod,
    filterBy,
    filterValue,
    selectedVendorFilter,
    selectedStatusFilter,
    fromDateFilter,
    toDateFilter,
    searchQuery,
  ]);

  useEffect(() => {
    setFilterValue("");
    setSelectedVendorFilter("");
    setSelectedStatusFilter("");
    setFromDateFilter("");
    setToDateFilter("");
  }, [filterBy]);

  return (
    <div className="space-y-6">
      {/* Filter Criteria Section */}
      <Card noPadding className="border-slate-200 shadow-sm overflow-visible">
        <div className="p-8 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
          {/* Left side: Title + Radios */}
          <div className="flex flex-col gap-4 min-w-fit">
            <h3 className="text-[15px] font-black text-slate-800 tracking-tight font-poppins">
              Filter Criteria
            </h3>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              {["Last Month", "Last 3 Months", "Last 6 Months", "All"].map(
                (period) => (
                  <label
                    key={period}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        filterPeriod === period
                          ? "border-[#0EA5E9] bg-white"
                          : "border-slate-300 group-hover:border-slate-400"
                      }`}
                    >
                      {filterPeriod === period && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#0EA5E9]" />
                      )}
                    </div>
                    <input
                      type="radio"
                      className="hidden"
                      name="period"
                      checked={filterPeriod === period}
                      onChange={() => setFilterPeriod(period)}
                    />
                    <span
                      className={`text-[13px] font-bold transition-colors ${
                        filterPeriod === period
                          ? "text-slate-900"
                          : "text-slate-400 group-hover:text-slate-600"
                      }`}
                    >
                      {period}
                    </span>
                  </label>
                ),
              )}
            </div>
          </div>

          {/* Right side: Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 flex-1 xl:max-w-3xl items-end">
            <div className="sm:col-span-4 flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Filter By
              </label>
              <StyledDropdown
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                triggerClassName="border-slate-200 bg-slate-50 !text-slate-700 !font-bold !h-11"
                placeholder={filterBy}
              >
                {FILTER_BY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </StyledDropdown>
            </div>
            <div className="sm:col-span-5 flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                {filterBy === "Vendor"
                  ? "Select Vendor"
                  : filterBy === "Date Range"
                    ? "Date Range"
                    : filterBy === "Status"
                      ? "Select Status"
                      : "Filter Value"}
              </label>
              {(filterBy === "SKU/UPC" || filterBy === "Product Code") && (
                <input
                  type="text"
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[14px] font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                  placeholder={`Enter ${filterBy.toLowerCase()}`}
                />
              )}
              {filterBy === "Vendor" && (
                <StyledDropdown
                  value={selectedVendorFilter}
                  onChange={(e) => setSelectedVendorFilter(e.target.value)}
                  triggerClassName="border-slate-200 bg-slate-50 !text-slate-700 !font-bold !h-11"
                  placeholder="All Vendors"
                >
                  <option value="">All Vendors</option>
                  {vendorFilterOptions.map((vendorOption) => (
                    <option key={vendorOption} value={vendorOption}>
                      {vendorOption}
                    </option>
                  ))}
                </StyledDropdown>
              )}
              {filterBy === "Status" && (
                <StyledDropdown
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  triggerClassName="border-slate-200 bg-slate-50 !text-slate-700 !font-bold !h-11"
                  placeholder="All Status"
                >
                  <option value="">All Status</option>
                  {statusFilterOptions.map((statusOption) => (
                    <option key={statusOption} value={statusOption}>
                      {statusOption}
                    </option>
                  ))}
                </StyledDropdown>
              )}
              {filterBy === "Date Range" && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      From Date
                    </span>
                    <input
                      type="date"
                      value={fromDateFilter}
                      onChange={(e) => setFromDateFilter(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      To Date
                    </span>
                    <input
                      type="date"
                      value={toDateFilter}
                      onChange={(e) => setToDateFilter(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="sm:col-span-3">
              <button className="w-full h-11 rounded-xl bg-white border-2 border-[#0EA5E9] text-[#0EA5E9] text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-sky-50 transition-all shadow-sm active:scale-95">
                <Filter size={16} />
                Filter
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Search & Actions Bar */}
      <Card noPadding className="border-slate-200 shadow-sm overflow-visible">
        <div className="p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left side: Search */}
          <div className="flex flex-col gap-4 flex-1 max-w-2xl">
            <h3 className="text-[15px] font-black text-slate-800 tracking-tight font-poppins">
              Search Criteria
            </h3>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[14px] font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                  placeholder=""
                />
              </div>
              <button className="h-11 px-8 rounded-xl border-2 border-[#0EA5E9]/30 text-[#0EA5E9] text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-sky-50 transition-all active:scale-95">
                <Search size={16} />
                Search
              </button>
            </div>
          </div>

          {/* Right side: Actions */}
          <div className="flex items-center gap-3 flex-wrap justify-end lg:pt-8">
            <button className="h-10 px-5 rounded-xl bg-slate-100/50 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95 border border-slate-200">
              Export To CSV
            </button>
            <button
              onClick={refetch}
              className="h-10 px-5 rounded-xl bg-slate-100/50 text-slate-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-200 transition-all active:scale-95 border border-slate-200"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>
            <div className="hidden sm:block h-8 w-px bg-slate-200 mx-1" />
            <button
              onClick={() => navigate(`${routeBase}/purchase-orders/create`)}
              className="h-10 px-6 rounded-xl bg-[#10B981] text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95"
            >
              <Plus size={16} />
              Add
            </button>
            <button className="h-10 px-6 rounded-xl bg-[#F43F5E] text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all active:scale-95">
              <Trash2 size={16} />
              Delete
            </button>
            <button
              onClick={() => navigate(`${routeBase}/purchase-orders/receive`)}
              className="h-10 px-6 rounded-xl bg-[#0EA5E9] text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-sky-500/20 hover:bg-[#0284C7] transition-all active:scale-95"
            >
              <CheckCircle size={16} />
              Receive
            </button>
          </div>
        </div>
      </Card>

      {/* Table Section */}
      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1 min-h-[500px]">
        <div className="overflow-x-auto scrollbar-hide flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                  PO #
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                  PO Date
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                  Vendor
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                  Vendor Order #
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                  Status
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">
                  Est. Total
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                  Status (Overall)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-8 text-center text-[#64748B]"
                  >
                    <Loader size={48} className="mx-auto" />
                    <p className="mt-2 font-medium text-[#64748B]">
                      Loading purchase orders...
                    </p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" className="px-8 py-10">
                    <div className="p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 text-center font-bold">
                      {error}
                    </div>
                  </td>
                </tr>
              ) : displayedOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-8 py-16 text-center">
                    <p className="text-slate-500 font-bold">
                      No purchase orders found.
                    </p>
                  </td>
                </tr>
              ) : (
                displayedOrders.map((order, idx) => (
                  <tr
                    key={order.key}
                    onClick={() => setSelectedRow(idx)}
                    className={`hover:bg-sky-50 transition-colors group ${selectedRow === idx ? "bg-sky-50/50" : ""}`}
                  >
                    <td
                      className="px-8 py-5 text-sm font-black text-sky-500 hover:underline cursor-pointer tracking-tight"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`${routeBase}/purchase-orders/edit/${order.id}`);
                      }}
                    >
                      {order.po}
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-slate-500">
                      {order.date}
                    </td>
                    <td className="px-8 py-5 text-sm font-black text-sky-500 hover:underline cursor-pointer">
                      {order.vendor}
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-slate-400">
                      {order.vendorOrder}
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          order.status === "Fully Received"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : "bg-sky-50 text-sky-600 border-sky-100"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm font-black text-slate-700 text-right">
                      {order.total}
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-slate-700">
                      {order.overallStatus}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-8 py-5 bg-slate-50/30 border-t border-slate-100">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Total Purchase Orders : {totalOrders || displayedOrders.length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrders;

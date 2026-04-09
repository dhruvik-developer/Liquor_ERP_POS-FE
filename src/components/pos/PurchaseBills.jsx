import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Filter,
  Search,
  RefreshCcw,
  Plus,
  Trash2,
  ChevronDown,
  Check,
} from "lucide-react";
import Loader from "../common/Loader";
import Card from "../common/Card";
import useFetch from "../../hooks/useFetch";
import StyledDropdown from "../common/StyledDropdown";

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

const formatDateTime = (value) => {
  const date = toDateValue(value);
  if (!date) return "N/A";
  return date.toLocaleString("en-US");
};

const formatAmount = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toFixed(2) : "0.00";
};

const getPeriodRange = (period, now = new Date()) => {
  const months = PERIOD_MONTHS[period];
  if (!months) return null;

  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const rangeStart = new Date(
    currentMonthStart.getFullYear(),
    currentMonthStart.getMonth() - months,
    1,
    0,
    0,
    0,
    0,
  );
  const rangeEnd = new Date(
    currentMonthStart.getFullYear(),
    currentMonthStart.getMonth(),
    0,
    23,
    59,
    59,
    999,
  );
  return { rangeStart, rangeEnd };
};

const PurchaseBills = () => {
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
  } = useFetch("/purchasing/bills/");
  const { data: vendorsData } = useFetch("/people/vendors/");

  const { purchaseBills, totalBills } = React.useMemo(() => {
    if (Array.isArray(responseData)) {
      return { purchaseBills: responseData, totalBills: responseData.length };
    }

    if (Array.isArray(responseData?.results)) {
      return {
        purchaseBills: responseData.results,
        totalBills: Number(responseData.count) || responseData.results.length,
      };
    }

    if (Array.isArray(responseData?.data?.results)) {
      return {
        purchaseBills: responseData.data.results,
        totalBills:
          Number(responseData.data.count) || responseData.data.results.length,
      };
    }

    if (Array.isArray(responseData?.data)) {
      return {
        purchaseBills: responseData.data,
        totalBills: responseData.data.length,
      };
    }

    return { purchaseBills: [], totalBills: 0 };
  }, [responseData]);

  const mappedBills = React.useMemo(() => {
    const vendorList = Array.isArray(vendorsData)
      ? vendorsData
      : Array.isArray(vendorsData?.results)
        ? vendorsData.results
        : Array.isArray(vendorsData?.data?.results)
          ? vendorsData.data.results
          : Array.isArray(vendorsData?.data)
            ? vendorsData.data
            : [];

    const vendorLookup = vendorList.reduce((acc, vendor) => {
      const id = String(
        getFirstDefined(vendor.id, vendor.vendor_id, ""),
      ).trim();
      const name = getFirstDefined(
        vendor.vendor_name,
        vendor.company_name,
        vendor.name,
        vendor.vendor_code,
      );
      if (id && name) acc[id] = name;
      return acc;
    }, {});

    return purchaseBills.map((bill, index) => {
      const billNumber = getFirstDefined(
        bill.bill_number,
        bill.bill_no,
        bill.invoice_number,
        bill.number,
        bill.reference_number,
        bill.id,
      );
      const billDateRaw = getFirstDefined(
        bill.bill_date,
        bill.bill_datetime,
        bill.date,
        bill.created_at,
      );
      const dueDateRaw = getFirstDefined(
        bill.due_date,
        bill.due_datetime,
        bill.payment_due_date,
      );
      const billVendorId = String(
        getFirstDefined(bill.vendor?.id, bill.vendor_id, bill.vendor, ""),
      ).trim();
      const vendorName = getFirstDefined(
        bill.vendor?.vendor_name,
        bill.vendor?.company_name,
        bill.vendor?.name,
        bill.vendor_name,
        vendorLookup[billVendorId],
        bill.vendor,
      );
      const totalAmount = getFirstDefined(
        bill.total_amount,
        bill.total,
        bill.amount_total,
        bill.grand_total,
        bill.net_total,
      );
      const lineItems = Array.isArray(bill.items_detail)
        ? bill.items_detail
        : Array.isArray(bill.items)
          ? bill.items
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
      const status = getFirstDefined(
        bill.status,
        bill.bill_status,
        bill.payment_status,
        bill.paid_status,
        "Open",
      );

      return {
        key: getFirstDefined(bill.id, bill.uuid, billNumber, index),
        id: billNumber || `BILL-${index + 1}`,
        dateRaw: billDateRaw,
        dateValue: toDateValue(billDateRaw),
        date: formatDateTime(billDateRaw),
        vendor: vendorName || "N/A",
        status,
        total: formatAmount(totalAmount),
        dueDate: formatDateTime(dueDateRaw),
        note: getFirstDefined(bill.note, bill.notes, ""),
        skuUpcText: String(skuUpcText || "").toLowerCase(),
        productCodeText: String(productCodeText || "").toLowerCase(),
      };
    });
  }, [purchaseBills, vendorsData]);

  const vendorFilterOptions = React.useMemo(() => {
    const values = Array.from(
      new Set(
        mappedBills
          .map((record) => String(record.vendor || "").trim())
          .filter(Boolean),
      ),
    );
    return values.sort((a, b) => a.localeCompare(b));
  }, [mappedBills]);

  const statusFilterOptions = React.useMemo(() => {
    const values = Array.from(
      new Set(
        mappedBills
          .map((record) => String(record.status || "").trim())
          .filter(Boolean),
      ),
    );
    return values.sort((a, b) => a.localeCompare(b));
  }, [mappedBills]);

  const displayedBills = React.useMemo(() => {
    const normalizedFilterValue = String(filterValue || "")
      .trim()
      .toLowerCase();
    const normalizedSearch = String(searchQuery || "")
      .trim()
      .toLowerCase();

    return mappedBills.filter((bill) => {
      if (filterPeriod !== "All") {
        const periodRange = getPeriodRange(filterPeriod);
        if (!bill.dateValue || !periodRange) return false;
        if (
          bill.dateValue < periodRange.rangeStart ||
          bill.dateValue > periodRange.rangeEnd
        )
          return false;
      }

      let matchesFilterBy = true;

      if (filterBy === "SKU/UPC") {
        matchesFilterBy =
          !normalizedFilterValue ||
          bill.skuUpcText.includes(normalizedFilterValue);
      } else if (filterBy === "Product Code") {
        matchesFilterBy =
          !normalizedFilterValue ||
          bill.productCodeText.includes(normalizedFilterValue);
      } else if (filterBy === "Vendor") {
        matchesFilterBy =
          !selectedVendorFilter || bill.vendor === selectedVendorFilter;
      } else if (filterBy === "Status") {
        matchesFilterBy =
          !selectedStatusFilter || bill.status === selectedStatusFilter;
      } else if (filterBy === "Date Range") {
        const rowDate = bill.dateValue;
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

      const combinedSearch = [
        bill.id,
        bill.vendor,
        bill.note,
        bill.status,
        bill.total,
        bill.date,
        bill.dueDate,
      ];
      return combinedSearch.some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(normalizedSearch),
      );
    });
  }, [
    mappedBills,
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
      <Card className="!p-4 bg-white shadow-sm border border-slate-200">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5 flex-1 max-w-xl">
            <h3 className="text-[15px] font-black text-slate-800 tracking-tight font-poppins">
              Search Criteria
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 transition-all shadow-inner"
              />
              <button className="h-11 px-6 rounded-xl border border-sky-400 bg-white text-sky-500 flex items-center gap-2 text-xs font-black uppercase tracking-widest shadow-sm hover:bg-sky-50 transition-all active:scale-95">
                <Search size={16} />
                Search
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button className="h-11 px-6 rounded-xl bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-200 transition-all shadow-sm active:scale-95">
              Export To CSV
            </button>
            <button
              onClick={refetch}
              className="h-11 px-6 rounded-xl bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-200 transition-all shadow-sm active:scale-95"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>
            <Link to="/pos/purchase-bills/create">
              <button className="h-11 px-6 rounded-xl bg-emerald-500 text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95">
                <Plus size={18} />
                Add
              </button>
            </Link>
            <button className="h-11 px-6 rounded-xl bg-rose-500 text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all active:scale-95">
              <Trash2 size={18} />
              Delete
            </button>
          </div>
        </div>
      </Card>

      {/* Table Section */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden min-h-[500px]">
        <div className="overflow-auto flex-1 scrollbar-hide">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Bill #
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Bill Date
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Vendor
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Total Amt.
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Due Date
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Note
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-8 text-center text-[#64748B]"
                  >
                    <Loader size={48} className="mx-auto" />
                    <p className="mt-2 font-medium">Loading bills...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="px-8 py-10">
                    <div className="p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 text-center font-bold">
                      {error}
                    </div>
                  </td>
                </tr>
              ) : displayedBills.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-8 py-16 text-center">
                    <p className="text-slate-500 font-bold">
                      No purchase bills found.
                    </p>
                  </td>
                </tr>
              ) : (
                displayedBills.map((bill, index) => {
                  const isSelected = selectedRow === index;
                  return (
                    <tr
                      key={bill.key}
                      onClick={() => setSelectedRow(index)}
                      className={`hover:bg-sky-50 transition-colors cursor-pointer ${
                        index % 2 !== 0 ? "bg-slate-50/30" : ""
                      } ${isSelected ? "shadow-[inset_4px_0_0_#0EA5E9] bg-sky-50/50" : ""}`}
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-sky-500 hover:underline">
                          {bill.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-600">
                        {bill.date}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-sky-500 hover:underline">
                          {bill.vendor}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-700">
                        {bill.total}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-500">
                        {bill.dueDate}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-400">
                        {bill.note}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="px-8 py-4 bg-white border-t border-slate-100">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Total Purchase Bills : {totalBills || displayedBills.length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PurchaseBills;

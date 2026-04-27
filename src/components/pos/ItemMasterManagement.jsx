import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Building2,
  Layers,
  ListFilter,
  Maximize,
  Package,
  Ruler,
  Award,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import Loader from "../common/Loader";
import Button from "../common/Button";
import useFetch from "../../hooks/useFetch";
import useApi from "../../hooks/useApi";
import { refetchDepartments } from "../../hooks/useDepartments";
import { refetchCategories } from "../../hooks/useCategories";
import { refetchSubCategories } from "../../hooks/useSubCategories";
import { refetchSizes } from "../../hooks/useSizes";
import { refetchPacks } from "../../hooks/usePacks";
import { refetchBrands } from "../../hooks/useBrands";
import StyledDropdown from "../common/StyledDropdown";

const MASTER_TABS = [
  {
    key: "department",
    label: "Department",
    endpoint: "/lookups/departments/",
    icon: Building2,
  },
  {
    key: "category",
    label: "Category",
    endpoint: "/inventory/categories/",
    icon: Layers,
  },
  {
    key: "sub-category",
    label: "Sub-Category",
    endpoint: "/inventory/sub-categories/",
    icon: ListFilter,
  },
  { key: "uom", label: "UMO", endpoint: "/lookups/uoms/", icon: Ruler },
  { key: "size", label: "Size", endpoint: "/lookups/sizes/", icon: Maximize },
  { key: "pack", label: "Pack", endpoint: "/lookups/packs/", icon: Package },
  { key: "brand", label: "Brand", endpoint: "/lookups/brands/", icon: Award },
];

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.results)) return value.results;
  return [];
};

const getId = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  if (typeof value === "object") {
    if (value.id !== undefined && value.id !== null) return Number(value.id);
    if (value.pk !== undefined && value.pk !== null) return Number(value.pk);
  }
  return null;
};

const getName = (value) => {
  if (!value) return "-";
  if (typeof value === "string") return value;
  return value.name || value.localized_name || value.title || "-";
};

const normalizeRelationName = (record, relationKey, fallbackKey) => {
  const relationValue = record?.[relationKey];
  const fallbackValue = record?.[fallbackKey];
  if (typeof relationValue === "object" && relationValue !== null)
    return getName(relationValue);
  if (typeof fallbackValue === "string") return fallbackValue;
  if (typeof relationValue === "string") return relationValue;
  return "-";
};

const getDepartmentNameFromCategory = (
  categoryValue,
  categories,
  departments,
) => {
  const categoryId = getId(categoryValue);
  let categoryRecord = null;

  if (typeof categoryValue === "object" && categoryValue !== null) {
    categoryRecord = categoryValue;
  } else if (categoryId) {
    categoryRecord =
      categories.find((cat) => getId(cat) === categoryId) || null;
  }

  if (!categoryRecord) return "";

  const directDepartmentName = normalizeRelationName(
    categoryRecord,
    "department",
    "department_name",
  );
  if (directDepartmentName && directDepartmentName !== "-")
    return directDepartmentName;

  const departmentId = getId(categoryRecord?.department);
  if (!departmentId) return "";

  const departmentRecord = departments.find(
    (dep) => getId(dep) === departmentId,
  );
  return getName(departmentRecord);
};

const getCategoryWithDepartmentLabel = (item, categories, departments) => {
  const directDisplay = item?.category_display;
  if (typeof directDisplay === "string" && directDisplay.trim())
    return directDisplay;

  const categoryLabel = normalizeRelationName(
    item,
    "category",
    "category_name",
  );
  if (!categoryLabel || categoryLabel === "-") return "-";
  if (categoryLabel.includes("->")) return categoryLabel;

  const apiDepartmentLabel = item?.category_department_name;
  const departmentLabel =
    typeof apiDepartmentLabel === "string" && apiDepartmentLabel.trim()
      ? apiDepartmentLabel
      : getDepartmentNameFromCategory(item?.category, categories, departments);
  if (!departmentLabel || departmentLabel === "-") return categoryLabel;
  return `${categoryLabel} -> ${departmentLabel}`;
};

const getDefaultForm = (activeTab) => {
  if (activeTab === "brand") return { name: "", manufacturer: "" };
  if (activeTab === "category")
    return { name: "", localized_name: "", department: "" };
  if (activeTab === "sub-category")
    return { name: "", localized_name: "", category: "" };
  if (activeTab === "size") {
    return {
      name: "",
      localized_name: "",
      uom: "",
      no_of_units: "",
      units_in_case: "",
      tax_factor: "",
      unit_price_factor: "",
      unit_price_uom: "",
    };
  }
  if (activeTab === "pack")
    return { name: "", localized_name: "", units_in_pack: "" };
  return { name: "", localized_name: "" };
};

const getSerialNumberColumn = () => ({
  key: "serialNumber",
  title: "SR NO.",
  render: (_, index) => index + 1,
});

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const ItemMasterManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "department";
  const [searchText, setSearchText] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(getDefaultForm(activeTab));
  const [formError, setFormError] = useState("");

  const activeConfig = useMemo(
    () => MASTER_TABS.find((tab) => tab.key === activeTab) || MASTER_TABS[0],
    [activeTab],
  );

  const { data, loading, error, refetch } = useFetch(activeConfig.endpoint);
  const { data: departmentsData } = useFetch("/lookups/departments/");
  const { data: categoriesData } = useFetch("/inventory/categories/");
  const { data: uomsData, refetch: refetchUomsList } =
    useFetch("/lookups/uoms/");
  const { post, put, del, loading: saving, error: apiError } = useApi();

  const departments = useMemo(
    () => toArray(departmentsData),
    [departmentsData],
  );
  const categories = useMemo(() => toArray(categoriesData), [categoriesData]);
  const uoms = useMemo(() => toArray(uomsData), [uomsData]);
  const rows = useMemo(() => toArray(data), [data]);
  const sizeUomDisplay = useMemo(() => {
    const selected = uoms.find(
      (item) => String(item?.id || "") === String(formData.uom || ""),
    );
    return selected?.name || "";
  }, [uoms, formData.uom]);

  useEffect(() => {
    setSearchText("");
    setCurrentPage(1);
    setPageInput("1");
    setIsModalOpen(false);
    setFormError("");
    setFormData(getDefaultForm(activeTab));
    setEditingItem(null);
  }, [activeTab]);

  const filteredRows = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return rows;

    return rows.filter((item) => {
      const tokens = [
        item?.id,
        item?.name,
        item?.manufacturer,
        item?.localized_name,
        normalizeRelationName(item, "department", "department_name"),
        activeTab === "sub-category"
          ? getCategoryWithDepartmentLabel(item, categories, departments)
          : normalizeRelationName(item, "category", "category_name"),
        item?.category_display,
        item?.category_department_name,
        normalizeRelationName(item, "uom", "uom_name"),
        item?.units_in_pack,
      ];
      return tokens.some((token) =>
        String(token || "")
          .toLowerCase()
          .includes(query),
      );
    });
  }, [rows, searchText, activeTab, categories, departments]);

  const totalRecords = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

  useEffect(() => {
    setCurrentPage(1);
    setPageInput("1");
  }, [searchText, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
      setPageInput(String(totalPages));
      return;
    }

    setPageInput(String(currentPage));
  }, [currentPage, totalPages]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  const pageStart = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const pageEnd =
    totalRecords === 0 ? 0 : Math.min(currentPage * pageSize, totalRecords);

  const setTab = (tab) => {
    setSearchParams({ tab });
  };

  const handlePageChange = (nextPage) => {
    const safePage = Math.min(Math.max(1, nextPage), totalPages);
    setCurrentPage(safePage);
    setPageInput(String(safePage));
  };

  const handlePageInputCommit = () => {
    const parsedPage = Number(pageInput);
    if (!Number.isInteger(parsedPage) || parsedPage < 1) {
      setPageInput(String(currentPage));
      return;
    }

    handlePageChange(parsedPage);
  };

  const openCreate = () => {
    setEditingItem(null);
    setFormError("");
    setFormData(getDefaultForm(activeTab));
    setIsModalOpen(true);
  };

  const openEdit = (item) => {
    const next = getDefaultForm(activeTab);
    next.name = item?.name || "";
    if (activeTab === "brand") {
      next.manufacturer = item?.manufacturer || "";
    } else {
      next.localized_name = item?.localized_name || "";
    }

    if (activeTab === "category") {
      next.department = String(getId(item?.department) || "");
    }
    if (activeTab === "sub-category") {
      next.category = String(getId(item?.category) || "");
    }
    if (activeTab === "size") {
      next.uom = String(getId(item?.uom) || "");
      next.no_of_units =
        item?.no_of_units !== undefined && item?.no_of_units !== null
          ? String(item.no_of_units)
          : "";
      next.units_in_case =
        item?.units_in_case !== undefined && item?.units_in_case !== null
          ? String(item.units_in_case)
          : "";
      next.tax_factor =
        item?.tax_factor !== undefined && item?.tax_factor !== null
          ? String(item.tax_factor)
          : "";
      next.unit_price_factor =
        item?.unit_price_factor !== undefined &&
        item?.unit_price_factor !== null
          ? String(item.unit_price_factor)
          : "";
      next.unit_price_uom = String(getId(item?.unit_price_uom) || "");
    }
    if (activeTab === "pack") {
      const packUnits = item?.units_in_pack ?? item?.units_in_case;
      next.units_in_pack =
        packUnits !== undefined && packUnits !== null ? String(packUnits) : "";
    }

    setEditingItem(item);
    setFormError("");
    setFormData(next);
    setIsModalOpen(true);
  };

  const refreshCacheByTab = async (tab) => {
    if (tab === "department") return refetchDepartments();
    if (tab === "category") return refetchCategories();
    if (tab === "sub-category") return refetchSubCategories();
    if (tab === "size") return refetchSizes();
    if (tab === "uom") return refetchUomsList();
    if (tab === "pack") return refetchPacks();
    if (tab === "brand") return refetchBrands();
    return Promise.resolve();
  };

  const buildPayload = () => {
    const baseName = formData.name?.trim();
    if (!baseName) {
      throw new Error("Name is required.");
    }

    if (activeTab === "brand") {
      return {
        name: baseName,
        manufacturer: formData.manufacturer?.trim() || "",
      };
    }

    if (activeTab === "category") {
      const departmentId = Number(formData.department);
      if (!departmentId) throw new Error("Department is required.");
      return {
        name: baseName,
        localized_name: formData.localized_name?.trim() || "",
        department: departmentId,
      };
    }

    if (activeTab === "sub-category") {
      const categoryId = Number(formData.category);
      if (!categoryId) throw new Error("Category is required.");
      return {
        name: baseName,
        localized_name: formData.localized_name?.trim() || "",
        category: categoryId,
      };
    }

    if (activeTab === "size") {
      const uomId = Number(formData.uom);
      if (!uomId) throw new Error("UOM is required.");
      const noOfUnits =
        formData.no_of_units === "" ? null : Number(formData.no_of_units);
      const unitsInCase =
        formData.units_in_case === "" ? null : Number(formData.units_in_case);
      const taxFactor =
        formData.tax_factor === "" ? null : Number(formData.tax_factor);
      const unitPriceFactor =
        formData.unit_price_factor === ""
          ? null
          : Number(formData.unit_price_factor);
      const unitPriceUomId = Number(formData.unit_price_uom) || null;

      if (noOfUnits !== null && Number.isNaN(noOfUnits))
        throw new Error("No. of Units must be numeric.");
      if (unitsInCase !== null && Number.isNaN(unitsInCase))
        throw new Error("Units In Case must be numeric.");
      if (taxFactor !== null && Number.isNaN(taxFactor))
        throw new Error("Tax Factor must be numeric.");
      if (unitPriceFactor !== null && Number.isNaN(unitPriceFactor))
        throw new Error("Unit Price Factor must be numeric.");

      return {
        name: baseName,
        localized_name: formData.localized_name?.trim() || "",
        uom: uomId,
        ...(noOfUnits !== null ? { no_of_units: noOfUnits } : {}),
        ...(unitsInCase !== null ? { units_in_case: unitsInCase } : {}),
        ...(taxFactor !== null ? { tax_factor: taxFactor } : {}),
        ...(unitPriceFactor !== null
          ? { unit_price_factor: unitPriceFactor }
          : {}),
        ...(unitPriceUomId !== null ? { unit_price_uom: unitPriceUomId } : {}),
      };
    }
    if (activeTab === "pack") {
      const unitsInPack =
        formData.units_in_pack === "" ? null : Number(formData.units_in_pack);
      if (unitsInPack !== null && Number.isNaN(unitsInPack))
        throw new Error("Units In Pack must be numeric.");
      return {
        name: baseName,
        localized_name: formData.localized_name?.trim() || "",
        ...(unitsInPack !== null ? { units_in_pack: unitsInPack } : {}),
      };
    }

    return {
      name: baseName,
      localized_name: formData.localized_name?.trim() || "",
    };
  };

  const handleSave = async () => {
    try {
      setFormError("");
      const payload = buildPayload();

      if (editingItem?.id) {
        await put(`${activeConfig.endpoint}${editingItem.id}/`, payload);
      } else {
        await post(activeConfig.endpoint, payload);
      }

      await Promise.all([refetch(), refreshCacheByTab(activeTab)]);
      setIsModalOpen(false);
      setEditingItem(null);
      setFormData(getDefaultForm(activeTab));
    } catch (submitError) {
      setFormError(submitError?.message || "Unable to save item.");
    }
  };

  const handleDelete = async (item) => {
    if (!item?.id) return;
    const itemName = item?.name || `ID ${item.id}`;
    const ok = window.confirm(`Delete "${itemName}"?`);
    if (!ok) return;

    try {
      await del(`${activeConfig.endpoint}${item.id}/`);
      await Promise.all([refetch(), refreshCacheByTab(activeTab)]);
    } catch (deleteError) {
      setFormError(deleteError?.message || "Unable to delete item.");
    }
  };

  const columns = useMemo(() => {
    if (activeTab === "department") {
      return [
        getSerialNumberColumn(),
        {
          key: "name",
          title: "DEPARTMENT",
          render: (item) => item.name || "-",
        },
      ];
    }
    if (activeTab === "category") {
      return [
        getSerialNumberColumn(),
        { key: "name", title: "CATEGORY", render: (item) => item.name || "-" },
        {
          key: "department",
          title: "DEPARTMENT",
          render: (item) =>
            normalizeRelationName(item, "department", "department_name"),
        },
      ];
    }
    if (activeTab === "sub-category") {
      return [
        getSerialNumberColumn(),
        {
          key: "name",
          title: "SUB CATEGORY",
          render: (item) => item.name || "-",
        },
        {
          key: "category",
          title: "CATEGORY",
          render: (item) =>
            getCategoryWithDepartmentLabel(item, categories, departments),
        },
      ];
    }
    if (activeTab === "size") {
      return [
        getSerialNumberColumn(),
        { key: "name", title: "SIZE", render: (item) => item.name || "-" },
        {
          key: "uom",
          title: "UOM",
          render: (item) => normalizeRelationName(item, "uom", "uom_name"),
        },
        {
          key: "no_of_units",
          title: "UNITS",
          render: (item) => item.no_of_units || "-",
        },
        {
          key: "units_in_case",
          title: "CASE QTY",
          render: (item) => item.units_in_case || "-",
        },
        {
          key: "tax_factor",
          title: "TAX FACT.",
          render: (item) => item.tax_factor || "-",
        },
      ];
    }
    if (activeTab === "uom") {
      return [
        getSerialNumberColumn(),
        { key: "name", title: "UOM", render: (item) => item.name || "-" },
      ];
    }
    if (activeTab === "pack") {
      return [
        getSerialNumberColumn(),
        { key: "name", title: "PACK", render: (item) => item.name || "-" },
        {
          key: "units_in_pack",
          title: "UNITS IN PACK",
          render: (item) => item.units_in_pack ?? item.units_in_case ?? "-",
        },
      ];
    }
    return [
      getSerialNumberColumn(),
      { key: "name", title: "BRAND NAME", render: (item) => item.name || "-" },
      {
        key: "manufacturer",
        title: "MANUFACTURER",
        render: (item) => item.manufacturer || "-",
      },
    ];
  }, [activeTab, categories, departments]);

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-300 pb-8 pr-2">
      {/* Horizontal Tab Navigation */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm p-1 flex items-center gap-1 w-fit">
        {MASTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setTab(tab.key)}
            className={`flex items-center gap-2 px-6 py-2 rounded-md text-[14px] font-bold transition-all duration-200 ${
              activeTab === tab.key
                ? "bg-[#0EA5E91A] text-[#0EA5E9]"
                : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]"
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <section className="min-w-0 flex-1 rounded-lg border border-[#E2E8F0] bg-white p-5 shadow-sm flex flex-col">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder={`Search ${activeConfig.label}`}
            className="h-10 w-full max-w-[320px] rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-[14px] font-medium text-[#1E293B] outline-none transition-all focus:border-[#0EA5E9] focus:bg-white focus:ring-4 focus:ring-[#0EA5E90D]"
          />
          <div className="flex-1" />
          <div className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-[13px] text-[#475569]">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(event) => setPageSize(Number(event.target.value))}
              className="min-w-[64px] rounded border border-[#CBD5E1] bg-white px-2 py-1 text-[13px] font-medium text-[#1E293B] outline-none"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>records</span>
          </div>
          <Button className="gap-2" onClick={openCreate}>
            <Plus size={16} />
            Add
          </Button>
        </div>

        <div className="overflow-hidden rounded-lg border border-[#E2E8F0]">
          <div className="overflow-auto">
            <table className="w-full border-collapse text-left text-[14px]">
              <thead className="bg-[#F8FAFC]">
                <tr className="border-b border-[#E2E8F0]">
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="whitespace-nowrap px-5 py-3 text-[11px] font-black uppercase tracking-wider text-[#64748B]"
                    >
                      {column.title}
                    </th>
                  ))}
                  <th className="px-5 py-3 text-right text-[11px] font-black uppercase tracking-wider text-[#64748B]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] bg-white">
                {loading && (
                  <tr>
                    <td
                      colSpan={columns.length + 1}
                      className="px-5 py-8 text-center text-[#64748B]"
                    >
                      <Loader size={40} className="mx-auto mb-2" />
                      Loading...
                    </td>
                  </tr>
                )}
                {!loading && error && (
                  <tr>
                    <td
                      colSpan={columns.length + 1}
                      className="px-5 py-8 text-center font-bold text-rose-500"
                    >
                      {error}
                    </td>
                  </tr>
                )}
                {!loading && !error && filteredRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={columns.length + 1}
                      className="px-5 py-8 text-center text-[#64748B]"
                    >
                      No records found.
                    </td>
                  </tr>
                )}
                {!loading &&
                  !error &&
                  paginatedRows.map((item, index) => (
                    <tr key={item?.id || index} className="hover:bg-[#F8FAFC]">
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className="whitespace-nowrap px-5 py-3 text-[#1E293B]"
                        >
                          {column.render(
                            item,
                            (currentPage - 1) * pageSize + index,
                          )}
                        </td>
                      ))}
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => openEdit(item)}
                            className="rounded p-1 text-[#0EA5E9] transition hover:bg-[#E0F2FE]"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="rounded p-1 text-rose-500 transition hover:bg-rose-50"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-[13px] text-[#475569] md:flex-row md:items-center md:justify-between">
          <div>
            {pageStart} - {pageEnd} of {totalRecords} records
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1 || totalRecords === 0}
              className="flex h-8 w-8 items-center justify-center rounded border border-[#CBD5E1] bg-white text-[#64748B] transition hover:bg-[#E2E8F0] disabled:cursor-not-allowed disabled:opacity-50"
              title="First Page"
            >
              <ChevronsLeft size={14} />
            </button>
            <button
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || totalRecords === 0}
              className="flex h-8 items-center gap-1 rounded border border-[#CBD5E1] bg-white px-2 text-[#64748B] transition hover:bg-[#E2E8F0] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft size={14} />
              Prev
            </button>
            <div className="flex items-center gap-2 px-1">
              <span>Pg</span>
              <input
                type="text"
                inputMode="numeric"
                value={pageInput}
                onChange={(event) =>
                  setPageInput(event.target.value.replace(/[^\d]/g, ""))
                }
                onBlur={handlePageInputCommit}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handlePageInputCommit();
                }}
                className="h-8 w-14 rounded border border-[#CBD5E1] bg-white px-2 text-center font-medium text-[#1E293B] outline-none"
              />
              <span>of {totalPages}</span>
            </div>
            <button
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalRecords === 0}
              className="flex h-8 items-center gap-1 rounded border border-[#CBD5E1] bg-white px-2 text-[#64748B] transition hover:bg-[#E2E8F0] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <ChevronRight size={14} />
            </button>
            <button
              type="button"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages || totalRecords === 0}
              className="flex h-8 w-8 items-center justify-center rounded border border-[#CBD5E1] bg-white text-[#64748B] transition hover:bg-[#E2E8F0] disabled:cursor-not-allowed disabled:opacity-50"
              title="Last Page"
            >
              <ChevronsRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-xl border border-[#E2E8F0] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
              <h3 className="text-[16px] font-bold text-[#1E293B]">
                {editingItem
                  ? `Edit ${activeConfig.label}`
                  : `Add ${activeConfig.label}`}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-md p-1 text-[#64748B] transition hover:bg-[#F8FAFC] hover:text-[#1E293B]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 p-5">
              {(formError || apiError) && (
                <div className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-[13px] font-bold text-rose-600">
                  {formError || apiError}
                </div>
              )}

              <input
                value={formData.name || ""}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Name *"
                className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-[14px] text-[#1E293B] outline-none focus:border-[#0EA5E9] focus:bg-white"
              />

              {activeTab !== "brand" && (
                <input
                  value={formData.localized_name || ""}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      localized_name: event.target.value,
                    }))
                  }
                  placeholder="Localized Name"
                  className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-[14px] text-[#1E293B] outline-none focus:border-[#0EA5E9] focus:bg-white"
                />
              )}

              {activeTab === "brand" && (
                <input
                  value={formData.manufacturer || ""}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      manufacturer: event.target.value,
                    }))
                  }
                  placeholder="Manufacturer"
                  className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-[14px] text-[#1E293B] outline-none focus:border-[#0EA5E9] focus:bg-white"
                />
              )}

              {activeTab === "category" && (
                <StyledDropdown
                  value={formData.department || ""}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      department: event.target.value,
                    }))
                  }
                  triggerClassName="!h-10 border-[#E2E8F0] bg-[#F8FAFC] !text-[#1E293B]"
                  placeholder="Select Department *"
                >
                  {departments.map((department) => (
                    <option
                      key={department.id || department.name}
                      value={String(department.id || "")}
                    >
                      {department.name}
                    </option>
                  ))}
                </StyledDropdown>
              )}

              {activeTab === "sub-category" && (
                <StyledDropdown
                  value={formData.category || ""}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: event.target.value,
                    }))
                  }
                  triggerClassName="!h-10 border-[#E2E8F0] bg-[#F8FAFC] !text-[#1E293B]"
                  placeholder="Select Category *"
                >
                  {categories.map((category) => (
                    <option
                      key={category.id || category.name}
                      value={String(category.id || "")}
                    >
                      {(() => {
                        const departmentLabel = getDepartmentNameFromCategory(
                          category,
                          categories,
                          departments,
                        );
                        return departmentLabel && departmentLabel !== "-"
                          ? `${category.name} -> ${departmentLabel}`
                          : category.name;
                      })()}
                    </option>
                  ))}
                </StyledDropdown>
              )}

              {activeTab === "size" && (
                <>
                  <StyledDropdown
                    value={formData.uom || ""}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        uom: event.target.value,
                      }))
                    }
                    triggerClassName="!h-10 border-[#E2E8F0] bg-[#F8FAFC] !text-[#1E293B]"
                    placeholder="Select UOM *"
                  >
                    {uoms.map((uom) => (
                      <option
                        key={uom.id || uom.name}
                        value={String(uom.id || "")}
                      >
                        {uom.name || "-"}
                      </option>
                    ))}
                  </StyledDropdown>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      value={formData.no_of_units || ""}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          no_of_units: event.target.value,
                        }))
                      }
                      placeholder="No. of Units"
                      className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-[14px] text-[#1E293B] outline-none focus:border-[#0EA5E9] focus:bg-white"
                    />
                    <input
                      type="number"
                      value={formData.units_in_case || ""}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          units_in_case: event.target.value,
                        }))
                      }
                      placeholder="Units In Case"
                      className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-[14px] text-[#1E293B] outline-none focus:border-[#0EA5E9] focus:bg-white"
                    />
                  </div>

                  <input
                    type="number"
                    step="0.001"
                    value={formData.tax_factor || ""}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        tax_factor: event.target.value,
                      }))
                    }
                    placeholder="Tax Factor"
                    className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-[14px] text-[#1E293B] outline-none focus:border-[#0EA5E9] focus:bg-white"
                  />

                  <div className="rounded-lg border border-[#E2E8F0] p-3">
                    <p className="mb-2 text-[11px] font-black uppercase tracking-wider text-[#64748B]">
                      Unit Price
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        step="0.0001"
                        value={formData.unit_price_factor || ""}
                        onChange={(event) =>
                          setFormData((prev) => ({
                            ...prev,
                            unit_price_factor: event.target.value,
                          }))
                        }
                        placeholder="Factor"
                        className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-[14px] text-[#1E293B] outline-none focus:border-[#0EA5E9] focus:bg-white"
                      />
                      <StyledDropdown
                        value={String(formData.unit_price_uom || "")}
                        onChange={(event) =>
                          setFormData((prev) => ({
                            ...prev,
                            unit_price_uom: event.target.value,
                          }))
                        }
                        triggerClassName="!h-10 border-[#E2E8F0] bg-[#F8FAFC] !text-[#1E293B]"
                        placeholder="Select UOM"
                      >
                        {uoms.map((uom) => (
                          <option key={uom.id} value={String(uom.id)}>
                            {uom.name || "-"}
                          </option>
                        ))}
                      </StyledDropdown>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "pack" && (
                <input
                  type="number"
                  value={formData.units_in_pack || ""}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      units_in_pack: event.target.value,
                    }))
                  }
                  placeholder="Units In Pack"
                  className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-[14px] text-[#1E293B] outline-none focus:border-[#0EA5E9] focus:bg-white"
                />
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-[#E2E8F0] bg-[#F8FAFC] px-5 py-4">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="min-w-[120px]">
                {saving ? "Saving..." : editingItem ? "Update" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemMasterManagement;

import React, { useState } from "react";
import { X, Save, ChevronDown, Check } from "lucide-react";
import StyledDropdown from "./StyledDropdown";

const DataEntryModal = ({ type, onClose, onSave }) => {
  const configs = {
    department: {
      title: "Department Setup",
      fields: [
        {
          id: "name",
          label: "Department Name *",
          placeholder: "e.g. Spirits, Wine",
        },
        {
          id: "localizedName",
          label: "Localized Name",
          placeholder: "Display name",
        },
      ],
    },
    brand: {
      title: "Brand Registration",
      fields: [
        { id: "name", label: "Brand Name *", placeholder: "e.g. Jack Daniels" },
        {
          id: "manufacturer",
          label: "Manufacturer",
          placeholder: "Parent company",
        },
      ],
    },
    category: {
      title: "Category Mapping",
      fields: [
        { id: "name", label: "Category Name *", placeholder: "e.g. Bourbon" },
        {
          id: "localizedName",
          label: "Localized Name",
          placeholder: "Display name",
        },
        {
          id: "department",
          label: "Parent Department",
          placeholder: "Select Department",
          type: "select",
          options: ["Liquor", "Beer", "Wine", "Tobacco"],
        },
      ],
    },
    subCategory: {
      title: "Sub-Category Data",
      fields: [
        {
          id: "name",
          label: "Sub-Category Name *",
          placeholder: "e.g. Single Malt",
        },
        {
          id: "localizedName",
          label: "Localized Name",
          placeholder: "Display name",
        },
        {
          id: "category",
          label: "Parent Category",
          placeholder: "Select Category",
          type: "select",
          options: ["Scotch", "Irish", "Japanese"],
        },
      ],
    },
    size: {
      title: "Unit Size Management",
      fields: [
        { id: "name", label: "Size Name *", placeholder: "e.g. 750ml" },
        {
          id: "localizedName",
          label: "Localized Name",
          placeholder: "Display name",
        },
        {
          id: "category",
          label: "Default Category",
          placeholder: "Select Category",
          type: "select",
          options: ["Spirits", "Wine"],
        },
        {
          id: "uom",
          label: "Unit of Measure",
          placeholder: "Select UOM",
          type: "select",
          options: ["ML", "L", "OZ", "GL"],
        },
      ],
    },
    pack: {
      title: "Packaging Standards",
      fields: [
        { id: "name", label: "Pack Name *", placeholder: "e.g. Case of 12" },
        {
          id: "localizedName",
          label: "Localized Name",
          placeholder: "Display name",
        },
      ],
    },
  };

  const config = configs[type] || configs.department;
  const [formData, setFormData] = useState({});

  const handleChange = (id, value) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = (closeAfter = true) => {
    onSave(formData);
    if (closeAfter) {
      onClose();
    } else {
      setFormData({});
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-neutral-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-300 border border-neutral-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50 bg-slate-50/20">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1.5 bg-primary rounded-full"></div>
            <h2 className="text-xl font-black text-neutral-800 tracking-tight">
              {config.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-full transition-all text-neutral-400 hover:text-rose-500 active:scale-95"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-10 space-y-6 flex-1 overflow-auto scrollbar-hide">
          <div className="bg-primary/5 rounded-2xl p-6 mb-8 border border-primary/10">
            <p className="text-xs font-bold text-primary flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              All fields marked with an asterisk (*) are mandatory.
            </p>
          </div>

          <div className="space-y-8">
            {config.fields.map((field) => (
              <div key={field.id} className="relative group">
                {field.type === "select" ? (
                  <div className="relative">
                    <StyledDropdown
                      value={formData[field.id] || ""}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      triggerClassName="!h-16 border-neutral-200 bg-neutral-50/50 !text-neutral-800 !font-bold rounded-2xl !pt-4"
                      placeholder={field.placeholder}
                    >
                      <option value="" disabled>
                        {field.placeholder}
                      </option>
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </StyledDropdown>
                    <span className="absolute top-2.5 left-5 text-[10px] font-black text-primary uppercase tracking-widest z-10 pointer-events-none">
                      {field.label}
                    </span>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder=" "
                      value={formData[field.id] || ""}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      className="w-full h-16 px-5 pt-5 rounded-2xl border border-neutral-200 bg-neutral-50/50 text-sm font-bold text-neutral-800 outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all peer font-inter"
                    />
                    <label
                      className="absolute top-1/2 left-5 -translate-y-1/2 text-neutral-400 text-sm font-bold transition-all pointer-events-none 
                      peer-focus:top-3.5 peer-focus:text-[10px] peer-focus:text-primary peer-focus:font-black peer-focus:uppercase peer-focus:tracking-widest
                      peer-[:not(:placeholder-shown)]:top-3.5 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-primary peer-[:not(:placeholder-shown)]:font-black peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-widest"
                    >
                      {field.label}
                    </label>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-8 pb-2">
            <button
              onClick={() => handleSave(false)}
              className="px-6 h-12 bg-white border-2 border-primary text-primary hover:bg-primary-light rounded-xl flex items-center gap-2 font-black text-xs uppercase tracking-widest transition-all active:scale-95"
            >
              <Save size={16} />
              Save & New
            </button>
            <button
              onClick={() => handleSave(true)}
              className="px-8 h-12 bg-primary hover:bg-primary-medium text-white rounded-xl flex items-center gap-2 font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-primary/20 active:scale-95 group"
            >
              <Check
                size={18}
                className="group-hover:scale-125 transition-transform"
              />
              Complete Entry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataEntryModal;

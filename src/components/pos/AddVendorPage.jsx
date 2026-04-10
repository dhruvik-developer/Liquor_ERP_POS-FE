import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../common/Button";
import Card from "../common/Card";
import useApi from "../../hooks/useApi";
import useFetch from "../../hooks/useFetch";
import Loader from "../common/Loader";
import StyledDropdown from "../common/StyledDropdown";
import { getPortalBasePath, getStoredAuth } from "../../utils/auth";

const initialFormData = {
  vendor_name: "",
  vendor_code: "",
  company_name: "",
  sales_persons: [
    {
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
    },
  ],
  inactive: false,
  address_1: "",
  address_2: "",
  city: "",
  state: "",
  zip: "",
  code: "",
  ext: "",
  country: "",
  phone_1: "",
  phone_2: "",
  cell_phone: "",
  fax: "",
  email: "",
  pay_term: "Net 30",
  gst_number: "",
  note: "",
};

const inputClassName =
  "w-full h-10 rounded-md border border-[#E5E7EB] bg-[#F8FAFC] px-3 text-[13px] text-[#0F172A] outline-none placeholder:text-[#94A3B8] focus:border-[#0EA5E9]";
const labelClassName = "text-[12px] font-semibold text-[#64748B]";

const AddVendorPage = ({ onCancel, onSave }) => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const portalBasePath = getPortalBasePath(getStoredAuth());

  const { post, put, loading: saving, error: saveError } = useApi();
  const {
    data: existingData,
    loading: fetching,
    error: fetchError,
  } = useFetch(isEdit ? `/people/vendors/${id}/` : null);

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (existingData) {
      const vendorCore = existingData.vendor_core_information || {};
      const contactAddress = existingData.contact_address_information || {};
      const apiSalesPersons = Array.isArray(
        existingData.sales_person_contact_details,
      )
        ? existingData.sales_person_contact_details
        : Array.isArray(existingData.sales_persons)
          ? existingData.sales_persons
          : Array.isArray(existingData.sales_people)
            ? existingData.sales_people
            : [];

      const normalizedSalesPersons = apiSalesPersons.length
        ? apiSalesPersons.map((person) => ({
            first_name: person.first_name || "",
            last_name: person.last_name || "",
            phone: person.phone || person.mobile || "",
            email: person.email || "",
          }))
        : initialFormData.sales_persons;

      setFormData({
        ...initialFormData,
        ...existingData,
        ...vendorCore,
        ...contactAddress,
        ...(existingData.address_details || {}),
        // Match API field names to form state if they differ
        vendor_name:
          vendorCore.vendor_name ||
          existingData.name ||
          existingData.vendor_name ||
          "",
        company_name:
          vendorCore.company_name ||
          existingData.company ||
          existingData.company_name ||
          "",
        vendor_code: vendorCore.vendor_code || existingData.vendor_code || "",
        pay_term:
          vendorCore.pay_term ||
          existingData.pay_term ||
          initialFormData.pay_term,
        gst_number: vendorCore.gst_number || existingData.gst_number || "",
        inactive:
          typeof vendorCore.is_active === "boolean"
            ? !vendorCore.is_active
            : typeof existingData.is_active === "boolean"
              ? !existingData.is_active
              : !!existingData.inactive,
        email: contactAddress.email || existingData.email || "",
        sales_persons: normalizedSalesPersons,
      });
    }
  }, [existingData]);

  const handleCancel = () => {
    if (onCancel) onCancel();
    else navigate(`${portalBasePath}/people?tab=vendors`);
  };

  const buildPayload = () => {
    const salesPersons = (
      Array.isArray(formData.sales_persons) ? formData.sales_persons : []
    )
      .map((person) => ({
        first_name: person.first_name || "",
        last_name: person.last_name || "",
        phone: person.phone || "",
        email: person.email || "",
      }))
      .filter(
        (person) =>
          person.first_name || person.last_name || person.phone || person.email,
      );

    return {
      vendor_core_information: {
        vendor_name: formData.vendor_name || "",
        vendor_code: formData.vendor_code || "",
        company_name: formData.company_name || "",
        pay_term: formData.pay_term || "",
        gst_number: formData.gst_number || "",
        is_active: !formData.inactive,
      },
      sales_person_contact_details: salesPersons,
      contact_address_information: {
        address_1: formData.address_1 || "",
        address_2: formData.address_2 || "",
        city: formData.city || "",
        state: formData.state || "",
        zip: formData.zip || "",
        code: formData.code || "",
        ext: formData.ext || "",
        country: formData.country || "",
        phone_1: formData.phone_1 || "",
        phone_2: formData.phone_2 || "",
        cell_phone: formData.cell_phone || "",
        fax: formData.fax || "",
        email: formData.email || "",
        note: formData.note || "",
      },
    };
  };

  const handleSaveBtn = async () => {
    try {
      if (isEdit) {
        await put(`/people/vendors/${id}/`, buildPayload());
      } else {
        await post("/people/vendors/", buildPayload());
      }

      if (onSave) onSave();
      else navigate(`${portalBasePath}/people?tab=vendors`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveAndNewBtn = async () => {
    try {
      await post("/people/vendors/", buildPayload());
      setFormData(initialFormData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const addSalesPerson = () => {
    setFormData((prev) => ({
      ...prev,
      sales_persons: [
        ...(Array.isArray(prev.sales_persons) ? prev.sales_persons : []),
        { first_name: "", last_name: "", phone: "", email: "" },
      ],
    }));
  };

  const removeSalesPerson = (index) => {
    setFormData((prev) => {
      const current = Array.isArray(prev.sales_persons)
        ? prev.sales_persons
        : [];
      if (current.length <= 1) return prev;

      return {
        ...prev,
        sales_persons: current.filter((_, idx) => idx !== index),
      };
    });
  };

  const handleSalesPersonChange = (index, key, value) => {
    setFormData((prev) => {
      const current = Array.isArray(prev.sales_persons)
        ? prev.sales_persons
        : [];
      const updated = current.map((person, idx) =>
        idx === index ? { ...person, [key]: value } : person,
      );
      return { ...prev, sales_persons: updated };
    });
  };

  if (fetching)
    return (
      <div className="h-full flex items-center justify-center">
        <Loader size={64} />
      </div>
    );

  return (
    <div className="flex flex-col min-h-full space-y-4 pb-8 pr-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-black text-[#1E293B] tracking-tight">
            {isEdit ? "Update Vendor" : "Add New Vendor"}
          </h1>
          <p className="text-[#64748B] font-bold text-[14px] mt-1 uppercase tracking-wider">
            Supply Chain Management
          </p>
        </div>
      </div>

      {(saveError || fetchError) && (
        <div className="p-3 bg-rose-50 text-rose-600 rounded-md border border-rose-100 text-[13px] font-semibold">
          {saveError || fetchError}
        </div>
      )}

      <Card title="Vendor Core Information" className="shadow-none">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className={labelClassName}>Vendor Name *</label>
            <input
              className={inputClassName}
              name="vendor_name"
              value={formData.vendor_name}
              onChange={handleChange}
              placeholder="Enter Vendor Name"
            />
          </div>

          <div className="space-y-1.5">
            <label className={labelClassName}>Vendor Code</label>
            <input
              className={inputClassName}
              name="vendor_code"
              value={formData.vendor_code}
              onChange={handleChange}
              placeholder="Enter Vendor Code"
            />
          </div>

          <div className="space-y-1.5">
            <label className={labelClassName}>Company Name *</label>
            <input
              className={inputClassName}
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              placeholder="Enter Company Name"
            />
          </div>

          <label className="flex items-center gap-2 text-[12px] text-[#64748B] font-semibold">
            <input
              type="checkbox"
              name="inactive"
              checked={formData.inactive}
              onChange={handleChange}
              className="h-4 w-4 rounded border border-[#CBD5E1]"
            />
            Vendor is inactive
          </label>
        </div>
      </Card>

      <Card title="Sales Person & Contact Details" className="shadow-none">
        <div className="space-y-3">
          {(Array.isArray(formData.sales_persons)
            ? formData.sales_persons
            : []
          ).map((person, index) => (
            <div
              key={index}
              className="rounded-md border border-[#E2E8F0] p-3 space-y-3 bg-[#F8FAFC]"
            >
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-bold text-[#334155]">
                  Sales Person {index + 1}
                </p>
                <button
                  type="button"
                  onClick={() => removeSalesPerson(index)}
                  disabled={(formData.sales_persons || []).length <= 1}
                  className="text-[12px] font-semibold text-rose-600 disabled:text-slate-300"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={labelClassName}>First Name *</label>
                  <input
                    className={inputClassName}
                    value={person.first_name}
                    onChange={(e) =>
                      handleSalesPersonChange(
                        index,
                        "first_name",
                        e.target.value,
                      )
                    }
                    placeholder="Enter First Name"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClassName}>Last Name *</label>
                  <input
                    className={inputClassName}
                    value={person.last_name}
                    onChange={(e) =>
                      handleSalesPersonChange(
                        index,
                        "last_name",
                        e.target.value,
                      )
                    }
                    placeholder="Enter Last Name"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClassName}>Phone</label>
                  <input
                    className={inputClassName}
                    value={person.phone}
                    onChange={(e) =>
                      handleSalesPersonChange(index, "phone", e.target.value)
                    }
                    placeholder="(000) 000-0000"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClassName}>Email</label>
                  <input
                    className={inputClassName}
                    value={person.email}
                    onChange={(e) =>
                      handleSalesPersonChange(index, "email", e.target.value)
                    }
                    placeholder="sales@example.com"
                  />
                </div>
              </div>
            </div>
          ))}

          <div>
            <Button
              type="button"
              variant="outline"
              onClick={addSalesPerson}
              className="h-9 px-4 text-[12px] font-semibold text-[#0EA5E9] border-[#0EA5E9] hover:bg-[#0EA5E90D]"
            >
              + Add Sales Person
            </Button>
          </div>
        </div>
      </Card>

      <Card title="Contact & Address Information" className="shadow-none">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className={labelClassName}>Address 1</label>
            <input
              className={inputClassName}
              name="address_1"
              value={formData.address_1}
              onChange={handleChange}
              placeholder="Street Address"
            />
          </div>

          <div className="space-y-1.5">
            <label className={labelClassName}>Address 2</label>
            <input
              className={inputClassName}
              name="address_2"
              value={formData.address_2}
              onChange={handleChange}
              placeholder="Apartment, suite, etc. (optional)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className={labelClassName}>City</label>
              <input
                className={inputClassName}
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelClassName}>State</label>
              <input
                className={inputClassName}
                name="state"
                value={formData.state}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelClassName}>Zip</label>
              <input
                className={inputClassName}
                name="zip"
                value={formData.zip}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className={labelClassName}>Code</label>
              <input
                className={inputClassName}
                name="code"
                value={formData.code}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelClassName}>Ext</label>
              <input
                className={inputClassName}
                name="ext"
                value={formData.ext}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelClassName}>Country</label>
              <input
                className={inputClassName}
                name="country"
                value={formData.country}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelClassName}>Phone 1</label>
              <input
                className={inputClassName}
                name="phone_1"
                value={formData.phone_1}
                onChange={handleChange}
                placeholder="(000) 000-0000"
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelClassName}>Phone 2</label>
              <input
                className={inputClassName}
                name="phone_2"
                value={formData.phone_2}
                onChange={handleChange}
                placeholder="(000) 000-0000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelClassName}>Cell Phone</label>
              <input
                className={inputClassName}
                name="cell_phone"
                value={formData.cell_phone}
                onChange={handleChange}
                placeholder="(000) 000-0000"
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelClassName}>Fax</label>
              <input
                className={inputClassName}
                name="fax"
                value={formData.fax}
                onChange={handleChange}
                placeholder="(000) 000-0000"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={labelClassName}>E-Mail</label>
            <input
              className={inputClassName}
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="vendor@example.com"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelClassName}>Pay Term</label>
              <StyledDropdown
                name="pay_term"
                value={formData.pay_term}
                onChange={handleChange}
                triggerClassName="border-[#E5E7EB] bg-[#F8FAFC] !h-10 !text-[13px] !text-[#0F172A]"
                placeholder="Select Pay Term"
              >
                <option value="Net 30">Net 30</option>
                <option value="Net 15">Net 15</option>
                <option value="Due on Receipt">Due on Receipt</option>
              </StyledDropdown>
            </div>
            <div className="space-y-1.5">
              <label className={labelClassName}>GST Number</label>
              <input
                className={inputClassName}
                name="gst_number"
                value={formData.gst_number}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={labelClassName}>Note</label>
            <textarea
              className="w-full min-h-24 rounded-md border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-2 text-[13px] text-[#0F172A] outline-none placeholder:text-[#94A3B8] focus:border-[#0EA5E9]"
              name="note"
              value={formData.note}
              onChange={handleChange}
            />
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap justify-end gap-2">
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={saving}
          className="h-9 px-5 text-[12px] font-semibold"
        >
          Close
        </Button>
        {!isEdit && (
          <Button
            variant="outline"
            onClick={handleSaveAndNewBtn}
            disabled={saving}
            className="h-9 px-5 text-[12px] font-semibold text-[#0EA5E9] border-[#0EA5E9] hover:bg-[#0EA5E90D]"
          >
            Save & New
          </Button>
        )}
        <Button
          onClick={handleSaveBtn}
          disabled={saving}
          className="h-9 px-6 text-[12px] font-semibold"
        >
          {saving ? "Saving..." : isEdit ? "Update" : "Save"}
        </Button>
      </div>
    </div>
  );
};

export default AddVendorPage;

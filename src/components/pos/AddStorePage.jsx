import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save, Building2 } from "lucide-react";
import Button from "../common/Button";
import Input from "../common/Input";
import useApi from "../../hooks/useApi";
import useFetch from "../../hooks/useFetch";

const AddStorePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const { get, post, put } = useApi();
  const { data: storeData, loading: storeLoading } = useFetch(
    isEdit ? `/stores/${id}/` : null
  );

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    is_active: true,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (storeData && !storeLoading) {
      setFormData({
        name: storeData.name || storeData.store_name || "",
        address: storeData.address || storeData.location || "",
        phone: storeData.phone || storeData.mobile_number || "",
        email: storeData.email || "",
        is_active: storeData.is_active !== false,
      });
    }
  }, [storeData, storeLoading]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      ...formData,
    };

    try {
      if (isEdit) {
        await put(`/stores/${id}/`, payload);
      } else {
        await post("/stores/", payload);
      }
      navigate("/pos/stores");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to save store.");
    } finally {
      setSaving(false);
    }
  };

  if (isEdit && storeLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[#64748B] font-medium">Loading store details...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500 pb-8 pr-2">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/pos/stores")}
          className="p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800">
            {isEdit ? "Edit Store" : "Create New Store"}
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            {isEdit
              ? "Update existing store information"
              : "Add a new store or branch"}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-500 px-4 py-3 rounded-lg font-medium text-sm">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden"
      >
        <div className="p-6 md:p-8 space-y-8">
          {/* General Information */}
          <section>
            <div className="flex items-center gap-2 mb-6 text-slate-800">
              <Building2 size={20} className="text-sky-500" />
              <h2 className="text-lg font-bold">Store Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Store Name *"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter store name"
                required
              />
              <Input
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
              />
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="store@example.com"
              />
            </div>
          </section>

          <section>
            <div className="grid grid-cols-1 gap-6">
               <Input
                label="Address / Location"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter physical address"
              />
            </div>
          </section>
        </div>

        <div className="bg-slate-50 p-6 border-t border-slate-200 flex items-center justify-end gap-3">
          <Link to="/pos/stores">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto h-11 px-8 bg-white"
            >
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            className="w-full sm:w-auto h-11 gap-2 px-8"
            disabled={saving}
          >
            {saving ? (
              "Saving..."
            ) : (
              <>
                <Save size={18} />
                Save Store
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddStorePage;

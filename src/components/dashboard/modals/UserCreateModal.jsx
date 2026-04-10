import { useState } from "react";
import { AlertCircle } from "lucide-react";
import ModalShell from "./ModalShell";
import StyledDropdown from "../../common/StyledDropdown";

const UserCreateModal = ({
  isOpen,
  onClose,
  roles,
  stores,
  onSubmit,
  isSubmitting,
  submitError,
}) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    roleId: "",
    storeIds: [],
    isActive: true,
  });

  if (!isOpen) {
    return null;
  }

  const submit = async (event) => {
    event.preventDefault();
    try {
      // onSubmit is expected to: POST user → GET users list → (resolve)
      // We only close the modal after the full chain succeeds.
      await onSubmit(form);
      // Reset form state for the next time the modal opens
      setForm({ name: "", email: "", password: "", roleId: "", storeIds: [], isActive: true });
      onClose();
    } catch {
      // Error is surfaced via the `submitError` prop from the parent — keep modal open
    }
  };

  const toggleStore = (storeId) => {
    setForm((current) => ({
      ...current,
      storeIds: current.storeIds.includes(storeId)
        ? current.storeIds.filter((id) => id !== storeId)
        : [...current.storeIds, storeId],
    }));
  };

  return (
    <ModalShell title="System User Registration" onClose={onClose}>
      <form onSubmit={submit} className="space-y-6">

        {/* Inline error banner — shown when the parent POST call fails */}
        {submitError && (
          <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-500" />
            <p className="text-xs font-bold text-rose-600">{submitError}</p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1.5 group">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1 group-focus-within:text-primary transition-colors">
              Legal Full Name
            </label>
            <input
              required
              disabled={isSubmitting}
              placeholder="e.g. Jonathan Doe"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm font-bold text-neutral-800 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 disabled:opacity-60"
            />
          </div>
          <div className="flex flex-col gap-1.5 group">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1 group-focus-within:text-primary transition-colors">
              Access Email
            </label>
            <input
              required
              type="email"
              disabled={isSubmitting}
              placeholder="user@domain.com"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm font-bold text-neutral-800 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 disabled:opacity-60"
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1.5 group">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1 group-focus-within:text-primary transition-colors">
              Temporary Access Code
            </label>
            <input
              required
              type="password"
              disabled={isSubmitting}
              placeholder="••••••••"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm font-bold text-neutral-800 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 disabled:opacity-60"
            />
          </div>
          <div className="flex flex-col gap-1.5 group">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1 group-focus-within:text-primary transition-colors">
              System Role Authority
            </label>
            <StyledDropdown
              value={form.roleId}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  roleId: event.target.value,
                }))
              }
              disabled={isSubmitting}
              triggerClassName="border-neutral-200 bg-neutral-50 !text-neutral-700 !font-black rounded-xl !h-[42px]"
              placeholder="Select Protocol Level"
            >
              <option value="">Select Protocol Level</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </StyledDropdown>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-neutral-50/50 p-3 rounded-xl border border-neutral-100 group">
          <input
            type="checkbox"
            id="isActive"
            disabled={isSubmitting}
            checked={form.isActive}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                isActive: event.target.checked,
              }))
            }
            className="w-5 h-5 rounded-lg border-neutral-300 text-primary focus:ring-primary cursor-pointer appearance-none checked:bg-primary checked:border-primary border-2 transition-all"
          />
          <label
            htmlFor="isActive"
            className="text-xs font-black uppercase tracking-widest text-neutral-600 cursor-pointer select-none"
          >
            Maintain Active Operational Status
          </label>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">
            Assigned Operational Storefronts
          </label>
          <div className="grid max-h-40 grid-cols-2 gap-3 overflow-auto rounded-2xl border border-neutral-100 bg-neutral-50/30 p-4 shadow-inner">
            {stores.map((store) => (
              <label
                key={store.id}
                className="flex items-center gap-3 text-xs font-bold text-neutral-600 group cursor-pointer hover:text-primary transition-colors"
              >
                <input
                  type="checkbox"
                  disabled={isSubmitting}
                  checked={form.storeIds.includes(store.id)}
                  onChange={() => toggleStore(store.id)}
                  className="w-4 h-4 rounded-md border-neutral-300 text-primary focus:ring-primary cursor-pointer appearance-none checked:bg-primary checked:border-primary border-2 transition-all"
                />
                <span className="uppercase tracking-wide">{store.name}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 rounded-2xl bg-primary px-8 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 transition-all hover:bg-primary-medium active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Finalizing Registry...
            </span>
          ) : (
            "Initialize User Access"
          )}
        </button>
      </form>
    </ModalShell>
  );
};

export default UserCreateModal;



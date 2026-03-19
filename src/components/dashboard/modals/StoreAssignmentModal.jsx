import { useEffect, useState } from 'react'
import ModalShell from './ModalShell'

const StoreAssignmentModal = ({
  isOpen,
  onClose,
  users,
  stores,
  selectedUser,
  onAssignStores,
  isSubmitting,
}) => {
  const [userId, setUserId] = useState('')
  const [storeIds, setStoreIds] = useState([])

  useEffect(() => {
    if (selectedUser) {
      setUserId(selectedUser.id)
      const ids = selectedUser.raw?.stores?.map(store => (typeof store === 'object' ? store.id : store)) || []
      setStoreIds(ids)
    }
  }, [selectedUser])

  if (!isOpen) {
    return null
  }

  const toggleStore = storeId => {
    setStoreIds(current => (
      current.includes(storeId)
        ? current.filter(id => id !== storeId)
        : [...current, storeId]
    ))
  }

  const submit = async event => {
    event.preventDefault()
    if (!userId) {
      return
    }
    await onAssignStores(userId, storeIds)
    onClose()
  }

  return (
    <ModalShell title="Branch Location Assignment" onClose={onClose}>
      <form onSubmit={submit} className="space-y-8">
        <div className="flex flex-col gap-2 group">
           <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1 group-focus-within:text-primary transition-colors">Target System User</label>
           <select
            value={userId}
            onChange={event => setUserId(event.target.value)}
            className="w-full h-12 px-5 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm font-black text-neutral-800 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
          >
            <option value="">Select Operator...</option>
            {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
          </select>
        </div>

        <div className="space-y-4">
           <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Licensed Operational Units</label>
           <div className="grid max-h-56 grid-cols-2 gap-4 overflow-auto rounded-[24px] border border-neutral-100 bg-neutral-50/30 p-6 shadow-inner">
            {stores.map(store => (
              <label key={store.id} className="flex items-center gap-3 text-xs font-bold text-neutral-600 group cursor-pointer hover:text-primary transition-colors">
                <input
                  type="checkbox"
                  checked={storeIds.includes(store.id)}
                  onChange={() => toggleStore(store.id)}
                  className="w-5 h-5 rounded-lg border-neutral-300 text-primary focus:ring-primary cursor-pointer appearance-none checked:bg-primary checked:border-primary border-2 transition-all"
                />
                <span className="uppercase tracking-widest">{store.name}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 rounded-2xl bg-primary text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 transition-all hover:bg-primary-medium active:scale-95 disabled:opacity-30"
        >
          {isSubmitting ? 'Updating Assignments...' : 'Commit Assignment Registry'}
        </button>
      </form>
    </ModalShell>
  )
}

export default StoreAssignmentModal

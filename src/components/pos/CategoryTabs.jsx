const CategoryTabs = ({ categories, selectedCategory, onSelect, variant = 'pill' }) => (
  <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide">
    {categories.map(category => (
      <button
        key={category.id}
        type="button"
        onClick={() => onSelect(category.id)}
        className={[
          variant === 'underline'
            ? 'whitespace-nowrap px-0.5 pb-2 text-[15px] font-black text-slate-800 tracking-tight font-poppins border-b-2 transition-colors duration-200'
            : 'whitespace-nowrap rounded-lg px-4 py-2 text-[14px] font-bold transition-all duration-200',
          variant === 'underline'
            ? (
                selectedCategory === category.id
                  ? 'text-[#1EA7EE] border-[#1EA7EE]'
                  : 'text-[#64748B] border-transparent hover:text-[#1E293B]'
              )
            : (
                selectedCategory === category.id
                  ? 'bg-[#0EA5E9] text-white shadow-md'
                  : 'border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]'
              ),
        ].join(' ')}
      >
        {category.name}
      </button>
    ))}
  </div>
)

export default CategoryTabs

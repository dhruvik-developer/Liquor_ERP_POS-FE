const CategoryTabs = ({ categories, selectedCategory, onSelect }) => (
  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
    {categories.map(category => (
      <button
        key={category.id}
        type="button"
        onClick={() => onSelect(category.id)}
        className={[
          'whitespace-nowrap rounded-lg px-4 py-2 text-[14px] font-bold transition-all duration-200',
          selectedCategory === category.id
            ? 'bg-[#0EA5E9] text-white shadow-md'
            : 'border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]',
        ].join(' ')}
      >
        {category.name}
      </button>
    ))}
  </div>
)

export default CategoryTabs

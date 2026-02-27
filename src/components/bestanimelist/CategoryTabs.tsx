"use client"

type Category = {
  id: string
  label: string
}

interface Props {
  categories: Category[]
  active: string
  onChange: (id: string) => void
}

export default function CategoryTabs({
  categories,
  active,
  onChange,
}: Props) {
  return (
    <div className="flex overflow-x-auto pb-2 scrollbar-hide">
      <div className="flex gap-3">
        {categories.map((cat) => {
          const isActive = active === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => onChange(cat.id)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              {cat.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
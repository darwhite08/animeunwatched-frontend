"use client"

interface Props {
  title: string
  options: string[]
  selectedFilters: Record<string, string[]>
  setSelectedFilters: React.Dispatch<
    React.SetStateAction<Record<string, string[]>>
  >
}

export default function FilterCheckboxGroup({
  title,
  options,
  selectedFilters,
  setSelectedFilters,
}: Props) {
  const toggle = (value: string) => {
    setSelectedFilters((prev) => {
      const current = prev[title] || []

      if (current.includes(value)) {
        return {
          ...prev,
          [title]: current.filter((v) => v !== value),
        }
      }

      return {
        ...prev,
        [title]: [...current, value],
      }
    })
  }

  return (
    <div className="space-y-3">
      {options.map((option) => (
        <label
          key={option}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <input
            type="checkbox"
            checked={
              selectedFilters[title]?.includes(option) ||
              false
            }
            onChange={() => toggle(option)}
            className="h-4 w-4 rounded border border-white/30 bg-transparent checked:bg-indigo-600 checked:border-indigo-600 transition"
          />
          <span className="text-sm text-white/70 group-hover:text-white transition">
            {option}
          </span>
        </label>
      ))}
    </div>
  )
}
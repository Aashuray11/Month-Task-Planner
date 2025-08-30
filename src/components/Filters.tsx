import { useTasks } from '../context/TaskContext';
import type { Category } from '../types';

const categories: { key: Category; label: string }[] = [
  { key: 'todo', label: 'To Do' },
  { key: 'inprogress', label: 'In Progress' },
  { key: 'review', label: 'Review' },
  { key: 'completed', label: 'Completed' },
];

export function Filters() {
  const { filters, setFilters } = useTasks();

  function toggleCategory(cat: Category) {
    const next = new Set(filters.categories);
    if (next.has(cat)) next.delete(cat);
    else next.add(cat);
    setFilters({ ...filters, categories: next });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 md:gap-3 bg-white p-2 md:p-3 border rounded">
      <div className="flex items-center gap-2">
        {categories.map(c => (
          <label key={c.key} className="inline-flex items-center gap-1 text-xs md:text-sm">
            <input
              type="checkbox"
              checked={filters.categories.has(c.key)}
              onChange={() => toggleCategory(c.key)}
            />
            <span>{c.label}</span>
          </label>
        ))}
      </div>

      <div className="flex items-center gap-2 ml-auto text-xs md:text-sm">
        {[0, 1, 2, 3].map(w => (
          <label key={w} className="inline-flex items-center gap-1 text-sm">
            <input
              type="radio"
              name="weeks"
              checked={filters.timeWindowWeeks === (w as 0 | 1 | 2 | 3)}
              onChange={() => setFilters({ ...filters, timeWindowWeeks: w as 0 | 1 | 2 | 3 })}
            />
            <span>{w === 0 ? 'All' : `${w}w`}</span>
          </label>
        ))}
      </div>

      <div className="w-full md:w-72 flex items-center gap-2">
        <input
          type="text"
          value={filters.search}
          onChange={e => setFilters({ ...filters, search: e.target.value })}
          placeholder="Search name, category, date, video..."
          className="w-full px-2 md:px-3 py-1.5 md:py-2 border rounded text-sm"
        />
        {filters.search ? (
          <button
            className="text-xs px-2 py-1 border rounded"
            title="Clear search"
            onClick={() => setFilters({ ...filters, search: '' })}
          >Clear</button>
        ) : null}
      </div>
    </div>
  );
}

export default Filters;

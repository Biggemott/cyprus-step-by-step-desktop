import type { CategoryId } from "@/data/catalog";
import { categoryIconPaths } from "./category-icon-paths";

/** Exact paths converted from the Cyprus Step-by-Step KMP Vector Drawables. */
export function CategoryIcon({ category }: { category: CategoryId }) {
  return (
    <svg className="category-icon" viewBox="0 0 260 260" aria-hidden="true">
      {categoryIconPaths[category].map((path, index) => (
        <path key={index} d={path} fill="currentColor" />
      ))}
    </svg>
  );
}

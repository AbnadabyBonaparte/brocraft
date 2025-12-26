import { DependencyList, useMemo } from "react";

type FilterOptions<T> = {
  searchTerm?: string;
  searchKeys?: (keyof T)[];
  customFilter?: (item: T) => boolean;
  dependencies?: DependencyList;
};

export function useFilteredData<T>(
  data: T[] | undefined,
  { searchTerm, searchKeys, customFilter, dependencies = [] }: FilterOptions<T>
) {
  const normalizedSearch = searchTerm?.toLowerCase().trim();

  return useMemo(() => {
    return (data ?? []).filter((item) => {
      const matchesSearch = normalizedSearch
        ? (searchKeys ?? []).some((key) => {
            const value = item[key];
            if (typeof value === "string") {
              return value.toLowerCase().includes(normalizedSearch);
            }
            return String(value).toLowerCase().includes(normalizedSearch);
          })
        : true;

      const matchesCustom = customFilter ? customFilter(item) : true;

      return matchesSearch && matchesCustom;
    });
  }, [customFilter, data, searchKeys, normalizedSearch, ...dependencies]);
}

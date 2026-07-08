/**
 * catalogHelpers.js — фильтрация и сортировка каталога
 */

export const INITIAL_CATALOG_FILTERS = {
  category: "all",
  minPrice: 0,
  maxPrice: 500,
  minRating: 0,
};

export function filterAndSortServices(services, debouncedQuery, filters, sortBy) {
  let result = services.filter((service) => {
    const matchesSearch =
      !debouncedQuery ||
      service.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(debouncedQuery.toLowerCase());

    const matchesCategory =
      filters.category === "all" || service.category === filters.category;

    const matchesPrice =
      service.price !== undefined &&
      service.price !== null &&
      service.price >= filters.minPrice &&
      service.price <= filters.maxPrice;

    const serviceRating = service.rating ?? 0;
    const matchesRating = serviceRating >= filters.minRating;

    return matchesSearch && matchesCategory && matchesPrice && matchesRating;
  });

  result = [...result].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "name":
        return a.name.localeCompare(b.name, "ru");
      case "rating":
        return (b.rating ?? 0) - (a.rating ?? 0);
      case "popular":
      default:
        return (b.rating ?? 0) - (a.rating ?? 0);
    }
  });

  return result;
}

export function filterAndSortSpecialists(
  specialists,
  debouncedQuery,
  filters,
  sortBy,
) {
  let result = specialists.filter((spec) => {
    const matchesSearch =
      !debouncedQuery ||
      spec.fullName.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      spec.position.toLowerCase().includes(debouncedQuery.toLowerCase());

    const matchesRating = spec.rating >= filters.minRating;

    return matchesSearch && matchesRating;
  });

  result = [...result].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.fullName.localeCompare(b.fullName, "ru");
      case "rating":
        return b.rating - a.rating;
      case "experience":
        return b.experience - a.experience;
      default:
        return b.rating - a.rating;
    }
  });

  return result;
}

export function countActiveCatalogFilters(filters) {
  return Object.entries(filters).filter(([key, value]) => {
    if (key === "category") return value !== "all";
    if (key === "minPrice") return value !== INITIAL_CATALOG_FILTERS.minPrice;
    if (key === "maxPrice") return value !== INITIAL_CATALOG_FILTERS.maxPrice;
    if (key === "minRating") return value !== INITIAL_CATALOG_FILTERS.minRating;
    return false;
  }).length;
}

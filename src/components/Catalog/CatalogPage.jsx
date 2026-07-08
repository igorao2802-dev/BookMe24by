/**
 * CatalogPage.jsx — каталог услуг и специалистов
 */
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../UI/Button";
import EmptyState from "../UI/EmptyState";
import SearchBar from "./SearchBar";
import FilterPanel from "./FilterPanel";
import SortPanel from "./SortPanel";
import ServiceCard from "./ServiceCard";
import SpecialistCard from "./SpecialistCard";
import FavoritesList from "./FavoritesList";
import CatalogModeTabs from "./CatalogModeTabs";

import { useFavorites } from "../../hooks/useFavorites";
import { useDebounce } from "../../hooks/useDebounce";
import { useLanguage } from "../../hooks/useLanguage";
import { BOOKING_STEPS } from "../../utils/constants";
import {
  INITIAL_CATALOG_FILTERS,
  filterAndSortServices,
  filterAndSortSpecialists,
  countActiveCatalogFilters,
} from "../../utils/catalogHelpers";
import "./CatalogPage.css";

export default function CatalogPage({ services, specialists }) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [viewMode, setViewMode] = useState("services");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);
  const [filters, setFilters] = useState(INITIAL_CATALOG_FILTERS);
  const [sortBy, setSortBy] = useState("popular");

  const { favorites, toggle: toggleFavorite, isFavorite } = useFavorites();

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_CATALOG_FILTERS);
    setSearchQuery("");
    setSortBy("popular");
  };

  const handleBookService = (serviceId) => {
    navigate("/", {
      state: {
        preselectedServiceId: serviceId,
        startStep: BOOKING_STEPS.SPECIALIST,
      },
    });
  };

  const handleBookSpecialist = (specialistId) => {
    navigate("/", {
      state: {
        preselectedSpecialistId: specialistId,
        startStep: BOOKING_STEPS.SERVICE,
      },
    });
  };

  const filteredAndSortedServices = useMemo(
    () =>
      filterAndSortServices(services, debouncedQuery, filters, sortBy),
    [services, debouncedQuery, filters, sortBy],
  );

  const filteredAndSortedSpecialists = useMemo(
    () =>
      filterAndSortSpecialists(specialists, debouncedQuery, filters, sortBy),
    [specialists, debouncedQuery, filters, sortBy],
  );

  const favoriteServices = services.filter((s) => favorites.includes(s.id));
  const favoriteSpecialists = specialists.filter((s) =>
    favorites.includes(s.id),
  );

  const activeFiltersCount = countActiveCatalogFilters(filters);

  return (
    <div className="catalog-page">
      <div className="catalog-page__header">
        <h1>{t("catalog.title")}</h1>
        <p className="catalog-page__subtitle">
          {t("catalog.subtitle", {
            services: services.length,
            specialists: specialists.length,
          })}
        </p>
      </div>

      <CatalogModeTabs
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        servicesCount={services.length}
        specialistsCount={specialists.length}
        favoritesCount={favorites.length}
      />

      {viewMode !== "favorites" && (
        <>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={
              viewMode === "services"
                ? t("catalog.search.service")
                : t("catalog.search.specialist")
            }
          />

          <div className="catalog-page__controls">
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
              activeCount={activeFiltersCount}
              viewMode={viewMode}
              services={services}
            />
            <SortPanel value={sortBy} onChange={setSortBy} viewMode={viewMode} />
          </div>
        </>
      )}

      {viewMode === "services" && (
        <section className="catalog-page__section">
          <div className="catalog-page__section-header">
            <h2>
              {t("catalog.tabs.services")} ({filteredAndSortedServices.length})
            </h2>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleResetFilters}>
                {t("catalog.buttons.resetFilters")}
              </Button>
            )}
          </div>

          {filteredAndSortedServices.length === 0 ? (
            <EmptyState
              title={t("catalog.empty.services")}
              description={t("catalog.empty.servicesDescription")}
              actionLabel={t("catalog.buttons.resetFilters")}
              onAction={handleResetFilters}
              variant="info"
            />
          ) : (
            <div className="catalog-page__grid">
              {filteredAndSortedServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  isFavorite={isFavorite(service.id)}
                  onToggleFavorite={() => toggleFavorite(service.id)}
                  onBook={() => handleBookService(service.id)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {viewMode === "specialists" && (
        <section className="catalog-page__section">
          <div className="catalog-page__section-header">
            <h2>
              {t("catalog.tabs.specialists")} (
              {filteredAndSortedSpecialists.length})
            </h2>
          </div>

          {filteredAndSortedSpecialists.length === 0 ? (
            <EmptyState
              title={t("catalog.empty.specialists")}
              description={t("catalog.empty.specialistsDescription")}
              actionLabel={t("catalog.buttons.resetFilters")}
              onAction={handleResetFilters}
              variant="info"
            />
          ) : (
            <div className="catalog-page__grid catalog-page__grid--specialists">
              {filteredAndSortedSpecialists.map((specialist) => (
                <SpecialistCard
                  key={specialist.id}
                  specialist={specialist}
                  services={services}
                  isFavorite={isFavorite(specialist.id)}
                  onToggleFavorite={() => toggleFavorite(specialist.id)}
                  onBook={() => handleBookSpecialist(specialist.id)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {viewMode === "favorites" && (
        <section className="catalog-page__section">
          <FavoritesList
            services={favoriteServices}
            specialists={favoriteSpecialists}
            onToggleFavorite={toggleFavorite}
            onBookService={handleBookService}
            onBookSpecialist={handleBookSpecialist}
          />
        </section>
      )}
    </div>
  );
}

/**
 * CatalogModeTabs.jsx — переключатель вкладок каталога
 */

import { Heart, Scissors, Users } from "lucide-react";
import Badge from "../UI/Badge";
import { useLanguage } from "../../hooks/useLanguage";

export default function CatalogModeTabs({
  viewMode,
  onViewModeChange,
  servicesCount,
  specialistsCount,
  favoritesCount,
}) {
  const { t } = useLanguage();

  const modes = [
    {
      id: "services",
      icon: Scissors,
      label: t("catalog.tabs.services"),
      count: servicesCount,
    },
    {
      id: "specialists",
      icon: Users,
      label: t("catalog.tabs.specialists"),
      count: specialistsCount,
    },
    {
      id: "favorites",
      icon: Heart,
      label: t("catalog.tabs.favorites"),
      count: favoritesCount,
    },
  ];

  return (
    <div className="catalog-page__modes">
      {modes.map(({ id, icon: Icon, label, count }) => (
        <button
          key={id}
          type="button"
          className={`catalog-page__mode ${viewMode === id ? "catalog-page__mode--active" : ""}`}
          onClick={() => onViewModeChange(id)}
        >
          <Icon size={18} />
          {label}
          <Badge variant="default" size="sm">
            {count}
          </Badge>
        </button>
      ))}
    </div>
  );
}

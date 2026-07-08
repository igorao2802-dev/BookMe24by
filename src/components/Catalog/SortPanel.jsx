/**
 * SortPanel.jsx — выпадающий список сортировки
 * 
 * ПОЧЕМУ nameShort вместо name для алфавитной сортировки?
 * «A–Z» короче полного «Alphabetically», понятнее и помещается на мобильных экранах.
 */
import { ArrowUpDown } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import './SortPanel.css';

export default function SortPanel({ value, onChange, viewMode = 'services' }) {
  const { t } = useLanguage();

  const options =
    viewMode === 'services'
      ? [
          { value: 'popular', label: t('catalog.sort.popular') },
          { value: 'price-asc', label: t('catalog.sort.priceAsc') },
          { value: 'price-desc', label: t('catalog.sort.priceDesc') },
          { value: 'rating', label: t('catalog.sort.rating') },
          { value: 'name', label: t('catalog.sort.nameShort') },
        ]
      : [
          { value: 'popular', label: t('catalog.sort.popular') },
          { value: 'rating', label: t('catalog.sort.rating') },
          { value: 'experience', label: t('catalog.sort.experience') },
          { value: 'name', label: t('catalog.sort.nameShort') },
        ];

  return (
    <div className="sort-panel">
      <label htmlFor="sort-select" className="sort-panel__label">
        <ArrowUpDown size={16} />
        {t('catalog.sort.title')}
      </label>
      <select
        id="sort-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="sort-panel__select"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * AdminServicesList.jsx — таблица услуг (только отображение и действия)
 *
 * АРХИТЕКТУРНАЯ РОЛЬ:
 * Презентационный компонент. Не содержит ServiceModal и не вызывает CRUD —
 * модалка и сохранение живут в AdminDashboard (единая точка для toast и валидации).
 *
 * ПОЧЕМУ onOpenAdd / onOpenEdit, а не onAdd?
 * Раньше onAdd ошибочно получал handleOpenAddService и при submit формы
 * вызывался повторный open вместо addService — silent fail, поля очищались.
 */
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Button from '../UI/Button';
import Badge from '../UI/Badge';
import EmptyState from '../UI/EmptyState';
import { SERVICE_CATEGORY_LABELS } from '../../utils/constants';
import { formatPrice, formatDuration } from '../../utils/formatters';
import { useLanguage } from '../../hooks/useLanguage';
import './AdminServicesList.css';

export default function AdminServicesList({
  services,
  onOpenAdd,
  onOpenEdit,
  onRequestDelete,
}) {
  const { t } = useLanguage();

  const canEdit = () => true;

  const canDelete = (service) => {
    return service.isCustom || String(service.id).startsWith('custom_');
  };

  if (services.length === 0) {
    return (
      <div className="admin-services-list">
        <div className="admin-services-list__header">
          <h2>{t('admin.services.title')}</h2>
          <Button variant="primary" leftIcon={<Plus size={16} />} onClick={onOpenAdd}>
            {t('admin.services.add')}
          </Button>
        </div>
        <EmptyState
          title={t('admin.services.empty')}
          description={t('admin.services.emptyDescription')}
          variant="info"
        />
      </div>
    );
  }

  return (
    <div className="admin-services-list">
      <div className="admin-services-list__header">
        <h2>
          {t('admin.services.title')} ({services.length})
        </h2>
        <Button variant="primary" leftIcon={<Plus size={16} />} onClick={onOpenAdd}>
          {t('admin.services.add')}
        </Button>
      </div>

      <div className="admin-services-list__table-wrapper">
        <table className="admin-services-list__table">
          <thead>
            <tr>
              <th>{t('admin.services.columns.name')}</th>
              <th>{t('admin.services.columns.category')}</th>
              <th>{t('admin.services.columns.duration')}</th>
              <th>{t('admin.services.columns.price')}</th>
              <th>{t('admin.services.columns.rating')}</th>
              <th>{t('admin.services.columns.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => {
              const isEditable = canEdit(service);
              const isDeletable = canDelete(service);
              return (
                <tr key={service.id}>
                  <td className="admin-services-list__name">{service.name}</td>
                  <td>
                    <Badge variant="default" size="sm">
                      {SERVICE_CATEGORY_LABELS[service.category] || service.category}
                    </Badge>
                  </td>
                  <td>{formatDuration(service.duration)}</td>
                  <td className="admin-services-list__price">
                    {formatPrice(service.price)}
                  </td>
                  <td>
                    <span className="admin-services-list__rating">
                      ⭐ {service.rating}
                    </span>
                  </td>
                  <td>
                    <div className="admin-services-list__actions">
                      <button
                        type="button"
                        className="admin-services-list__action-btn"
                        onClick={() => onOpenEdit(service)}
                        disabled={!isEditable}
                        title={
                          isEditable
                            ? t('common.edit')
                            : t('admin.services.cannotModifyStandard')
                        }
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        className="admin-services-list__action-btn admin-services-list__action-btn--danger"
                        onClick={() => onRequestDelete(service.id)}
                        disabled={!isDeletable}
                        title={
                          isDeletable
                            ? t('common.delete')
                            : t('admin.services.cannotDeleteStandard')
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

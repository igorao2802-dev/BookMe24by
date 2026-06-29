/**
 * NotFoundPage.jsx — страница 404 для несуществующих URL
 *
 * АРХИТЕКТУРНАЯ РОЛЬ:
 * Заменяет тихий редирект на "/" — пользователь понимает, что адрес неверный,
 * и может вернуться на главную одной кнопкой.
 */

import { useNavigate } from 'react-router-dom';
import { MapPinOff, Home } from 'lucide-react';

import Button from './UI/Button';
import { useLanguage } from '../hooks/useLanguage';
import { ROUTE_PATHS } from '../config/navigation';
import './NotFoundPage.css';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <section className="not-found-page" aria-labelledby="not-found-title">
      <div className="not-found-page__inner">
        <p className="not-found-page__code" aria-hidden="true">
          404
        </p>
        <div className="not-found-page__icon" aria-hidden="true">
          <MapPinOff size={56} strokeWidth={1.5} />
        </div>
        <h1 id="not-found-title" className="not-found-page__title">
          {t('notFound.title')}
        </h1>
        <p className="not-found-page__description">
          {t('notFound.description')}
        </p>
        <Button
          variant="primary"
          className="not-found-page__action"
          leftIcon={<Home size={18} />}
          onClick={() => navigate(ROUTE_PATHS.HOME)}
        >
          {t('notFound.goHome')}
        </Button>
      </div>
    </section>
  );
}

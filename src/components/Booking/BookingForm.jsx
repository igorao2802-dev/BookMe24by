/**
 * BookingForm.jsx — Шаг 4: форма контактов клиента
 *
 * ПОЧЕМУ ошибки синхронизируются с draft, а не только с touched?
 * Кнопка «Подтвердить запись» disabled по validateBookingForm в визарде;
 * если показывать ошибки только после blur — пользователь не видит причину блокировки.
 */
import { useState, useRef, useLayoutEffect, useEffect, useCallback, useMemo } from 'react';
import { User, Phone, Mail, X } from 'lucide-react';
import Input from '../UI/Input';
import {
  validateName,
  validatePhone,
  validateEmail,
  validateComment,
} from '../../utils/validators';
import { sanitizeInput, sanitizeNameInput } from '../../utils/sanitizers';
import { VALIDATION_LIMITS } from '../../constants/validationLimits';
import { processPhoneInput } from '../../utils/phoneInputHelpers';
import { translateValidationError } from '../../utils/validationMessages';
import { useLanguage } from '../../hooks/useLanguage';
import './BookingForm.css';

const REQUIRED_CONTACT_FIELDS = ['clientName', 'clientPhone'];

export default function BookingForm({ draft, onChange }) {
  const { t } = useLanguage();
  const [errors, setErrors] = useState({});
  const [errorParams, setErrorParams] = useState({});
  const [touched, setTouched] = useState({});
  const phoneInputRef = useRef(null);
  const phoneCursorRef = useRef(null);

  const validateField = useCallback((field, value) => {
    let result;
    switch (field) {
      case 'clientName':
        result = validateName(value);
        break;
      case 'clientPhone':
        result = validatePhone(value, { required: true });
        break;
      case 'clientEmail':
        result = validateEmail(value);
        break;
      case 'comment':
        result = validateComment(value);
        break;
      default:
        result = { isValid: true, errorKey: null };
    }

    setErrors((prev) => ({
      ...prev,
      [field]: result.isValid ? null : result.errorKey,
    }));
    setErrorParams((prev) => ({
      ...prev,
      [field]: result.isValid ? null : result.errorParams || null,
    }));

    return result;
  }, []);

  // ПОЧЕМУ useEffect на draft?
  // Черновик может восстановиться из localStorage — ошибки должны совпасть с disabled кнопкой.
  useEffect(() => {
    validateField('clientName', draft.clientName);
    validateField('clientPhone', draft.clientPhone);
    validateField('clientEmail', draft.clientEmail);
    validateField('comment', draft.comment);
  }, [
    draft.clientName,
    draft.clientPhone,
    draft.clientEmail,
    draft.comment,
    validateField,
  ]);

  useLayoutEffect(() => {
    const input = phoneInputRef.current;
    if (!input || phoneCursorRef.current === null) return;

    const pos = phoneCursorRef.current;
    input.setSelectionRange(pos, pos);
    phoneCursorRef.current = null;
  }, [draft.clientPhone]);

  const isFormStarted = useMemo(
    () =>
      Boolean(draft.clientName?.trim()) ||
      Boolean(draft.clientPhone?.trim()) ||
      Boolean(draft.clientEmail?.trim()) ||
      Object.keys(touched).length > 0,
    [draft.clientName, draft.clientPhone, draft.clientEmail, touched],
  );

  const getFieldError = useCallback(
    (field) => translateValidationError(t, errors[field], errorParams[field]),
    [t, errors, errorParams],
  );

  const getVisibleFieldError = useCallback(
    (field) => {
      if (!errors[field]) return null;

      const value = typeof draft[field] === 'string' ? draft[field].trim() : '';

      if (touched[field] || value.length > 0) {
        return getFieldError(field);
      }

      if (isFormStarted && REQUIRED_CONTACT_FIELDS.includes(field)) {
        return getFieldError(field);
      }

      return null;
    },
    [draft, errors, getFieldError, isFormStarted, touched],
  );

  const handleChange = (field, value) => {
    const safeValue = typeof value === 'string' ? sanitizeInput(value) : value;
    onChange({ [field]: safeValue });
    validateField(field, safeValue);
  };

  const handleNameChange = (e) => {
    const filtered = sanitizeNameInput(e.target.value);
    onChange({ clientName: filtered });
    validateField('clientName', filtered);
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, draft[field]);
  };

  const handlePhoneChange = (e) => {
    const { formatted, cursorPos } = processPhoneInput(
      e.target.value,
      e.target.selectionStart,
    );

    if (!formatted) {
      phoneCursorRef.current = 0;
      handleChange('clientPhone', '');
      setTouched((prev) => ({ ...prev, clientPhone: true }));
      return;
    }

    phoneCursorRef.current = cursorPos;
    onChange({ clientPhone: formatted });
    validateField('clientPhone', formatted);
  };

  const handleClearPhone = () => {
    handleChange('clientPhone', '');
    setTouched((prev) => ({ ...prev, clientPhone: true }));
  };

  return (
    <div className="booking-form">
      <div className="booking-form__header">
        <h2>{t('booking.contacts.title')}</h2>
        <p className="booking-form__description">
          {t('booking.contacts.description')}
        </p>
      </div>
      <form className="booking-form__fields" onSubmit={(e) => e.preventDefault()}>
        <Input
          label={t('booking.contacts.name')}
          name="clientName"
          value={draft.clientName}
          onChange={handleNameChange}
          onBlur={() => handleBlur('clientName')}
          error={getVisibleFieldError('clientName')}
          placeholder={t('booking.contacts.namePlaceholder')}
          leftIcon={<User size={18} />}
          maxLength={VALIDATION_LIMITS.CLIENT_NAME.maxLength}
          required
        />

        <div className="booking-form__row-2col">
          <div className="booking-form__field-wrapper">
            <Input
              ref={phoneInputRef}
              label={t('booking.contacts.phone')}
              name="clientPhone"
              type="tel"
              value={draft.clientPhone}
              onChange={handlePhoneChange}
              onBlur={() => handleBlur('clientPhone')}
              error={getVisibleFieldError('clientPhone')}
              placeholder={t('booking.contacts.phonePlaceholder')}
              helperText={
                getVisibleFieldError('clientPhone')
                  ? null
                  : t('booking.contacts.phoneHelper')
              }
              leftIcon={<Phone size={18} />}
              maxLength={VALIDATION_LIMITS.PHONE.maxLength}
              required
            />
            {draft.clientPhone && (
              <button
                type="button"
                className="booking-form__clear-btn"
                onClick={handleClearPhone}
                aria-label={t('booking.contacts.phoneClear')}
                title={t('booking.contacts.phoneClear')}
              >
                <X size={16} />
              </button>
            )}
          </div>

          <Input
            label={t('booking.contacts.email')}
            name="clientEmail"
            type="email"
            value={draft.clientEmail}
            onChange={(e) => handleChange('clientEmail', e.target.value)}
            onBlur={() => handleBlur('clientEmail')}
            error={getVisibleFieldError('clientEmail')}
            placeholder={t('booking.contacts.emailPlaceholder')}
            leftIcon={<Mail size={18} />}
            maxLength={VALIDATION_LIMITS.EMAIL.maxLength}
          />
        </div>

        <div className="booking-form__field">
          <label className="input__label" htmlFor="comment">
            {t('booking.contacts.comment')}
          </label>
          <textarea
            id="comment"
            name="comment"
            value={draft.comment}
            onChange={(e) => handleChange('comment', e.target.value)}
            onBlur={() => handleBlur('comment')}
            placeholder={t('booking.contacts.commentPlaceholder')}
            maxLength={VALIDATION_LIMITS.COMMENT.maxLength}
            rows={4}
            className={`input__field input__field--textarea ${
              getVisibleFieldError('comment') ? 'input__field--error' : ''
            }`}
            aria-invalid={Boolean(getVisibleFieldError('comment'))}
          />
          <div className="booking-form__comment-footer">
            {getVisibleFieldError('comment') ? (
              <p className="input__message input__message--error" role="alert">
                {getVisibleFieldError('comment')}
              </p>
            ) : (
              <p className="input__message input__message--helper">
                {t('booking.contacts.commentHelper', {
                  max: VALIDATION_LIMITS.COMMENT.maxLength,
                })}
              </p>
            )}
            <span className="booking-form__char-count">
              {draft.comment.length} / {VALIDATION_LIMITS.COMMENT.maxLength}
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}

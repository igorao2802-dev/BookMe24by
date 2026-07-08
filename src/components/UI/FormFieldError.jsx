/**
 * FormFieldError.jsx — унифицированное отображение ошибки поля
 */
import './FormFieldError.css';

export default function FormFieldError({ error, id }) {
  if (!error) return null;

  return (
    <p
      id={id}
      className="form-field-error"
      role="alert"
      aria-live="polite"
    >
      {error}
    </p>
  );
}

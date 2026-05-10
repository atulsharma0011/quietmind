import { useStore } from '../../store/useStore';

export default function Toasts() {
  const { toasts } = useStore();
  const icons = { success: 'fa-circle-check', warning: 'fa-triangle-exclamation', error: 'fa-circle-xmark' };

  return (
    <div className="toast-container" role="alert" aria-live="polite">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <i className={`fa-solid ${icons[t.type] || icons.success}`}></i>
          {t.message}
        </div>
      ))}
    </div>
  );
}

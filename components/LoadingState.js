export function LoadingSpinner({ size = 'medium' }) {
  return <span className={`loading-spinner ${size}`} aria-hidden="true" />;
}

export function ButtonLoader({ label = 'Please wait…' }) {
  return <span className="button-loader"><LoadingSpinner size="small" />{label}</span>;
}

export function LoadingState({ label = 'Loading…', compact = false }) {
  return (
    <div className={`loading-state${compact ? ' compact' : ''}`} role="status" aria-live="polite">
      <LoadingSpinner />
      <span>{label}</span>
    </div>
  );
}

export function LoadingScreen({ label = 'Loading Digital Heroes…' }) {
  return (
    <main className="loading-screen" role="status" aria-live="polite">
      <span className="loading-brand">DH</span>
      <LoadingSpinner size="large" />
      <p>{label}</p>
    </main>
  );
}

export function LoadingOverlay({ label = 'Working…' }) {
  return (
    <div className="loading-overlay" role="status" aria-live="polite">
      <LoadingSpinner />
      <span>{label}</span>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }) {
  return Array.from({ length: count }, (_, index) => (
    <div className="product-tile product-skeleton" aria-hidden="true" key={index}>
      <span className="skeleton-line short" />
      <span className="skeleton-shape" />
      <div><span className="skeleton-line title" /><span className="skeleton-line" /><span className="skeleton-line medium" /></div>
    </div>
  ));
}

'use client';

import { ExternalLink, X } from 'lucide-react';
import { useEffect } from 'react';

export default function ProofPreviewModal({ preview, title = 'Proof preview', onClose }) {
  useEffect(() => {
    if (!preview) return undefined;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [onClose, preview]);

  if (!preview) return null;

  return (
    <div className="proof-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="proof-modal" role="dialog" aria-modal="true" aria-labelledby="proof-modal-title">
        <header>
          <div><span>PROOF PREVIEW</span><h2 id="proof-modal-title">{title}</h2></div>
          <button type="button" onClick={onClose} aria-label="Close proof preview"><X /></button>
        </header>
        <iframe src={preview} title={title} />
        <footer>
          <code title={preview}>{preview}</code>
          <a href={preview} target="_blank" rel="noreferrer">Open in new tab <ExternalLink /></a>
        </footer>
      </section>
    </div>
  );
}

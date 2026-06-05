import { useState, useEffect } from 'react';

const STORAGE_KEY = 'cookie-consent';

type Consent = 'accepted' | 'declined' | null;

export default function CookieConsent() {
  const [consent, setConsent] = useState<Consent>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Consent | null;
    setConsent(stored);
    if (!stored) {
      setTimeout(() => setVisible(true), 500);
    }
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setConsent('accepted');
    setVisible(false);
    if (typeof window.__grantConsent === 'function') {
      window.__grantConsent();
    }
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, 'declined');
    setConsent('declined');
    setVisible(false);
  }

  if (consent || !visible) return null;

  const styles: Record<string, React.CSSProperties> = {
    overlay: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      background: 'var(--surface, #111)',
      borderTop: '1px solid var(--border, #333)',
      padding: '16px 24px',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: 14,
      lineHeight: 1.5,
      color: 'var(--fg, #fff)',
    },
    text: {
      flex: '1 1 300px',
      textAlign: 'center',
    },
    link: {
      color: 'var(--dim, #999)',
      textDecoration: 'underline',
    },
    btn: {
      padding: '8px 20px',
      borderRadius: 6,
      border: 'none',
      fontSize: 14,
      fontWeight: 600,
      cursor: 'pointer',
    },
    acceptBtn: {
      background: '#e94560',
      color: '#fff',
    },
    declineBtn: {
      background: 'transparent',
      color: 'var(--dim, #999)',
      border: '1px solid var(--border, #333)',
    },
  };

  return (
    <div style={styles.overlay} role="dialog" aria-label="Cookie consent">
      <div style={styles.text}>
        This site uses cookies to improve your experience.{' '}
        <a
          href="https://policies.google.com/technologies/cookies"
          target="_blank"
          rel="noopener noreferrer"
          style={styles.link}
        >
          Learn more
        </a>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button style={{ ...styles.btn, ...styles.declineBtn }} onClick={decline}>
          Decline
        </button>
        <button style={{ ...styles.btn, ...styles.acceptBtn }} onClick={accept}>
          Accept
        </button>
      </div>
    </div>
  );
}

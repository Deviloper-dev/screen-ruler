/// <reference types="astro/client" />

interface Window {
  __grantConsent?: () => void;
  dataLayer?: unknown[];
}

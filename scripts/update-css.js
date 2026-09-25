const fs = require("fs");

const cssCode = `@import "tailwindcss";

:root {
  /* Brand Primary Palette (Solid, authoritative, modern blue) */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;
  --color-primary-950: #172554;
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;

  /* Brand Semantic Colors */
  --color-brand-blue: #2563eb;
  --color-brand-blue-dark: #1d4ed8;
  --color-brand-blue-light: #60a5fa;
  --color-brand-blue-subtle: #eff6ff;

  /* Neutral Surfaces */
  --color-surface-card: #ffffff;
  --color-surface-muted: #f8fafc;
  --color-surface-subtle: #f1f5f9;
  --color-surface-dark: #0f172a;
  --color-surface-darker: #020617;
  --color-border-subtle: #e2e8f0;
  --color-border-dark: #1e293b;

  /* Typography Colors */
  --color-text-main: #0f172a;
  --color-text-muted: #475569;
  --color-text-light: #94a3b8;
  --color-text-inverse: #ffffff;

  /* Semantic Alerts / Status */
  --color-accent-green: #16a34a;
  --color-accent-green-bg: #f0fdf4;
  --color-accent-green-text: #166534;
  --color-accent-green-border: #bbf7d0;

  --color-accent-yellow: #d97706;
  --color-accent-yellow-bg: #fffbeb;
  --color-accent-yellow-text: #854d0e;
  --color-accent-yellow-border: #fef08a;

  --color-accent-red: #dc2626;
  --color-accent-red-bg: #fef2f2;
  --color-accent-red-text: #991b1b;
  --color-accent-red-border: #fecaca;
}

@theme {
  --color-primary-50: var(--color-primary-50);
  --color-primary-100: var(--color-primary-100);
  --color-primary-200: var(--color-primary-200);
  --color-primary-300: var(--color-primary-300);
  --color-primary-400: var(--color-primary-400);
  --color-primary-500: var(--color-primary-500);
  --color-primary-600: var(--color-primary-600);
  --color-primary-700: var(--color-primary-700);
  --color-primary-800: var(--color-primary-800);
  --color-primary-900: var(--color-primary-900);
  --color-primary-950: var(--color-primary-950);
  --color-primary: var(--color-primary);
  --color-primary-hover: var(--color-primary-hover);

  --color-brand-blue: var(--color-brand-blue);
  --color-brand-blue-dark: var(--color-brand-blue-dark);
  --color-brand-blue-light: var(--color-brand-blue-light);
  --color-brand-blue-subtle: var(--color-brand-blue-subtle);

  --color-surface-card: var(--color-surface-card);
  --color-surface-muted: var(--color-surface-muted);
  --color-surface-subtle: var(--color-surface-subtle);
  --color-surface-dark: var(--color-surface-dark);
  --color-surface-darker: var(--color-surface-darker);
  --color-border-subtle: var(--color-border-subtle);
  --color-border-dark: var(--color-border-dark);

  --color-text-main: var(--color-text-main);
  --color-text-muted: var(--color-text-muted);
  --color-text-light: var(--color-text-light);

  --color-accent-green: var(--color-accent-green);
  --color-accent-green-bg: var(--color-accent-green-bg);
  --color-accent-green-text: var(--color-accent-green-text);
  --color-accent-green-border: var(--color-accent-green-border);

  --color-accent-yellow: var(--color-accent-yellow);
  --color-accent-yellow-bg: var(--color-accent-yellow-bg);
  --color-accent-yellow-text: var(--color-accent-yellow-text);
  --color-accent-yellow-border: var(--color-accent-yellow-border);

  --color-accent-red: var(--color-accent-red);
  --color-accent-red-bg: var(--color-accent-red-bg);
  --color-accent-red-text: var(--color-accent-red-text);
  --color-accent-red-border: var(--color-accent-red-border);
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: var(--color-surface-muted);
  color: var(--color-text-main);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  letter-spacing: -0.011em;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: #f1f5f9;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
`;

fs.writeFileSync("D:/bisum/src/app/globals.css", cssCode, "utf8");
console.log("globals.css updated successfully!");

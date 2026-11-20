export const commonHead: string = `
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">
`;

export const sharedCss: string = `
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :root {
    --primary: #5B168C;
    --primary-dark: #3F0E63;
    --primary-deep: #25063D;
    --primary-light: #7B3AA8;
    --primary-glow: rgba(91, 22, 140, 0.12);
    --accent: #008C95;
    --accent-dark: #007A82;
    --accent-soft: #E6F5F6;
    --accent-glow: rgba(0, 140, 149, 0.15);
    --bg-light: #FCFAFD;
    --surface: #FFFFFF;
    --surface-soft: #F6EFF9;
    --surface-alt: #F0E7F5;
    --border: #E8DDEE;
    --border-subtle: #F0EAF5;
    --border-strong: #D1BFDD;
    --text: #251E2B;
    --text-muted: #645A70;
    --text-light: #8E849A;
    --whatsapp: #25D366;
    --whatsapp-dark: #128C7E;
    --star: #F59E0B;
    --shadow-sm: 0 2px 8px rgba(37, 30, 43, 0.04);
    --shadow-md: 0 8px 24px rgba(37, 30, 43, 0.07);
    --shadow-lg: 0 16px 40px rgba(37, 30, 43, 0.10);
    --shadow-glow: 0 12px 32px rgba(91, 22, 140, 0.20);
    --radius-sm: 8px;
    --radius-md: 14px;
    --radius-lg: 20px;
    --radius-xl: 28px;
    --radius-full: 9999px;
  }

  html, body {
    width: 100%;
    margin: 0;
    padding: 0;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: var(--text);
    background-color: var(--bg-light);
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 700;
    line-height: 1.2;
    color: var(--text);
    letter-spacing: -0.02em;
  }

  p {
    color: var(--text-muted);
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  img {
    max-width: 100%;
    height: auto;
    display: block;
  }

  /* Anti-quebra de linha estrita para CTAs (Regra 5 GEMINI.md) */
  .btn, .btn-primary, .btn-secondary, .btn-accent, .btn-whatsapp, .btn-outline, .btn-white, .btn-card, .btn-pill, .sticky-btn {
    white-space: nowrap !important;
    flex-shrink: 0 !important;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-family: 'Inter', sans-serif;
    font-size: 15px;
    font-weight: 600;
    border-radius: var(--radius-full);
    padding: 12px 24px;
    cursor: pointer;
    text-align: center;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    border: none;
    line-height: 1;
    text-decoration: none;
  }

  .btn-primary {
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
    color: #FFFFFF;
    box-shadow: 0 4px 14px rgba(91, 22, 140, 0.28);
  }

  .btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(91, 22, 140, 0.35);
  }

  .btn-accent {
    background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%);
    color: #FFFFFF;
    box-shadow: 0 4px 14px rgba(0, 140, 149, 0.28);
  }

  .btn-accent:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(0, 140, 149, 0.35);
  }

  .btn-whatsapp {
    background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
    color: #FFFFFF;
    box-shadow: 0 4px 14px rgba(37, 211, 102, 0.32);
    font-weight: 700;
  }

  .btn-whatsapp:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(37, 211, 102, 0.42);
  }

  .btn-outline {
    background: transparent;
    color: var(--primary);
    border: 1.5px solid var(--primary);
  }

  .btn-outline:hover {
    background: var(--surface-soft);
  }

  .btn-white {
    background: #FFFFFF;
    color: var(--primary);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  .btn-white:hover {
    background: #FAF8FC;
    transform: translateY(-1px);
  }

  .badge-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: var(--radius-full);
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    white-space: nowrap !important;
    flex-shrink: 0 !important;
  }

  .badge-primary {
    background: var(--surface-soft);
    color: var(--primary);
    border: 1px solid var(--border);
  }

  .badge-accent {
    background: var(--accent-soft);
    color: var(--accent-dark);
    border: 1px solid rgba(0, 140, 149, 0.25);
  }

  .badge-dark {
    background: rgba(255, 255, 255, 0.12);
    color: #E0F4F5;
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(8px);
  }

  .section-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 32px;
  }

  .section-header {
    text-align: center;
    max-width: 720px;
    margin: 0 auto 52px auto;
  }

  .section-header .badge-tag {
    margin-bottom: 14px;
  }

  .section-header h2 {
    font-size: 34px;
    margin-bottom: 14px;
    color: var(--text);
  }

  .section-header p {
    font-size: 16px;
    color: var(--text-muted);
    line-height: 1.6;
  }

  /* Utility classes */
  .flex-row {
    display: flex;
    align-items: center;
  }

  .svg-icon {
    display: inline-block;
    vertical-align: middle;
    flex-shrink: 0;
  }
`;

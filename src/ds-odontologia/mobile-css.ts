export const mobileCss: string = `
  body.mobile-viewport {
    width: 390px;
    max-width: 390px;
    margin: 0 auto;
    font-size: 14px;
    background-color: var(--bg-light);
  }

  .mobile-container {
    width: 100%;
    padding: 0 16px;
  }

  /* Mobile Topbar */
  .m-topbar {
    background: #25063D;
    padding: 8px 16px;
    font-size: 11.5px;
    color: #EDE5F5;
    text-align: center;
  }

  /* Mobile Header */
  .m-navbar {
    background: #FFFFFF;
    border-bottom: 1px solid var(--border);
    padding: 12px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  /* Mobile Hero */
  .m-hero {
    background: radial-gradient(circle at 80% 20%, #46106E 0%, #2A0845 60%, #1B042C 100%);
    padding: 32px 16px 28px 16px;
    color: #FFFFFF;
  }

  .m-hero-title {
    font-size: 26px;
    color: #FFFFFF;
    line-height: 1.2;
    margin-bottom: 12px;
  }

  .m-hero-subtitle {
    font-size: 14px;
    color: #E2D6EE;
    line-height: 1.55;
    margin-bottom: 20px;
  }

  /* Mobile Dropdown selector */
  .m-selector-card {
    background: #FFFFFF;
    border-radius: var(--radius-md);
    padding: 18px 16px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.25);
    margin-bottom: 22px;
  }

  .m-selector-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 4px;
  }

  .m-selector-sub {
    font-size: 12.5px;
    color: var(--text-muted);
    margin-bottom: 12px;
  }

  /* Mobile Stats */
  .m-stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-top: 20px;
  }

  .m-stat-box {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: var(--radius-sm);
    padding: 10px 12px;
  }

  .m-stat-num {
    font-size: 20px;
    font-weight: 800;
    color: #FFFFFF;
  }

  .m-stat-lbl {
    font-size: 11.5px;
    color: #C9B8DD;
  }

  /* Mobile Quick Bar */
  .m-quick-bar {
    background: #FFFFFF;
    border-radius: var(--radius-md);
    padding: 16px;
    margin: 16px 0;
    border: 1px solid var(--border);
    box-shadow: var(--shadow-sm);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .m-quick-item {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .m-quick-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--surface-soft);
    color: var(--primary);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  /* Mobile Procedures */
  .m-section {
    padding: 40px 16px;
  }

  .m-section-header {
    text-align: center;
    margin-bottom: 28px;
  }

  .m-section-header h2 {
    font-size: 22px;
    margin-top: 10px;
    margin-bottom: 8px;
  }

  .m-section-header p {
    font-size: 13.5px;
    line-height: 1.5;
  }

  .m-proc-card {
    background: #FFFFFF;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 20px 16px;
    margin-bottom: 16px;
    box-shadow: var(--shadow-sm);
  }

  .m-proc-title {
    font-size: 17px;
    margin: 10px 0 6px 0;
  }

  .m-proc-desc {
    font-size: 13px;
    color: var(--text-muted);
    line-height: 1.5;
    margin-bottom: 14px;
  }

  /* Mobile About */
  .m-about-img {
    width: 100%;
    height: 220px;
    object-fit: cover;
    border-radius: var(--radius-md);
    margin-bottom: 18px;
  }

  /* Mobile Cases & Reviews */
  .m-case-card {
    background: #FFFFFF;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    overflow: hidden;
    margin-bottom: 16px;
  }

  .m-case-img {
    width: 100%;
    height: 190px;
    object-fit: cover;
  }

  .m-case-info {
    padding: 14px;
  }

  .m-review-card {
    background: #FFFFFF;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 18px 16px;
    margin-bottom: 14px;
  }

  /* Mobile FAQ & Booking */
  .m-faq-item {
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    margin-bottom: 10px;
    background: #FFFFFF;
  }

  .m-faq-q {
    padding: 14px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    list-style: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .m-faq-q::-webkit-details-marker {
    display: none;
  }

  .m-faq-a {
    padding: 0 14px 14px 14px;
    font-size: 13px;
    color: var(--text-muted);
    line-height: 1.55;
  }

  .m-contact-box {
    background: #FFFFFF;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 20px 16px;
    margin-bottom: 24px;
  }

  .m-footer {
    background: #1B042C;
    color: #C9B8DD;
    padding: 32px 16px;
    font-size: 12.5px;
  }

  /* Sticky Action Bar ObrigatÃ³ria no Mobile Completo (Regras 3 e 5 GEMINI.md) */
  .mobile-sticky-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    width: 390px;
    margin: 0 auto;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(12px);
    border-top: 1px solid var(--border);
    box-shadow: 0 -6px 20px rgba(0, 0, 0, 0.12);
    display: flex;
    gap: 8px;
    padding: 10px 14px;
    z-index: 9999;
  }

  .sticky-btn-wpp {
    flex: 1.25;
    background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
    color: #FFFFFF;
    font-size: 13.5px;
    font-weight: 700;
    padding: 12px 10px;
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    white-space: nowrap !important;
    flex-shrink: 0 !important;
    text-decoration: none;
  }

  .sticky-btn-call {
    flex: 0.85;
    background: var(--surface-soft);
    color: var(--primary);
    border: 1px solid var(--border);
    font-size: 13px;
    font-weight: 700;
    padding: 12px 8px;
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    white-space: nowrap !important;
    flex-shrink: 0 !important;
    text-decoration: none;
  }
`;



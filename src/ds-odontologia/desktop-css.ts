export const desktopCss: string = `
  /* Topbar */
  .topbar {
    background: #25063D;
    padding: 10px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  /* Navbar */
  .navbar {
    background: #FFFFFF;
    border-bottom: 1px solid var(--border);
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: var(--shadow-sm);
  }

  .nav-link {
    transition: color 0.15s ease;
  }

  .nav-link:hover {
    color: var(--primary);
  }

  /* Hero Section (Fiel ao layout PrimeCare com identidade DS Odontologia) */
  .hero-section {
    background: radial-gradient(circle at 75% 20%, #46106E 0%, #2A0845 50%, #1B042C 100%);
    padding: 60px 0 60px 0;
    position: relative;
    overflow: hidden;
  }

  .hero-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 80%, rgba(0, 140, 149, 0.12) 0%, transparent 40%);
    pointer-events: none;
  }

  .hero-grid {
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    gap: 48px;
    align-items: center;
    position: relative;
    z-index: 2;
  }

  .hero-title {
    font-size: 42px;
    color: #FFFFFF;
    margin-bottom: 16px;
    line-height: 1.15;
    letter-spacing: -0.03em;
  }

  .hero-subtitle {
    font-size: 16.5px;
    color: #E2D6EE;
    line-height: 1.6;
    margin-bottom: 28px;
    max-width: 600px;
  }

  /* Dropdown interativo de procedimentos (Fiel Ã  Imagem 1) */
  .procedure-selector-card {
    background: #FFFFFF;
    border-radius: var(--radius-lg);
    padding: 24px;
    box-shadow: 0 16px 36px rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.2);
    margin-bottom: 28px;
  }

  .selector-form {
    display: flex;
    gap: 12px;
    margin-top: 14px;
    align-items: center;
  }

  .select-wrapper {
    flex: 1;
    position: relative;
  }

  .form-select, .form-input {
    width: 100%;
    padding: 14px 16px;
    font-size: 14.5px;
    font-family: 'Inter', sans-serif;
    color: var(--text);
    background-color: var(--bg-light);
    border: 1.5px solid var(--border);
    border-radius: var(--radius-md);
    outline: none;
    transition: border-color 0.2s;
  }

  .form-select:focus, .form-input:focus {
    border-color: var(--primary);
    background-color: #FFFFFF;
  }

  .btn-selector {
    padding: 14px 22px;
  }

  /* Stats row */
  .stat-number {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 26px;
    font-weight: 800;
    color: #FFFFFF;
    line-height: 1.1;
  }

  .stat-label {
    font-size: 12.5px;
    color: #C9B8DD;
    margin-top: 4px;
  }

  .stat-divider {
    width: 1px;
    height: 38px;
    background: rgba(255, 255, 255, 0.15);
  }

  /* Hero Visual Image & Floating Badges */
  .hero-image-wrapper {
    position: relative;
    border-radius: var(--radius-xl);
    overflow: hidden;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
    border: 3px solid rgba(255, 255, 255, 0.1);
  }

  .hero-main-img {
    width: 100%;
    height: 480px;
    object-fit: cover;
    object-position: center;
    display: block;
  }

  .hero-badge {
    position: absolute;
    background: rgba(37, 6, 61, 0.88);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: var(--radius-md);
    padding: 12px 18px;
    gap: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
    z-index: 3;
  }

  .badge-top {
    top: 24px;
    left: 20px;
  }

  .badge-bottom {
    bottom: 24px;
    right: 20px;
  }

  .badge-icon-box {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  /* Quick Contact Bar */
  .quick-contact-bar {
    background: #FFFFFF;
    border-radius: var(--radius-lg);
    padding: 20px 32px;
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--border);
    gap: 28px;
    position: relative;
    z-index: 5;
  }

  .quick-bar-item {
    gap: 14px;
    flex-shrink: 0;
  }

  .quick-icon-box {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: var(--surface-soft);
    color: var(--primary);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .quick-title {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-light);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    white-space: nowrap;
  }

  .quick-value {
    font-size: 14.5px;
    font-weight: 700;
    color: var(--text);
    white-space: nowrap;
  }

  .quick-bar-divider {
    width: 1px;
    height: 36px;
    background: var(--border);
  }

  .quick-wpp-btn {
    width: 48px;
    height: 48px;
    min-width: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
    color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 14px rgba(37, 211, 102, 0.35);
    margin-left: auto;
    flex-shrink: 0 !important;
    transition: transform 0.2s, box-shadow 0.2s;
    text-decoration: none;
  }

  .quick-wpp-btn:hover {
    transform: scale(1.08);
    box-shadow: 0 6px 20px rgba(37, 211, 102, 0.45);
  }

  .quick-wpp-btn svg {
    width: 24px;
    height: 24px;
  }

  /* Procedures Section */
  .procedures-section {
    padding: 80px 0;
    background: var(--bg-light);
  }

  .procedures-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 28px;
  }

  .proc-card {
    background: #FFFFFF;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 32px 28px;
    box-shadow: var(--shadow-sm);
    display: flex;
    flex-direction: column;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .proc-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-md);
    border-color: var(--border-strong);
  }

  .proc-card-header {
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .proc-icon-box {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .proc-tag {
    font-size: 11.5px;
    font-weight: 700;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: var(--radius-full);
    background: var(--surface-soft);
    color: var(--primary);
    border: 1px solid var(--border);
  }

  .proc-title {
    font-size: 20px;
    margin-bottom: 12px;
    color: var(--text);
  }

  .proc-desc {
    font-size: 14px;
    color: var(--text-muted);
    line-height: 1.6;
    margin-bottom: 18px;
  }

  .proc-features {
    list-style: none;
    margin-bottom: 24px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .proc-features li {
    font-size: 13px;
    color: var(--text);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .proc-features li svg {
    color: var(--accent);
    flex-shrink: 0;
  }

  .proc-link {
    margin-top: auto;
    font-size: 14px;
    font-weight: 700;
    color: var(--primary);
    gap: 6px;
    transition: gap 0.15s ease;
  }

  .proc-link:hover {
    gap: 10px;
    color: var(--primary-light);
  }

  /* About Section */
  .about-section {
    padding: 80px 0;
    background: #FFFFFF;
    border-top: 1px solid var(--border-subtle);
  }

  .about-grid {
    display: grid;
    grid-template-columns: 0.9fr 1.1fr;
    gap: 60px;
    align-items: center;
  }

  .about-img-box {
    position: relative;
    border-radius: var(--radius-xl);
    overflow: hidden;
    box-shadow: var(--shadow-lg);
  }

  .about-main-img {
    width: 100%;
    height: 480px;
    object-fit: cover;
    display: block;
  }

  .about-badge-card {
    position: absolute;
    bottom: 24px;
    left: 24px;
    background: rgba(255, 255, 255, 0.94);
    backdrop-filter: blur(10px);
    border-radius: var(--radius-md);
    padding: 14px 18px;
    gap: 12px;
    box-shadow: var(--shadow-md);
    border: 1px solid var(--border);
  }

  .about-badge-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--accent-soft);
    color: var(--accent-dark);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .metric-box {
    border-left: 3px solid var(--primary);
    padding-left: 16px;
  }

  .metric-val {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 32px;
    font-weight: 800;
    line-height: 1.1;
  }

  .metric-label {
    font-size: 13px;
    color: var(--text-muted);
    margin-top: 4px;
    max-width: 180px;
  }

  /* Results & Reviews Section */
  .results-section {
    padding: 80px 0;
    background: var(--bg-light);
  }

  .cases-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 28px;
    margin-bottom: 24px;
  }

  .case-card {
    background: #FFFFFF;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
  }

  .case-img-box {
    position: relative;
    height: 240px;
    overflow: hidden;
  }

  .case-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .case-badge {
    position: absolute;
    bottom: 12px;
    left: 12px;
    background: rgba(37, 6, 61, 0.82);
    color: #FFFFFF;
    font-size: 11.5px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: var(--radius-full);
    backdrop-filter: blur(6px);
  }

  .case-body {
    padding: 20px;
  }

  .cfo-disclaimer {
    font-size: 12px;
    color: var(--text-light);
    line-height: 1.6;
    text-align: center;
    max-width: 860px;
    margin: 0 auto;
  }

  .reviews-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }

  .review-card {
    background: #FFFFFF;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 28px;
    box-shadow: var(--shadow-sm);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .review-text {
    font-size: 14px;
    line-height: 1.65;
    color: var(--text);
  }

  .author-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 14px;
  }

  /* FAQ & Contact Section */
  .faq-section {
    padding: 80px 0 60px 0;
    background: #FFFFFF;
  }

  .faq-list {
    max-width: 820px;
    margin: 0 auto 64px auto;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .faq-item {
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--bg-light);
    overflow: hidden;
    transition: background 0.2s;
  }

  .faq-item[open] {
    background: #FFFFFF;
    border-color: var(--border-strong);
    box-shadow: var(--shadow-sm);
  }

  .faq-question {
    padding: 18px 22px;
    font-weight: 600;
    font-size: 16px;
    color: var(--text);
    cursor: pointer;
    list-style: none;
    justify-content: space-between;
  }

  .faq-question::-webkit-details-marker {
    display: none;
  }

  .faq-icon {
    color: var(--primary);
    transition: transform 0.2s ease;
  }

  .faq-item[open] .faq-icon {
    transform: rotate(180deg);
  }

  .faq-answer {
    padding: 0 22px 20px 22px;
    font-size: 14.5px;
    color: var(--text-muted);
    line-height: 1.65;
  }

  /* Contact & Booking Integrated Box */
  .contact-booking-box {
    background: #FFFFFF;
    border-radius: var(--radius-xl);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-lg);
    overflow: hidden;
  }

  .contact-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .booking-form-col {
    padding: 48px;
  }

  .contact-info-col {
    background: radial-gradient(circle at 10% 20%, #46106E 0%, #2A0845 60%, #1A042B 100%);
    padding: 48px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .form-group {
    margin-bottom: 16px;
  }

  .form-group label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 6px;
  }

  .info-icon-box {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.12);
    color: #E0D4EC;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  /* Footer */
  .footer {
    background: #1B042C;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }
`;


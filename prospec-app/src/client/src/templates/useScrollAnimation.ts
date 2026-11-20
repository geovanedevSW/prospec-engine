import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function useScrollAnimation(options?: {
  heroSelector?: string;
  cardSelector?: string;
  stagger?: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Respeitar preferência de movimento reduzido (GEMINI.md)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // 1. Animação de Entrada do Hero (Staggered Fade-Up)
      const heroItems = containerRef.current?.querySelectorAll(
        options?.heroSelector || '.anim-hero, .hero-title, .hero-sub, .hero-ctas, .hero-pill, .hero-card'
      );

      if (heroItems && heroItems.length > 0) {
        gsap.fromTo(
          heroItems,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.1,
            ease: 'power3.out',
            clearProps: 'transform'
          }
        );
      }

      // 2. Animação de Revelação de Seções ao Rolar (Scroll Reveal)
      const sections = containerRef.current?.querySelectorAll('.anim-section, section');
      sections?.forEach((sec) => {
        const title = sec.querySelector('.section-title, .section-head');
        if (title) {
          gsap.fromTo(
            title,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: sec,
                start: 'top 85%',
                toggleActions: 'play none none none'
              }
            }
          );
        }

        const cards = sec.querySelectorAll(
          options?.cardSelector || '.anim-card, .pillar-card, .service-card, .product-card, .metric-card, .treatment-card, .pricing-card, .triage-btn, .bento-item'
        );
        if (cards && cards.length > 0) {
          gsap.fromTo(
            cards,
            { opacity: 0, y: 28 },
            {
              opacity: 1,
              y: 0,
              duration: 0.65,
              stagger: options?.stagger ?? 0.12,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: sec,
                start: 'top 80%',
                toggleActions: 'play none none none'
              },
              clearProps: 'transform'
            }
          );
        }
      });
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [options?.heroSelector, options?.cardSelector, options?.stagger]);

  return containerRef;
}


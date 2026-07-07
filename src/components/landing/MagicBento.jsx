import { useRef, useCallback, useEffect } from 'react';
import './MagicBento.css';

const GLOW_RADIUS = 300;

const GlobalSpotlight = ({ sectionRef, glowColor }) => {
  const spotlightRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const spotlight = spotlightRef.current;
    if (!section || !spotlight) return;

    // Listen on the section (not window) and coalesce moves to one rAF per
    // frame, so off-screen scrolling and unrelated mouse activity cost nothing
    // and layout reads never interleave with the tilt handler's writes.
    let rafId = null;
    let lastEvent = null;

    const applyMove = () => {
      rafId = null;
      const e = lastEvent;
      if (!e) return;

      // The spotlight is position:fixed, but a transformed ancestor (the
      // SplitText reveal wrapper leaves an inline transform) becomes its
      // containing block — so `fixed` then resolves relative to that ancestor,
      // not the viewport. Offset the cursor coords by that block's top-left so
      // the glow lands on the cursor again. Kept inside the section so its
      // mix-blend-mode:screen still reads against the dark backdrop.
      let ox = 0;
      let oy = 0;
      let n = spotlight.parentElement;
      while (n) {
        if (getComputedStyle(n).transform !== 'none') {
          const r = n.getBoundingClientRect();
          ox = r.left;
          oy = r.top;
          break;
        }
        n = n.parentElement;
      }
      spotlight.style.left = `${e.clientX - ox}px`;
      spotlight.style.top = `${e.clientY - oy}px`;

      const cards = section.querySelectorAll('.magic-bento-card');
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--glow-x', `${x}px`);
        card.style.setProperty('--glow-y', `${y}px`);

        // Distance from cursor to nearest edge of the card
        const dx = Math.max(rect.left - e.clientX, 0, e.clientX - rect.right);
        const dy = Math.max(rect.top - e.clientY, 0, e.clientY - rect.bottom);
        const dist = Math.hypot(dx, dy);
        const intensity = Math.max(0, 1 - dist / GLOW_RADIUS);
        card.style.setProperty('--glow-intensity', intensity.toFixed(3));
      });

      // The spotlight follows the cursor across the whole section (not only near
      // the cards); the per-card border glow still fades with proximity.
      spotlight.style.opacity = '1';
    };

    const handleMove = (e) => {
      lastEvent = e;
      if (rafId == null) rafId = requestAnimationFrame(applyMove);
    };

    const handleLeave = () => {
      spotlight.style.opacity = '0';
      section.querySelectorAll('.magic-bento-card').forEach((card) => {
        card.style.setProperty('--glow-intensity', '0');
      });
    };

    section.addEventListener('mousemove', handleMove, { passive: true });
    section.addEventListener('mouseleave', handleLeave);
    return () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      section.removeEventListener('mousemove', handleMove);
      section.removeEventListener('mouseleave', handleLeave);
    };
  }, [sectionRef, glowColor]);

  return (
    <div
      ref={spotlightRef}
      className="global-spotlight"
      style={{
        background: `radial-gradient(circle,
          rgba(${glowColor}, 0.3) 0%,
          rgba(${glowColor}, 0.15) 20%,
          rgba(${glowColor}, 0.05) 40%,
          transparent 60%
        )`,
        transform: 'translate(-50%, -50%)',
      }}
    />
  );
};

const MagicBento = ({
  cards = [],
  enableTilt = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  enableParticles = true,
  glowColor = '110, 86, 207',
}) => {
  const sectionRef = useRef(null);

  const handleMouseMove = useCallback(
    (e) => {
      if (!enableTilt) return;
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rx = ((y - cy) / cy) * -4;
      const ry = ((x - cx) / cx) * 4;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    },
    [enableTilt]
  );

  const handleMouseLeave = useCallback(
    (e) => {
      if (enableTilt) e.currentTarget.style.transform = '';
    },
    [enableTilt]
  );

  const handleMouseEnter = useCallback(
    (e) => {
      if (!enableParticles) return;
      const card = e.currentTarget;
      const layer = card.querySelector('.magic-bento-card__particles');
      if (!layer) return;
      const count = 10;
      for (let i = 0; i < count; i++) {
        const p = document.createElement('span');
        p.className = 'magic-bento-particle';
        p.style.left = `${Math.random() * 100}%`;
        p.style.top = `${70 + Math.random() * 30}%`;
        p.style.setProperty('--dx', `${(Math.random() - 0.5) * 80}px`);
        p.style.setProperty('--dy', `${-60 - Math.random() * 80}px`);
        p.style.animationDelay = `${Math.random() * 0.4}s`;
        layer.appendChild(p);
        setTimeout(() => p.remove(), 2800);
      }
    },
    [enableParticles]
  );

  return (
    <section className="bento-section" ref={sectionRef}>
      {enableSpotlight && <GlobalSpotlight sectionRef={sectionRef} glowColor={glowColor} />}
      <div className="card-grid">
        {cards.map((card, idx) => {
          const isFeatured = card.ctaStyle === 'solid-purple';
          const classes = [
            'magic-bento-card',
            enableBorderGlow ? 'magic-bento-card--border-glow' : '',
            isFeatured ? 'magic-bento-card--featured' : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <article
              key={idx}
              className={classes}
              style={{
                background: card.color || '#14101d',
              }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onMouseEnter={handleMouseEnter}
            >
              {enableParticles && <div className="magic-bento-card__particles" />}

              <div className="magic-bento-card__content">
                {card.label && <span className="magic-bento-card__label">{card.label}</span>}
                {card.title && <h3 className="magic-bento-card__title">{card.title}</h3>}
                {card.price && <p className="magic-bento-card__price">{card.price}</p>}
                {card.description && (
                  <p className="magic-bento-card__description">{card.description}</p>
                )}
                {card.features && card.features.length > 0 && (
                  <ul className="magic-bento-card__features">
                    {card.features.map((feature, i) => (
                      <li key={i}>
                        <svg
                          className="magic-bento-card__check"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {card.ctaText && (
                  <a
                    href={card.ctaHref || '#contact'}
                    className={`magic-bento-card__cta magic-bento-card__cta--${card.ctaStyle || 'outline'}`}
                  >
                    {card.ctaText}
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default MagicBento;

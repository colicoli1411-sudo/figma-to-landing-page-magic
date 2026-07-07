import {
  Children,
  Fragment,
  cloneElement,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type JSX,
  type ReactNode,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type SplitTextProps = {
  /** Plain-string content. Provide this OR `children` (rich content). */
  text?: string;
  /**
   * Rich content — animated the same way as `text`, but nested elements (e.g.
   * a styled `<span>`) are preserved while their text still splits per unit.
   */
  children?: ReactNode;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  style?: CSSProperties;
  /** Stagger between units, in ms (React Bits' `delay`). */
  delay?: number;
  /** Per-unit duration, in seconds. */
  duration?: number;
  ease?: string;
  splitType?: "chars" | "words";
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  /** Fraction of the element that must be in view before playing (0–1). */
  threshold?: number;
  /** Replay every time the element scrolls into view (both directions) instead of once. */
  replay?: boolean;
  /**
   * Quiet reveal mode: skip per-unit splitting entirely and fade+slide the whole
   * element in once on scroll. Text stays as plain nodes (no split spans). Used
   * for every non-hero heading/paragraph so the hero's entrance stays the only
   * dramatic motion. Ignores split-specific props (splitType/from/to/etc.).
   */
  reveal?: boolean;
  /**
   * Delay (seconds) before the reveal tween starts — lets sibling reveals form
   * a heading → sub → content cadence instead of one flat beat.
   */
  revealDelay?: number;
  onComplete?: () => void;
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const unitStyle = { display: "inline-block", willChange: "opacity, transform" } as const;

/** Flatten any React node down to its plain text (for aria-label + effect deps). */
function extractText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (isValidElement(node)) return extractText((node.props as { children?: ReactNode }).children);
  return "";
}

/**
 * React Bits–style SplitText: splits text into per-character (or per-word)
 * spans and animates them in with a GSAP stagger when the element scrolls into
 * view — fires early (default `top 80%`) so it never lags behind the scroll.
 * Typography is inherited from `className`. Accepts a plain `text` string or
 * rich `children` (nested elements preserved, their text still split).
 */
export function SplitText({
  text,
  children,
  as: Tag = "p",
  className = "",
  style,
  delay = 40,
  duration = 0.6,
  ease = "power3.out",
  splitType = "chars",
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.2,
  replay = false,
  reveal = false,
  revealDelay = 0,
  onComplete,
}: SplitTextProps) {
  const ref = useRef<HTMLElement | null>(null);

  // Split into words first so words never break across lines; optionally split
  // each word into characters.
  const words = useMemo(() => (text ?? "").split(" "), [text]);

  // Stable content key so replays/deps track the actual heading text.
  const label = text ?? extractText(children);

  // Effect key: split mode re-inits when the text changes (re-split); reveal mode
  // fades the whole element once and never reads the text, so it must NOT depend on
  // it — otherwise dynamic children (e.g. a live-updating calculator) retrigger the
  // reveal on every value change, replaying the fade-in.
  const effectKey = reveal ? "reveal" : label;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Reduced motion: skip all animation and leave content in its natural,
    // fully-visible state.
    if (prefersReducedMotion()) return;

    // Quiet reveal: fade + slide the whole element in once, no splitting.
    if (reveal) {
      const ctx = gsap.context(() => {
        gsap.from(el, {
          y: 24,
          opacity: 0,
          duration: 0.7,
          delay: revealDelay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            // `reset` on leaveBack (not `none`): if a reveal ever fires against a
            // stale, too-short layout — before fonts/images/the Features pin push
            // it down — the follow-up ScrollTrigger.refresh() re-measures it below
            // the viewport and resets it to its hidden state, so it animates
            // properly when you actually scroll to it. Also gives a clean replay
            // when scrolling back up past a section.
            // NOTE: no invalidateOnRefresh — for a `.from()` tween it would
            // re-capture the element's *current* (hidden) value as the animation
            // target on refresh, animating 0→0 and leaving content stuck hidden.
            toggleActions: "play none none reset",
          },
          onComplete,
        });
      }, el);
      return () => ctx.revert();
    }

    const units = el.querySelectorAll<HTMLElement>("[data-split-unit]");
    if (!units.length) return;

    const startPct = Math.max(0, Math.min(100, (1 - threshold) * 100));

    const ctx = gsap.context(() => {
      // Hold the units hidden up-front and drive a paused tween through explicit
      // ScrollTrigger callbacks. This is deterministic where toggleActions are
      // not: if the trigger ever fires against a stale, too-short layout (before
      // fonts/images/the Features pin push this element down), the follow-up
      // ScrollTrigger.refresh() re-measures it below the viewport and onLeaveBack
      // pauses it back to frame 0 (hidden) — so it animates properly when you
      // actually scroll to it, instead of sitting committed-visible.
      gsap.set(units, { ...from });
      const tween = gsap.fromTo(
        units,
        { ...from },
        { ...to, duration, ease, stagger: delay / 1000, paused: true, onComplete },
      );
      ScrollTrigger.create({
        trigger: el,
        start: `top ${startPct}%`,
        invalidateOnRefresh: true,
        onEnter: () => tween.play(),
        // replay: restart on every downward re-entry; default: just ensure it has played.
        onEnterBack: () => (replay ? tween.restart() : tween.play()),
        // Reset to the hidden frame when the element leaves below the viewport,
        // both on real upward scroll and on refresh-driven repositioning.
        onLeaveBack: () => tween.pause(0),
        ...(replay ? { onLeave: () => tween.pause(0) } : {}),
      });
    }, el);

    return () => ctx.revert();
  }, [effectKey, splitType, delay, duration, ease, threshold, replay, reveal, revealDelay]);

  const TagAny = Tag as any;

  // Wrap a single word's characters (or the whole word) as animatable units,
  // kept on one line via a nowrap wrapper so it never breaks mid-word.
  const renderWord = (word: string, key: React.Key) => (
    <span key={key} aria-hidden style={{ display: "inline-block", whiteSpace: "nowrap" }}>
      {splitType === "words" ? (
        <span data-split-unit style={unitStyle}>
          {word}
        </span>
      ) : (
        [...word].map((char, ci) => (
          <span key={ci} data-split-unit style={unitStyle}>
            {char}
          </span>
        ))
      )}
    </span>
  );

  // Recursively split rich children: strings become animated word/char units,
  // elements (e.g. a styled accent span) are preserved and their text split.
  let unitKey = 0;
  const splitNode = (node: ReactNode): ReactNode => {
    if (node == null || typeof node === "boolean") return null;
    if (typeof node === "string" || typeof node === "number") {
      // Tokenize keeping whitespace runs so lines still wrap at spaces.
      return String(node)
        .split(/(\s+)/)
        .map((tok, i) =>
          tok === "" ? null : /^\s+$/.test(tok) ? (
            <Fragment key={`s${unitKey++}-${i}`}> </Fragment>
          ) : (
            renderWord(tok, `w${unitKey++}-${i}`)
          ),
        );
    }
    if (Array.isArray(node)) return node.map((n) => splitNode(n));
    if (isValidElement(node)) {
      const el = node as React.ReactElement<{ children?: ReactNode }>;
      return cloneElement(el, { key: `e${unitKey++}` }, splitNode(el.props.children));
    }
    return node;
  };

  return (
    <TagAny
      ref={ref as any}
      className={`split-text ${className}`}
      style={{ margin: 0, ...style }}
      // Reveal mode renders real text nodes, so no aria-label shim is needed;
      // the split path uses aria-hidden units and relies on the label.
      aria-label={reveal ? undefined : label}
    >
      {reveal
        ? (children ?? text)
        : children != null
        ? Children.toArray(children).map((c) => splitNode(c))
        : words.map((word, wi) => (
            <Fragment key={wi}>
              {renderWord(word, `word-${wi}`)}
              {/* Breakable space between words — at container level so lines wrap. */}
              {wi < words.length - 1 ? " " : null}
            </Fragment>
          ))}
    </TagAny>
  );
}

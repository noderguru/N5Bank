"use client";

import { useEffect, useState } from "react";

const TYPE_MS = 55;
const DELETE_MS = 26;
const HOLD_MS = 1900;

/**
 * Types one phrase at a time under a shimmering hairline rule.
 *
 * Server-renders the first phrase in full, so the headline reads correctly
 * without JS and never pops in. Typing only starts once the client has
 * confirmed the visitor has not asked for reduced motion.
 *
 * ponytail: the phrase reflows its own line as it types — no fixed-width
 * sizer. Add one only if the reflow proves distracting at real content widths.
 */
export function RotatingWords({ words }: { words: string[] }) {
  const first = words[0] ?? "";
  const [index, setIndex] = useState(0);
  const [length, setLength] = useState(first.length);
  const [deleting, setDeleting] = useState(false);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setTyping(true);
  }, []);

  useEffect(() => {
    if (!typing || words.length < 2) return;

    const word = words[index] ?? "";

    if (!deleting && length >= word.length) {
      const hold = setTimeout(() => setDeleting(true), HOLD_MS);
      return () => clearTimeout(hold);
    }

    if (deleting && length <= 0) {
      setDeleting(false);
      setIndex((i) => (i + 1) % words.length);
      return;
    }

    const step = setTimeout(
      () => setLength((l) => l + (deleting ? -1 : 1)),
      deleting ? DELETE_MS : TYPE_MS
    );
    return () => clearTimeout(step);
  }, [typing, deleting, index, length, words]);

  const word = words[index] ?? "";
  const shown = typing ? word.slice(0, length) : first;

  // Rendered inline (not inline-flex) so a long ru/uk phrase can still wrap.
  return (
    <>
      {/* Keeps the full phrase available to screen readers and to crawlers. */}
      <span className="sr-only">{first}</span>
      <span aria-hidden="true" className="shimmer-rule">
        {shown}
      </span>
      {typing && <span aria-hidden="true" className="type-caret" />}
    </>
  );
}

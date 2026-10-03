import { useEffect, useRef, useState } from "react";

/**
 * Types example text into a field's placeholder, one character at a time, then
 * deletes it and moves to the next.
 *
 * Vakilsearch does this in its hero search, and it is the one piece of motion
 * on that page that earns its place: the field is the only thing a visitor is
 * meant to touch, and a moving placeholder both draws the eye there and shows
 * what the field expects.
 *
 * Ours searches the MCA register for a *business name*, not a service, so the
 * examples are names in the shape we want typed back — the hint is the point,
 * the motion is what makes it get read.
 *
 * Stops the moment the field is focused or has a value: an animation competing
 * with someone's own typing is just noise. Returns the full static text under
 * `prefers-reduced-motion`, so the hint survives without the movement.
 */
export function useTypedPlaceholder(
  examples: string[],
  { active = true, prefix = "" }: { active?: boolean; prefix?: string } = {},
) {
  const [typed, setTyped] = useState(examples[0] ?? "");
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
    if (reduced.current || !active || examples.length === 0) {
      setTyped(examples[0] ?? "");
      return;
    }

    const TYPE_MS = 55;
    const DELETE_MS = 28;
    const HOLD_MS = 1800;
    const BETWEEN_MS = 350;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timer = setTimeout(resolve, ms);
      });

    (async () => {
      let i = 0;
      // Start from whatever is on screen rather than clearing it first, so the
      // field never flashes an empty hint.
      let current = examples[0] ?? "";
      while (!cancelled) {
        const word = examples[i % examples.length];

        while (!cancelled && current !== word) {
          // Rewind to the longest shared opening before typing forward, so
          // names sharing a first word do not retype it.
          const shared = sharedPrefix(current, word);
          if (current.length > shared.length) {
            current = current.slice(0, -1);
            setTyped(current);
            await wait(DELETE_MS);
          } else {
            current = word.slice(0, current.length + 1);
            setTyped(current);
            await wait(TYPE_MS);
          }
        }

        await wait(HOLD_MS);
        i += 1;
        await wait(BETWEEN_MS);
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [examples, active]);

  return prefix + typed;
}

function sharedPrefix(a: string, b: string) {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i += 1;
  return a.slice(0, i);
}

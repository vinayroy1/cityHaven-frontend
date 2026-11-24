/**
 * Sizes and places an absolutely-positioned dropdown panel under its field when it opens, so it works in
 * any layout (full-width form, narrow grid column, right-hand filter):
 *  - at least as wide as the field, up to `preferred` px (names stay readable in narrow columns);
 *  - opens rightwards when there is room, otherwise grows leftwards from the field's right edge;
 *  - never past either edge of the screen.
 * Use as a callback ref on the panel: `ref={(el) => placeDropdown(el, fieldRef.current)}`.
 */
export function placeDropdown(panel: HTMLElement | null, field: HTMLElement | null, preferred = 352, margin = 8) {
  if (!panel || !field || typeof window === "undefined") return;
  const r = field.getBoundingClientRect();
  const vw = document.documentElement.clientWidth || window.innerWidth;
  const width = Math.min(Math.max(r.width, preferred), vw - margin * 2);
  panel.style.width = `${width}px`;
  panel.style.maxWidth = "none";
  panel.style.minWidth = "0";
  if (r.left + width <= vw - margin) {
    panel.style.left = "0";
    panel.style.right = "auto";
  } else if (r.right - width >= margin) {
    panel.style.left = "auto";
    panel.style.right = "0";
  } else {
    // Neither edge works on its own (very wide preference on a small screen): pin to the screen margin.
    panel.style.left = `${margin - r.left}px`;
    panel.style.right = "auto";
  }
}

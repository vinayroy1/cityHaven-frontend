/**
 * An advisor's real photo, or null. Profiles without an upload were seeded with the Awasio mark or a
 * generic avatar SVG; those count as "no photo" so cards show the advisor's initials instead.
 */
const PLACEHOLDER = /\/(assets\/logo\/awasio-mark|advisors\/avatars\/(avatar_[a-z]+|placeholder-avatar))\.svg(\?|$)/i;

export function advisorPhoto(url?: string | null): string | null {
  const v = url?.trim();
  return v && !PLACEHOLDER.test(v) ? v : null;
}

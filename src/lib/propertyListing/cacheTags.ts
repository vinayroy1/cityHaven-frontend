/** Cache tag for the /properties/[id] detail fetch (`key` is the id or slug in the URL). */
export const propertyDetailCacheTag = (key: string) => `property-detail:${key}`;

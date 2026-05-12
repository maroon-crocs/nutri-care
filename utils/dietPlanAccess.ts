export const DIET_PLAN_ACCESS_CODE = 'Roshan_2026';
export const DIET_PLAN_ROUTE_HASH = '#/diet-plan';
export const ADMIN_PANEL_ROUTE_HASH = '#/admin';

const normalizeAccessCode = (value: string): string =>
  value.toUpperCase().replace(/[^A-Z0-9]/g, '');

export const containsDietPlanAccessCode = (message: string): boolean =>
  normalizeAccessCode(message).includes(normalizeAccessCode(DIET_PLAN_ACCESS_CODE));

export const buildDietPlanAccessUrl = (
  origin: string,
  pathname = '/',
  routeHash = DIET_PLAN_ROUTE_HASH,
): string => {
  const safeOrigin = origin.replace(/\/$/, '');
  const safePathname = pathname || '/';

  return `${safeOrigin}${safePathname}${routeHash}`;
};

export const buildDietPlanAccessResponse = (
  message: string,
  origin: string,
  pathname = '/',
): string | null => {
  if (!containsDietPlanAccessCode(message)) {
    return null;
  }

  const adminUrl = buildDietPlanAccessUrl(origin, pathname, ADMIN_PANEL_ROUTE_HASH);
  const dietPlanUrl = buildDietPlanAccessUrl(
    origin,
    pathname,
    DIET_PLAN_ROUTE_HASH,
  );

  return [
    'Admin workspace unlocked.',
    '',
    `[Open Admin Panel](${adminUrl})`,
    '',
    `[Open Diet Plan Creator](${dietPlanUrl})`,
    '',
    `Admin URL: ${adminUrl}`,
    `Diet Plan URL: ${dietPlanUrl}`,
  ].join('\n');
};

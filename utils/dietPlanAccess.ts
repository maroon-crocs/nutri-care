export const DIET_PLAN_ACCESS_CODE = 'Roshan_2026';
export const DIET_PLAN_ROUTE_HASH = '#/diet-plan';

const normalizeAccessCode = (value: string): string =>
  value.toUpperCase().replace(/[^A-Z0-9]/g, '');

export const containsDietPlanAccessCode = (message: string): boolean =>
  normalizeAccessCode(message).includes(normalizeAccessCode(DIET_PLAN_ACCESS_CODE));

export const buildDietPlanAccessUrl = (
  origin: string,
  pathname = '/',
): string => {
  const safeOrigin = origin.replace(/\/$/, '');
  const safePathname = pathname || '/';

  return `${safeOrigin}${safePathname}${DIET_PLAN_ROUTE_HASH}`;
};

export const buildDietPlanAccessResponse = (
  message: string,
  origin: string,
  pathname = '/',
): string | null => {
  if (!containsDietPlanAccessCode(message)) {
    return null;
  }

  const accessUrl = buildDietPlanAccessUrl(origin, pathname);

  return [
    'Admin diet plan link unlocked.',
    '',
    `[Open Diet Plan Creator](${accessUrl})`,
    '',
    `Direct URL: ${accessUrl}`,
  ].join('\n');
};

import type {
  AdminClient,
  AdminClientStatus,
  AdminDietPlanRecord,
  AdminPaymentStatus,
  DietPlan,
} from '../types';
import { createEmptyDietPlan, normalizeDietPlan } from './dietPlan.ts';

export const ADMIN_SESSION_STORAGE_KEY = 'nutriguide:admin-session';
export const ADMIN_CLIENTS_STORAGE_KEY = 'nutriguide:admin-clients';
export const ADMIN_PLAN_RECORDS_STORAGE_KEY = 'nutriguide:admin-plan-records';

export const ADMIN_CLIENT_STATUSES: Array<{
  id: AdminClientStatus;
  label: string;
}> = [
  { id: 'new', label: 'New Lead' },
  { id: 'intakeReceived', label: 'Intake Received' },
  { id: 'paymentPending', label: 'Payment Pending' },
  { id: 'planPending', label: 'Plan Pending' },
  { id: 'planSent', label: 'Plan Sent' },
  { id: 'followUpDue', label: 'Follow-up Due' },
  { id: 'completed', label: 'Completed' },
];

export const ADMIN_PAYMENT_STATUSES: Array<{
  id: AdminPaymentStatus;
  label: string;
}> = [
  { id: 'unpaid', label: 'Unpaid' },
  { id: 'partial', label: 'Partial' },
  { id: 'paid', label: 'Paid' },
];

const ADMIN_CLIENT_STATUS_IDS = new Set<AdminClientStatus>(
  ADMIN_CLIENT_STATUSES.map((status) => status.id),
);

const ADMIN_PAYMENT_STATUS_IDS = new Set<AdminPaymentStatus>(
  ADMIN_PAYMENT_STATUSES.map((status) => status.id),
);

const getText = (value: unknown): string =>
  typeof value === 'string' ? value : '';

const getClientStatus = (value: unknown): AdminClientStatus =>
  typeof value === 'string' &&
  ADMIN_CLIENT_STATUS_IDS.has(value as AdminClientStatus)
    ? (value as AdminClientStatus)
    : 'new';

const getPaymentStatus = (value: unknown): AdminPaymentStatus =>
  typeof value === 'string' &&
  ADMIN_PAYMENT_STATUS_IDS.has(value as AdminPaymentStatus)
    ? (value as AdminPaymentStatus)
    : 'unpaid';

const getObject = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

export const createAdminClient = (
  client: Partial<AdminClient> = {},
): AdminClient => {
  const now = new Date().toISOString();

  return {
    id: client.id || `client-${Date.now()}`,
    name: client.name || '',
    phone: client.phone || '',
    instagramHandle: client.instagramHandle || '',
    email: client.email || '',
    age: client.age || '',
    gender: client.gender || '',
    height: client.height || '',
    weight: client.weight || '',
    dietType: client.dietType || '',
    allergies: client.allergies || '',
    healthIssues: client.healthIssues || '',
    goal: client.goal || '',
    workoutStatus: client.workoutStatus || '',
    workoutType: client.workoutType || '',
    medicinesSupplements: client.medicinesSupplements || '',
    preferences: client.preferences || '',
    wakeSleepTime: client.wakeSleepTime || '',
    cuisinePreference: client.cuisinePreference || '',
    budgetPreference: client.budgetPreference || '',
    currentEatingPattern: client.currentEatingPattern || '',
    packageName: client.packageName || '',
    amount: client.amount || '',
    paymentStatus: client.paymentStatus || 'unpaid',
    status: client.status || 'new',
    followUpDate: client.followUpDate || '',
    notes: client.notes || '',
    createdAt: client.createdAt || now,
    updatedAt: client.updatedAt || now,
  };
};

export const normalizeAdminClient = (value: unknown): AdminClient => {
  const item = getObject(value);
  const now = new Date().toISOString();

  return createAdminClient({
    id: getText(item.id) || `client-${Date.now()}`,
    name: getText(item.name),
    phone: getText(item.phone),
    instagramHandle: getText(item.instagramHandle),
    email: getText(item.email),
    age: getText(item.age),
    gender: getText(item.gender),
    height: getText(item.height),
    weight: getText(item.weight),
    dietType: getText(item.dietType),
    allergies: getText(item.allergies),
    healthIssues: getText(item.healthIssues),
    goal: getText(item.goal),
    workoutStatus: getText(item.workoutStatus),
    workoutType: getText(item.workoutType),
    medicinesSupplements: getText(item.medicinesSupplements),
    preferences: getText(item.preferences),
    wakeSleepTime: getText(item.wakeSleepTime),
    cuisinePreference: getText(item.cuisinePreference),
    budgetPreference: getText(item.budgetPreference),
    currentEatingPattern: getText(item.currentEatingPattern),
    packageName: getText(item.packageName),
    amount: getText(item.amount),
    paymentStatus: getPaymentStatus(item.paymentStatus),
    status: getClientStatus(item.status),
    followUpDate: getText(item.followUpDate),
    notes: getText(item.notes),
    createdAt: getText(item.createdAt) || now,
    updatedAt: getText(item.updatedAt) || now,
  });
};

export const normalizeAdminClients = (value: unknown): AdminClient[] =>
  Array.isArray(value) ? value.map(normalizeAdminClient) : [];

export const readAdminClients = (): AdminClient[] => {
  try {
    return normalizeAdminClients(
      JSON.parse(window.localStorage.getItem(ADMIN_CLIENTS_STORAGE_KEY) || '[]'),
    );
  } catch {
    return [];
  }
};

export const writeAdminClients = (clients: AdminClient[]): void => {
  window.localStorage.setItem(
    ADMIN_CLIENTS_STORAGE_KEY,
    JSON.stringify(clients),
  );
};

export const createDietPlanFromAdminClient = (
  client: AdminClient,
): DietPlan => {
  const plan = createEmptyDietPlan();

  return {
    ...plan,
    id: `diet-plan-${Date.now()}`,
    sourceClientId: client.id,
    title: `${client.name.trim() || 'Patient'} Weekly Diet Plan`,
    patient: {
      ...plan.patient,
      name: client.name,
      phone: client.phone,
      instagramHandle: client.instagramHandle,
      age: client.age,
      height: client.height,
      weight: client.weight,
      dietType: client.dietType,
      allergies: client.allergies,
      healthIssues: client.healthIssues,
      goal: client.goal,
      workoutStatus: client.workoutStatus,
      workoutType: client.workoutType,
      medicinesSupplements: client.medicinesSupplements,
      preferences: [
        client.preferences,
        client.wakeSleepTime ? `Wake/sleep: ${client.wakeSleepTime}` : '',
        client.cuisinePreference
          ? `Cuisine: ${client.cuisinePreference}`
          : '',
        client.budgetPreference ? `Budget: ${client.budgetPreference}` : '',
        client.currentEatingPattern
          ? `Current eating: ${client.currentEatingPattern}`
          : '',
      ]
        .filter(Boolean)
        .join(' | '),
    },
    updatedAt: new Date().toISOString(),
  };
};

export const normalizeAdminDietPlanRecord = (
  value: unknown,
): AdminDietPlanRecord | null => {
  const item = getObject(value);
  const rawPlan = item.plan;

  if (!rawPlan) {
    return null;
  }

  const plan = normalizeDietPlan(rawPlan);
  const now = new Date().toISOString();

  return {
    id: getText(item.id) || plan.id,
    clientId: getText(item.clientId) || plan.sourceClientId || '',
    patientName:
      getText(item.patientName) || plan.patient.name.trim() || 'Patient',
    title: getText(item.title) || plan.title,
    goal: getText(item.goal) || plan.patient.goal,
    status: item.status === 'final' ? 'final' : 'draft',
    plan,
    createdAt: getText(item.createdAt) || now,
    updatedAt: getText(item.updatedAt) || now,
  };
};

export const normalizeAdminDietPlanRecords = (
  value: unknown,
): AdminDietPlanRecord[] =>
  Array.isArray(value)
    ? value
        .map(normalizeAdminDietPlanRecord)
        .filter((record): record is AdminDietPlanRecord => Boolean(record))
    : [];

export const readAdminDietPlanRecords = (): AdminDietPlanRecord[] => {
  try {
    return normalizeAdminDietPlanRecords(
      JSON.parse(
        window.localStorage.getItem(ADMIN_PLAN_RECORDS_STORAGE_KEY) || '[]',
      ),
    );
  } catch {
    return [];
  }
};

export const writeAdminDietPlanRecords = (
  records: AdminDietPlanRecord[],
): void => {
  window.localStorage.setItem(
    ADMIN_PLAN_RECORDS_STORAGE_KEY,
    JSON.stringify(records),
  );
};

export const saveAdminDietPlanRecord = (
  plan: DietPlan,
  status: AdminDietPlanRecord['status'] = 'draft',
): AdminDietPlanRecord => {
  const records = readAdminDietPlanRecords();
  const normalizedPlan = normalizeDietPlan(plan);
  const now = new Date().toISOString();
  const existingRecord = records.find((record) => record.id === normalizedPlan.id);
  const nextRecord: AdminDietPlanRecord = {
    id: normalizedPlan.id,
    clientId: normalizedPlan.sourceClientId || '',
    patientName: normalizedPlan.patient.name.trim() || 'Patient',
    title: normalizedPlan.title.trim() || 'Weekly Diet Plan',
    goal: normalizedPlan.patient.goal.trim(),
    status,
    plan: normalizedPlan,
    createdAt: existingRecord?.createdAt || now,
    updatedAt: now,
  };
  const nextRecords = existingRecord
    ? records.map((record) =>
        record.id === nextRecord.id ? nextRecord : record,
      )
    : [nextRecord, ...records];

  writeAdminDietPlanRecords(nextRecords);

  if (nextRecord.clientId) {
    const clients = readAdminClients();
    const nextClientStatus: AdminClientStatus =
      status === 'final' ? 'planSent' : 'planPending';
    const nextClients = clients.map((client) =>
      client.id === nextRecord.clientId
        ? {
            ...client,
            status: nextClientStatus,
            updatedAt: now,
          }
        : client,
    );
    writeAdminClients(nextClients);
  }

  return nextRecord;
};

export const buildClientIntakeMessage = (client?: AdminClient): string => {
  const name = client?.name.trim();

  return [
    name ? `Hi ${name}, please share these details:` : 'Please share these details:',
    '',
    '1. Age, height, weight',
    '2. Goal: weight loss, weight gain, PCOS, thyroid, diabetes, muscle gain, or maintenance',
    '3. Diet type: veg, eggetarian, or non-veg',
    '4. Allergies or foods that do not suit you',
    '5. Health issues: PCOS, thyroid, diabetes, acidity, BP, etc.',
    '6. Workout: yes/no and type',
    '7. Medicines or supplements',
    '8. Wake-up time and sleep time',
    '9. Food likes, dislikes, and cuisine preference',
    '10. Current eating pattern from morning to night',
  ].join('\n');
};

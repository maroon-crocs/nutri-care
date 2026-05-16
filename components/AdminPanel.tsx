import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ClipboardList,
  Copy,
  Download,
  FileText,
  Instagram,
  LogOut,
  Pencil,
  Plus,
  RefreshCcw,
  Save,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound,
  UsersRound,
} from 'lucide-react';
import type {
  AdminClient,
  AdminClientStatus,
  AdminDietPlanRecord,
  AdminPaymentStatus,
} from '../types';
import {
  ADMIN_CLIENT_STATUSES,
  ADMIN_NEW_CLIENT_ROUTE_HASH,
  ADMIN_NOTICE_STORAGE_KEY,
  ADMIN_PAYMENT_STATUSES,
  ADMIN_SESSION_STORAGE_KEY,
  buildAdminClientEditRouteHash,
  buildAdminClientRouteHash,
  buildClientIntakeMessage,
  createAdminClient,
  createDietPlanFromAdminClient,
  deleteAdminClientAsync,
  deleteAdminDietPlanRecordAsync,
  getAdminDietPlanPdfSignedUrl,
  parseAdminClientRouteId,
  readAdminClientsAsync,
  readAdminDietPlanRecordsAsync,
  saveAdminClientAsync,
} from '../utils/adminPanel';
import {
  buildInstagramProfileUrl,
  buildWhatsAppDietPlanUrl,
  DIET_PLAN_STORAGE_KEY,
  formatDietPlanForInstagram,
  formatDietPlanForSharing,
} from '../utils/dietPlan';
import {
  DIET_PLAN_ACCESS_CODE,
  containsDietPlanAccessCode,
} from '../utils/dietPlanAccess';
import {
  getSupabaseSession,
  isSupabaseConfigured,
  supabase,
} from '../utils/supabaseClient';

type AdminNotice = {
  type: 'success' | 'error';
  message: string;
} | null;

type AdminPanelProps = {
  currentHash: string;
};

const inputClassName =
  'w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-leaf-500 focus:ring-2 focus:ring-leaf-100';

const labelClassName = 'mb-2 block text-sm font-semibold text-slate-700';

const statusLabelMap = Object.fromEntries(
  ADMIN_CLIENT_STATUSES.map((status) => [status.id, status.label]),
) as Record<AdminClientStatus, string>;

const paymentLabelMap = Object.fromEntries(
  ADMIN_PAYMENT_STATUSES.map((status) => [status.id, status.label]),
) as Record<AdminPaymentStatus, string>;

const formatDate = (value: string): string => {
  if (!value) {
    return 'Not set';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
};

const createFreshClient = (): AdminClient => createAdminClient();

const AdminPanel: React.FC<AdminPanelProps> = ({ currentHash }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    !isSupabaseConfigured &&
    window.sessionStorage.getItem(ADMIN_SESSION_STORAGE_KEY) === 'unlocked',
  );
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [accessCode, setAccessCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [planRecords, setPlanRecords] = useState<AdminDietPlanRecord[]>([]);
  const [activeClientId, setActiveClientId] = useState('');
  const [draftClient, setDraftClient] = useState<AdminClient>(() =>
    createFreshClient(),
  );
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AdminClientStatus>(
    'all',
  );
  const [notice, setNotice] = useState<AdminNotice>(null);

  const routeClientId = useMemo(
    () => parseAdminClientRouteId(currentHash),
    [currentHash],
  );
  const isCreateClientRoute = currentHash === ADMIN_NEW_CLIENT_ROUTE_HASH;
  const isEditClientRoute = Boolean(routeClientId) && currentHash.endsWith('/edit');
  const isProfileFormRoute = isCreateClientRoute || isEditClientRoute;
  const isClientDetailRoute = Boolean(routeClientId) && !isEditClientRoute;
  const isDashboardRoute = !isProfileFormRoute && !isClientDetailRoute;

  const activeClient = useMemo(
    () =>
      clients.find((client) => client.id === (routeClientId || activeClientId)) ||
      null,
    [activeClientId, clients, routeClientId],
  );

  const filteredClients = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    return clients.filter((client) => {
      const statusMatches =
        statusFilter === 'all' || client.status === statusFilter;
      const searchMatches =
        !normalizedSearch ||
        [
          client.name,
          client.phone,
          client.instagramHandle,
          client.goal,
          client.healthIssues,
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch);

      return statusMatches && searchMatches;
    });
  }, [clients, searchText, statusFilter]);

  const selectedClientPlans = useMemo(
    () =>
      activeClient
        ? planRecords.filter((record) => record.clientId === activeClient.id)
        : planRecords.slice(0, 5),
    [activeClient, planRecords],
  );

  const stats = useMemo(() => {
    const activeClients = clients.filter(
      (client) => client.status !== 'completed',
    ).length;
    const pendingPlans = clients.filter(
      (client) => client.status === 'planPending',
    ).length;
    const unpaidClients = clients.filter(
      (client) => client.paymentStatus !== 'paid',
    ).length;
    const followUps = clients.filter(
      (client) => client.status === 'followUpDue',
    ).length;

    return [
      { label: 'Total Clients', value: clients.length.toString() },
      { label: 'Active Clients', value: activeClients.toString() },
      { label: 'Plans Pending', value: pendingPlans.toString() },
      { label: 'Payments Due', value: unpaidClients.toString() },
      { label: 'Follow-ups', value: followUps.toString() },
    ];
  }, [clients]);

  const loadAdminData = async () => {
    const [nextClients, nextPlanRecords] = await Promise.all([
      readAdminClientsAsync(),
      readAdminDietPlanRecordsAsync(),
    ]);
    setClients(nextClients);
    setPlanRecords(nextPlanRecords);
  };

  useEffect(() => {
    const storedNotice = window.sessionStorage.getItem(ADMIN_NOTICE_STORAGE_KEY);

    if (!storedNotice) {
      return;
    }

    window.sessionStorage.removeItem(ADMIN_NOTICE_STORAGE_KEY);

    try {
      const parsedNotice = JSON.parse(storedNotice) as {
        type?: unknown;
        message?: unknown;
      };

      if (
        (parsedNotice.type === 'success' || parsedNotice.type === 'error') &&
        typeof parsedNotice.message === 'string'
      ) {
        setNotice({
          type: parsedNotice.type,
          message: parsedNotice.message,
        });
      }
    } catch {
      setNotice(null);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeAdmin = async () => {
      try {
        if (isSupabaseConfigured) {
          const session = await getSupabaseSession();
          if (!isMounted) {
            return;
          }

          setIsAuthenticated(Boolean(session));

          if (session) {
            await loadAdminData();
          }
          return;
        }

        const unlocked =
          window.sessionStorage.getItem(ADMIN_SESSION_STORAGE_KEY) ===
          'unlocked';
        if (!isMounted) {
          return;
        }
        setIsAuthenticated(unlocked);

        if (unlocked) {
          await loadAdminData();
        }
      } catch (error) {
        if (isMounted) {
          setNotice({
            type: 'error',
            message:
              error instanceof Error
                ? error.message
                : 'Could not load admin data.',
          });
        }
      } finally {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      }
    };

    initializeAdmin();

    if (!supabase) {
      return () => {
        isMounted = false;
      };
    }

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session));
      if (session) {
        loadAdminData().catch((error: unknown) => {
          setNotice({
            type: 'error',
            message:
              error instanceof Error
                ? error.message
                : 'Could not load admin data.',
          });
        });
      } else {
        setClients([]);
        setPlanRecords([]);
      }
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!routeClientId) {
      return;
    }

    const routedClient = clients.find((client) => client.id === routeClientId);

    if (routedClient) {
      setActiveClientId(routedClient.id);
      setDraftClient(routedClient);
    }
  }, [clients, routeClientId]);

  useEffect(() => {
    if (!isCreateClientRoute) {
      return;
    }

    setActiveClientId('');
    setDraftClient(createFreshClient());
  }, [isCreateClientRoute]);

  const refreshData = async () => {
    try {
      await loadAdminData();
      setNotice({ type: 'success', message: 'Admin data refreshed.' });
    } catch (error) {
      setNotice({
        type: 'error',
        message:
          error instanceof Error ? error.message : 'Could not refresh data.',
      });
    }
  };

  const updateDraftField = (field: keyof AdminClient, value: string) => {
    setDraftClient((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateDraftStatus = (value: AdminClientStatus) => {
    setDraftClient((current) => ({
      ...current,
      status: value,
    }));
  };

  const updateDraftPaymentStatus = (value: AdminPaymentStatus) => {
    setDraftClient((current) => ({
      ...current,
      paymentStatus: value,
    }));
  };

  const selectClient = (client: AdminClient) => {
    setActiveClientId(client.id);
    setDraftClient(client);
    window.location.hash = buildAdminClientRouteHash(client.id);
  };

  const startNewClient = () => {
    setActiveClientId('');
    setDraftClient(createFreshClient());
    setNotice(null);
    window.location.hash = ADMIN_NEW_CLIENT_ROUTE_HASH;
  };

  const saveClient = async () => {
    if (!draftClient.name.trim()) {
      setNotice({ type: 'error', message: 'Add client name before saving.' });
      return;
    }

    try {
      const clientToSave = await saveAdminClientAsync(draftClient);
      await loadAdminData();
      setActiveClientId(clientToSave.id);
      setDraftClient(clientToSave);
      setNotice({ type: 'success', message: 'Client saved.' });
      window.location.hash = buildAdminClientRouteHash(clientToSave.id);
    } catch (error) {
      setNotice({
        type: 'error',
        message:
          error instanceof Error ? error.message : 'Could not save client.',
      });
    }
  };

  const copyIntakeQuestions = async () => {
    try {
      await navigator.clipboard.writeText(buildClientIntakeMessage(draftClient));
      setNotice({ type: 'success', message: 'Intake questions copied.' });
    } catch {
      setNotice({
        type: 'error',
        message: 'Copy failed. Select and copy the questions manually.',
      });
    }
  };

  const startDietPlan = async (client: AdminClient) => {
    const now = new Date().toISOString();
    const savedClient: AdminClient = {
      ...client,
      status: 'planPending',
      createdAt: client.createdAt || now,
      updatedAt: now,
    };

    try {
      const persistedClient = await saveAdminClientAsync(savedClient);
      const plan = createDietPlanFromAdminClient(persistedClient);
      setActiveClientId(persistedClient.id);
      setDraftClient(persistedClient);
      window.localStorage.setItem(DIET_PLAN_STORAGE_KEY, JSON.stringify(plan));
      window.location.hash = '#/diet-plan';
    } catch (error) {
      setNotice({
        type: 'error',
        message:
          error instanceof Error ? error.message : 'Could not create plan.',
      });
    }
  };

  const openPlanRecord = (record: AdminDietPlanRecord) => {
    window.localStorage.setItem(
      DIET_PLAN_STORAGE_KEY,
      JSON.stringify(record.plan),
    );
    window.location.hash = '#/diet-plan';
  };

  const deletePlanRecord = async (record: AdminDietPlanRecord) => {
    const confirmed = window.confirm(
      `Delete "${record.title}" for ${record.patientName}? This will also remove the stored PDF.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteAdminDietPlanRecordAsync(record);
      await loadAdminData();
      setNotice({ type: 'success', message: 'Diet plan deleted.' });
    } catch (error) {
      setNotice({
        type: 'error',
        message:
          error instanceof Error ? error.message : 'Could not delete diet plan.',
      });
    }
  };

  const deleteClient = async () => {
    if (!activeClient) {
      return;
    }

    const confirmed = window.confirm(
      `Delete ${activeClient.name || 'this client'} and all saved diet plans?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteAdminClientAsync(activeClient.id);
      await loadAdminData();
      setActiveClientId('');
      setDraftClient(createFreshClient());
      window.location.hash = '#/admin';
      setNotice({ type: 'success', message: 'Client and diet plans deleted.' });
    } catch (error) {
      setNotice({
        type: 'error',
        message:
          error instanceof Error ? error.message : 'Could not delete client.',
      });
    }
  };

  const downloadStoredPdf = async (record: AdminDietPlanRecord) => {
    try {
      const signedUrl = await getAdminDietPlanPdfSignedUrl(record);
      window.open(signedUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      setNotice({
        type: 'error',
        message:
          error instanceof Error ? error.message : 'Could not open stored PDF.',
      });
    }
  };

  const copyPlanRecord = async (record: AdminDietPlanRecord) => {
    try {
      await navigator.clipboard.writeText(formatDietPlanForSharing(record.plan));
      setNotice({
        type: 'success',
        message: `"${record.title}" copied for sharing.`,
      });
    } catch {
      setNotice({
        type: 'error',
        message: 'Copy failed. Open the plan and copy manually.',
      });
    }
  };

  const sendPlanRecordToWhatsApp = (record: AdminDietPlanRecord) => {
    if (!record.plan.patient.phone.trim()) {
      setNotice({
        type: 'error',
        message: 'Add a WhatsApp number to this client before sending.',
      });
      return;
    }

    window.open(
      buildWhatsAppDietPlanUrl(record.plan),
      '_blank',
      'noopener,noreferrer',
    );
  };

  const sharePlanRecordOnInstagram = async (record: AdminDietPlanRecord) => {
    try {
      await navigator.clipboard.writeText(formatDietPlanForInstagram(record.plan));
      const instagramHandle = record.plan.patient.instagramHandle.trim();

      if (instagramHandle) {
        window.open(
          buildInstagramProfileUrl(instagramHandle),
          '_blank',
          'noopener,noreferrer',
        );
      }

      setNotice({
        type: 'success',
        message: instagramHandle
          ? 'Instagram message copied and profile opened.'
          : 'Instagram message copied. No handle is saved for this client.',
      });
    } catch {
      setNotice({
        type: 'error',
        message: 'Instagram copy failed. Open the plan and copy manually.',
      });
    }
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSupabaseConfigured) {
      if (!supabase) {
        setNotice({ type: 'error', message: 'Supabase is not configured.' });
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setNotice({ type: 'error', message: error.message });
        return;
      }

      setNotice({ type: 'success', message: 'Admin signed in.' });
      return;
    }

    if (containsDietPlanAccessCode(accessCode)) {
      window.sessionStorage.setItem(ADMIN_SESSION_STORAGE_KEY, 'unlocked');
      setIsAuthenticated(true);
      await loadAdminData();
      setNotice({ type: 'success', message: 'Admin unlocked.' });
      return;
    }

    setNotice({ type: 'error', message: 'Wrong admin code.' });
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    window.sessionStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
    setIsAuthenticated(false);
    setAccessCode('');
    setEmail('');
    setPassword('');
    setNotice(null);
  };

  if (isCheckingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 pt-24 text-slate-900">
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-leaf-600"></div>
          <p className="text-sm font-semibold text-slate-600">
            Checking admin session...
          </p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 pt-28 text-slate-900">
        <section className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-leaf-600 text-white">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-950">
                Admin Panel
              </h1>
              <p className="text-sm text-slate-500">
                {isSupabaseConfigured
                  ? 'Sign in with your Supabase admin account.'
                  : 'Enter the private code to manage clients.'}
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {isSupabaseConfigured ? (
              <>
                <label>
                  <span className={labelClassName}>Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className={inputClassName}
                    placeholder="admin@example.com"
                  />
                </label>
                <label>
                  <span className={labelClassName}>Password</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className={inputClassName}
                    placeholder="Admin password"
                  />
                </label>
              </>
            ) : (
              <label>
                <span className={labelClassName}>Admin Code</span>
                <input
                  type="password"
                  value={accessCode}
                  onChange={(event) => setAccessCode(event.target.value)}
                  className={inputClassName}
                  placeholder={DIET_PLAN_ACCESS_CODE}
                />
              </label>
            )}
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-leaf-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-leaf-700"
            >
              <ShieldCheck size={18} />
              Unlock Admin
            </button>
          </form>

          {notice && (
            <p
              className={`mt-4 rounded-lg border px-4 py-3 text-sm font-medium ${
                notice.type === 'success'
                  ? 'border-leaf-200 bg-leaf-50 text-leaf-800'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {notice.message}
            </p>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pt-24 text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-leaf-600">
                Nutritionist admin
              </p>
              <h1 className="font-serif text-4xl font-bold text-slate-950 md:text-5xl">
                {isCreateClientRoute
                  ? 'Create Client Profile'
                  : isEditClientRoute
                    ? `Edit ${activeClient?.name || 'Client'}`
                    : isClientDetailRoute
                  ? activeClient?.name || 'Client Details'
                  : 'Client Workflow Dashboard'}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600">
                {isProfileFormRoute
                  ? 'Complete the client intake once, then save and continue to the client workspace.'
                  : isClientDetailRoute
                  ? 'Edit intake details, review every saved diet plan, open drafts, download PDFs, and clean up this client record.'
                  : 'Manage clients, intake details, payment status, follow-ups, and saved diet plan history from one private workspace.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {(isClientDetailRoute || isProfileFormRoute) && (
                <button
                  type="button"
                  onClick={() => {
                    window.location.hash = '#/admin';
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-leaf-300 hover:text-leaf-700"
                >
                  <ArrowLeft size={18} />
                  Dashboard
                </button>
              )}
              <button
                type="button"
                onClick={refreshData}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-leaf-300 hover:text-leaf-700"
              >
                <RefreshCcw size={18} />
                Refresh
              </button>
              <button
                type="button"
                onClick={startNewClient}
                disabled={isCreateClientRoute}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-leaf-300 hover:text-leaf-700"
              >
                <Plus size={18} />
                New Client
              </button>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>

          {notice && (
            <div
              className={`mt-6 rounded-lg border px-4 py-3 text-sm font-medium ${
                notice.type === 'success'
                  ? 'border-leaf-200 bg-leaf-50 text-leaf-800'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {notice.message}
            </div>
          )}
        </div>
      </section>

      <section className="container mx-auto px-6 py-8">
        {isClientDetailRoute && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-500">
                {stat.label}
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-950">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
        )}

        <div
          className={
            isProfileFormRoute
              ? 'mx-auto max-w-5xl'
              : isClientDetailRoute
                ? 'grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]'
                : 'space-y-6'
          }
        >
          {isDashboardRoute && (
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <UsersRound size={20} className="text-leaf-700" />
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Clients</h2>
                  <p className="text-sm text-slate-500">
                    Select a client to open their profile, plan history, and diet plan actions.
                  </p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[520px]">
                <div className="relative">
                  <Search
                    size={17}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    className={`${inputClassName} pl-10`}
                    placeholder="Search clients"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as 'all' | AdminClientStatus)
                  }
                  className={inputClassName}
                >
                  <option value="all">All statuses</option>
                  {ADMIN_CLIENT_STATUSES.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredClients.length ? (
                filteredClients.map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => selectClient(client)}
                    className="min-h-44 rounded-lg border border-slate-200 bg-white p-5 text-left transition hover:border-leaf-300 hover:bg-leaf-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-bold text-slate-900">
                          {client.name || 'Unnamed client'}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {client.goal || 'No goal added'}
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                        {statusLabelMap[client.status]}
                      </span>
                    </div>
                    <div className="mt-5 space-y-2 text-sm font-semibold text-slate-500">
                      <p>{client.phone || client.instagramHandle || 'No contact'}</p>
                      <p>
                        {paymentLabelMap[client.paymentStatus]} - Follow-up:{' '}
                        {formatDate(client.followUpDate)}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 md:col-span-2 xl:col-span-3">
                  No clients found.
                </div>
              )}
            </div>
          </section>
          )}

          {isClientDetailRoute && (
          <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <UserRound size={20} className="text-leaf-700" />
                  <h2 className="text-lg font-bold text-slate-900">
                    Client Summary
                  </h2>
                </div>
                {activeClient ? (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Status
                      </p>
                      <p className="mt-2 font-bold text-slate-900">
                        {statusLabelMap[activeClient.status]}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Payment: {paymentLabelMap[activeClient.paymentStatus]}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-lg border border-slate-100 p-3">
                        <p className="font-semibold text-slate-500">Plans</p>
                        <p className="mt-1 text-2xl font-bold text-slate-950">
                          {selectedClientPlans.length}
                        </p>
                      </div>
                      <div className="rounded-lg border border-slate-100 p-3">
                        <p className="font-semibold text-slate-500">
                          Follow-up
                        </p>
                        <p className="mt-1 font-bold text-slate-950">
                          {formatDate(activeClient.followUpDate)}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-slate-600">
                      <p>
                        <span className="font-semibold text-slate-800">
                          Contact:
                        </span>{' '}
                        {activeClient.phone ||
                          activeClient.instagramHandle ||
                          activeClient.email ||
                          'Not added'}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-800">
                          Goal:
                        </span>{' '}
                        {activeClient.goal || 'Not added'}
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <button
                        type="button"
                        onClick={() => startDietPlan(activeClient)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        <Sparkles size={17} />
                        New Diet Plan
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          window.location.hash = buildAdminClientEditRouteHash(
                            activeClient.id,
                          );
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-leaf-300 hover:text-leaf-700"
                      >
                        <Pencil size={17} />
                        Edit Profile
                      </button>
                      <button
                        type="button"
                        onClick={deleteClient}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                      >
                        <Trash2 size={17} />
                        Delete Client
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500">
                    This client was not found. Go back to the dashboard and
                    select an existing client.
                  </div>
                )}
              </div>
          </aside>
          )}

          <div className="space-y-6">
            {isProfileFormRoute && (
            <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-leaf-50 text-leaf-700">
                    <UserRound size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {isCreateClientRoute ? 'New Client Profile' : 'Edit Client Profile'}
                    </h2>
                    <p className="text-sm text-slate-500">
                      Save intake details before creating or updating diet plans.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={copyIntakeQuestions}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-leaf-300 hover:text-leaf-700"
                  >
                    <Copy size={17} />
                    Copy Intake
                  </button>
                  <button
                    type="button"
                    onClick={saveClient}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-leaf-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-leaf-700"
                  >
                    <Save size={17} />
                    Save Client
                  </button>
                  <button
                    type="button"
                    onClick={() => startDietPlan(draftClient)}
                    disabled={!draftClient.name.trim()}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    <Sparkles size={17} />
                    Create Plan
                  </button>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label>
                  <span className={labelClassName}>Name</span>
                  <input
                    value={draftClient.name}
                    onChange={(event) =>
                      updateDraftField('name', event.target.value)
                    }
                    className={inputClassName}
                    placeholder="Client full name"
                  />
                </label>
                <label>
                  <span className={labelClassName}>Phone</span>
                  <input
                    value={draftClient.phone}
                    onChange={(event) =>
                      updateDraftField('phone', event.target.value)
                    }
                    className={inputClassName}
                    placeholder="+91 98765 43210"
                  />
                </label>
                <label>
                  <span className={labelClassName}>Instagram</span>
                  <input
                    value={draftClient.instagramHandle}
                    onChange={(event) =>
                      updateDraftField('instagramHandle', event.target.value)
                    }
                    className={inputClassName}
                    placeholder="@username"
                  />
                </label>
                <label>
                  <span className={labelClassName}>Email</span>
                  <input
                    value={draftClient.email}
                    onChange={(event) =>
                      updateDraftField('email', event.target.value)
                    }
                    className={inputClassName}
                    placeholder="Optional"
                  />
                </label>
                <label>
                  <span className={labelClassName}>Age</span>
                  <input
                    value={draftClient.age}
                    onChange={(event) =>
                      updateDraftField('age', event.target.value)
                    }
                    className={inputClassName}
                    placeholder="29"
                  />
                </label>
                <label>
                  <span className={labelClassName}>Gender</span>
                  <input
                    value={draftClient.gender}
                    onChange={(event) =>
                      updateDraftField('gender', event.target.value)
                    }
                    className={inputClassName}
                    placeholder="Female"
                  />
                </label>
                <label>
                  <span className={labelClassName}>Height</span>
                  <input
                    value={draftClient.height}
                    onChange={(event) =>
                      updateDraftField('height', event.target.value)
                    }
                    className={inputClassName}
                    placeholder="162 cm"
                  />
                </label>
                <label>
                  <span className={labelClassName}>Weight</span>
                  <input
                    value={draftClient.weight}
                    onChange={(event) =>
                      updateDraftField('weight', event.target.value)
                    }
                    className={inputClassName}
                    placeholder="59 kg"
                  />
                </label>
                <label>
                  <span className={labelClassName}>Diet Type</span>
                  <select
                    value={draftClient.dietType}
                    onChange={(event) =>
                      updateDraftField('dietType', event.target.value)
                    }
                    className={inputClassName}
                  >
                    <option value="">Select</option>
                    <option value="Veg">Veg</option>
                    <option value="Eggetarian">Eggetarian</option>
                    <option value="Non-veg">Non-veg</option>
                  </select>
                </label>
                <label>
                  <span className={labelClassName}>Goal</span>
                  <input
                    value={draftClient.goal}
                    onChange={(event) =>
                      updateDraftField('goal', event.target.value)
                    }
                    className={inputClassName}
                    placeholder="Weight loss, PCOS, diabetes"
                  />
                </label>
                <label>
                  <span className={labelClassName}>Workout</span>
                  <select
                    value={draftClient.workoutStatus}
                    onChange={(event) =>
                      updateDraftField('workoutStatus', event.target.value)
                    }
                    className={inputClassName}
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </label>
                <label>
                  <span className={labelClassName}>Workout Type</span>
                  <input
                    value={draftClient.workoutType}
                    onChange={(event) =>
                      updateDraftField('workoutType', event.target.value)
                    }
                    className={inputClassName}
                    placeholder="Walking, gym, yoga"
                  />
                </label>
                <label>
                  <span className={labelClassName}>Client Status</span>
                  <select
                    value={draftClient.status}
                    onChange={(event) =>
                      updateDraftStatus(event.target.value as AdminClientStatus)
                    }
                    className={inputClassName}
                  >
                    {ADMIN_CLIENT_STATUSES.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className={labelClassName}>Payment Status</span>
                  <select
                    value={draftClient.paymentStatus}
                    onChange={(event) =>
                      updateDraftPaymentStatus(
                        event.target.value as AdminPaymentStatus,
                      )
                    }
                    className={inputClassName}
                  >
                    {ADMIN_PAYMENT_STATUSES.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className={labelClassName}>Package</span>
                  <input
                    value={draftClient.packageName}
                    onChange={(event) =>
                      updateDraftField('packageName', event.target.value)
                    }
                    className={inputClassName}
                    placeholder="1 week, 1 month, 3 months"
                  />
                </label>
                <label>
                  <span className={labelClassName}>Amount</span>
                  <input
                    value={draftClient.amount}
                    onChange={(event) =>
                      updateDraftField('amount', event.target.value)
                    }
                    className={inputClassName}
                    placeholder="INR"
                  />
                </label>
                <label>
                  <span className={labelClassName}>Follow-up Date</span>
                  <input
                    type="date"
                    value={draftClient.followUpDate}
                    onChange={(event) =>
                      updateDraftField('followUpDate', event.target.value)
                    }
                    className={inputClassName}
                  />
                </label>
                <label>
                  <span className={labelClassName}>Wake / Sleep Time</span>
                  <input
                    value={draftClient.wakeSleepTime}
                    onChange={(event) =>
                      updateDraftField('wakeSleepTime', event.target.value)
                    }
                    className={inputClassName}
                    placeholder="7 AM wake, 11 PM sleep"
                  />
                </label>
                <label className="md:col-span-2">
                  <span className={labelClassName}>Allergies</span>
                  <textarea
                    rows={2}
                    value={draftClient.allergies}
                    onChange={(event) =>
                      updateDraftField('allergies', event.target.value)
                    }
                    className={inputClassName}
                    placeholder="Food allergies or intolerances"
                  />
                </label>
                <label className="md:col-span-2">
                  <span className={labelClassName}>Health Issues</span>
                  <textarea
                    rows={2}
                    value={draftClient.healthIssues}
                    onChange={(event) =>
                      updateDraftField('healthIssues', event.target.value)
                    }
                    className={inputClassName}
                    placeholder="PCOS, thyroid, diabetes, acidity, etc."
                  />
                </label>
                <label className="md:col-span-2">
                  <span className={labelClassName}>Medicines / Supplements</span>
                  <textarea
                    rows={2}
                    value={draftClient.medicinesSupplements}
                    onChange={(event) =>
                      updateDraftField(
                        'medicinesSupplements',
                        event.target.value,
                      )
                    }
                    className={inputClassName}
                    placeholder="Medicine names, supplement timing"
                  />
                </label>
                <label>
                  <span className={labelClassName}>Cuisine Preference</span>
                  <input
                    value={draftClient.cuisinePreference}
                    onChange={(event) =>
                      updateDraftField('cuisinePreference', event.target.value)
                    }
                    className={inputClassName}
                    placeholder="Indian home-style, South Indian"
                  />
                </label>
                <label>
                  <span className={labelClassName}>Budget Preference</span>
                  <input
                    value={draftClient.budgetPreference}
                    onChange={(event) =>
                      updateDraftField('budgetPreference', event.target.value)
                    }
                    className={inputClassName}
                    placeholder="Low, medium, flexible"
                  />
                </label>
                <label className="md:col-span-2">
                  <span className={labelClassName}>Food Notes</span>
                  <textarea
                    rows={3}
                    value={draftClient.preferences}
                    onChange={(event) =>
                      updateDraftField('preferences', event.target.value)
                    }
                    className={inputClassName}
                    placeholder="Likes, dislikes, restrictions, food habits"
                  />
                </label>
                <label className="md:col-span-2">
                  <span className={labelClassName}>Current Eating Pattern</span>
                  <textarea
                    rows={3}
                    value={draftClient.currentEatingPattern}
                    onChange={(event) =>
                      updateDraftField(
                        'currentEatingPattern',
                        event.target.value,
                      )
                    }
                    className={inputClassName}
                    placeholder="Morning to night current routine"
                  />
                </label>
                <label className="md:col-span-2">
                  <span className={labelClassName}>Internal Notes</span>
                  <textarea
                    rows={3}
                    value={draftClient.notes}
                    onChange={(event) =>
                      updateDraftField('notes', event.target.value)
                    }
                    className={inputClassName}
                    placeholder="Payment notes, follow-up comments, admin reminders"
                  />
                </label>
              </div>
            </section>
            )}

            {isClientDetailRoute && (
            <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <FileText size={20} className="text-leaf-700" />
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Plan History
                    </h2>
                    <p className="text-sm text-slate-500">
                      {activeClient
                        ? 'All saved diet plans for this client are available here.'
                        : 'Recent saved plans from the diet plan editor appear here.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                {selectedClientPlans.length ? (
                  selectedClientPlans.map((record) => (
                    <div
                      key={record.id}
                      className="flex flex-col gap-4 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-bold text-slate-900">
                          {record.title}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {record.patientName} - {record.goal || 'No goal'} -
                          {' '}
                          {formatDate(record.updatedAt)}
                        </p>
                        <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                          {record.status}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2 sm:items-end">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => openPlanRecord(record)}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-leaf-300 hover:text-leaf-700"
                          >
                            <ClipboardList size={17} />
                            Edit Plan
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadStoredPdf(record)}
                            disabled={!record.pdfPath}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-leaf-300 hover:text-leaf-700 disabled:cursor-not-allowed disabled:border-slate-100 disabled:text-slate-300"
                            title={
                              record.pdfPath
                                ? 'Open stored customer PDF'
                                : 'Save Diet Plan from the diet plan editor to store PDF'
                            }
                          >
                            <Download size={17} />
                            PDF
                          </button>
                          <button
                            type="button"
                            onClick={() => deletePlanRecord(record)}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                          >
                            <Trash2 size={17} />
                            Delete
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => copyPlanRecord(record)}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-leaf-300 hover:text-leaf-700"
                          >
                            <Copy size={17} />
                            Copy
                          </button>
                          <button
                            type="button"
                            onClick={() => sendPlanRecordToWhatsApp(record)}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-leaf-200 bg-leaf-50 px-4 py-3 text-sm font-semibold text-leaf-800 transition hover:border-leaf-300"
                          >
                            <Send size={17} />
                            WhatsApp
                          </button>
                          <button
                            type="button"
                            onClick={() => sharePlanRecordOnInstagram(record)}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-pink-200 bg-pink-50 px-4 py-3 text-sm font-semibold text-pink-700 transition hover:border-pink-300"
                          >
                            <Instagram size={17} />
                            Instagram
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                    No saved plans yet.
                  </div>
                )}
              </div>
            </section>
            )}

          </div>
        </div>
      </section>
    </main>
  );
};

export default AdminPanel;

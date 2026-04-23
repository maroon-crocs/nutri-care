import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Check,
  Clipboard,
  Copy,
  Download,
  FileText,
  Instagram,
  Loader2,
  Phone,
  RefreshCcw,
  Send,
  Sparkles,
  UserRound,
} from 'lucide-react';
import type { DietPlan, DietPlanTemplateId, MealSlotKey } from '../types';
import { generateDietPlanWithAI } from '../services/geminiService';
import {
  applyDietPlanTemplate,
  buildWhatsAppDietPlanUrl,
  createEmptyDietPlan,
  DIET_PLAN_STORAGE_KEY,
  DIET_PLAN_TEMPLATES,
  buildInstagramProfileUrl,
  formatDietPlanForInstagram,
  formatDietPlanForSharing,
  MEAL_SLOTS,
  mergeGeneratedDietPlan,
  normalizeDietPlan,
  normalizeInstagramHandle,
  splitTextIntoShareChunks,
} from '../utils/dietPlan';
import { downloadDietPlanPdf } from '../utils/dietPlanPdf';

type NoticeState = {
  type: 'success' | 'error';
  message: string;
} | null;

const inputClassName =
  'w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-leaf-500 focus:ring-2 focus:ring-leaf-100';

const labelClassName = 'mb-2 block text-sm font-semibold text-slate-700';

const DietPlanCreator: React.FC = () => {
  const [plan, setPlan] = useState<DietPlan>(() => createEmptyDietPlan());
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [selectedTemplateId, setSelectedTemplateId] =
    useState<DietPlanTemplateId>('balancedVegetarian');
  const [notice, setNotice] = useState<NoticeState>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isGeneratingDietPlan, setIsGeneratingDietPlan] = useState(false);
  const [aiReviewNotes, setAiReviewNotes] = useState<string[]>([]);
  const [instagramChunkIndex, setInstagramChunkIndex] = useState(0);

  useEffect(() => {
    const savedPlan = window.localStorage.getItem(DIET_PLAN_STORAGE_KEY);

    if (savedPlan) {
      try {
        setPlan(normalizeDietPlan(JSON.parse(savedPlan)));
      } catch {
        window.localStorage.removeItem(DIET_PLAN_STORAGE_KEY);
      }
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    window.localStorage.setItem(
      DIET_PLAN_STORAGE_KEY,
      JSON.stringify({ ...plan, updatedAt: new Date().toISOString() }),
    );
  }, [isLoaded, plan]);

  const shareText = useMemo(() => formatDietPlanForSharing(plan), [plan]);
  const instagramText = useMemo(() => formatDietPlanForInstagram(plan), [plan]);
  const instagramChunks = useMemo(
    () => splitTextIntoShareChunks(instagramText),
    [instagramText],
  );
  const activeDay = plan.days[activeDayIndex] ?? plan.days[0];

  useEffect(() => {
    if (instagramChunkIndex >= instagramChunks.length) {
      setInstagramChunkIndex(Math.max(instagramChunks.length - 1, 0));
    }
  }, [instagramChunkIndex, instagramChunks.length]);

  const updatePlan = (updater: (current: DietPlan) => DietPlan) => {
    setPlan((current) => ({
      ...updater(current),
      updatedAt: new Date().toISOString(),
    }));
  };

  const updatePatientField = (
    field: keyof DietPlan['patient'],
    value: string,
  ) => {
    updatePlan((current) => ({
      ...current,
      patient: {
        ...current.patient,
        [field]: value,
      },
    }));
  };

  const updateTopLevelField = (
    field: 'title' | 'dietitianName' | 'instructions',
    value: string,
  ) => {
    updatePlan((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateMeal = (
    dayIndex: number,
    slotId: MealSlotKey,
    value: string,
  ) => {
    updatePlan((current) => ({
      ...current,
      days: current.days.map((day, index) =>
        index === dayIndex
          ? {
              ...day,
              meals: {
                ...day.meals,
                [slotId]: value,
              },
            }
          : day,
      ),
    }));
  };

  const updateDayNote = (dayIndex: number, value: string) => {
    updatePlan((current) => ({
      ...current,
      days: current.days.map((day, index) =>
        index === dayIndex ? { ...day, note: value } : day,
      ),
    }));
  };

  const handleApplyTemplate = () => {
    updatePlan((current) => applyDietPlanTemplate(current, selectedTemplateId));
    setAiReviewNotes([]);
    setNotice({ type: 'success', message: 'Template applied to the week.' });
  };

  const generatePlanWithAI = async () => {
    if (!plan.patient.age.trim() || !plan.patient.goal.trim()) {
      setNotice({
        type: 'error',
        message: 'Add patient age and goal before generating an AI draft.',
      });
      return;
    }

    setIsGeneratingDietPlan(true);
    setNotice(null);

    try {
      const generatedPlan = await generateDietPlanWithAI(plan);
      updatePlan((current) => mergeGeneratedDietPlan(current, generatedPlan));
      setAiReviewNotes(
        Array.isArray(generatedPlan.reviewNotes)
          ? generatedPlan.reviewNotes.filter(Boolean)
          : [],
      );
      setActiveDayIndex(0);
      setNotice({
        type: 'success',
        message: 'AI draft added. Review and edit before sending.',
      });
    } catch (error) {
      setNotice({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'AI diet plan generation failed. Please try again.',
      });
    } finally {
      setIsGeneratingDietPlan(false);
    }
  };

  const copyPreviousDay = () => {
    if (activeDayIndex === 0) {
      setNotice({ type: 'error', message: 'Monday has no previous day.' });
      return;
    }

    updatePlan((current) => ({
      ...current,
      days: current.days.map((day, index) =>
        index === activeDayIndex
          ? {
              ...day,
              meals: { ...current.days[activeDayIndex - 1].meals },
              note: current.days[activeDayIndex - 1].note,
            }
          : day,
      ),
    }));
    setNotice({ type: 'success', message: 'Previous day copied.' });
  };

  const copyMondayToWeek = () => {
    updatePlan((current) => {
      const monday = current.days[0];

      return {
        ...current,
        days: current.days.map((day, index) =>
          index === 0
            ? day
            : {
                ...day,
                meals: { ...monday.meals },
                note: monday.note,
              },
        ),
      };
    });
    setNotice({ type: 'success', message: 'Monday copied to the week.' });
  };

  const resetDraft = () => {
    const freshPlan = createEmptyDietPlan();
    setPlan(freshPlan);
    setActiveDayIndex(0);
    window.localStorage.removeItem(DIET_PLAN_STORAGE_KEY);
    setNotice({ type: 'success', message: 'Draft cleared.' });
  };

  const copyPlan = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setNotice({ type: 'success', message: 'Diet plan copied.' });
    } catch {
      setNotice({
        type: 'error',
        message: 'Copy failed. Select the preview text and copy it manually.',
      });
    }
  };

  const copyInstagramText = async (text: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setNotice({ type: 'success', message: successMessage });
    } catch {
      setNotice({
        type: 'error',
        message: 'Copy failed. Select the preview text and copy it manually.',
      });
    }
  };

  const copyInstagramChunk = async () => {
    const chunk = instagramChunks[instagramChunkIndex];

    if (!chunk) {
      setNotice({ type: 'error', message: 'No Instagram message to copy.' });
      return;
    }

    await copyInstagramText(
      chunk,
      `Instagram part ${instagramChunkIndex + 1} copied.`,
    );
  };

  const openInstagram = () => {
    const url = buildInstagramProfileUrl(plan.patient.instagramHandle || '');
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const sendToWhatsApp = () => {
    if (!plan.patient.phone.trim()) {
      setNotice({
        type: 'error',
        message: 'Add patient phone number before sending on WhatsApp.',
      });
      return;
    }

    window.open(buildWhatsAppDietPlanUrl(plan), '_blank', 'noopener,noreferrer');
  };

  const handleDownloadPdf = () => {
    try {
      downloadDietPlanPdf(plan);
      setNotice({ type: 'success', message: 'Diet plan PDF downloaded.' });
    } catch (error) {
      setNotice({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'PDF generation failed. Please try again.',
      });
    }
  };

  const patientSummary = [
    plan.patient.name.trim() || 'New patient',
    plan.patient.goal.trim() || 'Weekly nutrition plan',
  ].join(' - ');

  return (
    <main className="min-h-screen bg-slate-50 pt-24 text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-leaf-600">
                Diet plan workspace
              </p>
              <h1 className="font-serif text-4xl font-bold text-slate-950 md:text-5xl">
                Create Weekly Diet Plan
              </h1>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Build a complete seven-day plan with four meals per day, then
                copy, print, or share it through WhatsApp and Instagram.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={copyPlan}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-leaf-300 hover:text-leaf-700"
              >
                <Clipboard size={18} />
                Copy Plan
              </button>
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-leaf-300 hover:text-leaf-700"
              >
                <Download size={18} />
                Download PDF
              </button>
              <button
                type="button"
                onClick={sendToWhatsApp}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-leaf-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-leaf-100 transition hover:bg-leaf-700"
              >
                <Send size={18} />
                Send WhatsApp
              </button>
            </div>
          </div>

          {notice && (
            <div
              className={`mt-6 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium ${
                notice.type === 'success'
                  ? 'border-leaf-200 bg-leaf-50 text-leaf-800'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {notice.type === 'success' ? <Check size={18} /> : <FileText size={18} />}
              {notice.message}
            </div>
          )}
        </div>
      </section>

      <section className="container mx-auto grid gap-6 px-6 py-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-leaf-50 text-leaf-700">
                <UserRound size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Patient Details
                </h2>
                <p className="text-sm text-slate-500">{patientSummary}</p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label>
                <span className={labelClassName}>Plan Title</span>
                <input
                  value={plan.title}
                  onChange={(event) =>
                    updateTopLevelField('title', event.target.value)
                  }
                  className={inputClassName}
                  placeholder="Weekly Diet Plan"
                />
              </label>
              <label>
                <span className={labelClassName}>Dietitian Name</span>
                <input
                  value={plan.dietitianName}
                  onChange={(event) =>
                    updateTopLevelField('dietitianName', event.target.value)
                  }
                  className={inputClassName}
                  placeholder="Dietitian Iram"
                />
              </label>
              <label>
                <span className={labelClassName}>Patient Name</span>
                <input
                  value={plan.patient.name}
                  onChange={(event) =>
                    updatePatientField('name', event.target.value)
                  }
                  className={inputClassName}
                  placeholder="Patient full name"
                />
              </label>
              <label>
                <span className={labelClassName}>WhatsApp Number</span>
                <div className="relative">
                  <Phone
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={plan.patient.phone}
                    onChange={(event) =>
                      updatePatientField('phone', event.target.value)
                    }
                    className={`${inputClassName} pl-11`}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </label>
              <label>
                <span className={labelClassName}>Instagram Handle</span>
                <div className="relative">
                  <Instagram
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={plan.patient.instagramHandle || ''}
                    onChange={(event) =>
                      updatePatientField('instagramHandle', event.target.value)
                    }
                    onBlur={(event) =>
                      updatePatientField(
                        'instagramHandle',
                        normalizeInstagramHandle(event.target.value),
                      )
                    }
                    className={`${inputClassName} pl-11`}
                    placeholder="@client_username"
                  />
                </div>
              </label>
              <label>
                <span className={labelClassName}>Age</span>
                <input
                  value={plan.patient.age}
                  onChange={(event) =>
                    updatePatientField('age', event.target.value)
                  }
                  className={inputClassName}
                  placeholder="32"
                />
              </label>
              <label>
                <span className={labelClassName}>Start Date</span>
                <div className="relative">
                  <CalendarDays
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="date"
                    value={plan.patient.startDate}
                    onChange={(event) =>
                      updatePatientField('startDate', event.target.value)
                    }
                    className={`${inputClassName} pl-11`}
                  />
                </div>
              </label>
              <label className="md:col-span-2">
                <span className={labelClassName}>Goal</span>
                <input
                  value={plan.patient.goal}
                  onChange={(event) =>
                    updatePatientField('goal', event.target.value)
                  }
                  className={inputClassName}
                  placeholder="Weight loss, diabetes support, muscle gain"
                />
              </label>
              <label className="md:col-span-2">
                <span className={labelClassName}>
                  Preferences or Restrictions
                </span>
                <textarea
                  rows={3}
                  value={plan.patient.preferences}
                  onChange={(event) =>
                    updatePatientField('preferences', event.target.value)
                  }
                  className={inputClassName}
                  placeholder="Vegetarian, lactose intolerance, thyroid, food dislikes"
                />
              </label>
            </div>
          </div>

          <div className="rounded-lg border border-pink-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="max-w-2xl">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-600 text-white">
                    <Instagram size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Instagram DM Share
                    </h2>
                    <p className="text-sm text-slate-500">
                      Copy the plan, open Instagram, and paste it into the
                      client chat. Phone number is not required.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-pink-50 px-3 py-1 text-pink-700">
                    Handle:{' '}
                    {plan.patient.instagramHandle
                      ? `@${normalizeInstagramHandle(plan.patient.instagramHandle)}`
                      : 'Optional'}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                    {instagramChunks.length} message part
                    {instagramChunks.length === 1 ? '' : 's'}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                    {instagramText.length.toLocaleString()} characters
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() =>
                    copyInstagramText(
                      instagramText,
                      'Full Instagram message copied.',
                    )
                  }
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-pink-200 px-4 text-sm font-semibold text-pink-700 transition hover:bg-pink-50"
                >
                  <Clipboard size={17} />
                  Copy Full
                </button>
                <button
                  type="button"
                  onClick={copyInstagramChunk}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-pink-200 px-4 text-sm font-semibold text-pink-700 transition hover:bg-pink-50"
                >
                  <Copy size={17} />
                  Copy Part {instagramChunkIndex + 1}
                </button>
                <button
                  type="button"
                  onClick={openInstagram}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-pink-600 px-4 text-sm font-semibold text-white transition hover:bg-pink-700"
                >
                  <Instagram size={17} />
                  Open Instagram
                </button>
              </div>
            </div>

            {instagramChunks.length > 1 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {instagramChunks.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setInstagramChunkIndex(index)}
                    className={`min-h-10 rounded-lg border px-3 text-sm font-semibold transition ${
                      index === instagramChunkIndex
                        ? 'border-pink-500 bg-pink-50 text-pink-700'
                        : 'border-slate-200 text-slate-600 hover:border-pink-200'
                    }`}
                  >
                    Part {index + 1}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-leaf-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="max-w-2xl">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-leaf-600 text-white">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      AI Diet Draft
                    </h2>
                    <p className="text-sm text-slate-500">
                      Uses age, goal, preferences, and restrictions from the
                      patient details.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                    Age: {plan.patient.age.trim() || 'Needed'}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                    Goal: {plan.patient.goal.trim() || 'Needed'}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                    Restrictions:{' '}
                    {plan.patient.preferences.trim() ? 'Added' : 'None added'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={generatePlanWithAI}
                disabled={isGeneratingDietPlan}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-leaf-600 px-5 text-sm font-semibold text-white shadow-lg shadow-leaf-100 transition hover:bg-leaf-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                {isGeneratingDietPlan ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Sparkles size={18} />
                )}
                {isGeneratingDietPlan ? 'Generating...' : 'Generate AI Draft'}
              </button>
            </div>

            {aiReviewNotes.length > 0 && (
              <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="mb-2 text-sm font-bold text-amber-900">
                  Review before sending
                </p>
                <ul className="space-y-2 text-sm text-amber-800">
                  {aiReviewNotes.map((note, index) => (
                    <li key={`${note}-${index}`} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Weekly Meals
                </h2>
                <p className="text-sm text-slate-500">
                  {activeDay.label} has {MEAL_SLOTS.length} meal slots.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <select
                  value={selectedTemplateId}
                  onChange={(event) =>
                    setSelectedTemplateId(event.target.value as DietPlanTemplateId)
                  }
                  className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-100"
                >
                  {DIET_PLAN_TEMPLATES.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleApplyTemplate}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <FileText size={17} />
                  Apply
                </button>
                <button
                  type="button"
                  onClick={copyPreviousDay}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:border-leaf-300 hover:text-leaf-700"
                >
                  <Copy size={17} />
                  Previous
                </button>
                <button
                  type="button"
                  onClick={copyMondayToWeek}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:border-leaf-300 hover:text-leaf-700"
                >
                  <Copy size={17} />
                  Monday to Week
                </button>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
              {plan.days.map((day, index) => (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => setActiveDayIndex(index)}
                  className={`min-h-12 rounded-lg border px-3 text-sm font-semibold transition ${
                    index === activeDayIndex
                      ? 'border-leaf-500 bg-leaf-50 text-leaf-800'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-leaf-200'
                  }`}
                >
                  {day.label.slice(0, 3)}
                </button>
              ))}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {MEAL_SLOTS.map((slot) => (
                <label key={slot.id}>
                  <span className={labelClassName}>
                    {slot.label} <span className="text-slate-400">({slot.time})</span>
                  </span>
                  <textarea
                    rows={4}
                    value={activeDay.meals[slot.id]}
                    onChange={(event) =>
                      updateMeal(activeDayIndex, slot.id, event.target.value)
                    }
                    className={inputClassName}
                    placeholder={`${slot.label} items, portions, and swaps`}
                  />
                </label>
              ))}
              <label className="md:col-span-2">
                <span className={labelClassName}>Day Note</span>
                <textarea
                  rows={3}
                  value={activeDay.note}
                  onChange={(event) =>
                    updateDayNote(activeDayIndex, event.target.value)
                  }
                  className={inputClassName}
                  placeholder="Hydration, walk, supplement timing, or follow-up note"
                />
              </label>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-slate-900">
                Final Instructions
              </h2>
              <button
                type="button"
                onClick={resetDraft}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <RefreshCcw size={16} />
                Clear Draft
              </button>
            </div>
            <textarea
              rows={4}
              value={plan.instructions}
              onChange={(event) =>
                updateTopLevelField('instructions', event.target.value)
              }
              className={inputClassName}
              placeholder="Water intake, oil limits, follow-up reminders, and special notes"
            />
          </div>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Patient Preview
                </h2>
                <p className="text-sm text-slate-500">
                  {shareText.length.toLocaleString()} characters
                </p>
              </div>
              <button
                type="button"
                onClick={copyPlan}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-leaf-300 hover:text-leaf-700"
                aria-label="Copy preview"
                title="Copy preview"
              >
                <Clipboard size={18} />
              </button>
            </div>
            <pre className="max-h-[calc(100vh-220px)] overflow-auto whitespace-pre-wrap rounded-lg bg-slate-950 p-5 font-sans text-sm leading-6 text-slate-100">
              {shareText}
            </pre>
          </div>
        </aside>
      </section>
    </main>
  );
};

export default DietPlanCreator;

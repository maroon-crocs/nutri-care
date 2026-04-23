import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { DietPlan } from '../types';
import { getWorkoutSummary, MEAL_SLOTS } from './dietPlan.ts';

type PdfTableData = {
  body: string[][];
  head: string[][];
};

const PAGE_MARGIN = 10;
const TITLE_Y = 14;
const META_START_Y = 21;
const META_LINE_HEIGHT = 5;

export const buildDietPlanPdfFileName = (plan: DietPlan): string => {
  const patientName = plan.patient.name.trim() || 'patient';
  const safePatientName = patientName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${safePatientName || 'patient'}-diet-plan.pdf`;
};

export const buildDietPlanPdfTableData = (plan: DietPlan): PdfTableData => ({
  head: [['Day', ...MEAL_SLOTS.map((slot) => slot.label)]],
  body: plan.days.map((day) => [
    day.label,
    ...MEAL_SLOTS.map((slot) => day.meals[slot.id].trim()),
  ]),
});

export const buildDietPlanPdfMetaLines = (plan: DietPlan): string[] => {
  const workoutSummary = getWorkoutSummary(plan.patient);

  return [
    [
      `Patient: ${plan.patient.name.trim() || 'Patient'}`,
      plan.patient.age.trim() ? `Age: ${plan.patient.age.trim()}` : '',
      plan.patient.height.trim() ? `Height: ${plan.patient.height.trim()}` : '',
      plan.patient.weight.trim() ? `Weight: ${plan.patient.weight.trim()}` : '',
      plan.patient.dietType.trim()
        ? `Diet Type: ${plan.patient.dietType.trim()}`
        : '',
    ]
      .filter(Boolean)
      .join(' | '),
    [
      plan.patient.goal.trim() ? `Goal: ${plan.patient.goal.trim()}` : '',
      workoutSummary ? `Workout: ${workoutSummary}` : '',
      plan.patient.startDate
        ? `Start Date: ${new Date(plan.patient.startDate).toLocaleDateString('en-IN')}`
        : '',
      `Prepared by: ${plan.dietitianName.trim() || 'Dietitian'}`,
    ]
      .filter(Boolean)
      .join(' | '),
    [
      plan.patient.allergies.trim()
        ? `Allergies: ${plan.patient.allergies.trim()}`
        : '',
      plan.patient.healthIssues.trim()
        ? `Health Issues: ${plan.patient.healthIssues.trim()}`
        : '',
    ]
      .filter(Boolean)
      .join(' | '),
    [
      plan.patient.medicinesSupplements.trim()
        ? `Medicines/Supplements: ${plan.patient.medicinesSupplements.trim()}`
        : '',
      plan.patient.preferences.trim()
        ? `Food Notes: ${plan.patient.preferences.trim()}`
        : '',
    ]
      .filter(Boolean)
      .join(' | '),
  ].filter(Boolean);
};

export const createDietPlanPdf = (plan: DietPlan): jsPDF => {
  const doc = new jsPDF({
    compress: true,
    format: 'a4',
    orientation: 'landscape',
    unit: 'mm',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const { head, body } = buildDietPlanPdfTableData(plan);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text(plan.title.trim() || 'Weekly Diet Plan', pageWidth / 2, TITLE_Y, {
    align: 'center',
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  const metaLines = buildDietPlanPdfMetaLines(plan).flatMap((line) =>
    doc.splitTextToSize(line, pageWidth - PAGE_MARGIN * 2),
  );

  metaLines.forEach((line, index) => {
    doc.text(line, PAGE_MARGIN, META_START_Y + index * META_LINE_HEIGHT);
  });

  const tableStartY = META_START_Y + metaLines.length * META_LINE_HEIGHT + 2;

  autoTable(doc, {
    body,
    head,
    margin: { bottom: 12, left: PAGE_MARGIN, right: PAGE_MARGIN, top: PAGE_MARGIN },
    rowPageBreak: 'auto',
    showHead: 'everyPage',
    startY: tableStartY,
    styles: {
      cellPadding: 1.8,
      font: 'helvetica',
      fontSize: 8.4,
      lineColor: [65, 65, 65],
      lineWidth: 0.18,
      overflow: 'linebreak',
      textColor: [20, 20, 20],
      valign: 'top',
    },
    headStyles: {
      fillColor: [128, 128, 128],
      fontStyle: 'bold',
      halign: 'center',
      minCellHeight: 10,
      textColor: [255, 255, 255],
      valign: 'middle',
    },
    bodyStyles: {
      minCellHeight: 20,
    },
    columnStyles: {
      0: { cellWidth: 25, fontStyle: 'bold', halign: 'center', valign: 'middle' },
      1: { cellWidth: 42 },
      2: { cellWidth: 42 },
      3: { cellWidth: 42 },
      4: { cellWidth: 42 },
      5: { cellWidth: 42 },
      6: { cellWidth: 42 },
    },
    didDrawPage: ({ pageNumber }) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(
        `Page ${pageNumber}`,
        pageWidth - PAGE_MARGIN,
        pageHeight - 5,
        { align: 'right' },
      );
    },
    theme: 'grid',
  });

  return doc;
};

export const downloadDietPlanPdf = (plan: DietPlan): void => {
  const doc = createDietPlanPdf(plan);
  doc.save(buildDietPlanPdfFileName(plan));
};

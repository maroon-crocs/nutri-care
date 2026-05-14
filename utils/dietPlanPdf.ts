import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { DietPlan } from '../types';
import {
  buildSelectedDietPlanGuidelines,
  getWorkoutSummary,
  MEAL_SLOTS,
} from './dietPlan.ts';

type PdfTableData = {
  body: string[][];
  head: string[][];
};

type PdfSummaryItem = {
  label: string;
  value: string;
};

type AutoTableDoc = jsPDF & {
  lastAutoTable?: {
    finalY: number;
  };
};

const PAGE_MARGIN = 10;
const BRAND_GREEN = [22, 163, 74] as const;
const BRAND_GREEN_DARK = [20, 83, 45] as const;
const BRAND_GREEN_SOFT = [240, 253, 244] as const;
const BRAND_GREEN_PALE = [247, 252, 248] as const;
const SLATE_TEXT = [30, 41, 59] as const;
const MUTED_TEXT = [100, 116, 139] as const;
const BORDER_GREEN = [187, 222, 195] as const;
const GENERAL_GUIDELINE_LINE_HEIGHT = 4.5;

const PDF_MEAL_SLOTS = MEAL_SLOTS;

const splitLongLine = (doc: jsPDF, text: string, maxWidth: number): string[] =>
  text.trim() ? doc.splitTextToSize(text.trim(), maxWidth) : [];

const drawNutriGuideLogo = (
  doc: jsPDF,
  x: number,
  y: number,
  size: number,
): void => {
  doc.setFillColor(...BRAND_GREEN);
  doc.roundedRect(x, y, size, size, 4, 4, 'F');

  doc.setFillColor(255, 255, 255);
  doc.ellipse(x + size * 0.45, y + size * 0.58, size * 0.22, size * 0.32, 'F');
  doc.setFillColor(220, 252, 231);
  doc.ellipse(x + size * 0.62, y + size * 0.4, size * 0.17, size * 0.27, 'F');
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.7);
  doc.line(x + size * 0.35, y + size * 0.72, x + size * 0.68, y + size * 0.28);
};

const drawBrandHeader = (
  doc: jsPDF,
  plan: DietPlan,
  pageWidth: number,
): void => {
  const contentWidth = pageWidth - PAGE_MARGIN * 2;
  const headerY = 7;

  doc.setFillColor(...BRAND_GREEN_PALE);
  doc.roundedRect(PAGE_MARGIN, headerY, contentWidth, 25, 4, 4, 'F');
  doc.setDrawColor(...BORDER_GREEN);
  doc.setLineWidth(0.2);
  doc.roundedRect(PAGE_MARGIN, headerY, contentWidth, 25, 4, 4, 'S');

  drawNutriGuideLogo(doc, PAGE_MARGIN + 5, headerY + 5, 15);

  doc.setTextColor(...BRAND_GREEN_DARK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('NutriGuide', PAGE_MARGIN + 24, headerY + 11);

  doc.setTextColor(...MUTED_TEXT);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Personalized Nutrition Expert', PAGE_MARGIN + 24, headerY + 16.5);

  doc.setTextColor(...SLATE_TEXT);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(plan.title.trim() || 'Weekly Diet Plan', pageWidth / 2, headerY + 11.5, {
    align: 'center',
  });

  const subtitle = [
    plan.patient.dietType.trim(),
    plan.patient.goal.trim(),
    plan.patient.startDate
      ? `Starts ${new Date(plan.patient.startDate).toLocaleDateString('en-IN')}`
      : '',
  ]
    .filter(Boolean)
    .join(' | ');

  doc.setTextColor(...MUTED_TEXT);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.4);
  doc.text(subtitle || '7-day meal table', pageWidth / 2, headerY + 17, {
    align: 'center',
  });

  doc.setTextColor(...BRAND_GREEN_DARK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.6);
  doc.text(plan.dietitianName.trim() || 'Dietitian', pageWidth - PAGE_MARGIN - 5, headerY + 11.5, {
    align: 'right',
  });

  doc.setTextColor(...MUTED_TEXT);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.6);
  doc.text('Prepared by', pageWidth - PAGE_MARGIN - 5, headerY + 16.5, {
    align: 'right',
  });
};

export const buildDietPlanPdfFileName = (plan: DietPlan): string => {
  const patientName = plan.patient.name.trim() || 'patient';
  const safePatientName = patientName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${safePatientName || 'patient'}-diet-plan.pdf`;
};

export const buildDietPlanPdfTableData = (plan: DietPlan): PdfTableData => ({
  head: [['Day', ...PDF_MEAL_SLOTS.map((slot) => slot.label)]],
  body: plan.days.map((day) => [
    day.label,
    ...PDF_MEAL_SLOTS.map((slot) => day.meals[slot.id].trim() || 'As discussed'),
  ]),
});

export const buildDietPlanPdfSummaryItems = (
  plan: DietPlan,
): PdfSummaryItem[] => {
  const workoutSummary = getWorkoutSummary(plan.patient);

  return [
    { label: 'Patient', value: plan.patient.name.trim() || 'Patient' },
    { label: 'Age', value: plan.patient.age.trim() },
    { label: 'Height', value: plan.patient.height.trim() },
    { label: 'Weight', value: plan.patient.weight.trim() },
    { label: 'Diet', value: plan.patient.dietType.trim() },
    { label: 'Goal', value: plan.patient.goal.trim() },
    { label: 'Workout', value: workoutSummary },
    { label: 'Health', value: plan.patient.healthIssues.trim() },
    { label: 'Allergies', value: plan.patient.allergies.trim() },
    {
      label: 'Medicines/Supplements',
      value: plan.patient.medicinesSupplements.trim(),
    },
  ].filter((item) => item.value);
};

export const buildDietPlanPdfMetaLines = (plan: DietPlan): string[] => {
  const summaryItems = buildDietPlanPdfSummaryItems(plan);
  const lines = [
    summaryItems
      .slice(0, 5)
      .map((item) => `${item.label}: ${item.value}`)
      .join(' | '),
    summaryItems
      .slice(5)
      .map((item) => `${item.label}: ${item.value}`)
      .join(' | '),
  ].filter(Boolean);

  if (plan.patient.preferences.trim()) {
    lines.push(`Food Notes: ${plan.patient.preferences.trim()}`);
  }

  return lines;
};

export const buildDietPlanPdfGeneralGuidelines = (plan: DietPlan): string[] => {
  return buildSelectedDietPlanGuidelines(plan);
};

const buildDietPlanPdfNoteItems = (plan: DietPlan): string[] =>
  [
    plan.instructions.trim() ? `Instructions: ${plan.instructions.trim()}` : '',
  ].filter(Boolean);

export const buildDietPlanPdfNoteLines = (
  doc: jsPDF,
  plan: DietPlan,
  maxWidth: number,
): string[] => {
  return buildDietPlanPdfNoteItems(plan).flatMap((note) =>
    splitLongLine(doc, note, maxWidth),
  );
};

const buildDietPlanPdfGuidelinePagePoints = (plan: DietPlan): string[] => [
  ...buildDietPlanPdfGeneralGuidelines(plan),
  ...buildDietPlanPdfNoteItems(plan),
];

const fitTextWithEllipsis = (
  doc: jsPDF,
  text: string,
  maxWidth: number,
): string => {
  const ellipsis = '...';
  let fittedText = text.trim();

  while (
    fittedText &&
    doc.getTextWidth(`${fittedText}${ellipsis}`) > maxWidth
  ) {
    fittedText = fittedText.slice(0, -1).trimEnd();
  }

  return `${fittedText}${ellipsis}`;
};

const drawSummaryPanel = (
  doc: jsPDF,
  plan: DietPlan,
  pageWidth: number,
  y: number,
): number => {
  const contentWidth = pageWidth - PAGE_MARGIN * 2;
  const metaLines = buildDietPlanPdfMetaLines(plan).flatMap((line) =>
    splitLongLine(doc, line, contentWidth - 12),
  );
  const panelHeight = Math.max(12, metaLines.length * 4.2 + 8);

  doc.setFillColor(...BRAND_GREEN_SOFT);
  doc.roundedRect(PAGE_MARGIN, y, contentWidth, panelHeight, 3, 3, 'F');
  doc.setDrawColor(...BORDER_GREEN);
  doc.setLineWidth(0.2);
  doc.roundedRect(PAGE_MARGIN, y, contentWidth, panelHeight, 3, 3, 'S');

  doc.setTextColor(...BRAND_GREEN_DARK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.1);
  doc.text('Patient Summary', PAGE_MARGIN + 5, y + 5.3);

  doc.setTextColor(...SLATE_TEXT);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  metaLines.forEach((line, index) => {
    doc.text(line, PAGE_MARGIN + 36, y + 5.3 + index * 4.2);
  });

  return y + panelHeight + 4;
};

const drawGuidelinesPage = (
  doc: jsPDF,
  plan: DietPlan,
  pageWidth: number,
): void => {
  const contentWidth = pageWidth - PAGE_MARGIN * 2;
  const points = buildDietPlanPdfGuidelinePagePoints(plan);
  const pageHeight = doc.internal.pageSize.getHeight();

  if (!points.length) {
    return;
  }

  doc.addPage();
  drawNutriGuideLogo(doc, PAGE_MARGIN, 8, 13);

  doc.setTextColor(...BRAND_GREEN_DARK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('General Guidelines', PAGE_MARGIN + 17, 16);

  let cursorY = 28;
  const pointsPanelHeight = pageHeight - cursorY - 15;
  const pointTextWidth = contentWidth - 18;
  const pointBottomY = cursorY + pointsPanelHeight - 8;

  doc.setFillColor(...BRAND_GREEN_PALE);
  doc.roundedRect(
    PAGE_MARGIN,
    cursorY,
    contentWidth,
    pointsPanelHeight,
    3,
    3,
    'F',
  );
  doc.setDrawColor(...BORDER_GREEN);
  doc.setLineWidth(0.2);
  doc.roundedRect(
    PAGE_MARGIN,
    cursorY,
    contentWidth,
    pointsPanelHeight,
    3,
    3,
    'S',
  );

  doc.setTextColor(...SLATE_TEXT);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  let pointY = cursorY + 8;
  for (const point of points) {
    const wrappedLines = splitLongLine(doc, point, pointTextWidth);
    const requiredHeight =
      wrappedLines.length * GENERAL_GUIDELINE_LINE_HEIGHT + 2.6;

    if (pointY + requiredHeight > pointBottomY) {
      if (pointY + GENERAL_GUIDELINE_LINE_HEIGHT <= pointBottomY) {
        doc.setFillColor(...BRAND_GREEN);
        doc.circle(PAGE_MARGIN + 6, pointY - 1.3, 0.8, 'F');
        doc.text(
          fitTextWithEllipsis(doc, point, pointTextWidth),
          PAGE_MARGIN + 10,
          pointY,
        );
      }
      break;
    }

    doc.setFillColor(...BRAND_GREEN);
    doc.circle(PAGE_MARGIN + 6, pointY - 1.3, 0.8, 'F');
    wrappedLines.forEach((line, index) => {
      doc.text(
        line,
        PAGE_MARGIN + 10,
        pointY + index * GENERAL_GUIDELINE_LINE_HEIGHT,
      );
    });
    pointY += wrappedLines.length * GENERAL_GUIDELINE_LINE_HEIGHT + 2.6;
  }
};

export const createDietPlanPdf = (plan: DietPlan): jsPDF => {
  const doc = new jsPDF({
    compress: true,
    format: 'a4',
    orientation: 'landscape',
    unit: 'mm',
  }) as AutoTableDoc;

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - PAGE_MARGIN * 2;
  const tableData = buildDietPlanPdfTableData(plan);

  drawBrandHeader(doc, plan, pageWidth);
  const tableStartY = drawSummaryPanel(doc, plan, pageWidth, 36);

  autoTable(doc, {
    body: tableData.body,
    head: tableData.head,
    margin: { bottom: 13, left: PAGE_MARGIN, right: PAGE_MARGIN, top: 18 },
    rowPageBreak: 'auto',
    showHead: 'everyPage',
    startY: tableStartY,
    styles: {
      cellPadding: 1,
      font: 'helvetica',
      fontSize: 6.65,
      lineColor: [...BORDER_GREEN],
      lineWidth: 0.18,
      overflow: 'linebreak',
      textColor: [...SLATE_TEXT],
      valign: 'top',
    },
    headStyles: {
      fillColor: [...BRAND_GREEN],
      fontStyle: 'bold',
      halign: 'center',
      minCellHeight: 8.5,
      textColor: [255, 255, 255],
      valign: 'middle',
    },
    bodyStyles: {
      minCellHeight: 14.2,
    },
    alternateRowStyles: {
      fillColor: [...BRAND_GREEN_PALE],
    },
    columnStyles: {
      0: {
        cellWidth: 20,
        fillColor: [...BRAND_GREEN_SOFT],
        fontStyle: 'bold',
        halign: 'center',
        textColor: [...BRAND_GREEN_DARK],
        valign: 'middle',
      },
      1: { cellWidth: 38 },
      2: { cellWidth: 46 },
      3: { cellWidth: 38 },
      4: { cellWidth: 46 },
      5: { cellWidth: 45 },
      6: { cellWidth: contentWidth - 20 - 38 * 2 - 46 * 2 - 45 },
    },
    theme: 'grid',
  });

  drawGuidelinesPage(doc, plan, pageWidth);

  const totalPages = doc.getNumberOfPages();

  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
    doc.setPage(pageNumber);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED_TEXT);
    doc.text(
      `NutriGuide | Page ${pageNumber}`,
      PAGE_MARGIN,
      pageHeight - 6,
    );
    doc.text(
      `Page ${pageNumber} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 6,
      { align: 'center' },
    );
    doc.text(
      'Editable dietitian draft',
      pageWidth - PAGE_MARGIN,
      pageHeight - 6,
      { align: 'right' },
    );
  }

  return doc;
};

export const createDietPlanPdfBlob = (plan: DietPlan): Blob => {
  const doc = createDietPlanPdf(plan);
  return doc.output('blob');
};

export const downloadDietPlanPdf = (plan: DietPlan): void => {
  const doc = createDietPlanPdf(plan);
  doc.save(buildDietPlanPdfFileName(plan));
};

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ABTest, ConversionEvent, FunnelStage } from "./types";

interface ABTestReportData {
  tests: ABTest[];
  generatedDate: string;
}

interface ConversionReportData {
  events: ConversionEvent[];
  funnel: FunnelStage[];
  stats: {
    totalConversions: number;
    conversionRate: string;
    avgTimeToConvert: string;
    totalValue: string;
  };
  generatedDate: string;
}

// Brand colors
const BRAND_PURPLE = [124, 58, 237] as const;
const BRAND_PINK = [236, 72, 153] as const;
const BRAND_BLUE = [59, 130, 246] as const;

export function generateABTestPDF(data: ABTestReportData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header with gradient-like effect
  doc.setFillColor(BRAND_PURPLE[0], BRAND_PURPLE[1], BRAND_PURPLE[2]);
  doc.rect(0, 0, pageWidth, 45, "F");
  
  // Logo/Brand area
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("TruMove", 20, 22);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("AI Marketing Suite", 20, 30);
  
  // Report title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("A/B Test Results Report", 20, 42);
  
  // Date badge
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(pageWidth - 70, 15, 55, 20, 3, 3, "F");
  doc.setTextColor(BRAND_PURPLE[0], BRAND_PURPLE[1], BRAND_PURPLE[2]);
  doc.setFontSize(8);
  doc.text("Generated:", pageWidth - 65, 23);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(data.generatedDate, pageWidth - 65, 31);
  
  let yPos = 60;
  
  // Summary section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Executive Summary", 20, yPos);
  yPos += 10;
  
  const runningTests = data.tests.filter(t => t.status === "running").length;
  const completedTests = data.tests.filter(t => t.status === "completed").length;
  const avgConfidence = data.tests.reduce((acc, t) => acc + t.confidence, 0) / data.tests.length;
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`Total Tests: ${data.tests.length}  |  Running: ${runningTests}  |  Completed: ${completedTests}  |  Avg Confidence: ${avgConfidence.toFixed(0)}%`, 20, yPos);
  yPos += 15;
  
  // Tests details
  data.tests.forEach((test, index) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    // Test header with status badge
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, yPos - 5, pageWidth - 30, 45, 3, 3, "F");
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`${index + 1}. ${test.name}`, 20, yPos + 5);
    
    // Status badge
    const statusColor = test.status === "running" ? BRAND_BLUE : BRAND_PURPLE;
    doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.roundedRect(pageWidth - 50, yPos - 2, 30, 10, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.text(test.status.toUpperCase(), pageWidth - 47, yPos + 5);
    
    // Metrics row
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Started: ${test.startDate}  |  Winner: ${test.winner}  |  Lift: ${test.lift}  |  Confidence: ${test.confidence}%`, 20, yPos + 15);
    
    // Variants table
    yPos += 25;
    
    autoTable(doc, {
      startY: yPos,
      head: [["Variant", "Visitors", "Conversions", "Conv. Rate"]],
      body: test.variants.map(v => [
        v.name === test.winner ? `${v.name} 🏆` : v.name,
        v.visitors.toLocaleString(),
        v.conversions.toString(),
        `${v.rate.toFixed(1)}%`
      ]),
      margin: { left: 20, right: 20 },
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { 
        fillColor: [BRAND_PURPLE[0], BRAND_PURPLE[1], BRAND_PURPLE[2]],
        textColor: [255, 255, 255],
        fontStyle: "bold"
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      theme: "grid"
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount}  |  TruMove AI Marketing Suite  |  Confidential`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }
  
  doc.save(`trumove-abtest-report-${new Date().toISOString().split("T")[0]}.pdf`);
}

export function generateConversionPDF(data: ConversionReportData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header with gradient-like effect
  doc.setFillColor(BRAND_PINK[0], BRAND_PINK[1], BRAND_PINK[2]);
  doc.rect(0, 0, pageWidth, 45, "F");
  
  // Logo/Brand area
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("TruMove", 20, 22);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("AI Marketing Suite", 20, 30);
  
  // Report title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Conversion Analytics Report", 20, 42);
  
  // Date badge
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(pageWidth - 70, 15, 55, 20, 3, 3, "F");
  doc.setTextColor(BRAND_PINK[0], BRAND_PINK[1], BRAND_PINK[2]);
  doc.setFontSize(8);
  doc.text("Generated:", pageWidth - 65, 23);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(data.generatedDate, pageWidth - 65, 31);
  
  let yPos = 60;
  
  // Key Metrics Cards
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Key Metrics", 20, yPos);
  yPos += 10;
  
  const metrics = [
    { label: "Total Conversions", value: data.stats.totalConversions.toLocaleString() },
    { label: "Conversion Rate", value: data.stats.conversionRate },
    { label: "Avg Time to Convert", value: data.stats.avgTimeToConvert },
    { label: "Total Value", value: data.stats.totalValue }
  ];
  
  const cardWidth = (pageWidth - 50) / 4;
  metrics.forEach((metric, i) => {
    const x = 20 + (i * (cardWidth + 5));
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, yPos, cardWidth, 25, 2, 2, "F");
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(BRAND_PURPLE[0], BRAND_PURPLE[1], BRAND_PURPLE[2]);
    doc.text(metric.value, x + 5, yPos + 12);
    
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(metric.label, x + 5, yPos + 20);
  });
  
  yPos += 40;
  
  // Conversion Funnel
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Conversion Funnel", 20, yPos);
  yPos += 10;
  
  autoTable(doc, {
    startY: yPos,
    head: [["Stage", "Count", "Rate", "Drop-off"]],
    body: data.funnel.map((stage, i) => {
      const dropoff = i < data.funnel.length - 1 
        ? `-${((1 - (data.funnel[i + 1].count / stage.count)) * 100).toFixed(0)}%`
        : "-";
      return [stage.stage, stage.count.toLocaleString(), `${stage.rate.toFixed(1)}%`, dropoff];
    }),
    margin: { left: 20, right: 20 },
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { 
      fillColor: [BRAND_PINK[0], BRAND_PINK[1], BRAND_PINK[2]],
      textColor: [255, 255, 255],
      fontStyle: "bold"
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    theme: "grid"
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Conversion Events
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Conversion Events", 20, yPos);
  yPos += 10;
  
  autoTable(doc, {
    startY: yPos,
    head: [["Event", "Count", "Trend", "Avg Value", "Source"]],
    body: data.events.map(e => [e.event, e.count.toString(), e.trend, e.value, e.source]),
    margin: { left: 20, right: 20 },
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { 
      fillColor: [BRAND_PURPLE[0], BRAND_PURPLE[1], BRAND_PURPLE[2]],
      textColor: [255, 255, 255],
      fontStyle: "bold"
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    theme: "grid"
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount}  |  TruMove AI Marketing Suite  |  Confidential`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }
  
  doc.save(`trumove-conversion-report-${new Date().toISOString().split("T")[0]}.pdf`);
}

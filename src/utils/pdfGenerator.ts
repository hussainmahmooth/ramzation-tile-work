import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Triggers native browser print dialog for printing or saving as PDF
 */
export function printDocument(elementId: string): void {
  const element = document.getElementById(elementId);
  if (!element) {
    window.print();
    return;
  }
  window.print();
}

/**
 * Exports a specified DOM element to a professional A4 PDF file using jsPDF & html2canvas
 */
export async function downloadPdfFromElement(
  elementId: string,
  fileName: string = 'bill.pdf'
): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return false;
  }

  try {
    // Render the element to a canvas
    const canvas = await html2canvas(element, {
      scale: 2.5, // High resolution for crisp text & borders
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1024,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth - 20; // 10mm margins on each side
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Center on page with 10mm top margin
    let position = 10;
    
    // If the content fits on one page
    if (imgHeight <= pdfHeight - 20) {
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    } else {
      // Multi-page support if needed
      let heightLeft = imgHeight;
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - 20);

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
    }

    pdf.save(fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    // Fallback to window.print if html2canvas encounters issues
    window.print();
    return false;
  }
}

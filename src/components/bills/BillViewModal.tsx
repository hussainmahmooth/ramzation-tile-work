import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  Share2,
  MapPin,
  Phone,
  Mail,
  FileText,
  Hammer,
} from 'lucide-react';
import type { Bill, Project, Payment, BillType } from '../../types/index.ts';
import { useData } from '../../context/DataContext';
import { formatCurrency, formatDate } from '../../utils/calculations';
import { generateNextBillNumber } from '../../utils/billNumber';
import { downloadPdfFromElement, printDocument } from '../../utils/pdfGenerator';

interface BillViewModalProps {
  isOpen: boolean;
  project: Project;
  billType: BillType;
  selectedPayment?: Payment | null;
  existingBill?: Bill | null;
  onClose: () => void;
}

export const BillViewModal: React.FC<BillViewModalProps> = ({
  isOpen,
  project,
  billType,
  selectedPayment,
  existingBill,
  onClose,
}) => {
  const { settings, bills, saveBill, customers } = useData();
  const [isExporting, setIsExporting] = useState(false);
  const [savedBillNumber] = useState<string>(() => {
    if (existingBill?.bill_number) return existingBill.bill_number;
    return generateNextBillNumber(bills);
  });

  if (!isOpen) return null;

  const customer = project.customer || customers.find((c) => c.id === project.customer_id);
  const workItems = project.work_items || [];
  const payments = project.payments || [];

  const subtotal = project.subtotal || 0;
  const totalDiscount = project.total_discount || 0;
  const finalAmount = project.final_amount || 0;
  const totalPaid = project.total_paid || 0;
  const balanceDue = project.remaining_balance || 0;

  // Title depending on bill type
  let documentTitle = 'BILL / INVOICE';
  let badgeColor = 'bg-slate-100 text-slate-800 border-slate-300';

  switch (billType) {
    case 'progress':
      documentTitle = 'PROGRESS BILL';
      badgeColor = 'bg-blue-50 text-blue-800 border-blue-200';
      break;
    case 'final':
      documentTitle = 'FINAL BILL';
      badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      break;
    case 'payment_receipt':
      documentTitle = 'PAYMENT RECEIPT';
      badgeColor = 'bg-indigo-50 text-indigo-800 border-indigo-200';
      break;
    case 'balance_statement':
      documentTitle = 'BALANCE STATEMENT';
      badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
      break;
  }

  const businessTitle = settings.business_name || 'RAMSAN TILE WORK';

  // Handle saving the generated bill record if new
  const handleSaveAndPrint = async () => {
    if (!existingBill) {
      await saveBill({
        project_id: project.id,
        bill_number: savedBillNumber,
        bill_type: billType,
        bill_date: new Date().toISOString().split('T')[0],
        subtotal,
        discount_amount: totalDiscount,
        final_amount: finalAmount,
        total_paid: totalPaid,
        balance_due: balanceDue,
        notes: `Generated ${documentTitle} for ${project.project_name}`,
        payment_id: selectedPayment?.id,
      });
    }
    printDocument('printable-bill-document');
  };

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    try {
      if (!existingBill) {
        await saveBill({
          project_id: project.id,
          bill_number: savedBillNumber,
          bill_type: billType,
          bill_date: new Date().toISOString().split('T')[0],
          subtotal,
          discount_amount: totalDiscount,
          final_amount: finalAmount,
          total_paid: totalPaid,
          balance_due: balanceDue,
          notes: `Generated ${documentTitle} for ${project.project_name}`,
          payment_id: selectedPayment?.id,
        });
      }
      await downloadPdfFromElement(
        'printable-bill-document',
        `${savedBillNumber}_${project.project_name.replace(/[^a-zA-Z0-9]/g, '_')}`
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleWhatsAppShare = () => {
    if (!customer?.phone) return;
    const cleanPhone = customer.whatsapp ? customer.whatsapp.replace(/[^0-9]/g, '') : customer.phone.replace(/[^0-9]/g, '');
    const message = `*${businessTitle}*\n*${documentTitle}* - ${savedBillNumber}\n\nCustomer: ${customer.name}\nProject: ${project.project_name}\nProject Total: ${formatCurrency(finalAmount)}\nPaid: ${formatCurrency(totalPaid)}\n*Balance Due: ${formatCurrency(balanceDue)}*\n\nThank you for choosing Ramsan Tile Work!`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform animate-in zoom-in-95 duration-200 max-h-[96vh] flex flex-col"
        role="dialog"
      >
        {/* Modal Action Header (Excluded from Print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{documentTitle} Preview</h3>
              <p className="text-xs text-slate-500">Bill Number: <span className="font-mono font-bold text-slate-800">{savedBillNumber}</span></p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {customer?.phone && (
              <button
                onClick={handleWhatsAppShare}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                title="Share on WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5" />
                WhatsApp
              </button>
            )}

            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 text-xs sm:text-sm font-bold rounded-xl border border-slate-300 shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-indigo-600" />
              {isExporting ? 'Exporting...' : 'Download PDF'}
            </button>

            <button
              onClick={handleSaveAndPrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-indigo-600/20 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-200 transition ml-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Container (A4 Layout) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 flex justify-center">
          <div
            id="printable-bill-document"
            className="print-container bg-white w-full max-w-[800px] min-h-[900px] p-8 sm:p-10 rounded-2xl shadow-md border border-slate-200 text-slate-800 text-xs sm:text-sm leading-normal flex flex-col justify-between"
          >
            {/* 1. Header & Business Details */}
            <div>
              <div className="flex flex-row justify-between items-start gap-4 pb-5 border-b-2 border-slate-900">
                {/* Left: Company Branding & Contact */}
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-sm shrink-0">
                      <Hammer className="w-4 h-4" />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase truncate">
                      {businessTitle}
                    </h1>
                  </div>
                  <p className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider mb-2">
                    Expert Tile Fixing & Contractor Work
                  </p>
                  <div className="text-xs text-slate-600 space-y-0.5">
                    <p className="font-semibold text-slate-800">Proprietor: {settings.owner_name}</p>
                    <p>{settings.address}</p>
                    <p>Phone / WhatsApp: <span className="font-semibold text-slate-800">{settings.phone}</span></p>
                    {settings.email && <p>Email: {settings.email}</p>}
                  </div>
                </div>

                {/* Right: Bill Metadata with Crisp Right Alignment */}
                <div className="w-48 sm:w-56 text-right shrink-0">
                  <div className={`inline-block px-3 py-1 rounded-lg border font-black text-xs sm:text-sm tracking-wider uppercase ${badgeColor}`}>
                    {documentTitle}
                  </div>
                  <div className="mt-3 text-xs space-y-1 text-right">
                    <div className="flex justify-between sm:justify-end gap-2 items-center">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">Bill No:</span>
                      <span className="font-mono font-black text-slate-900 text-xs sm:text-sm">{savedBillNumber}</span>
                    </div>
                    <div className="flex justify-between sm:justify-end gap-2 items-center">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">Date:</span>
                      <span className="font-semibold text-slate-800">{formatDate(existingBill?.bill_date || new Date().toISOString())}</span>
                    </div>
                    <div className="flex justify-between sm:justify-end gap-2 items-center">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">Project #:</span>
                      <span className="font-mono font-bold text-slate-800">{project.project_number}</span>
                    </div>
                    <div className="flex justify-between sm:justify-end gap-2 items-center">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">Job Status:</span>
                      <span className="font-bold text-slate-800 uppercase text-[11px]">{project.status}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Customer & Project Info Boxes */}
              <div className="grid grid-cols-2 gap-4 py-5 border-b border-slate-200 text-xs">
                {/* Bill To */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                      Customer / Client:
                    </span>
                    <p className="text-sm font-black text-slate-900">{customer?.name || 'Customer'}</p>
                    <p className="text-slate-700 mt-1 flex items-center gap-1 font-medium">
                      <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                      {customer?.phone}
                    </p>
                  </div>
                  {customer?.address && (
                    <p className="text-slate-600 mt-1 flex items-start gap-1 text-[11px] pt-1 border-t border-slate-200/60">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{customer.address}</span>
                    </p>
                  )}
                </div>

                {/* Project Info */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                      Project / Site:
                    </span>
                    <p className="text-sm font-black text-slate-900">{project.project_name}</p>
                    {project.location && (
                      <p className="text-slate-700 mt-1 flex items-start gap-1 font-medium">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{project.location}</span>
                      </p>
                    )}
                  </div>
                  {project.description && (
                    <p className="text-slate-600 mt-1 text-[11px] pt-1 border-t border-slate-200/60 line-clamp-2">
                      <span className="font-semibold text-slate-700">Scope:</span> {project.description}
                    </p>
                  )}
                </div>
              </div>

              {/* 3. Specific Receipt Banner (if Payment Receipt) */}
              {billType === 'payment_receipt' && selectedPayment && (
                <div className="my-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
                      Payment Received Acknowledgement
                    </span>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Paid via <strong className="font-bold">{selectedPayment.payment_method}</strong> on {formatDate(selectedPayment.payment_date)}
                      {selectedPayment.reference && ` [Ref: ${selectedPayment.reference}]`}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-emerald-800 block uppercase">Amount Received:</span>
                    <span className="font-mono text-xl font-black text-emerald-700">
                      {formatCurrency(selectedPayment.amount)}
                    </span>
                  </div>
                </div>
              )}

              {/* 4. Itemized Work Table with Fixed Aligned Headers & Columns */}
              <div className="my-4 overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 uppercase font-black tracking-wider text-[10px] border-b border-slate-300">
                      <th className="py-2 px-2 text-center w-8">#</th>
                      <th className="py-2 px-3 text-left">Work Description</th>
                      <th className="py-2 px-2 text-center w-20">Type</th>
                      <th className="py-2 px-3 text-right w-36">Measurements</th>
                      <th className="py-2 px-3 text-right w-24">Rate</th>
                      <th className="py-2 px-3 text-right w-24">Subtotal</th>
                      <th className="py-2 px-3 text-right w-24">Discount</th>
                      <th className="py-2 px-3 text-right w-28">Final Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {workItems.map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-2 text-center font-bold text-slate-400">{index + 1}</td>
                        <td className="py-2.5 px-3 text-left">
                          <p className="font-bold text-slate-900">{item.description}</p>
                          {item.notes && <p className="text-[10px] text-slate-500 mt-0.5">{item.notes}</p>}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[9px] font-bold uppercase tracking-tight">
                            {item.pricing_type === 'square_feet' ? 'Sq.Ft' : 'Fixed'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700 tabular-nums">
                          {item.pricing_type === 'square_feet'
                            ? `${item.length} × ${item.width} = ${item.square_feet} sq.ft`
                            : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700 tabular-nums">
                          {item.pricing_type === 'square_feet'
                            ? formatCurrency(item.rate_per_sqft || 0)
                            : 'Fixed'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-800 tabular-nums">
                          {formatCurrency(item.subtotal)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-amber-700 tabular-nums">
                          {item.discount_amount > 0 ? `- ${formatCurrency(item.discount_amount)}` : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900 tabular-nums">
                          {formatCurrency(item.final_amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 5. Payments Schedule / History Breakdown (if any payments) */}
              {payments.length > 0 && (
                <div className="my-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 mb-2">
                    <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                      Payments Received Schedule
                    </span>
                    <span className="font-bold text-slate-500 text-[10px]">{payments.length} Installment(s)</span>
                  </div>
                  <div className="space-y-1">
                    {payments.map((p, idx) => (
                      <div key={p.id} className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-600">
                          {idx + 1}. {formatDate(p.payment_date)} • {p.payment_method} {p.reference ? `[${p.reference}]` : ''}
                        </span>
                        <span className="font-mono font-bold text-emerald-700 tabular-nums">{formatCurrency(p.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. Financial Summary Box Aligned with Right Border */}
              <div className="flex justify-end pt-3">
                <div className="w-72 sm:w-80 space-y-1.5 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="font-medium">Gross Work Subtotal:</span>
                    <span className="font-mono font-bold text-slate-800 tabular-nums">{formatCurrency(subtotal)}</span>
                  </div>

                  <div className="flex justify-between items-center text-amber-800">
                    <span className="font-medium">Total Work Discounts:</span>
                    <span className="font-mono font-bold tabular-nums">- {formatCurrency(totalDiscount)}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs font-black text-slate-900 pt-1.5 border-t border-slate-200">
                    <span>Final Project Amount:</span>
                    <span className="font-mono font-black text-slate-900 tabular-nums">{formatCurrency(finalAmount)}</span>
                  </div>

                  <div className="flex justify-between items-center text-emerald-700 font-bold">
                    <span>Total Amount Paid:</span>
                    <span className="font-mono tabular-nums">{formatCurrency(totalPaid)}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm font-black p-2.5 rounded-lg bg-slate-900 text-white mt-2">
                    <span className="uppercase tracking-wide">BALANCE DUE:</span>
                    <span className="font-mono text-amber-300 text-base tabular-nums">{formatCurrency(balanceDue)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 7. Footer / Terms & Signature */}
            <div className="pt-6 mt-6 border-t border-slate-200 text-xs text-slate-500">
              <div className="flex flex-row justify-between items-end gap-6">
                <div className="space-y-1 max-w-sm">
                  <p className="font-bold text-slate-700">Remarks & Guarantee:</p>
                  <p className="text-[11px] leading-relaxed">{settings.invoice_footer}</p>
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    Official Computer Generated Document • {businessTitle}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="w-40 border-b border-slate-400 mb-1 ml-auto"></div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                    Authorized Signature
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

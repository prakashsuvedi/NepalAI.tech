import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle2, 
  QrCode, 
  Building2, 
  Receipt,
  FileCheck2
} from 'lucide-react';
import { ThemeMode, Language } from '../../types';
import { 
  calculateIrdTax, 
  numberToNepaliWords, 
  numberToEnglishWords, 
  IrdTaxInvoiceData 
} from '../../utils/nepalInvoiceEngine';
import { getCurrentBikramSambatDate } from '../../utils/nepaliTextConverter';
import { CommerceOrder } from './CommercePortal';

export interface TaxInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: CommerceOrder | null;
  businessName?: string;
  businessPan?: string;
  businessAddress?: string;
  businessPhone?: string;
  theme: ThemeMode;
  language: Language;
}

export const TaxInvoiceModal: React.FC<TaxInvoiceModalProps> = ({
  isOpen,
  onClose,
  order,
  businessName = 'Himalayan Tech & Artisan Collective Pvt. Ltd.',
  businessPan = '609812453',
  businessAddress = 'Ward No. 3, Patan Dhoka, Lalitpur, Nepal',
  businessPhone = '+977-1-5541200',
  theme,
  language,
}) => {
  const isDark = theme === 'dark';
  const isNe = language === 'ne';
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !order) return null;

  const bsDate = getCurrentBikramSambatDate();
  const adDate = new Date(order.createdAt).toISOString().split('T')[0];

  const tax = calculateIrdTax(
    order.items.map(i => ({
      title: i.title,
      quantity: i.quantity,
      unitPriceNpr: i.unitPriceNpr,
    })),
    Number(order.deliveryChargeNpr) || 0,
    Number(order.discountNpr) || 0,
    true
  );

  const totalNpr = Number(order.totalNpr) || tax.grandTotalNpr;
  const wordsNe = numberToNepaliWords(totalNpr);
  const wordsEn = numberToEnglishWords(totalNpr);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      {/* Print styles to ensure only the invoice prints on standard A4 paper */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #nepal-tax-invoice, #nepal-tax-invoice * {
            visibility: visible;
          }
          #nepal-tax-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 24px;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`w-full max-w-3xl my-8 rounded-3xl border shadow-2xl overflow-hidden flex flex-col ${
          isDark ? 'border-cyan-950/60 bg-[#0d1527] text-slate-100' : 'border-slate-200 bg-white text-slate-900'
        }`}
      >
        {/* Action Header (No Print) */}
        <div className={`p-4 px-6 border-b flex items-center justify-between no-print ${
          isDark ? 'border-slate-800 bg-[#080d1a]' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Receipt className="h-4 w-4 text-cyan-400" />
            <span>{isNe ? 'आन्तरिक राजस्व विभाग (IRD) कर बिजक' : 'IRD Tax Invoice Preview (Schedule 5)'}</span>
            <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-2xs text-cyan-400 border border-cyan-500/20">
              VAT 13% Validated
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white px-3.5 py-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>{isNe ? 'प्रिन्ट / PDF डाउनलोड' : 'Print / Save PDF'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg cursor-pointer"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Official Printable IRD Tax Invoice Body */}
        <div 
          id="nepal-tax-invoice"
          ref={printAreaRef}
          className="p-6 sm:p-10 bg-white text-slate-900 font-sans text-xs select-text overflow-y-auto"
        >
          {/* Header */}
          <div className="text-center border-b pb-4">
            <h2 className="text-lg font-extrabold uppercase tracking-wide text-slate-900">
              {businessName}
            </h2>
            <p className="text-2xs text-slate-600 mt-0.5">{businessAddress}</p>
            <p className="text-2xs text-slate-600">Tel: {businessPhone} | Web: nepalai.tech</p>
            <div className="inline-block mt-2 px-3 py-1 bg-slate-100 rounded-md border border-slate-300 font-mono font-bold text-xs text-slate-900">
              PAN / VAT No: {businessPan}
            </div>

            <div className="mt-3">
              <span className="text-sm font-black tracking-wider uppercase border-b-2 border-slate-900 pb-0.5">
                TAX INVOICE / कर बिजक
              </span>
              <p className="text-3xs text-slate-500 mt-1">(मूल्य अभिवृद्धि कर ऐन, २०५२ को नियम १७ सँग सम्बन्धित)</p>
            </div>
          </div>

          {/* Invoice & Buyer Metadata Grid */}
          <div className="grid grid-cols-2 gap-6 py-4 border-b text-xs">
            <div>
              <div className="font-bold text-slate-800 mb-1">खरिदकर्ताको विवरण (Buyer Details):</div>
              <div className="text-slate-900 font-semibold">{order.shippingAddress?.fullName}</div>
              <div className="text-slate-600">{order.shippingAddress?.address}, {order.shippingAddress?.city}</div>
              <div className="text-slate-600">Phone: {order.shippingAddress?.phone}</div>
              <div className="text-slate-600">Buyer PAN: {order.customerId ? 'N/A (Consumer)' : 'Consumer (उपभोक्ता)'}</div>
            </div>

            <div className="text-right">
              <div><span className="text-slate-500">Invoice No / बिजक नं:</span> <span className="font-mono font-bold text-slate-900">#{order.orderNumber}</span></div>
              <div><span className="text-slate-500">Date (BS) / मिति:</span> <span className="font-semibold text-slate-900">{bsDate.formattedBs}</span></div>
              <div><span className="text-slate-500">Date (AD):</span> <span className="text-slate-700">{adDate}</span></div>
              <div><span className="text-slate-500">Payment Mode / भुक्तानी:</span> <span className="font-bold text-cyan-800 uppercase">{order.paymentMethod} ({order.paymentStatus})</span></div>
            </div>
          </div>

          {/* Line Items Table */}
          <table className="w-full mt-4 border-collapse text-left text-xs">
            <thead>
              <tr className="border-b-2 border-slate-800 bg-slate-50 text-slate-700 font-bold">
                <th className="py-2 px-2 w-10 text-center">क्र.सं. (S.N.)</th>
                <th className="py-2 px-3">विवरण (Particulars)</th>
                <th className="py-2 px-2 text-center w-16">परिमाण (Qty)</th>
                <th className="py-2 px-3 text-right w-24">दर (Rate रू)</th>
                <th className="py-2 px-3 text-right w-28">रकम (Amount रू)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {tax.itemsCalculated.map(item => (
                <tr key={item.sn} className="text-slate-800">
                  <td className="py-2.5 px-2 text-center text-slate-500 font-mono">{item.sn}</td>
                  <td className="py-2.5 px-3 font-semibold">{item.title}</td>
                  <td className="py-2.5 px-2 text-center font-mono">{item.quantity}</td>
                  <td className="py-2.5 px-3 text-right font-mono">{item.unitPriceNpr.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold">{item.totalNpr.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary Math Breakdown */}
          <div className="mt-4 pt-3 border-t-2 border-slate-800 flex justify-end">
            <div className="w-72 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>कुल रकम (Subtotal):</span>
                <span className="font-mono">रू {tax.subtotalNpr.toLocaleString('en-IN')}</span>
              </div>
              {tax.discountNpr > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>छुट (Discount):</span>
                  <span className="font-mono">- रू {tax.discountNpr.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>करयोग्य रकम (Taxable Amount):</span>
                <span className="font-mono">रू {tax.taxableAmountNpr.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>१३% मूल्य अभिवृद्धि कर (13% VAT):</span>
                <span className="font-mono">रू {tax.vat13PercentNpr.toLocaleString('en-IN')}</span>
              </div>
              {tax.deliveryChargeNpr > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>ढुवानी शुल्क (Delivery Charge):</span>
                  <span className="font-mono">रू {tax.deliveryChargeNpr.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-400">
                <span>जम्मा रकम (Grand Total):</span>
                <span className="font-mono text-cyan-900">रू {totalNpr.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Words Representation */}
          <div className="mt-4 p-3 bg-slate-50 border rounded-lg space-y-1 text-2xs">
            <div>
              <span className="font-bold text-slate-700">अक्षरेपी:</span> <span className="text-slate-900 font-semibold">{wordsNe}</span>
            </div>
            <div>
              <span className="font-bold text-slate-700">In Words:</span> <span className="text-slate-900 font-semibold">{wordsEn}</span>
            </div>
          </div>

          {/* Footer with Nepal QR & Authorization Stamp */}
          <div className="mt-8 pt-6 border-t border-slate-300 grid grid-cols-2 items-end">
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 bg-slate-100 border border-slate-300 rounded-lg p-1.5 flex items-center justify-center">
                <QrCode className="h-12 w-12 text-slate-800" />
              </div>
              <div className="text-3xs text-slate-500 leading-tight">
                <div className="font-bold text-slate-700">Nepal QR / FonePay Compliant</div>
                <div>Scan via eSewa, Khalti, or Mobile Banking</div>
                <div>IRD PAN Validated: {businessPan}</div>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block border-t border-slate-400 pt-1 w-44 text-center">
                <div className="font-bold text-slate-800 text-2xs">अधिकृत हस्ताक्षर (Authorized Signatory)</div>
                <div className="text-3xs text-slate-500">NepalAI Sovereign Billing Engine</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

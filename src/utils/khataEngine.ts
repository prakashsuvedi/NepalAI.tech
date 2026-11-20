import { getCurrentBikramSambatDate } from './nepaliTextConverter';

export type KhataLedgerMode = 'udharo_khata' | 'grocery_bill' | 'roommate_split';

export interface KhataLineItem {
  id: string;
  name: string;
  qty: string;
  rateNpr: number;
  amountNpr: number;
}

export interface KhataLedgerRecord {
  id: string;
  shopOrPartyName: string;
  phone: string;
  billDateBs: string;
  entryType: 'udharo_due' | 'cash_paid' | 'household_expense';
  ledgerMode: KhataLedgerMode;
  items: KhataLineItem[];
  totalNpr: number;
  paidNpr: number;
  dueNpr: number;
  splitCount?: number;
  confidenceNote: string;
  rawSummaryText?: string;
  updatedAt: string;
}

export const KHATA_SAMPLE_NOTES: Array<{
  id: string;
  labelEn: string;
  labelNe: string;
  ledgerMode: KhataLedgerMode;
  rawText: string;
}> = [
  {
    id: 'sample_kirana',
    labelEn: 'Kirana Udharo (Ramesh Dai)',
    labelNe: 'किराना उधारो खाता',
    ledgerMode: 'udharo_khata',
    rawText: `ग्राहक: रमेश थापा (9841556677)
मिति: २०८१/०८/१४
१. जिरा मसिनो चामल २५ केजी - २७५०
२. तोरीको तेल २ लिटर - ६८०
३. मुसुरो दाल ३ केजी - ५४०
४. चिनी २ केजी - २२०
५. चियापत्ती १ प्याकेट - १५०
जम्मा: ४३४०
तिरेको (Paid): १५००`,
  },
  {
    id: 'sample_kitchen',
    labelEn: 'Kitchen & Kalimati Hisab',
    labelNe: 'भान्सा र तरकारी हिसाब',
    ledgerMode: 'grocery_bill',
    rawText: `पसल: बानेश्वर तरकारी तथा डेरी
गोलभेडा २ केजी - १६०
आलु रातो ३ केजी - १८०
प्याज १ केजी - ११०
गाईको दूध २ लिटर - २४०
दही १ केजी - २२०
ताजा साग ३ मुठा - ९०
बुझाएको: १०००`,
  },
  {
    id: 'sample_roommate',
    labelEn: 'Hostel / Roommate Split',
    labelNe: 'कोठा र साथी खर्च बाँडफाँट',
    ledgerMode: 'roommate_split',
    rawText: `विवरण: कोठा खर्च (३ जना)
खानेपानी जार ६ पिस - ३००
खाना पकाउने ग्यास १ सिलिन्डर - १९१०
इन्टरनेट बिल (WorldLink) - १४५०
बिजुली बत्ती महसुल - ७२०
तिरेको: १२००`,
  },
];

const DEVANAGARI_DIGITS: Record<string, string> = {
  '०': '0',
  '१': '1',
  '२': '2',
  '३': '3',
  '४': '4',
  '५': '5',
  '६': '6',
  '७': '7',
  '८': '8',
  '९': '9',
};

export function normalizeNepaliDigits(input: string): string {
  return String(input || '').replace(/[०-९]/g, (ch) => DEVANAGARI_DIGITS[ch] ?? ch);
}

export function reconcileKhataLedger(record: KhataLedgerRecord): KhataLedgerRecord {
  const sanitizedItems = (record.items || [])
    .filter((item) => item.name.trim().length > 0 || item.amountNpr > 0)
    .map((item, idx) => {
      const amt = Math.max(0, Math.round(Number(item.amountNpr) || 0));
      const rate = Math.max(0, Math.round(Number(item.rateNpr) || amt));
      return {
        id: item.id || `item_${idx + 1}`,
        name: item.name.trim() || `Item ${idx + 1}`,
        qty: (item.qty || '1').trim(),
        rateNpr: rate,
        amountNpr: amt,
      };
    });

  const computedTotal =
    sanitizedItems.length > 0
      ? sanitizedItems.reduce((acc, item) => acc + item.amountNpr, 0)
      : Math.max(0, Math.round(Number(record.totalNpr) || 0));

  const paidNpr = Math.max(0, Math.round(Number(record.paidNpr) || 0));
  const dueNpr = Math.max(0, computedTotal - paidNpr);

  return {
    ...record,
    items: sanitizedItems,
    totalNpr: computedTotal,
    paidNpr,
    dueNpr,
    entryType:
      dueNpr > 0
        ? 'udharo_due'
        : record.ledgerMode === 'grocery_bill'
        ? 'household_expense'
        : 'cash_paid',
    updatedAt: new Date().toISOString(),
  };
}

export function parseHandwrittenKhataText(
  rawText: string,
  options?: {
    ledgerMode?: KhataLedgerMode;
    language?: 'en' | 'ne' | string;
  }
): KhataLedgerRecord {
  const normalized = normalizeNepaliDigits(rawText || '').trim();
  const ledgerMode: KhataLedgerMode = options?.ledgerMode || 'udharo_khata';
  const isNe = options?.language === 'ne' || /[\u0900-\u097F]/.test(normalized);

  const phoneMatch = normalized.match(/\b(9[678]\d{8})\b/);
  const phone = phoneMatch ? phoneMatch[1] : '';

  const bsDateMatch = normalized.match(/(20\d{2}[\/\-.]\d{1,2}[\/\-.]\d{1,2})/);
  const billDateBs = bsDateMatch ? bsDateMatch[1] : getCurrentBikramSambatDate().formattedBs;

  let shopOrPartyName = isNe ? 'नयाँ ग्राहक / पसल खाता' : 'Walk-in Customer / Shop';
  const partyLineMatch = normalized.match(
    /(?:ग्राहक|पसल|नाम|विवरण|Customer|Shop|Party|Name)\s*[:\-]\s*([^\n\r]+)/i
  );
  if (partyLineMatch && partyLineMatch[1]) {
    shopOrPartyName = partyLineMatch[1].replace(/\(?\b9[678]\d{8}\b\)?/g, '').trim() || shopOrPartyName;
  }

  let explicitPaid = 0;
  const items: KhataLineItem[] = [];
  const lines = normalized
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  lines.forEach((line, idx) => {
    const cleanLine = line.replace(/^[\d]+\s*[\.\)]\s*/, '').trim();

    // Skip metadata lines
    if (/^(ग्राहक|पसल|नाम|विवरण|मिति|फोन|Customer|Shop|Party|Name|Date|Phone)\s*[:\-]/i.test(cleanLine)) {
      return;
    }

    // Paid / Advance line
    if (/^(तिरेको|बुझाएको|जम्मा बुझाएको|Paid|Advance|Received|Cash)/i.test(cleanLine)) {
      const paidNum = cleanLine.match(/(\d+(?:,\d+)*(?:\.\d+)?)/);
      if (paidNum) {
        explicitPaid += Math.round(parseFloat(paidNum[1].replace(/,/g, '')) || 0);
      }
      return;
    }

    // Total / Due summary lines (we compute accurately from line items unless no items exist)
    if (/^(जम्मा|कुल|बाँकी|Total|Grand Total|Due|Balance|Baki)/i.test(cleanLine)) {
      return;
    }

    // Match trailing amount like "Chamal 25 kg - 2750" or "चिनि २ केजी रु २२०"
    const amountMatch = cleanLine.match(/(?:[-:=]|rs\.?|npr|रु\.?)?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:\/\-|रुपैयाँ)?$/i);
    if (amountMatch) {
      const amountNpr = Math.round(parseFloat(amountMatch[1].replace(/,/g, '')) || 0);
      if (amountNpr <= 0) return;

      const leftPart = cleanLine
        .slice(0, amountMatch.index)
        .replace(/[-:=]+$/, '')
        .replace(/(?:rs\.?|npr|रु\.?)$/i, '')
        .trim();

      const qtyMatch = leftPart.match(/(\d+(?:\.\d+)?\s*(?:केजी|kg|लिटर|ltr|l|पिस|pcs|बट्टा|पाउ|दर्जन|प्याकेट|बोरा|मुठा|जार|सिलिन्डर|unit))/i);
      const qty = qtyMatch ? qtyMatch[1].trim() : '1';
      const itemName = (qtyMatch ? leftPart.replace(qtyMatch[0], '') : leftPart).trim() || `Item ${items.length + 1}`;

      items.push({
        id: `item_${idx + 1}`,
        name: itemName,
        qty,
        rateNpr: amountNpr,
        amountNpr,
      });
    }
  });

  const baseRecord: KhataLedgerRecord = {
    id: `khata_${Date.now()}`,
    shopOrPartyName,
    phone,
    billDateBs,
    entryType: 'udharo_due',
    ledgerMode,
    items,
    totalNpr: items.reduce((sum, i) => sum + i.amountNpr, 0),
    paidNpr: explicitPaid,
    dueNpr: 0,
    splitCount: ledgerMode === 'roommate_split' ? 3 : 1,
    confidenceNote: isNe
      ? 'नेपाली/अंग्रेजी बिल विवरणबाट स्वचालित हिसाब तयार गरियो'
      : 'Parsed & reconciled directly into clean NPR ledger items',
    rawSummaryText: rawText,
    updatedAt: new Date().toISOString(),
  };

  return reconcileKhataLedger(baseRecord);
}

export function buildKhataWhatsAppReminder(params: {
  record: KhataLedgerRecord;
  senderShopName?: string;
  esewaOrFonepayId?: string;
  language?: 'en' | 'ne' | string;
}): { message: string; whatsappUrl: string } {
  const { record, senderShopName, esewaOrFonepayId, language } = params;
  const isNe = language === 'ne';
  const itemSummary = record.items
    .slice(0, 8)
    .map((item) => `• ${item.name} (${item.qty}): रू ${item.amountNpr.toLocaleString('en-IN')}`)
    .join('\n');

  const paymentLine = esewaOrFonepayId?.trim()
    ? isNe
      ? `\nभुक्तानी माध्यम (eSewa/FonePay): ${esewaOrFonepayId.trim()}`
      : `\nPay via eSewa/FonePay: ${esewaOrFonepayId.trim()}`
    : '';

  const message = isNe
    ? `नमस्ते ${record.shopOrPartyName} ज्यू,\n${senderShopName ? `${senderShopName} बाट ` : ''}मिति ${record.billDateBs} को हिसाब विवरण:\n${itemSummary}\n\nकुल रकम: रू ${record.totalNpr.toLocaleString('en-IN')}\nबुझाएको: रू ${record.paidNpr.toLocaleString('en-IN')}\nबाँकी उधारो: रू ${record.dueNpr.toLocaleString('en-IN')}${paymentLine}\n\nकृपया सुविधा अनुसार फरफारक गरिदिनुहोला। धन्यवाद!`
    : `Namaste ${record.shopOrPartyName},\nBill & Khata Summary (${record.billDateBs})${senderShopName ? ` from ${senderShopName}` : ''}:\n${itemSummary}\n\nTotal: NPR ${record.totalNpr.toLocaleString('en-IN')}\nPaid: NPR ${record.paidNpr.toLocaleString('en-IN')}\nBalance Due: NPR ${record.dueNpr.toLocaleString('en-IN')}${paymentLine}\n\nThank you!`;

  const cleanPhone = (record.phone || '').replace(/\D/g, '');
  const formattedWaPhone =
    cleanPhone.length === 10 && cleanPhone.startsWith('9')
      ? `977${cleanPhone}`
      : cleanPhone;

  const whatsappUrl = formattedWaPhone
    ? `https://wa.me/${formattedWaPhone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;

  return { message, whatsappUrl };
}

export function exportKhataCsv(records: KhataLedgerRecord[]): string {
  const header = ['Date (BS)', 'Party / Shop', 'Phone', 'Item', 'Qty', 'Item Amount (NPR)', 'Total Bill (NPR)', 'Paid (NPR)', 'Balance Due (NPR)'];
  const rows: string[][] = [header];

  records.forEach((rec) => {
    if (rec.items.length === 0) {
      rows.push([
        rec.billDateBs,
        rec.shopOrPartyName,
        rec.phone || '-',
        'Summary Entry',
        '1',
        String(rec.totalNpr),
        String(rec.totalNpr),
        String(rec.paidNpr),
        String(rec.dueNpr),
      ]);
    } else {
      rec.items.forEach((item, idx) => {
        rows.push([
          idx === 0 ? rec.billDateBs : '',
          idx === 0 ? rec.shopOrPartyName : '',
          idx === 0 ? rec.phone || '-' : '',
          item.name,
          item.qty,
          String(item.amountNpr),
          idx === 0 ? String(rec.totalNpr) : '',
          idx === 0 ? String(rec.paidNpr) : '',
          idx === 0 ? String(rec.dueNpr) : '',
        ]);
      });
    }
  });

  return rows
    .map((cols) => cols.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

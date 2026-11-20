import assert from 'node:assert';
import crypto from 'node:crypto';
import {
  verifyEsewaPayment,
  verifyKhaltiPayment,
  createEsewaV2FormPayload,
  verifyEsewaV2EncodedResponse,
  initiateKhaltiPayment,
  getGatewayReadinessStatus,
  generateNepalQRInvoicePayload,
  generateWhatsAppOrderAlert
} from '../lib/payments/nepalPayments';

async function runCommerceTests() {
  console.log('--- Starting NepalAI Commerce Multi-Tenant Unit Tests ---');

  // Test 1: eSewa payment verification sandbox logic
  console.log('Test 1: Validating eSewa payment verification...');
  const esewaRes = await verifyEsewaPayment({
    amt: 1250,
    oid: 'ORD-2081-9901',
    refId: 'ESW-TST-102948',
    scd: 'EPAYTEST',
  });
  assert.strictEqual(esewaRes.verified, true, 'eSewa test transaction should be verified');
  assert.strictEqual(esewaRes.gateway, 'esewa');
  assert.strictEqual(esewaRes.amountNpr, 1250);
  console.log('✓ Test 1 Passed: eSewa payment verified successfully.');

  // Test 2: Khalti payment verification logic
  console.log('Test 2: Validating Khalti payment verification...');
  const khaltiRes = await verifyKhaltiPayment({
    pidx: 'KHLTI_SANDBOX_TXN_001',
    amountNpr: 28500,
  });
  assert.strictEqual(khaltiRes.verified, true, 'Khalti sandbox transaction should be verified');
  assert.strictEqual(khaltiRes.gateway, 'khalti');
  assert.strictEqual(khaltiRes.amountNpr, 28500);
  console.log('✓ Test 2 Passed: Khalti payment verified successfully.');

  // Test 3: Nepal EMVCo / FonePay QR Invoice Payload Generation
  console.log('Test 3: Validating Nepal QR / FonePay payload generator...');
  const qrRes = generateNepalQRInvoicePayload({
    orderNumber: 'ORD-2081-1005',
    amountNpr: 3450,
    merchantName: 'Himalayan Organic Coffee',
    panNumber: '609812453',
    city: 'Kathmandu',
  });
  assert.ok(qrRes.qrPayload.startsWith('00020101021226320016np.com.nepalqr'), 'QR payload should match Nepal QR standard prefix');
  assert.ok(qrRes.qrPayload.includes('5303524'), 'Payload must include NPR currency code 524');
  assert.strictEqual(qrRes.amountNpr, 3450);
  console.log('✓ Test 3 Passed: Nepal QR payload conforms to national EMVCo specification.');

  // Test 4: WhatsApp Order Alert Notification Link & Devanagari Copy
  console.log('Test 4: Validating automated WhatsApp Order Notification link...');
  const waRes = generateWhatsAppOrderAlert({
    businessName: 'NepalAI Artisan Roasters',
    customerPhone: '9841234567',
    customerName: 'Prakash Suvedi',
    orderNumber: 'ORD-2081-1001',
    items: [
      { title: 'Single-Origin Nuwakot Coffee (500g)', quantity: 2, priceNpr: 2500 },
      { title: 'Ilam First Flush Tea (250g)', quantity: 1, priceNpr: 950 },
    ],
    totalNpr: 3450,
    deliveryAddress: 'Kathmandu Ward 4, Baluwatar',
    paymentMethod: 'esewa',
    paymentStatus: 'paid',
  });
  assert.strictEqual(waRes.phoneFormatted, '9779841234567', 'Phone should be formatted with 977 Nepal country code');
  assert.ok(waRes.whatsappLink.startsWith('https://wa.me/9779841234567?text='), 'Must produce valid wa.me link');
  assert.ok(waRes.messageText.includes('नयाँ अर्डर विवरण'), 'Message must contain authentic Nepali order greeting');
  assert.ok(waRes.messageText.includes('रू 3,450') || waRes.messageText.includes('3450'), 'Message must include formatted amount in NPR');
  console.log('✓ Test 4 Passed: WhatsApp notification generator built and verified.');

  // Test 5: IRD Tax Invoice Schedule 5 Calculation Engine
  console.log('Test 5: Validating IRD 13% VAT & Subtotal computation...');
  const { calculateIrdTax, numberToNepaliWords, numberToEnglishWords } = await import('../utils/nepalInvoiceEngine');

  const taxBreakdown = calculateIrdTax([
    { title: 'Nuwakot Highland Coffee', quantity: 2, unitPriceNpr: 1250 },
    { title: 'Ilam Organic Tea', quantity: 1, unitPriceNpr: 950 }
  ], 100, 0, true);

  assert.strictEqual(taxBreakdown.subtotalNpr, 3450, 'Subtotal should be 3450');
  assert.strictEqual(taxBreakdown.taxableAmountNpr, 3450, 'Taxable amount should be 3450');
  assert.strictEqual(taxBreakdown.vat13PercentNpr, Math.round(3450 * 0.13), 'VAT should be 13% of taxable');
  assert.strictEqual(taxBreakdown.grandTotalNpr, 3450 + taxBreakdown.vat13PercentNpr + 100, 'Grand total should include VAT and delivery');
  console.log('✓ Test 5 Passed: IRD Schedule 5 VAT arithmetic verified.');

  // Test 6: Devanagari and English Words Representation
  console.log('Test 6: Validating Nepali & English currency words conversion...');
  const neWords = numberToNepaliWords(3450);
  const enWords = numberToEnglishWords(3450);
  assert.ok(neWords.includes('हजार') && neWords.includes('सय'), 'Devanagari words should include thousand and hundred units');
  assert.ok(enWords.includes('Three Thousand') && enWords.includes('Four Hundred'), 'English words should spell out thousand and hundred');
  console.log('✓ Test 6 Passed: Bilingual currency words verified.');

  // Test 7: eSewa ePay v2 HMAC-SHA256 Signature Generation & Tamper-Proof Callback Verification
  console.log('Test 7: Validating eSewa v2 HMAC-SHA256 signing and callback verification...');
  const v2Payload = createEsewaV2FormPayload({
    amt: 1250,
    deliveryCharge: 100,
    totalAmt: 1350,
    transactionUuid: 'ORD-2081-2050',
    productCode: 'EPAYTEST',
    successUrl: 'https://nepalai.tech/#store/himalayan-coffee',
    failureUrl: 'https://nepalai.tech/#store/himalayan-coffee',
  });
  assert.strictEqual(v2Payload.mode, 'sandbox');
  assert.strictEqual(v2Payload.fields.total_amount, '1350');
  assert.ok(v2Payload.fields.signature.length > 20, 'Must produce Base64 HMAC-SHA256 signature');

  const callbackObj: Record<string, string> = {
    transaction_code: '0007ABC',
    status: 'COMPLETE',
    total_amount: '1350',
    transaction_uuid: 'ORD-2081-2050',
    product_code: 'EPAYTEST',
    signed_field_names: 'transaction_code,status,total_amount,transaction_uuid,product_code,signed_field_names',
  };
  const msg = callbackObj.signed_field_names.split(',').map((f) => `${f}=${callbackObj[f]}`).join(',');
  callbackObj.signature = crypto.createHmac('sha256', '8gBm/:&EnhH.1/q').update(msg).digest('base64');
  const encodedValid = Buffer.from(JSON.stringify(callbackObj), 'utf8').toString('base64');

  const verifiedV2 = verifyEsewaV2EncodedResponse(encodedValid);
  assert.strictEqual(verifiedV2.verified, true, 'Valid eSewa v2 HMAC callback must verify');
  assert.strictEqual(verifiedV2.totalAmount, 1350);

  // Tamper test
  const tamperedObj = { ...callbackObj, total_amount: '9999' };
  const encodedTampered = Buffer.from(JSON.stringify(tamperedObj), 'utf8').toString('base64');
  const tamperedV2 = verifyEsewaV2EncodedResponse(encodedTampered);
  assert.strictEqual(tamperedV2.verified, false, 'Tampered eSewa v2 callback must be rejected');
  console.log('✓ Test 7 Passed: eSewa v2 HMAC signing & tamper rejection verified.');

  // Test 8: Khalti v2 Initiation & Gateway Readiness Check
  console.log('Test 8: Validating Khalti v2 session initiation & gateway readiness...');
  const khaltiInit = await initiateKhaltiPayment({
    amountNpr: 1350,
    purchaseOrderId: 'ORD-2081-2050',
    purchaseOrderName: 'Order #ORD-2081-2050',
    returnUrl: 'https://nepalai.tech/#store/himalayan-coffee',
    websiteUrl: 'https://nepalai.tech',
  });
  assert.strictEqual(khaltiInit.success, true);
  assert.strictEqual(khaltiInit.amountPaisa, 135000);
  assert.ok(khaltiInit.pidx.startsWith('KHLTI_SANDBOX_'));

  const readiness = getGatewayReadinessStatus();
  assert.strictEqual(readiness.esewa.v2SignatureEnabled, true);
  assert.strictEqual(readiness.khalti.v2LookupEnabled, true);
  console.log('✓ Test 8 Passed: Khalti v2 initiation and gateway readiness verified.');

  console.log('--- All 8 Commerce & Payment Gateway Tests Passed Successfully! ---');
}

runCommerceTests().catch((err) => {
  console.error('Commerce test failed:', err);
  process.exit(1);
});

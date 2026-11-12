import assert from 'node:assert';
import { 
  generateFileKey, 
  getPublicMediaUrl, 
  generatePresignedUploadUrl, 
  ALLOWED_MIME_TYPES,
  isR2Configured,
  uploadBufferToR2 
} from '../lib/r2Storage';

console.log('--- Running Phase 2 Cloudflare R2 Media Storage Tests ---');

// Test 1: Storage Key Generation & Multi-Tenant Directory Isolation
console.log('[Test 1] Validating Object Storage Key Generation & Tenancy Isolation...');
const key1 = generateFileKey('Product Photo.JPG', 'products', 'biz_himalayan_01');
assert.ok(key1.startsWith('tenants/biz_himalayan_01/products/'), 'Key must isolate under tenant folder');
assert.ok(key1.endsWith('.jpg'), 'Key extension must normalize to lowercase');

const key2 = generateFileKey('Invoice #104.pdf', 'invoices', 'biz_everest_02');
assert.ok(key2.startsWith('tenants/biz_everest_02/invoices/'), 'Invoice key must isolate under everest tenant');
assert.ok(!key2.includes('#'), 'Key must sanitize special characters');
console.log('  ✓ Multi-tenant file keys correctly generated and isolated.');

// Test 2: Public Media CDN URL Resolver
console.log('[Test 2] Validating Public CDN Media URL Resolution...');
const publicUrl = getPublicMediaUrl(key1);
assert.ok(publicUrl.includes(key1), 'Public URL must include the generated key');
assert.ok(publicUrl.startsWith('http'), 'Public URL must start with valid http/https schema');
console.log(`  ✓ Resolved CDN Media URL: ${publicUrl}`);

// Test 3: Whitelisted MIME Types & Security Boundary
console.log('[Test 3] Auditing Content-Type Whitelist...');
assert.ok(ALLOWED_MIME_TYPES.includes('image/jpeg'), 'JPEG must be allowed');
assert.ok(ALLOWED_MIME_TYPES.includes('image/png'), 'PNG must be allowed');
assert.ok(ALLOWED_MIME_TYPES.includes('image/webp'), 'WebP must be allowed');
assert.ok(ALLOWED_MIME_TYPES.includes('application/pdf'), 'PDF must be allowed');
assert.ok(!ALLOWED_MIME_TYPES.includes('application/x-executable'), 'Executables must be forbidden');
console.log('  ✓ MIME whitelist security boundaries verified.');

// Test 4: Presigned URL Generation & Rejection of Bad MIME Types
console.log('[Test 4] Testing Presigned Upload URL Generator & Rejections...');
(async () => {
  // Valid image request
  const presigned = await generatePresignedUploadUrl({
    filename: 'thangka-painting.webp',
    contentType: 'image/webp',
    folder: 'catalog',
    tenantId: 'biz_patan_03',
  });
  assert.ok(presigned.uploadUrl, 'Upload URL must be returned');
  assert.ok(presigned.fileKey.includes('biz_patan_03/catalog'), 'File key must match requested folder');
  assert.strictEqual(typeof presigned.isSimulated, 'boolean', 'isSimulated flag must be boolean');

  // Bad content type rejection test
  let caughtError = false;
  try {
    await generatePresignedUploadUrl({
      filename: 'malicious.exe',
      contentType: 'application/x-msdownload',
    });
  } catch (err: any) {
    caughtError = true;
    assert.ok(err.message.includes('Unsupported content type'), 'Must reject unsupported mime types');
  }
  assert.strictEqual(caughtError, true, 'Unwhitelisted content type must be rejected');
  console.log('  ✓ Presigned URL generation and bad filetype rejection verified.');

  // Test 5: Direct Buffer Upload Fallback
  console.log('[Test 5] Testing Direct Buffer Upload Pipeline...');
  const testBuffer = Buffer.from('TEST_IMAGE_BUFFER_DATA');
  const bufferUpload = await uploadBufferToR2({
    buffer: testBuffer,
    key: 'tenants/public/test/sample.txt',
    contentType: 'image/png',
  });
  assert.strictEqual(bufferUpload.success, true, 'Buffer upload must report success');
  assert.ok(bufferUpload.publicUrl, 'Buffer upload must yield publicUrl');
  console.log('  ✓ Direct buffer upload pipeline operational.');

  console.log('-------------------------------------------------------');
  console.log('✅ ALL PHASE 2 CLOUDFLARE R2 STORAGE TESTS PASSED (5/5)');
  console.log('-------------------------------------------------------');
})();

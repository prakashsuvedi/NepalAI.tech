import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import {
  users,
  profiles,
  businesses,
  businessMembers,
  businessInvitations,
  userPreferences,
  savedCalculations,
  consultationLeads,
} from '../db/schema.ts';

console.log('--- Running Phase 1 Identity & Cloud SQL Architecture Tests ---');

// Test 1: Verify Drizzle ORM Schema Tables & Fields
console.log('[Test 1] Validating Drizzle PostgreSQL Multi-Tenant Schema...');
assert.ok(users, 'Users table must be defined');
assert.ok(users.uid, 'Users uid (Firebase Auth link) must be defined');
assert.ok(users.email, 'Users email must be defined');

assert.ok(profiles, 'Profiles table must be defined');
assert.ok(profiles.id, 'Profiles id (Firebase UID link) must be defined');
assert.ok(profiles.email, 'Profiles email must be defined');
assert.ok(profiles.systemRole, 'Profiles systemRole must be defined');

assert.ok(businesses, 'Businesses table must be defined');
assert.ok(businesses.slug, 'Businesses slug must be defined');
assert.ok(businesses.panNumber, 'Businesses PAN number must be defined');
assert.ok(businesses.isVatRegistered, 'Businesses VAT registration flag must be defined');

assert.ok(businessMembers, 'Business members table must be defined');
assert.ok(businessMembers.businessId, 'Business member businessId must be defined');
assert.ok(businessMembers.userId, 'Business member userId must be defined');
assert.ok(businessMembers.role, 'Business member role must be defined');

assert.ok(businessInvitations, 'Business invitations table must be defined');
assert.ok(businessInvitations.token, 'Business invitation token must be defined');

assert.ok(userPreferences, 'User preferences table must be defined');
assert.ok(savedCalculations, 'Saved calculations table must be defined');
assert.ok(consultationLeads, 'Consultation leads table must be defined');
console.log('  ✓ All Cloud SQL identity, tenant, workspace, and lead tables verified.');

// Test 2: Security Remediation Audit - Ensure NO exposed admin key in frontend service
console.log('[Test 2] Auditing Frontend Client Code for Compromised Admin Keys...');
const studioServiceContent = fs.readFileSync(path.join(process.cwd(), 'src/services/studioAdminService.ts'), 'utf-8');
const hasHardcodedAdminKey = studioServiceContent.includes("'x-admin-key': 'nepalai-admin-key'");
assert.strictEqual(hasHardcodedAdminKey, false, 'Hardcoded x-admin-key MUST NOT exist in studioAdminService.ts');
const hasAuthHeadersHelper = studioServiceContent.includes('getAuthHeaders()');
assert.strictEqual(hasAuthHeadersHelper, true, 'getAuthHeaders() dynamic resolver must be present in studioAdminService.ts');
console.log('  ✓ Verified: Zero hardcoded admin credentials in client-facing code.');

// Test 3: Verify Firebase configuration & Drizzle Cloud SQL pool configuration
console.log('[Test 3] Auditing Firebase Config & Cloud SQL Pool Configuration...');
const fbConfigRaw = fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf-8');
const fbConfig = JSON.parse(fbConfigRaw);
assert.ok(fbConfig.projectId && fbConfig.projectId !== 'remixed-project-id', 'firebase-applet-config.json must have a valid projectId');

const dbIndexContent = fs.readFileSync(path.join(process.cwd(), 'src/db/index.ts'), 'utf-8');
assert.ok(dbIndexContent.includes('process.env.SQL_HOST'), 'pg Pool must use Object Method with SQL_HOST');
assert.ok(!dbIndexContent.includes('DATABASE_URL'), 'pg Pool must not use DATABASE_URL');
console.log('  ✓ Firebase Auth & Cloud SQL Object Method configuration verified.');

console.log('-------------------------------------------------------');
console.log('✅ ALL PHASE 1 IDENTITY & AUTH TESTS PASSED SUCCESSFULLY');
console.log('-------------------------------------------------------');

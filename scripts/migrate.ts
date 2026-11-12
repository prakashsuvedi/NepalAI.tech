/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * NepalAI Multi-Tenant Supabase & PostgreSQL Migration Executor
 * Applies identity tables, commerce tables, and Row Level Security (RLS) policies.
 */

import fs from 'fs';
import path from 'path';
import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

async function runMigration() {
  console.log('========================================================================');
  console.log('🇳🇵 NEPALAI COMMERCE & SUPABASE MIGRATION RUNNER');
  console.log('========================================================================');

  const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;

  const migrationFilePath = path.join(process.cwd(), 'src', 'db', 'migrations', '0001_rls_policies.sql');
  if (!fs.existsSync(migrationFilePath)) {
    console.error(`❌ Migration file not found at: ${migrationFilePath}`);
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(migrationFilePath, 'utf-8');

  if (!dbUrl) {
    console.log('\n[NOTICE] No DATABASE_URL or SUPABASE_DATABASE_URL detected in current environment.');
    console.log('To apply these migrations to your live Supabase database:\n');
    console.log('Option A (Supabase Web UI - Instant):');
    console.log('  1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/_/sql');
    console.log('  2. Click "New Query" and paste the contents of src/db/migrations/0001_rls_policies.sql');
    console.log('  3. Click "Run" to activate all tables, RBAC, and RLS policies.\n');
    console.log('Option B (CLI with Connection String):');
    console.log('  DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" npx tsx scripts/migrate.ts\n');
    console.log('========================================================================');
    return;
  }

  console.log(`Connecting to PostgreSQL database: ${dbUrl.replace(/:([^:@]+)@/, ':****@')}`);
  const sql = postgres(dbUrl, {
    ssl: 'require',
    max: 1,
  });

  try {
    console.log('Executing multi-tenant schema and RLS policies...');
    await sql.unsafe(sqlContent);
    console.log('✅ Migrations applied successfully! Tables and RLS policies are active.');
  } catch (err: any) {
    console.error('❌ Migration execution error:', err.message);
  } finally {
    await sql.end();
  }
}

runMigration().catch((err) => {
  console.error('Fatal migration script error:', err);
  process.exit(1);
});

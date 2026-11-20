import { desc, eq } from 'drizzle-orm';
import { db } from './index.ts';
import { consultationLeads } from './schema.ts';

let leadsSeedPromise: Promise<void> | null = null;

async function ensureInitialLeadsSeeded() {
  if (!leadsSeedPromise) {
    leadsSeedPromise = (async () => {
      const existing = await db.select({ id: consultationLeads.id }).from(consultationLeads).limit(1);
      if (existing.length > 0) return;

      await db
        .insert(consultationLeads)
        .values([
          {
            id: 'lead_seed_101',
            fullName: 'Suman Adhikari',
            email: 'suman.adhikari@himalayanbank.com.np',
            phone: '+977 9851023456',
            organization: 'Himalayan Commercial Bank Ltd.',
            industry: 'Banking & Financial Institutions (BFIs)',
            serviceCategory: 'NRB Compliant AI Audit & Air-Gapped Deploy',
            budgetRange: 'रू ५,००,०००+ ($3,800+ USD)',
            timeline: '2-Week Rapid MVP Sprint (Urgent)',
            billingPreference: 'Local NPR Invoicing (FonePay Bank Direct)',
            message:
              'We need an on-premise Devanagari OCR pipeline to process 15,000 daily loan citizenship and Lalpurja documents with zero cloud data export in compliance with NRB cyber guidelines.',
            submittedAt: new Date(Date.now() - 3600000 * 4),
            status: 'new',
            adminNotes:
              'High-priority enterprise lead. Technical scoping required for Kathmandu data center deployment.',
            source: 'consultation_modal',
            notificationDispatched: true,
          },
          {
            id: 'lead_seed_102',
            fullName: 'Pooja Shrestha',
            email: 'pooja@everesttravels.com.np',
            phone: '+977 9841987654',
            organization: 'Everest Trekking & Expeditions',
            industry: 'Hospitality & Tourism Logistics',
            serviceCategory: 'Nepali / Newari Dialect Neural Voice & Conversational Chat',
            budgetRange: 'रू १,५०,००० – ५,००,००० ($1,150 – $3,800 USD)',
            timeline: '1-Month Comprehensive Implementation',
            billingPreference: 'eSewa / Khalti Digital Wallet',
            message:
              'Looking for an automated 24/7 WhatsApp AI concierge in Nepali, English, and French that accepts itinerary inquiries and generates customized trek packing plans.',
            submittedAt: new Date(Date.now() - 3600000 * 22),
            status: 'reviewing',
            adminNotes: 'Followed up via WhatsApp. Scheduling Zoom architecture demo with engineering team.',
            source: 'contact_section',
            notificationDispatched: true,
          },
        ])
        .onConflictDoNothing({ target: consultationLeads.id });
    })().catch((err) => {
      leadsSeedPromise = null;
      throw err;
    });
  }
  await leadsSeedPromise;
}

export async function listLeads() {
  try {
    await ensureInitialLeadsSeeded();
    const rows = await db
      .select()
      .from(consultationLeads)
      .orderBy(desc(consultationLeads.submittedAt));

    return rows.map((row) => ({
      ...row,
      submittedAt: row.submittedAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error('Database listLeads failed:', error);
    throw new Error('Failed to load consultation inquiries.', { cause: error });
  }
}

export async function createLead(input: {
  userUid?: string | null;
  fullName: string;
  email: string;
  phone?: string;
  organization?: string;
  industry?: string;
  serviceCategory?: string;
  budgetRange?: string;
  timeline?: string;
  billingPreference?: string;
  message: string;
  source?: string;
}) {
  try {
    await ensureInitialLeadsSeeded();
    const id = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const [created] = await db
      .insert(consultationLeads)
      .values({
        id,
        userUid: input.userUid || null,
        fullName: input.fullName.trim(),
        email: input.email.trim(),
        phone: (input.phone || '').trim() || 'N/A',
        organization: (input.organization || '').trim() || 'N/A',
        industry: (input.industry || '').trim() || 'General',
        serviceCategory: (input.serviceCategory || '').trim() || 'General AI Advisory',
        budgetRange: (input.budgetRange || '').trim() || 'Standard',
        timeline: (input.timeline || '').trim() || '2-Week Rapid Sprint',
        billingPreference: (input.billingPreference || '').trim() || 'NPR (eSewa / Khalti / FonePay)',
        message: input.message.trim(),
        status: 'new',
        adminNotes: '',
        source: input.source || 'web_portal',
        notificationDispatched: true,
        submittedAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return {
      ...created,
      submittedAt: created.submittedAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error('Database createLead failed:', error);
    throw new Error('Failed to record inquiry.', { cause: error });
  }
}

export async function updateLead(id: string, status?: string, adminNotes?: string) {
  try {
    const [existing] = await db
      .select()
      .from(consultationLeads)
      .where(eq(consultationLeads.id, id))
      .limit(1);

    if (!existing) return null;

    const [updated] = await db
      .update(consultationLeads)
      .set({
        status: status || existing.status,
        adminNotes: adminNotes !== undefined ? adminNotes : existing.adminNotes,
        updatedAt: new Date(),
      })
      .where(eq(consultationLeads.id, id))
      .returning();

    return {
      ...updated,
      submittedAt: updated.submittedAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error('Database updateLead failed:', error);
    throw new Error('Failed to update inquiry status.', { cause: error });
  }
}

export async function deleteLeadById(id: string) {
  try {
    const deleted = await db
      .delete(consultationLeads)
      .where(eq(consultationLeads.id, id))
      .returning({ id: consultationLeads.id });

    return deleted.length > 0;
  } catch (error) {
    console.error('Database deleteLead failed:', error);
    throw new Error('Failed to remove inquiry.', { cause: error });
  }
}

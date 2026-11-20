import { eq, or } from 'drizzle-orm';
import { db } from './index.ts';
import { users, profiles, businesses, businessMembers } from './schema.ts';

const SUPER_ADMIN_EMAILS = new Set(
  [
    'prakashsuvedi@gmail.com',
    'prakash@scamspike.com',
    'prakashsuvedi.backup@gmail.com',
    process.env.ADMIN_NOTIFICATION_EMAIL || '',
  ]
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
);

export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.has(email.trim().toLowerCase());
}

export async function ensureFlagshipBusinessExists() {
  try {
    await db
      .insert(businesses)
      .values({
        id: 'biz_default',
        name: 'Himalayan Sovereign Organic Store',
        slug: 'himalayan-coffee',
        description:
          'Direct mountain farm products, handloom crafts, and Devanagari sovereign devices with instant eSewa & Khalti settlement.',
        panNumber: '609812453',
        isVatRegistered: true,
        currency: 'NPR',
        phone: '+977 9841234567',
        email: 'store@nepalai.tech',
        address: 'Ward No. 3, Patan Dhoka, Lalitpur, Nepal',
        municipality: 'Lalitpur Metropolitan',
        wardNo: '03',
        district: 'Lalitpur',
        bannerUrl: '/api/storage/mock-media?key=banners/store-banner.jpg',
        logoUrl: '/api/storage/mock-media?key=logos/store-logo.jpg',
        status: 'active',
        tier: 'enterprise',
      })
      .onConflictDoNothing({ target: businesses.id });
  } catch (error) {
    console.error('Failed to ensure flagship business:', error);
    throw new Error('Database error ensuring store exists.', { cause: error });
  }
}

export async function getOrCreateUser(
  uid: string,
  email: string,
  fullName?: string,
  avatarUrl?: string
) {
  try {
    const cleanEmail = (email || `${uid}@users.nepalai.tech`).trim();
    const role = isSuperAdminEmail(cleanEmail) ? 'super_admin' : 'user';
    const displayName = (fullName || cleanEmail.split('@')[0] || 'NepalAI Member').trim();

    const [userRecord] = await db
      .insert(users)
      .values({
        uid,
        email: cleanEmail,
        fullName: displayName,
        avatarUrl: avatarUrl || '',
        systemRole: role,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: cleanEmail,
          fullName: displayName,
          avatarUrl: avatarUrl || '',
          updatedAt: new Date(),
        },
      })
      .returning();

    const [profileRecord] = await db
      .insert(profiles)
      .values({
        id: uid,
        email: cleanEmail,
        fullName: displayName,
        avatarUrl: avatarUrl || '',
        systemRole: role,
      })
      .onConflictDoUpdate({
        target: profiles.id,
        set: {
          email: cleanEmail,
          fullName: displayName,
          avatarUrl: avatarUrl || '',
          updatedAt: new Date(),
        },
      })
      .returning();

    await ensureFlagshipBusinessExists();

    const existingMemberships = await db
      .select()
      .from(businessMembers)
      .where(eq(businessMembers.userId, uid));

    if (existingMemberships.length === 0) {
      if (role === 'super_admin') {
        await db
          .insert(businessMembers)
          .values({
            id: `bm_${uid}_default`,
            businessId: 'biz_default',
            userId: uid,
            role: 'owner',
            permissions: ['all'],
          })
          .onConflictDoNothing();
      } else {
        const personalBizId = `biz_${uid.slice(0, 18)}`;
        const baseSlug = displayName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') || 'nepalai-store';
        const personalSlug = `${baseSlug}-${uid.slice(0, 6).toLowerCase()}`;

        await db
          .insert(businesses)
          .values({
            id: personalBizId,
            name: `${displayName}'s Store`,
            slug: personalSlug,
            description: 'NepalAI Commerce merchant workspace',
            currency: 'NPR',
            email: cleanEmail,
            status: 'active',
            tier: 'starter',
          })
          .onConflictDoNothing({ target: businesses.id });

        await db
          .insert(businessMembers)
          .values({
            id: `bm_${uid}_personal`,
            businessId: personalBizId,
            userId: uid,
            role: 'owner',
            permissions: ['all'],
          })
          .onConflictDoNothing();
      }
    }

    return { user: userRecord, profile: profileRecord };
  } catch (error) {
    console.error('Database user sync failed:', error);
    throw new Error('Failed to synchronize user account.', { cause: error });
  }
}

export async function getProfileByUid(uid: string) {
  try {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, uid)).limit(1);
    return profile || null;
  } catch (error) {
    console.error('Database profile lookup failed:', error);
    throw new Error('Failed to load user profile.', { cause: error });
  }
}

export async function getUserBusinesses(uid: string) {
  try {
    const rows = await db
      .select({
        business: businesses,
        role: businessMembers.role,
      })
      .from(businessMembers)
      .innerJoin(businesses, eq(businessMembers.businessId, businesses.id))
      .where(eq(businessMembers.userId, uid));

    return rows.map((r) => r.business);
  } catch (error) {
    console.error('Database business lookup failed:', error);
    throw new Error('Failed to load user businesses.', { cause: error });
  }
}

export async function createBusinessForUser(params: {
  uid: string;
  name: string;
  panNumber?: string;
  isVatRegistered?: boolean;
  email?: string;
}) {
  try {
    const cleanName = params.name.trim();
    const id = `biz_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const slugBase = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'store';
    const slug = `${slugBase}-${Math.random().toString(36).slice(2, 6)}`;

    const [created] = await db
      .insert(businesses)
      .values({
        id,
        name: cleanName,
        slug,
        panNumber: params.panNumber?.trim() || null,
        isVatRegistered: Boolean(params.isVatRegistered),
        email: params.email || null,
        currency: 'NPR',
        status: 'active',
        tier: 'starter',
      })
      .returning();

    await db.insert(businessMembers).values({
      id: `bm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      businessId: created.id,
      userId: params.uid,
      role: 'owner',
      permissions: ['all'],
    });

    return created;
  } catch (error) {
    console.error('Database create business failed:', error);
    throw new Error('Failed to create business workspace.', { cause: error });
  }
}

export async function userHasBusinessAccess(uid: string, businessId: string): Promise<boolean> {
  try {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, uid)).limit(1);
    if (profile?.systemRole === 'super_admin' || isSuperAdminEmail(profile?.email)) {
      return true;
    }

    const memberships = await db
      .select()
      .from(businessMembers)
      .where(eq(businessMembers.userId, uid));

    return memberships.some((m) => m.businessId === businessId);
  } catch (error) {
    console.error('Database business access check failed:', error);
    throw new Error('Failed to verify business access.', { cause: error });
  }
}

export async function listStudioUsersFromDb() {
  try {
    const allProfiles = await db
      .select()
      .from(profiles)
      .where(or(eq(profiles.systemRole, 'super_admin'), eq(profiles.systemRole, 'user')));
    return allProfiles;
  } catch (error) {
    console.error('Failed to list users:', error);
    throw new Error('Failed to fetch platform users.', { cause: error });
  }
}

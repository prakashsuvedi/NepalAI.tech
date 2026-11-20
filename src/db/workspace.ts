import { and, desc, eq } from 'drizzle-orm';
import { db } from './index.ts';
import { savedCalculations, userPreferences } from './schema.ts';

const DEFAULT_PINNED_TOOLS = ['nrb-forex', 'income-tax-tds', 'ward-nibedan-studio', 'devanagari-ocr'];

export async function getWorkspaceState(userUid: string) {
  try {
    const [prefs] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userUid, userUid))
      .limit(1);

    const calcs = await db
      .select()
      .from(savedCalculations)
      .where(eq(savedCalculations.userUid, userUid))
      .orderBy(desc(savedCalculations.createdAt))
      .limit(50);

    return {
      preferences: prefs || {
        userUid,
        pinnedTools: DEFAULT_PINNED_TOOLS,
        recentTools: [],
        preferredLanguage: 'en',
        updatedAt: new Date(),
      },
      savedCalculations: calcs.map((c) => ({
        id: c.id,
        type: c.type as 'tax' | 'land' | 'fx' | 'document',
        title: c.title,
        summary: c.summary,
        timestamp: c.timestampLabel,
        payload: c.payload,
      })),
    };
  } catch (error) {
    console.error('Failed to fetch workspace state:', error);
    throw new Error('Failed to load workspace preferences.', { cause: error });
  }
}

export async function upsertUserPreferences(
  userUid: string,
  patch: {
    pinnedTools?: string[];
    recentTools?: string[];
    preferredLanguage?: string;
  }
) {
  try {
    const [existing] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userUid, userUid))
      .limit(1);

    const pinnedTools = patch.pinnedTools ?? existing?.pinnedTools ?? DEFAULT_PINNED_TOOLS;
    const recentTools = patch.recentTools ?? existing?.recentTools ?? [];
    const preferredLanguage = patch.preferredLanguage ?? existing?.preferredLanguage ?? 'en';

    const [saved] = await db
      .insert(userPreferences)
      .values({
        userUid,
        pinnedTools,
        recentTools,
        preferredLanguage,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: userPreferences.userUid,
        set: {
          pinnedTools,
          recentTools,
          preferredLanguage,
          updatedAt: new Date(),
        },
      })
      .returning();

    return saved;
  } catch (error) {
    console.error('Failed to save user preferences:', error);
    throw new Error('Failed to persist workspace preferences.', { cause: error });
  }
}

export async function createSavedCalculation(
  userUid: string,
  input: {
    id?: string;
    type: string;
    title: string;
    summary: string;
    timestampLabel: string;
    payload?: Record<string, unknown>;
  }
) {
  try {
    const id = input.id || `calc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const [created] = await db
      .insert(savedCalculations)
      .values({
        id,
        userUid,
        type: input.type,
        title: input.title,
        summary: input.summary,
        timestampLabel: input.timestampLabel,
        payload: input.payload || {},
      })
      .onConflictDoNothing({ target: savedCalculations.id })
      .returning();

    return created;
  } catch (error) {
    console.error('Failed to save calculation:', error);
    throw new Error('Failed to save calculation.', { cause: error });
  }
}

export async function deleteSavedCalculation(userUid: string, id: string) {
  try {
    const deleted = await db
      .delete(savedCalculations)
      .where(and(eq(savedCalculations.id, id), eq(savedCalculations.userUid, userUid)))
      .returning();

    return deleted.length > 0;
  } catch (error) {
    console.error('Failed to delete saved calculation:', error);
    throw new Error('Failed to remove saved calculation.', { cause: error });
  }
}

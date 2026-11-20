import { pgTable, serial, text, timestamp, boolean, jsonb, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/**
 * USERS Table
 * Core Firebase Authentication identity table keyed by Firebase UID.
 */
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  systemRole: text('system_role').default('user').notNull(), // 'super_admin' | 'user'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * PROFILES Table
 * Represents user identity linked 1:1 with Firebase Auth UID.
 * Reusable by NepalAI Commerce and NepalAI Studio.
 */
export const profiles = pgTable('profiles', {
  id: text('id').primaryKey().notNull(), // Firebase Auth UID
  email: text('email').notNull().unique(),
  fullName: text('full_name'),
  phone: text('phone'),
  avatarUrl: text('avatar_url'),
  systemRole: text('system_role').default('user').notNull(), // 'super_admin' | 'user'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * BUSINESSES (Tenants) Table
 * Multi-tenant business entities under NepalAI Commerce & Platform.
 */
export const businesses = pgTable('businesses', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  logoUrl: text('logo_url'),
  bannerUrl: text('banner_url'),
  panNumber: text('pan_number'), // Nepal IRD Tax PAN identifier (9 digits)
  isVatRegistered: boolean('is_vat_registered').default(false).notNull(),
  currency: text('currency').default('NPR').notNull(),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  municipality: text('municipality'),
  wardNo: text('ward_no'),
  district: text('district'),
  status: text('status').default('active').notNull(), // 'active' | 'suspended' | 'trial'
  tier: text('tier').default('starter').notNull(), // 'starter' | 'growth' | 'enterprise'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * BUSINESS MEMBERS Table
 * Maps user membership to business tenants with Role-Based Access Control (RBAC).
 */
export const businessMembers = pgTable('business_members', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  role: text('role').default('staff').notNull(), // 'owner' | 'admin' | 'staff'
  permissions: jsonb('permissions').$type<string[]>().default(['read:products', 'read:orders']).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * BUSINESS INVITATIONS Table
 * Pending email invitations to join a business tenant.
 */
export const businessInvitations = pgTable('business_invitations', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  role: text('role').default('staff').notNull(), // 'admin' | 'staff'
  token: text('token').notNull().unique(),
  status: text('status').default('pending').notNull(), // 'pending' | 'accepted' | 'expired'
  invitedBy: text('invited_by').references(() => profiles.id),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * USER PREFERENCES Table
 * Persists pinned utilities, recently used tools, and UI preferences per user.
 */
export const userPreferences = pgTable('user_preferences', {
  userUid: text('user_uid').primaryKey().notNull(),
  pinnedTools: jsonb('pinned_tools').$type<string[]>().default(['nrb-forex', 'income-tax-tds', 'ward-nibedan-studio', 'devanagari-ocr']).notNull(),
  recentTools: jsonb('recent_tools').$type<string[]>().default([]).notNull(),
  preferredLanguage: text('preferred_language').default('en').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * SAVED CALCULATIONS Table
 * Persists user-saved IRD tax, land conversion, bullion, and NEPSE calculations.
 */
export const savedCalculations = pgTable('saved_calculations', {
  id: text('id').primaryKey(),
  userUid: text('user_uid').notNull(),
  type: text('type').notNull(), // 'tax' | 'land' | 'fx' | 'document'
  title: text('title').notNull(),
  summary: text('summary').notNull(),
  timestampLabel: text('timestamp_label').notNull(),
  payload: jsonb('payload').$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * CONSULTATION LEADS Table
 * Persistent enterprise inquiries and consultation bookings.
 */
export const consultationLeads = pgTable('consultation_leads', {
  id: text('id').primaryKey(),
  userUid: text('user_uid'),
  fullName: text('full_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').default('N/A').notNull(),
  organization: text('organization').default('N/A').notNull(),
  industry: text('industry').default('General').notNull(),
  serviceCategory: text('service_category').default('General AI Advisory').notNull(),
  budgetRange: text('budget_range').default('Standard').notNull(),
  timeline: text('timeline').default('2-Week Rapid Sprint').notNull(),
  billingPreference: text('billing_preference').default('NPR (eSewa / Khalti / FonePay)').notNull(),
  message: text('message').notNull(),
  status: text('status').default('new').notNull(), // 'new' | 'reviewing' | 'contacted' | 'converted' | 'archived'
  adminNotes: text('admin_notes').default('').notNull(),
  source: text('source').default('web_portal').notNull(),
  notificationDispatched: boolean('notification_dispatched').default(true).notNull(),
  submittedAt: timestamp('submitted_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// =========================================================================
// NEPALAI COMMERCE MULTI-TENANT TABLES
// =========================================================================

/**
 * CATEGORIES Table
 * Product categories organized per business tenant.
 */
export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  displayOrder: text('display_order').default('0').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * PRODUCTS Table
 * Products and SKU inventory managed per business tenant with Cloudflare R2 images.
 */
export const products = pgTable('products', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  categoryId: text('category_id').references(() => categories.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  priceNpr: text('price_npr').notNull(),
  compareAtPriceNpr: text('compare_at_price_npr'),
  costPerItemNpr: text('cost_per_item_npr'),
  sku: text('sku'),
  barcode: text('barcode'),
  inventoryQuantity: text('inventory_quantity').default('0').notNull(),
  trackQuantity: boolean('track_quantity').default(true).notNull(),
  status: text('status').default('active').notNull(), // 'active' | 'draft' | 'archived'
  images: jsonb('images').$type<Array<{ key: string; url: string; alt?: string }>>().default([]).notNull(),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * CUSTOMERS Table
 * Shoppers and commercial accounts linked to a tenant.
 */
export const customers = pgTable('customers', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  fullName: text('full_name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  address: text('address'),
  city: text('city').default('Kathmandu'),
  totalOrders: text('total_orders').default('0').notNull(),
  totalSpendNpr: text('total_spend_npr').default('0').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * ORDERS Table
 * Multi-tenant orders with eSewa / Khalti / FonePay / COD support.
 */
export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  customerId: text('customer_id').references(() => customers.id, { onDelete: 'set null' }),
  orderNumber: text('order_number').notNull(),
  subtotalNpr: text('subtotal_npr').notNull(),
  deliveryChargeNpr: text('delivery_charge_npr').default('0').notNull(),
  discountNpr: text('discount_npr').default('0').notNull(),
  totalNpr: text('total_npr').notNull(),
  paymentMethod: text('payment_method').default('cod').notNull(),
  paymentStatus: text('payment_status').default('pending').notNull(),
  fulfillmentStatus: text('fulfillment_status').default('unfulfilled').notNull(),
  shippingAddress: jsonb('shipping_address').$type<{
    fullName: string;
    phone: string;
    address: string;
    city: string;
    province?: string;
  }>().default({ fullName: '', phone: '', address: '', city: 'Kathmandu' }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * ORDER ITEMS Table
 * Item snapshots preserved in each order.
 */
export const orderItems = pgTable('order_items', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: text('product_id').references(() => products.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  unitPriceNpr: text('unit_price_npr').notNull(),
  quantity: text('quantity').notNull(),
  totalPriceNpr: text('total_price_npr').notNull(),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * PAYMENTS Table
 * Gateway transactions for eSewa, Khalti, and FonePay.
 */
export const payments = pgTable('payments', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  businessId: text('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  gateway: text('gateway').notNull(),
  transactionId: text('transaction_id'),
  amountNpr: text('amount_npr').notNull(),
  status: text('status').default('pending').notNull(),
  rawResponse: jsonb('raw_response').$type<Record<string, unknown>>().default({}).notNull(),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// =========================================================================
// RELATIONS DEFINITIONS
// =========================================================================

export const profilesRelations = relations(profiles, ({ many }) => ({
  memberships: many(businessMembers),
  sentInvitations: many(businessInvitations),
}));

export const businessesRelations = relations(businesses, ({ many }) => ({
  members: many(businessMembers),
  invitations: many(businessInvitations),
  categories: many(categories),
  products: many(products),
  customers: many(customers),
  orders: many(orders),
  payments: many(payments),
}));

export const businessMembersRelations = relations(businessMembers, ({ one }) => ({
  business: one(businesses, {
    fields: [businessMembers.businessId],
    references: [businesses.id],
  }),
  profile: one(profiles, {
    fields: [businessMembers.userId],
    references: [profiles.id],
  }),
}));

export const businessInvitationsRelations = relations(businessInvitations, ({ one }) => ({
  business: one(businesses, {
    fields: [businessInvitations.businessId],
    references: [businesses.id],
  }),
  inviter: one(profiles, {
    fields: [businessInvitations.invitedBy],
    references: [profiles.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  business: one(businesses, {
    fields: [categories.businessId],
    references: [businesses.id],
  }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one }) => ({
  business: one(businesses, {
    fields: [products.businessId],
    references: [businesses.id],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  business: one(businesses, {
    fields: [customers.businessId],
    references: [businesses.id],
  }),
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  business: one(businesses, {
    fields: [orders.businessId],
    references: [businesses.id],
  }),
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  items: many(orderItems),
  payments: many(payments),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
  business: one(businesses, {
    fields: [payments.businessId],
    references: [businesses.id],
  }),
}));

// TypeScript Inferred Types
export type AppUser = typeof users.$inferSelect;
export type NewAppUser = typeof users.$inferInsert;

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

export type Business = typeof businesses.$inferSelect;
export type NewBusiness = typeof businesses.$inferInsert;

export type BusinessMember = typeof businessMembers.$inferSelect;
export type NewBusinessMember = typeof businessMembers.$inferInsert;

export type BusinessInvitation = typeof businessInvitations.$inferSelect;
export type NewBusinessInvitation = typeof businessInvitations.$inferInsert;

export type UserPreference = typeof userPreferences.$inferSelect;
export type SavedCalculationRecord = typeof savedCalculations.$inferSelect;
export type ConsultationLeadRecord = typeof consultationLeads.$inferSelect;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;

// =========================================================================
// NEPAL AI + TRENDS PLATFORM TABLES
// =========================================================================

/**
 * TRENDS Table
 * Canonical normalized trends ingested from Google Trends RSS (geo=NP & diaspora)
 * and enriched via rules-first + source-grounded Gemini synthesis.
 */
export const trends = pgTable('trends', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  keyword: text('keyword').notNull(),
  keywordNormalized: text('keyword_normalized').notNull(),
  country: text('country').default('NP').notNull(),
  language: text('language').default('en').notNull(), // 'en' | 'ne' | 'romanized-ne' | 'mixed'
  category: text('category').default('politics-governance').notNull(),
  audienceSegment: text('audience_segment').default('nepal_local').notNull(), // 'nepal_local' | 'diaspora' | 'global_nepali'
  trafficBand: text('traffic_band').default('200+').notNull(),
  numericTrafficFloor: integer('numeric_traffic_floor').default(200).notNull(),
  trendScore: integer('trend_score').default(50).notNull(),
  aiWhyTrending: text('ai_why_trending'),
  citations: jsonb('citations').$type<Array<{ title: string; url: string; source: string }>>().default([]).notNull(),
  relatedQueries: jsonb('related_queries').$type<string[]>().default([]).notNull(),
  triScriptVariants: jsonb('tri_script_variants').$type<Array<{
    baseKeyword: string;
    englishVariant: string;
    romanizedNepali: string;
    devanagariVariant: string;
    intentTag: string;
  }>>().default([]).notNull(),
  linkedToolTab: text('linked_tool_tab'),
  imageUrl: text('image_url'),
  isActive: boolean('is_active').default(true).notNull(),
  sourceUrl: text('source_url'),
  firstSeenAt: timestamp('first_seen_at', { withTimezone: true }).defaultNow().notNull(),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).defaultNow().notNull(),
  enrichedAt: timestamp('enriched_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * TREND SNAPSHOTS Table
 * Time-series captures per RSS sync cycle for authentic 24h & 7d velocity charts.
 */
export const trendSnapshots = pgTable('trend_snapshots', {
  id: text('id').primaryKey(),
  trendId: text('trend_id').notNull().references(() => trends.id, { onDelete: 'cascade' }),
  capturedAt: timestamp('captured_at', { withTimezone: true }).defaultNow().notNull(),
  rankPosition: integer('rank_position').default(1).notNull(),
  trafficBand: text('traffic_band').default('200+').notNull(),
  numericTrafficFloor: integer('numeric_traffic_floor').default(200).notNull(),
  velocityDelta: integer('velocity_delta').default(0).notNull(),
});

/**
 * TREND NEWS Table
 * Source articles extracted directly from Google Trends RSS ht:news_item blocks.
 */
export const trendNews = pgTable('trend_news', {
  id: text('id').primaryKey(),
  trendId: text('trend_id').notNull().references(() => trends.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  url: text('url').notNull(),
  source: text('source').default('News Source').notNull(),
  snippet: text('snippet'),
  imageUrl: text('image_url'),
  publishedAt: timestamp('published_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * KEYWORD METRICS Table
 * Stores relative interest series (Google Trends Alpha API adapter or RSS velocity fallback),
 * direction, and intent scores per searched query.
 */
export const keywordMetrics = pgTable('keyword_metrics', {
  id: text('id').primaryKey(),
  keyword: text('keyword').notNull(),
  keywordNormalized: text('keyword_normalized').notNull(),
  country: text('country').default('NP').notNull(),
  detectedScript: text('detected_script').default('en').notNull(),
  category: text('category').default('technology-ai').notNull(),
  interestScore: integer('interest_score').default(50).notNull(),
  direction: text('direction').default('steady').notNull(), // 'rising' | 'steady' | 'seasonal' | 'cooling'
  localIntentScore: integer('local_intent_score').default(70).notNull(),
  diasporaIntentScore: integer('diaspora_intent_score').default(30).notNull(),
  period: text('period').default('weekly').notNull(), // 'daily' | 'weekly' | 'monthly'
  dataSource: text('data_source').default('rss_velocity').notNull(), // 'google_trends_api' | 'rss_velocity'
  interestSeries: jsonb('interest_series').$type<Array<{ date: string; score: number }>>().default([]).notNull(),
  relatedQueries: jsonb('related_queries').$type<string[]>().default([]).notNull(),
  contentAngles: jsonb('content_angles').$type<string[]>().default([]).notNull(),
  capturedAt: timestamp('captured_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * KEYWORD VARIANTS Table
 * Aligned English, Romanized Nepali, and Devanagari keyword permutations.
 */
export const keywordVariants = pgTable('keyword_variants', {
  id: text('id').primaryKey(),
  metricId: text('metric_id').notNull().references(() => keywordMetrics.id, { onDelete: 'cascade' }),
  baseKeyword: text('base_keyword').notNull(),
  englishVariant: text('english_variant').notNull(),
  romanizedNepali: text('romanized_nepali').notNull(),
  devanagariVariant: text('devanagari_variant').notNull(),
  intentTag: text('intent_tag').default('General').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * TREND ALERT SUBSCRIPTIONS Table
 * Category-filtered email digest subscriptions with one-click unsubscribe tokens.
 */
export const trendAlertSubscriptions = pgTable('trend_alert_subscriptions', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  userUid: text('user_uid'),
  categories: jsonb('categories').$type<string[]>().default(['technology-ai', 'business-finance']).notNull(),
  cadence: text('cadence').default('daily').notNull(), // 'daily' | 'breaking'
  preferredLanguage: text('preferred_language').default('bilingual').notNull(), // 'en' | 'ne' | 'bilingual'
  countryFilter: text('country_filter').default('NP').notNull(),
  deliveryChannel: text('delivery_channel').default('email').notNull(), // 'email' | 'whatsapp' | 'both'
  whatsappNumber: text('whatsapp_number'),
  whatsappWebhookUrl: text('whatsapp_webhook_url'),
  isVerified: boolean('is_verified').default(true).notNull(),
  unsubscribeToken: text('unsubscribe_token').notNull().unique(),
  lastSentAt: timestamp('last_sent_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * CONTENT BRIEFS Table
 * AI-generated bilingual SEO briefs & creator hooks linked to trends or keywords.
 */
export const contentBriefs = pgTable('content_briefs', {
  id: text('id').primaryKey(),
  trendId: text('trend_id').references(() => trends.id, { onDelete: 'set null' }),
  keyword: text('keyword').notNull(),
  userUid: text('user_uid'),
  languageMode: text('language_mode').default('bilingual').notNull(),
  outlineJson: jsonb('outline_json').$type<{
    headlineEn: string;
    headlineNe: string;
    hookEn: string;
    hookNe: string;
    keyPoints: string[];
    seoKeywords: string[];
    faqQuestion: string;
    faqAnswer: string;
  }>().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * TREND API KEYS Table (Phase 3)
 * Metered REST API keys for Nepali media houses, agencies, and e-commerce platforms.
 */
export const trendApiKeys = pgTable('trend_api_keys', {
  id: text('id').primaryKey(),
  label: text('label').notNull(),
  keyPrefix: text('key_prefix').notNull(),
  keyHash: text('key_hash').notNull().unique(),
  userUid: text('user_uid'),
  planTier: text('plan_tier').default('starter').notNull(), // 'starter' | 'agency'
  monthlyQuota: integer('monthly_quota').default(5000).notNull(),
  requestCount: integer('request_count').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * TREND WATCHLISTS Table (Phase 3)
 * Saved topics & keywords tracked by creators, journalists, and businesses.
 */
export const trendWatchlists = pgTable('trend_watchlists', {
  id: text('id').primaryKey(),
  ownerKey: text('owner_key').notNull(), // userUid or browser/email key
  keyword: text('keyword').notNull(),
  keywordNormalized: text('keyword_normalized').notNull(),
  slug: text('slug'),
  category: text('category').default('technology-ai').notNull(),
  country: text('country').default('NP').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * TREND VELOCITY ALERTS Table
 * Custom user-configured velocity threshold rules evaluated against live snapshots.
 */
export const trendVelocityAlerts = pgTable('trend_velocity_alerts', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  userUid: text('user_uid'),
  ownerKey: text('owner_key').notNull(),
  keywordFilter: text('keyword_filter'),
  keywordNormalized: text('keyword_normalized'),
  category: text('category').default('all').notNull(),
  country: text('country').default('NP').notNull(),
  minVelocityScore: integer('min_velocity_score').default(75).notNull(),
  minVelocityDelta: integer('min_velocity_delta').default(0).notNull(),
  deliveryChannel: text('delivery_channel').default('email').notNull(), // 'email' | 'whatsapp' | 'both'
  whatsappNumber: text('whatsapp_number'),
  whatsappWebhookUrl: text('whatsapp_webhook_url'),
  isActive: boolean('is_active').default(true).notNull(),
  cooldownMinutes: integer('cooldown_minutes').default(180).notNull(),
  lastTriggeredAt: timestamp('last_triggered_at', { withTimezone: true }),
  lastTriggeredKeyword: text('last_triggered_keyword'),
  lastTriggeredScore: integer('last_triggered_score'),
  triggerCount: integer('trigger_count').default(0).notNull(),
  unsubscribeToken: text('unsubscribe_token').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * SEASONAL BENCHMARKS Table (Phase 3B)
 * Bikram Sambat & Gregorian 12-month Nepal demand cycles (Festivals, Exams, Trekking, E-commerce).
 */
export const seasonalBenchmarks = pgTable('seasonal_benchmarks', {
  id: text('id').primaryKey(),
  keyword: text('keyword').notNull(),
  keywordNormalized: text('keyword_normalized').notNull().unique(),
  pillar: text('pillar').notNull(), // 'festivals' | 'exams' | 'trekking' | 'ecommerce'
  bsMonthLabel: text('bs_month_label').notNull(),
  peakMonthsJson: jsonb('peak_months_json').$type<number[]>().default([]).notNull(),
  monthlyIndexJson: jsonb('monthly_index_json').$type<number[]>().default([]).notNull(),
  currentInterestScore: integer('current_interest_score').default(50).notNull(),
  direction: text('direction').default('seasonal').notNull(), // 'rising' | 'pre-peak' | 'peak' | 'steady'
  romanizedNepali: text('romanized_nepali').notNull(),
  devanagariVariant: text('devanagari_variant').notNull(),
  linkedToolTab: text('linked_tool_tab'),
  insightNote: text('insight_note').notNull(),
  dataSource: text('data_source').default('bs_calendar_benchmark').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * WHATSAPP DELIVERY LOGS Table (Phase 3B)
 * Audit trail for WhatsApp Business webhook relay dispatches across daily digests and velocity alerts.
 */
export const whatsappDeliveryLogs = pgTable('whatsapp_delivery_logs', {
  id: text('id').primaryKey(),
  sourceType: text('source_type').notNull(), // 'daily_digest' | 'velocity_threshold' | 'test_ping'
  referenceId: text('reference_id'),
  recipientNumber: text('recipient_number').notNull(),
  webhookTarget: text('webhook_target').notNull(),
  payloadPreview: text('payload_preview').notNull(),
  deliveryStatus: text('delivery_status').notNull(), // 'sent' | 'queued_no_webhook' | 'failed'
  httpStatus: integer('http_status'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * DIASPORA PARTNER SLOTS Table (Phase 3B)
 * Vetted geo-targeted sponsor placements scoped exclusively to /trending/diaspora.
 */
export const diasporaPartnerSlots = pgTable('diaspora_partner_slots', {
  id: text('id').primaryKey(),
  partnerName: text('partner_name').notNull(),
  tagline: text('tagline').notNull(),
  ctaLabel: text('cta_label').notNull(),
  ctaUrl: text('cta_url').notNull(),
  categoryLabel: text('category_label').notNull(),
  targetCountries: jsonb('target_countries').$type<string[]>().default(['US', 'AU', 'GB', 'AE', 'JP', 'CA']).notNull(),
  sponsorTier: text('sponsor_tier').default('featured').notNull(), // 'featured' | 'hub_spotlight'
  impressionsCount: integer('impressions_count').default(0).notNull(),
  clicksCount: integer('clicks_count').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const trendsRelations = relations(trends, ({ many }) => ({
  snapshots: many(trendSnapshots),
  newsItems: many(trendNews),
  briefs: many(contentBriefs),
}));

export const trendSnapshotsRelations = relations(trendSnapshots, ({ one }) => ({
  trend: one(trends, {
    fields: [trendSnapshots.trendId],
    references: [trends.id],
  }),
}));

export const trendNewsRelations = relations(trendNews, ({ one }) => ({
  trend: one(trends, {
    fields: [trendNews.trendId],
    references: [trends.id],
  }),
}));

export const keywordMetricsRelations = relations(keywordMetrics, ({ many }) => ({
  variants: many(keywordVariants),
}));

export const keywordVariantsRelations = relations(keywordVariants, ({ one }) => ({
  metric: one(keywordMetrics, {
    fields: [keywordVariants.metricId],
    references: [keywordMetrics.id],
  }),
}));

export const contentBriefsRelations = relations(contentBriefs, ({ one }) => ({
  trend: one(trends, {
    fields: [contentBriefs.trendId],
    references: [trends.id],
  }),
}));

export type TrendRecord = typeof trends.$inferSelect;
export type NewTrendRecord = typeof trends.$inferInsert;
export type TrendSnapshotRecord = typeof trendSnapshots.$inferSelect;
export type TrendNewsRecord = typeof trendNews.$inferSelect;
export type KeywordMetricRecord = typeof keywordMetrics.$inferSelect;
export type KeywordVariantRecord = typeof keywordVariants.$inferSelect;
export type TrendAlertSubscriptionRecord = typeof trendAlertSubscriptions.$inferSelect;
export type ContentBriefRecord = typeof contentBriefs.$inferSelect;
export type TrendApiKeyRecord = typeof trendApiKeys.$inferSelect;
export type TrendWatchlistRecord = typeof trendWatchlists.$inferSelect;
export type TrendVelocityAlertRecord = typeof trendVelocityAlerts.$inferSelect;
export type SeasonalBenchmarkRecord = typeof seasonalBenchmarks.$inferSelect;
export type WhatsappDeliveryLogRecord = typeof whatsappDeliveryLogs.$inferSelect;
export type DiasporaPartnerSlotRecord = typeof diasporaPartnerSlots.$inferSelect;


import { pgTable, uuid, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/**
 * PROFILES Table
 * Represents user identity linked 1:1 with Supabase Auth (auth.users.id).
 * Reusable by NepalAI Commerce and NepalAI Studio.
 */
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().notNull(), // References auth.users(id)
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
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(), // URL-friendly unique identifier: e.g. "himalayan-coffee"
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
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  userId: uuid('userId').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  role: text('role').default('staff').notNull(), // 'owner' | 'admin' | 'staff'
  permissions: jsonb('permissions').default(['read:products', 'read:orders']).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * BUSINESS INVITATIONS Table
 * Pending email invitations to join a business tenant.
 */
export const businessInvitations = pgTable('business_invitations', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  role: text('role').default('staff').notNull(), // 'admin' | 'staff'
  token: text('token').notNull().unique(),
  status: text('status').default('pending').notNull(), // 'pending' | 'accepted' | 'expired'
  invitedBy: uuid('invited_by').references(() => profiles.id),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * RELATIONS DEFINITIONS
 */
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

// =========================================================================
// NEPALAI COMMERCE MULTI-TENANT TABLES
// =========================================================================

/**
 * CATEGORIES Table
 * Product categories organized per business tenant.
 */
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
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
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  priceNpr: text('price_npr').notNull(), // NPR monetary string to avoid float precision issues
  compareAtPriceNpr: text('compare_at_price_npr'),
  costPerItemNpr: text('cost_per_item_npr'),
  sku: text('sku'),
  barcode: text('barcode'),
  inventoryQuantity: text('inventory_quantity').default('0').notNull(),
  trackQuantity: boolean('track_quantity').default(true).notNull(),
  status: text('status').default('active').notNull(), // 'active' | 'draft' | 'archived'
  images: jsonb('images').default([]).notNull(), // Array of { key: string, url: string, alt?: string }
  metadata: jsonb('metadata').default({}).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * CUSTOMERS Table
 * Shoppers and commercial accounts linked to a tenant.
 */
export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  fullName: text('full_name').notNull(),
  phone: text('phone').notNull(), // Required for WhatsApp confirmations and delivery
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
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'set null' }),
  orderNumber: text('order_number').notNull(), // e.g. "ORD-2081-1001"
  subtotalNpr: text('subtotal_npr').notNull(),
  deliveryChargeNpr: text('delivery_charge_npr').default('0').notNull(),
  discountNpr: text('discount_npr').default('0').notNull(),
  totalNpr: text('total_npr').notNull(),
  paymentMethod: text('payment_method').default('cod').notNull(), // 'esewa' | 'khalti' | 'fonepay' | 'cod'
  paymentStatus: text('payment_status').default('pending').notNull(), // 'pending' | 'paid' | 'failed' | 'refunded'
  fulfillmentStatus: text('fulfillment_status').default('unfulfilled').notNull(), // 'unfulfilled' | 'processing' | 'dispatched' | 'delivered' | 'cancelled'
  shippingAddress: jsonb('shipping_address').default({}).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * ORDER ITEMS Table
 * Item snapshots preserved in each order.
 */
export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'set null' }),
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
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  businessId: uuid('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  gateway: text('gateway').notNull(), // 'esewa' | 'khalti' | 'fonepay' | 'cod'
  transactionId: text('transaction_id'),
  amountNpr: text('amount_npr').notNull(),
  status: text('status').default('pending').notNull(), // 'pending' | 'verified' | 'failed'
  rawResponse: jsonb('raw_response').default({}).notNull(),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Commerce Relations
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
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

export type Business = typeof businesses.$inferSelect;
export type NewBusiness = typeof businesses.$inferInsert;

export type BusinessMember = typeof businessMembers.$inferSelect;
export type NewBusinessMember = typeof businessMembers.$inferInsert;

export type BusinessInvitation = typeof businessInvitations.$inferSelect;
export type NewBusinessInvitation = typeof businessInvitations.$inferInsert;

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

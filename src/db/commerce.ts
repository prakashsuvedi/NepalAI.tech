import { and, desc, eq, or } from 'drizzle-orm';
import { db } from './index.ts';
import {
  businesses,
  categories,
  customers,
  orderItems,
  orders,
  payments,
  products,
} from './schema.ts';
import { ensureFlagshipBusinessExists } from './users.ts';

let commerceSeedPromise: Promise<void> | null = null;

async function ensureCommerceSeeded() {
  if (!commerceSeedPromise) {
    commerceSeedPromise = (async () => {
      await ensureFlagshipBusinessExists();

      const existingCat = await db.select({ id: categories.id }).from(categories).limit(1);
      if (existingCat.length > 0) return;

      await db
        .insert(categories)
        .values([
          {
            id: 'cat_agro_01',
            businessId: 'biz_default',
            name: 'Himalayan Organic Agro & Coffee',
            slug: 'himalayan-organic-agro',
            description: 'Direct mountain farm products with organic traceability',
            imageUrl: '/api/storage/mock-media?key=categories/coffee.jpg',
            displayOrder: '1',
          },
          {
            id: 'cat_tech_02',
            businessId: 'biz_default',
            name: 'Sovereign AI Appliances & Kits',
            slug: 'sovereign-ai-hardware',
            description: 'Local Devanagari OCR scanners and air-gapped edge devices',
            imageUrl: '/api/storage/mock-media?key=categories/ai_device.jpg',
            displayOrder: '2',
          },
          {
            id: 'cat_handicraft_03',
            businessId: 'biz_default',
            name: 'Handcrafted Heritage & Dhaka',
            slug: 'heritage-dhaka',
            description: 'Authentic Palpali Dhaka textiles and Pashmina shawls',
            imageUrl: '/api/storage/mock-media?key=categories/dhaka.jpg',
            displayOrder: '3',
          },
        ])
        .onConflictDoNothing({ target: categories.id });

      await db
        .insert(products)
        .values([
          {
            id: 'prod_coffee_101',
            businessId: 'biz_default',
            categoryId: 'cat_agro_01',
            title: 'Single-Origin Nuwakot Highland Coffee (500g)',
            slug: 'single-origin-nuwakot-coffee',
            description:
              'Grown at 1,450m elevation in Nuwakot. Hand-picked, washed Arabica beans with hints of dark cocoa and Himalayan citrus. Perfect for espresso and French press.',
            priceNpr: '1250',
            compareAtPriceNpr: '1450',
            costPerItemNpr: '800',
            sku: 'NWK-COF-500',
            barcode: '8901234567890',
            inventoryQuantity: '42',
            trackQuantity: true,
            status: 'active',
            images: [
              {
                key: 'tenants/biz_default/products/coffee-beans.jpg',
                url: '/api/storage/mock-media?key=products/coffee-beans.jpg',
                alt: 'Nuwakot Highland Coffee',
              },
            ],
            metadata: { weightGrams: 500, origin: 'Nuwakot, Nepal', roaster: 'Kathmandu Artisan Roasters' },
          },
          {
            id: 'prod_ocr_device_102',
            businessId: 'biz_default',
            categoryId: 'cat_tech_02',
            title: 'NepalAI Devanagari OCR Scanner Appliance V2',
            slug: 'nepalai-devanagari-ocr-scanner',
            description:
              'Plug-and-play local edge document scanner with onboard Devanagari OCR model. Scans Nepali Citizenship Cards, Lalpurja land deeds, and Ward bills in 350ms with zero cloud egress.',
            priceNpr: '28500',
            compareAtPriceNpr: '32000',
            costPerItemNpr: '19000',
            sku: 'NEP-OCR-HW02',
            barcode: '8909876543210',
            inventoryQuantity: '14',
            trackQuantity: true,
            status: 'active',
            images: [
              {
                key: 'tenants/biz_default/products/ocr-scanner.jpg',
                url: '/api/storage/mock-media?key=products/ocr-scanner.jpg',
                alt: 'NepalAI Sovereign OCR Scanner',
              },
            ],
            metadata: { warrantyMonths: 12, interface: 'USB-C & Gigabit LAN', chip: 'Hailo-8 / Edge LPU' },
          },
          {
            id: 'prod_tea_103',
            businessId: 'biz_default',
            categoryId: 'cat_agro_01',
            title: 'Ilam First Flush Golden Tips Organic Tea (250g)',
            slug: 'ilam-first-flush-golden-tips',
            description:
              'Certified organic orthodox black tea harvested from high-altitude gardens of Ilam, Eastern Nepal. Rich muscatel bouquet and smooth finish.',
            priceNpr: '950',
            compareAtPriceNpr: '1150',
            costPerItemNpr: '550',
            sku: 'ILM-TEA-250',
            barcode: '8905671234567',
            inventoryQuantity: '68',
            trackQuantity: true,
            status: 'active',
            images: [
              {
                key: 'tenants/biz_default/products/ilam-tea.jpg',
                url: '/api/storage/mock-media?key=products/ilam-tea.jpg',
                alt: 'Ilam First Flush Tea',
              },
            ],
            metadata: { harvestSeason: 'Spring 2026', altitudeM: 1800, grade: 'FTGFOP1' },
          },
          {
            id: 'prod_dhaka_104',
            businessId: 'biz_default',
            categoryId: 'cat_handicraft_03',
            title: 'Palpali Handwoven Dhaka Executive Sleeve (14-inch)',
            slug: 'palpali-handwoven-dhaka-laptop-sleeve',
            description:
              'Traditional geometric hand-loomed Palpali Dhaka pattern lined with shock-absorbent wool felt. Fits MacBook Pro 14 and standard ultrabooks.',
            priceNpr: '2200',
            compareAtPriceNpr: '2600',
            costPerItemNpr: '1300',
            sku: 'PLP-DHK-SLV14',
            barcode: '8903456789012',
            inventoryQuantity: '25',
            trackQuantity: true,
            status: 'active',
            images: [
              {
                key: 'tenants/biz_default/products/dhaka-sleeve.jpg',
                url: '/api/storage/mock-media?key=products/dhaka-sleeve.jpg',
                alt: 'Palpali Dhaka Sleeve',
              },
            ],
            metadata: { weave: '100% Cotton Handloom', location: 'Tansen, Palpa' },
          },
        ])
        .onConflictDoNothing({ target: products.id });

      await db
        .insert(customers)
        .values([
          {
            id: 'cust_101',
            businessId: 'biz_default',
            fullName: 'Aayush Maharjan',
            phone: '+977 9841234567',
            email: 'aayush.m@gmail.com',
            address: 'Patan Dhoka, Lalitpur',
            city: 'Lalitpur',
            totalOrders: '2',
            totalSpendNpr: '4100',
          },
          {
            id: 'cust_102',
            businessId: 'biz_default',
            fullName: 'Sujata Gurung',
            phone: '+977 9801987654',
            email: 'sujata.g@techhub.np',
            address: 'Lakeside, Pokhara',
            city: 'Pokhara',
            totalOrders: '1',
            totalSpendNpr: '28500',
          },
        ])
        .onConflictDoNothing({ target: customers.id });

      await db
        .insert(orders)
        .values([
          {
            id: 'ord_2081_1001',
            businessId: 'biz_default',
            customerId: 'cust_101',
            orderNumber: 'ORD-2081-1001',
            subtotalNpr: '3450',
            deliveryChargeNpr: '150',
            discountNpr: '0',
            totalNpr: '3600',
            paymentMethod: 'esewa',
            paymentStatus: 'paid',
            fulfillmentStatus: 'delivered',
            shippingAddress: {
              fullName: 'Aayush Maharjan',
              phone: '+977 9841234567',
              address: 'Patan Dhoka, Ward 3',
              city: 'Lalitpur',
              province: 'Bagmati',
            },
            notes: 'Deliver before 4 PM to Patan office',
            createdAt: new Date(Date.now() - 3600000 * 48),
          },
          {
            id: 'ord_2081_1002',
            businessId: 'biz_default',
            customerId: 'cust_102',
            orderNumber: 'ORD-2081-1002',
            subtotalNpr: '28500',
            deliveryChargeNpr: '0',
            discountNpr: '0',
            totalNpr: '28500',
            paymentMethod: 'khalti',
            paymentStatus: 'paid',
            fulfillmentStatus: 'processing',
            shippingAddress: {
              fullName: 'Sujata Gurung',
              phone: '+977 9801987654',
              address: 'Lakeside Street 6, Pokhara',
              city: 'Pokhara',
              province: 'Gandaki',
            },
            notes: 'Corporate warranty certificate required',
            createdAt: new Date(Date.now() - 3600000 * 5),
          },
        ])
        .onConflictDoNothing({ target: orders.id });

      await db
        .insert(orderItems)
        .values([
          {
            id: 'item_01',
            orderId: 'ord_2081_1001',
            productId: 'prod_coffee_101',
            title: 'Single-Origin Nuwakot Highland Coffee (500g)',
            unitPriceNpr: '1250',
            quantity: '2',
            totalPriceNpr: '2500',
          },
          {
            id: 'item_02',
            orderId: 'ord_2081_1001',
            productId: 'prod_tea_103',
            title: 'Ilam First Flush Golden Tips Organic Tea (250g)',
            unitPriceNpr: '950',
            quantity: '1',
            totalPriceNpr: '950',
          },
          {
            id: 'item_03',
            orderId: 'ord_2081_1002',
            productId: 'prod_ocr_device_102',
            title: 'NepalAI Devanagari OCR Scanner Appliance V2',
            unitPriceNpr: '28500',
            quantity: '1',
            totalPriceNpr: '28500',
          },
        ])
        .onConflictDoNothing({ target: orderItems.id });

      await db
        .insert(payments)
        .values([
          {
            id: 'pay_01',
            orderId: 'ord_2081_1001',
            businessId: 'biz_default',
            gateway: 'esewa',
            transactionId: 'ESW-9840129',
            amountNpr: '3600',
            status: 'verified',
            rawResponse: { mode: 'esewa_epay', refId: 'ESW-9840129', status: 'COMPLETE' },
            verifiedAt: new Date(Date.now() - 3600000 * 48),
          },
          {
            id: 'pay_02',
            orderId: 'ord_2081_1002',
            businessId: 'biz_default',
            gateway: 'khalti',
            transactionId: 'KHLTI-8910471',
            amountNpr: '28500',
            status: 'verified',
            rawResponse: { mode: 'khalti_v2', pidx: 'KHLTI-8910471', status: 'Completed' },
            verifiedAt: new Date(Date.now() - 3600000 * 5),
          },
        ])
        .onConflictDoNothing({ target: payments.id });
    })().catch((err) => {
      commerceSeedPromise = null;
      throw err;
    });
  }
  await commerceSeedPromise;
}

export async function getCategoriesByBusiness(businessId = 'biz_default') {
  try {
    await ensureCommerceSeeded();
    if (businessId === 'all') {
      return await db.select().from(categories);
    }
    return await db.select().from(categories).where(eq(categories.businessId, businessId));
  } catch (error) {
    console.error('Database getCategories failed:', error);
    throw new Error('Failed to load categories.', { cause: error });
  }
}

export async function createCategoryRecord(input: {
  businessId: string;
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
}) {
  try {
    await ensureCommerceSeeded();
    const existing = await db.select({ id: categories.id }).from(categories);
    const id = `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const [created] = await db
      .insert(categories)
      .values({
        id,
        businessId: input.businessId,
        name: input.name.trim(),
        slug: input.slug || input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: input.description || '',
        imageUrl: input.imageUrl || '',
        displayOrder: String(existing.length + 1),
      })
      .returning();
    return created;
  } catch (error) {
    console.error('Database createCategory failed:', error);
    throw new Error('Failed to create category.', { cause: error });
  }
}

export async function getProductsByFilter(filters: {
  businessId?: string;
  categoryId?: string;
  status?: string;
  search?: string;
}) {
  try {
    await ensureCommerceSeeded();
    const businessId = filters.businessId || 'biz_default';

    let items =
      businessId === 'all'
        ? await db.select().from(products).orderBy(desc(products.createdAt))
        : await db
            .select()
            .from(products)
            .where(eq(products.businessId, businessId))
            .orderBy(desc(products.createdAt));

    if (filters.categoryId && filters.categoryId !== 'all') {
      items = items.filter((p) => p.categoryId === filters.categoryId);
    }
    if (filters.status && filters.status !== 'all') {
      items = items.filter((p) => p.status === filters.status);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      items = items.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q) ||
          (p.sku || '').toLowerCase().includes(q)
      );
    }

    return items;
  } catch (error) {
    console.error('Database getProducts failed:', error);
    throw new Error('Failed to load product catalog.', { cause: error });
  }
}

export async function getProductById(id: string) {
  try {
    const [prod] = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return prod || null;
  } catch (error) {
    console.error('Database getProductById failed:', error);
    throw new Error('Failed to fetch product.', { cause: error });
  }
}

export async function createProductRecord(input: {
  businessId: string;
  categoryId?: string | null;
  title: string;
  description?: string;
  priceNpr: string;
  compareAtPriceNpr?: string | null;
  costPerItemNpr?: string | null;
  sku?: string;
  barcode?: string | null;
  inventoryQuantity?: string;
  trackQuantity?: boolean;
  status?: string;
  images?: Array<{ key: string; url: string; alt?: string }>;
  metadata?: Record<string, unknown>;
}) {
  try {
    await ensureCommerceSeeded();
    const id = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const [created] = await db
      .insert(products)
      .values({
        id,
        businessId: input.businessId,
        categoryId: input.categoryId || null,
        title: input.title.trim(),
        slug: input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: input.description || '',
        priceNpr: String(input.priceNpr),
        compareAtPriceNpr: input.compareAtPriceNpr ? String(input.compareAtPriceNpr) : null,
        costPerItemNpr: input.costPerItemNpr ? String(input.costPerItemNpr) : null,
        sku: input.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        barcode: input.barcode || null,
        inventoryQuantity: String(input.inventoryQuantity ?? '0'),
        trackQuantity: input.trackQuantity !== undefined ? Boolean(input.trackQuantity) : true,
        status: input.status || 'active',
        images: Array.isArray(input.images) ? input.images : [],
        metadata: input.metadata || {},
      })
      .returning();

    return created;
  } catch (error) {
    console.error('Database createProduct failed:', error);
    throw new Error('Failed to create product.', { cause: error });
  }
}

export async function updateProductRecord(id: string, patch: Record<string, any>) {
  try {
    const [existing] = await db.select().from(products).where(eq(products.id, id)).limit(1);
    if (!existing) return null;

    const [updated] = await db
      .update(products)
      .set({
        title: patch.title !== undefined ? String(patch.title) : existing.title,
        description: patch.description !== undefined ? String(patch.description) : existing.description,
        priceNpr: patch.priceNpr !== undefined ? String(patch.priceNpr) : existing.priceNpr,
        compareAtPriceNpr:
          patch.compareAtPriceNpr !== undefined ? patch.compareAtPriceNpr : existing.compareAtPriceNpr,
        inventoryQuantity:
          patch.inventoryQuantity !== undefined ? String(patch.inventoryQuantity) : existing.inventoryQuantity,
        status: patch.status !== undefined ? String(patch.status) : existing.status,
        sku: patch.sku !== undefined ? patch.sku : existing.sku,
        images: Array.isArray(patch.images) ? patch.images : existing.images,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();

    return updated;
  } catch (error) {
    console.error('Database updateProduct failed:', error);
    throw new Error('Failed to update product.', { cause: error });
  }
}

export async function deleteProductRecord(id: string) {
  try {
    const deleted = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning({ id: products.id });
    return deleted.length > 0;
  } catch (error) {
    console.error('Database deleteProduct failed:', error);
    throw new Error('Failed to delete product.', { cause: error });
  }
}

export async function getOrdersWithItems(filters: {
  businessId?: string;
  status?: string;
  paymentStatus?: string;
}) {
  try {
    await ensureCommerceSeeded();
    const businessId = filters.businessId || 'biz_default';

    let orderRows =
      businessId === 'all'
        ? await db.select().from(orders).orderBy(desc(orders.createdAt))
        : await db
            .select()
            .from(orders)
            .where(eq(orders.businessId, businessId))
            .orderBy(desc(orders.createdAt));

    if (filters.status && filters.status !== 'all') {
      orderRows = orderRows.filter((o) => o.fulfillmentStatus === filters.status);
    }
    if (filters.paymentStatus && filters.paymentStatus !== 'all') {
      orderRows = orderRows.filter((o) => o.paymentStatus === filters.paymentStatus);
    }

    const allItems = await db.select().from(orderItems);
    const itemsByOrder = new Map<string, typeof allItems>();
    for (const item of allItems) {
      const list = itemsByOrder.get(item.orderId) || [];
      list.push(item);
      itemsByOrder.set(item.orderId, list);
    }

    return orderRows.map((o) => ({
      ...o,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
      items: itemsByOrder.get(o.id) || [],
    }));
  } catch (error) {
    console.error('Database getOrders failed:', error);
    throw new Error('Failed to load orders.', { cause: error });
  }
}

export async function getOrderByIdOrNumber(idOrNumber: string) {
  try {
    await ensureCommerceSeeded();
    const [order] = await db
      .select()
      .from(orders)
      .where(or(eq(orders.id, idOrNumber), eq(orders.orderNumber, idOrNumber)))
      .limit(1);

    if (!order) return null;
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    return {
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items,
    };
  } catch (error) {
    console.error('Database getOrder failed:', error);
    throw new Error('Failed to load order details.', { cause: error });
  }
}

export async function createOrderRecord(input: {
  businessId: string;
  customer: {
    id?: string;
    fullName: string;
    phone: string;
    email?: string;
    address?: string;
    city?: string;
  };
  items: Array<{
    productId?: string | null;
    title?: string;
    unitPriceNpr?: string | number;
    priceNpr?: string | number;
    quantity?: string | number;
  }>;
  paymentMethod?: string;
  deliveryChargeNpr?: number | string;
  notes?: string;
}) {
  try {
    await ensureCommerceSeeded();

    let subtotal = 0;
    const preparedItems: Array<{
      id: string;
      productId: string | null;
      title: string;
      unitPriceNpr: string;
      quantity: string;
      totalPriceNpr: string;
    }> = [];

    for (const item of input.items) {
      let unitPrice = parseFloat(String(item.unitPriceNpr || item.priceNpr || '0'));
      let resolvedTitle = item.title || 'Product Item';

      if (item.productId) {
        const [prod] = await db
          .select()
          .from(products)
          .where(eq(products.id, item.productId))
          .limit(1);

        if (prod) {
          unitPrice = parseFloat(prod.priceNpr || '0');
          resolvedTitle = prod.title;
          const qtyNum = Math.max(1, parseInt(String(item.quantity || '1'), 10));
          if (prod.trackQuantity) {
            const currentQty = parseInt(prod.inventoryQuantity || '0', 10);
            await db
              .update(products)
              .set({
                inventoryQuantity: String(Math.max(0, currentQty - qtyNum)),
                updatedAt: new Date(),
              })
              .where(eq(products.id, prod.id));
          }
        }
      }

      const qty = Math.max(1, parseInt(String(item.quantity || '1'), 10));
      const totalItemPrice = unitPrice * qty;
      subtotal += totalItemPrice;

      preparedItems.push({
        id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        productId: item.productId || null,
        title: resolvedTitle,
        unitPriceNpr: String(unitPrice),
        quantity: String(qty),
        totalPriceNpr: String(totalItemPrice),
      });
    }

    const deliveryNum = Math.max(0, parseFloat(String(input.deliveryChargeNpr ?? 0)) || 0);
    const totalNpr = subtotal + deliveryNum;

    // Customer upsert by phone within business
    const existingCustomers = await db
      .select()
      .from(customers)
      .where(
        and(eq(customers.businessId, input.businessId), eq(customers.phone, input.customer.phone))
      )
      .limit(1);

    let custId: string;
    if (existingCustomers.length > 0) {
      const existing = existingCustomers[0];
      custId = existing.id;
      await db
        .update(customers)
        .set({
          totalOrders: String(parseInt(existing.totalOrders || '0', 10) + 1),
          totalSpendNpr: String(parseFloat(existing.totalSpendNpr || '0') + totalNpr),
          updatedAt: new Date(),
        })
        .where(eq(customers.id, custId));
    } else {
      custId = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      await db.insert(customers).values({
        id: custId,
        businessId: input.businessId,
        fullName: input.customer.fullName,
        phone: input.customer.phone,
        email: input.customer.email || '',
        address: input.customer.address || '',
        city: input.customer.city || 'Kathmandu',
        totalOrders: '1',
        totalSpendNpr: String(totalNpr),
      });
    }

    const existingOrderCountRows = await db.select({ id: orders.id }).from(orders);
    const orderNumber = `ORD-2081-${1000 + existingOrderCountRows.length + 1}`;
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const [createdOrder] = await db
      .insert(orders)
      .values({
        id: orderId,
        businessId: input.businessId,
        customerId: custId,
        orderNumber,
        subtotalNpr: String(subtotal),
        deliveryChargeNpr: String(deliveryNum),
        discountNpr: '0',
        totalNpr: String(totalNpr),
        paymentMethod: input.paymentMethod || 'cod',
        paymentStatus: 'pending',
        fulfillmentStatus: 'unfulfilled',
        shippingAddress: {
          fullName: input.customer.fullName,
          phone: input.customer.phone,
          address: input.customer.address || 'Kathmandu Valley',
          city: input.customer.city || 'Kathmandu',
        },
        notes: input.notes || '',
      })
      .returning();

    if (preparedItems.length > 0) {
      await db.insert(orderItems).values(
        preparedItems.map((it) => ({
          ...it,
          orderId: createdOrder.id,
        }))
      );
    }

    return {
      ...createdOrder,
      createdAt: createdOrder.createdAt.toISOString(),
      updatedAt: createdOrder.updatedAt.toISOString(),
      items: preparedItems,
    };
  } catch (error) {
    console.error('Database createOrder failed:', error);
    throw new Error('Failed to create order.', { cause: error });
  }
}

export async function updateOrderStatusRecord(
  idOrNumber: string,
  patch: { fulfillmentStatus?: string; paymentStatus?: string; paymentMethod?: string }
) {
  try {
    const [existing] = await db
      .select()
      .from(orders)
      .where(or(eq(orders.id, idOrNumber), eq(orders.orderNumber, idOrNumber)))
      .limit(1);

    if (!existing) return null;

    const [updated] = await db
      .update(orders)
      .set({
        fulfillmentStatus: patch.fulfillmentStatus || existing.fulfillmentStatus,
        paymentStatus: patch.paymentStatus || existing.paymentStatus,
        paymentMethod: patch.paymentMethod || existing.paymentMethod,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, existing.id))
      .returning();

    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, updated.id));

    return {
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      items,
    };
  } catch (error) {
    console.error('Database updateOrderStatus failed:', error);
    throw new Error('Failed to update order status.', { cause: error });
  }
}

export async function recordVerifiedPayment(input: {
  orderIdOrNumber: string;
  gateway: string;
  transactionId: string;
  amountNpr: string | number;
  rawResponse?: Record<string, unknown>;
}) {
  try {
    const existingOrder = await getOrderByIdOrNumber(input.orderIdOrNumber);
    if (!existingOrder) {
      throw new Error(`Order not found for payment reconciliation: ${input.orderIdOrNumber}`);
    }

    const expectedTotal = parseFloat(String(existingOrder.totalNpr || '0'));
    const paidAmount = parseFloat(String(input.amountNpr || '0'));
    if (expectedTotal > 0 && paidAmount + 1 < expectedTotal) {
      throw new Error(
        `Paid amount (NPR ${paidAmount}) is below order total (NPR ${expectedTotal}) for ${existingOrder.orderNumber}`
      );
    }

    // Idempotency guard: avoid inserting duplicate verified payment records for the same transaction
    const existingPayments = await db
      .select()
      .from(payments)
      .where(and(eq(payments.orderId, existingOrder.id), eq(payments.transactionId, input.transactionId)))
      .limit(1);

    const updatedOrder = await updateOrderStatusRecord(existingOrder.id, {
      paymentStatus: 'paid',
      paymentMethod: input.gateway,
    });

    if (existingPayments.length === 0) {
      await db.insert(payments).values({
        id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        orderId: existingOrder.id,
        businessId: existingOrder.businessId,
        gateway: input.gateway,
        transactionId: input.transactionId,
        amountNpr: String(paidAmount || expectedTotal),
        status: 'verified',
        rawResponse: input.rawResponse || {},
        verifiedAt: new Date(),
      });
    }

    return updatedOrder;
  } catch (error) {
    console.error('Database recordVerifiedPayment failed:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to record payment verification.', { cause: error });
  }
}

export async function getCommerceAnalyticsFromDb(businessId = 'biz_default') {
  try {
    await ensureCommerceSeeded();
    const orderRows =
      businessId === 'all'
        ? await db.select().from(orders).orderBy(desc(orders.createdAt))
        : await db
            .select()
            .from(orders)
            .where(eq(orders.businessId, businessId))
            .orderBy(desc(orders.createdAt));

    const productRows =
      businessId === 'all'
        ? await db.select().from(products)
        : await db.select().from(products).where(eq(products.businessId, businessId));

    const paidOrders = orderRows.filter((o) => o.paymentStatus === 'paid');
    const totalRevenueNpr = paidOrders.reduce((sum, o) => sum + parseFloat(o.totalNpr || '0'), 0);
    const pendingRevenueNpr = orderRows
      .filter((o) => o.paymentStatus === 'pending')
      .reduce((sum, o) => sum + parseFloat(o.totalNpr || '0'), 0);

    return {
      success: true,
      totalOrders: orderRows.length,
      totalRevenueNpr,
      pendingRevenueNpr,
      totalProducts: productRows.length,
      averageOrderValueNpr:
        orderRows.length > 0 ? Math.round(totalRevenueNpr / (paidOrders.length || 1)) : 0,
      gateways: {
        esewa: orderRows.filter((o) => o.paymentMethod === 'esewa').length,
        khalti: orderRows.filter((o) => o.paymentMethod === 'khalti').length,
        fonepay: orderRows.filter((o) => o.paymentMethod === 'fonepay').length,
        cod: orderRows.filter((o) => o.paymentMethod === 'cod').length,
      },
      fulfillment: {
        unfulfilled: orderRows.filter((o) => o.fulfillmentStatus === 'unfulfilled').length,
        processing: orderRows.filter((o) => o.fulfillmentStatus === 'processing').length,
        dispatched: orderRows.filter((o) => o.fulfillmentStatus === 'dispatched').length,
        delivered: orderRows.filter((o) => o.fulfillmentStatus === 'delivered').length,
      },
      currency: 'NPR',
      vatIncluded: true,
      lastOrderAt: orderRows[0]?.createdAt?.toISOString() || null,
    };
  } catch (error) {
    console.error('Database getCommerceAnalytics failed:', error);
    throw new Error('Failed to load commerce analytics.', { cause: error });
  }
}

export async function getPublicStoreBySlug(slug: string) {
  try {
    await ensureCommerceSeeded();
    const [matchedStore] = await db
      .select()
      .from(businesses)
      .where(or(eq(businesses.slug, slug), eq(businesses.id, slug)))
      .limit(1);

    const store =
      matchedStore ||
      (await db.select().from(businesses).where(eq(businesses.id, 'biz_default')).limit(1))[0];

    const storeId = store?.id || 'biz_default';
    const storeCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.businessId, storeId));
    const activeProducts = await db
      .select()
      .from(products)
      .where(and(eq(products.businessId, storeId), eq(products.status, 'active')));

    return {
      matchedBySlug: Boolean(matchedStore),
      store: store || {
        id: 'biz_default',
        slug: slug || 'himalayan-coffee',
        name: 'Himalayan Sovereign Organic Store',
        description:
          'Direct mountain farm products, handloom crafts, and Devanagari sovereign devices with instant eSewa & Khalti settlement.',
        panNumber: '609812453',
        isVatRegistered: true,
        phone: '+977 9841234567',
        email: 'store@nepalai.tech',
        address: 'Ward No. 3, Patan Dhoka, Lalitpur, Nepal',
        bannerUrl: '/api/storage/mock-media?key=banners/store-banner.jpg',
        logoUrl: '/api/storage/mock-media?key=logos/store-logo.jpg',
        currency: 'NPR',
        tier: 'growth',
      },
      categories: storeCategories,
      products: activeProducts,
    };
  } catch (error) {
    console.error('Database getPublicStoreBySlug failed:', error);
    throw new Error('Failed to load storefront.', { cause: error });
  }
}

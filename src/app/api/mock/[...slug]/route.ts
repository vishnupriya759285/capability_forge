import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/api/mock-api';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  const slug = params.slug || [];
  const [resource, id, subresource] = slug;

  // Simulate timeout test if requested
  if (id === 'timeout_test' || resource === 'timeout_test') {
    await new Promise((resolve) => setTimeout(resolve, 3500));
    return NextResponse.json({ error: 'Gateway Timeout' }, { status: 504 });
  }

  // Customers
  if (resource === 'customers') {
    if (!id) {
      return NextResponse.json(mockDb.listCustomers());
    }
    const customer = mockDb.getCustomer(id);
    if (!customer) {
      return NextResponse.json({ error: `Customer '${id}' not found` }, { status: 404 });
    }
    return NextResponse.json(customer);
  }

  // Orders
  if (resource === 'orders') {
    if (!id) {
      return NextResponse.json(mockDb.listOrders());
    }
    if (subresource === 'items') {
      const items = mockDb.getOrderItems(id);
      if (!items) {
        return NextResponse.json({ error: `Order '${id}' items not found` }, { status: 404 });
      }
      return NextResponse.json(items);
    }
    const order = mockDb.getOrder(id);
    if (!order) {
      return NextResponse.json({ error: `Order '${id}' not found` }, { status: 404 });
    }
    return NextResponse.json(order);
  }

  // Shipping
  if (resource === 'shipping') {
    if (!id) {
      return NextResponse.json({ error: 'Order ID is required for shipping lookups' }, { status: 400 });
    }
    const shipping = mockDb.getShipping(id);
    if (!shipping) {
      return NextResponse.json({ error: `Shipping details for order '${id}' not found` }, { status: 404 });
    }
    return NextResponse.json(shipping);
  }

  // Products
  if (resource === 'products') {
    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }
    const product = mockDb.getProduct(id);
    if (!product) {
      return NextResponse.json({ error: `Product '${id}' not found` }, { status: 404 });
    }
    return NextResponse.json(product);
  }

  // Inventory
  if (resource === 'inventory') {
    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }
    const inventory = mockDb.getInventory(id);
    if (!inventory) {
      return NextResponse.json({ error: `Inventory record for '${id}' not found` }, { status: 404 });
    }
    return NextResponse.json(inventory);
  }

  // Refund Policy
  if (resource === 'refund-policy') {
    return NextResponse.json(mockDb.getRefundPolicy());
  }

  return NextResponse.json({ error: `Unknown mock route: /${slug.join('/')}` }, { status: 404 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  const slug = params.slug || [];
  const [resource, id, subresource] = slug;

  let body: any = {};
  try {
    body = await request.json();
  } catch (e) {
    // Empty body is allowed for some routes
  }

  // POST /refund
  if (resource === 'refund') {
    if (!body.order_id || !body.amount) {
      return NextResponse.json(
        { error: 'Missing required refund fields: order_id, amount' },
        { status: 400 }
      );
    }
    const refund = mockDb.createRefund({
      order_id: body.order_id,
      amount: Number(body.amount),
      reason: body.reason || 'Requested customer refund',
      authorization_mode: body.authorization_mode || 'HUMAN_APPROVED',
    });
    return NextResponse.json(refund, { status: 201 });
  }

  // POST /orders/:id/cancel
  if (resource === 'orders' && id && subresource === 'cancel') {
    const cancelled = mockDb.cancelOrder(id);
    if (!cancelled) {
      return NextResponse.json({ error: `Order '${id}' not found to cancel` }, { status: 404 });
    }
    return NextResponse.json(cancelled);
  }

  return NextResponse.json({ error: `Method POST not supported for /${slug.join('/')}` }, { status: 405 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  const slug = params.slug || [];
  const [resource, id] = slug;

  if (resource === 'orders' && id) {
    const deleted = mockDb.deleteOrder(id);
    if (!deleted) {
      return NextResponse.json({ error: `Order '${id}' not found` }, { status: 404 });
    }
    return NextResponse.json({ message: `Order '${id}' purged successfully` });
  }

  return NextResponse.json({ error: `Method DELETE not supported for /${slug.join('/')}` }, { status: 405 });
}

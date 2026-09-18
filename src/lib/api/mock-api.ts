// In-memory deterministic mock API database and handlers

export interface MockCustomer {
  id: string;
  name: string;
  email: string;
  tier: string;
}

export interface MockOrder {
  id: string;
  customer_id: string;
  customer_name: string;
  order_date: string;
  status: string;
  total_amount: number;
  items: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    price: number;
  }>;
}

export interface MockShipping {
  order_id: string;
  carrier: string;
  tracking_number: string;
  status: string;
  expected_delivery: string;
  last_checkpoint: string;
  days_delayed: number;
}

export interface MockProduct {
  id: string;
  name: string;
  sku: string;
  price: number;
}

export interface MockInventory {
  product_id: string;
  in_stock: boolean;
  available_quantity: number;
  warehouse_location: string;
}

export interface MockRefundPolicy {
  policy_id: string;
  max_delay_threshold_days: number;
  eligible_conditions: string[];
  auto_approval_limit: number;
  human_approval_required_for_financial: boolean;
}

export interface MockRefundConfirmation {
  refund_id: string;
  order_id: string;
  amount: number;
  status: string;
  processed_at: string;
  authorization_mode: 'HUMAN_APPROVED' | 'DIRECT_EXECUTION';
}

class MockApiDatabase {
  private customers: Map<string, MockCustomer> = new Map();
  private orders: Map<string, MockOrder> = new Map();
  private shipping: Map<string, MockShipping> = new Map();
  private products: Map<string, MockProduct> = new Map();
  private inventory: Map<string, MockInventory> = new Map();
  private refundPolicy: MockRefundPolicy;
  private refunds: Map<string, MockRefundConfirmation> = new Map();

  constructor() {
    this.refundPolicy = {
      policy_id: 'POL-REF-2026-V1',
      max_delay_threshold_days: 3,
      eligible_conditions: [
        'Delivery delayed by more than 3 days beyond promised delivery date',
        'Package confirmed lost in transit by carrier',
        'Customer received wrong or damaged goods'
      ],
      auto_approval_limit: 0,
      human_approval_required_for_financial: true,
    };
    this.resetToDefaults();
  }

  public resetToDefaults() {
    this.customers.clear();
    this.orders.clear();
    this.shipping.clear();
    this.products.clear();
    this.inventory.clear();
    this.refunds.clear();

    // Primary Demo Customer: Ananya
    this.customers.set('cust_ananya_99', {
      id: 'cust_ananya_99',
      name: 'Ananya',
      email: 'ananya.sharma@example.com',
      tier: 'Gold Customer',
    });

    // Secondary Customer
    this.customers.set('cust_marcus_42', {
      id: 'cust_marcus_42',
      name: 'Marcus Vance',
      email: 'm.vance@example.org',
      tier: 'Standard',
    });

    // Products
    this.products.set('prod_audio_01', {
      id: 'prod_audio_01',
      name: 'Wireless Noise-Canceling Headphones',
      sku: 'WNC-HEADPHONE-BLK',
      price: 129.99,
    });

    this.products.set('prod_charge_02', {
      id: 'prod_charge_02',
      name: 'Fast GaN USB-C Charger 65W',
      sku: 'GAN-65W-WHITE',
      price: 39.99,
    });

    // Inventory
    this.inventory.set('prod_audio_01', {
      product_id: 'prod_audio_01',
      in_stock: true,
      available_quantity: 42,
      warehouse_location: 'East Coast Distribution Center - Bay 14',
    });

    this.inventory.set('prod_charge_02', {
      product_id: 'prod_charge_02',
      in_stock: true,
      available_quantity: 180,
      warehouse_location: 'Central Fulfillment Hub - Aisle 3',
    });

    // Hero Order #4821: Ananya's Wireless Headphones (DELAYED)
    this.orders.set('4821', {
      id: '4821',
      customer_id: 'cust_ananya_99',
      customer_name: 'Ananya',
      order_date: '2026-09-10',
      status: 'PROCESSING',
      total_amount: 129.99,
      items: [
        {
          product_id: 'prod_audio_01',
          product_name: 'Wireless Noise-Canceling Headphones',
          quantity: 1,
          price: 129.99,
        },
      ],
    });

    // Hero Shipping for #4821
    this.shipping.set('4821', {
      order_id: '4821',
      carrier: 'SwiftLogistics Express',
      tracking_number: 'SWIFT-98214-US',
      status: 'DELAYED',
      expected_delivery: '2026-09-15',
      last_checkpoint: 'Regional Sorting Center (Transit backlog delayed delivery by 6 days)',
      days_delayed: 6, // Exceeds 3 days policy threshold
    });

    // Order #1001: On-time order for testing
    this.orders.set('1001', {
      id: '1001',
      customer_id: 'cust_marcus_42',
      customer_name: 'Marcus Vance',
      order_date: '2026-09-18',
      status: 'SHIPPED',
      total_amount: 39.99,
      items: [
        {
          product_id: 'prod_charge_02',
          product_name: 'Fast GaN USB-C Charger 65W',
          quantity: 1,
          price: 39.99,
        },
      ],
    });

    this.shipping.set('1001', {
      order_id: '1001',
      carrier: 'SwiftLogistics Express',
      tracking_number: 'SWIFT-10018-US',
      status: 'ON_TIME',
      expected_delivery: '2026-09-22',
      last_checkpoint: 'Departed sorting facility',
      days_delayed: 0,
    });
  }

  // Query Methods
  public getCustomer(id: string): MockCustomer | null {
    return this.customers.get(id) || null;
  }

  public listCustomers(): MockCustomer[] {
    return Array.from(this.customers.values());
  }

  public getOrder(id: string): MockOrder | null {
    return this.orders.get(id) || null;
  }

  public listOrders(): MockOrder[] {
    return Array.from(this.orders.values());
  }

  public getOrderItems(id: string): any[] | null {
    const order = this.orders.get(id);
    return order ? order.items : null;
  }

  public getShipping(orderId: string): MockShipping | null {
    return this.shipping.get(orderId) || null;
  }

  public getProduct(id: string): MockProduct | null {
    return this.products.get(id) || null;
  }

  public getInventory(productId: string): MockInventory | null {
    return this.inventory.get(productId) || null;
  }

  public getRefundPolicy(): MockRefundPolicy {
    return this.refundPolicy;
  }

  public createRefund(payload: {
    order_id: string;
    amount: number;
    reason: string;
    authorization_mode?: 'HUMAN_APPROVED' | 'DIRECT_EXECUTION';
  }): MockRefundConfirmation {
    const refundId = `REF-9021`;
    const confirmation: MockRefundConfirmation = {
      refund_id: refundId,
      order_id: payload.order_id,
      amount: payload.amount,
      status: 'PROCESSED',
      processed_at: new Date().toISOString(),
      authorization_mode: payload.authorization_mode || 'HUMAN_APPROVED',
    };
    this.refunds.set(payload.order_id, confirmation);
    return confirmation;
  }

  public cancelOrder(id: string): { order_id: string; status: string } | null {
    const order = this.orders.get(id);
    if (!order) return null;
    order.status = 'CANCELLED';
    return { order_id: id, status: 'CANCELLED' };
  }

  public deleteOrder(id: string): boolean {
    return this.orders.delete(id);
  }
}

// Global Singleton Instance
export const mockDb = new MockApiDatabase();

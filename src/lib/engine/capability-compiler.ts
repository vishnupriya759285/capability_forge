import {
  Capability,
  CapabilityContract,
  CapabilityStep,
  RiskLevel,
} from '@/lib/types';
import { RiskEngine } from './risk-engine';
import { capabilityStore } from './capability-store';

export class CapabilityCompiler {
  /**
   * Compile a full capability specification from candidate ID
   */
  public static compile(capabilityId: string): Capability {
    const fromStore = capabilityStore.getCapability(capabilityId);
    if (fromStore) return fromStore;

    switch (capabilityId) {
      case 'order_pet_safely':
        return this.compileOrderPetSafely();
      case 'triage_and_respond_issue':
        return this.compileTriageGitHubIssue();
      case 'process_invoice_payment':
        return this.compileProcessInvoicePayment();
      case 'resolve_customer_order':
        return this.compileResolveCustomerOrder();
      case 'track_shipment':
        return this.compileTrackShipment();
      case 'check_product_availability':
        return this.compileCheckProductAvailability();
      case 'cancel_order':
        return this.compileCancelOrder();
      case 'check_refund_eligibility':
        return this.compileCheckRefundEligibility();
      default:
        const first = capabilityStore.getCapabilities()[0];
        if (first) return first;
        return this.compileOrderPetSafely();
    }
  }

  /**
   * Hero E-Commerce capability: resolve_customer_order
   */
  private static compileResolveCustomerOrder(): Capability {
    const steps: CapabilityStep[] = [
      {
        id: 'step_1_order',
        name: 'get_order',
        type: 'API_CALL',
        endpointId: 'get_order',
        method: 'GET',
        path: '/orders/{id}',
        description: 'Fetch customer order details, line items, and purchase dates',
      },
      {
        id: 'step_2_shipping',
        name: 'get_shipping',
        type: 'API_CALL',
        endpointId: 'get_shipping',
        method: 'GET',
        path: '/shipping/{orderId}',
        description: 'Retrieve real-time tracking data and calculate delivery delay in days',
      },
      {
        id: 'step_3_policy',
        name: 'get_refund_policy',
        type: 'API_CALL',
        endpointId: 'get_refund_policy',
        method: 'GET',
        path: '/refund-policy',
        description: 'Load store refund policy rules and delay threshold constraints',
      },
      {
        id: 'step_4_logic',
        name: 'evaluate_refund_eligibility',
        type: 'LOGIC',
        description: 'Compute if shipment days_delayed exceeds max_delay_threshold_days',
      },
      {
        id: 'step_5_approval',
        name: 'request_human_approval',
        type: 'APPROVAL_GUARD',
        requiresHumanApproval: true,
        description: 'Pause execution to request operator authorization before executing financial write',
      },
      {
        id: 'step_6_refund',
        name: 'create_refund',
        type: 'MUTATION',
        endpointId: 'create_refund',
        method: 'POST',
        path: '/refund',
        description: 'Issue official monetary refund and register transaction confirmation ID',
      },
    ];

    const contract: CapabilityContract = {
      name: 'resolve_customer_order',
      purpose: 'Resolve delivery status and refund questions for a customer order with safety-first human approval.',
      inputs: {
        order_id: {
          type: 'string',
          required: true,
          description: 'Unique identifier for the order',
          example: '1001',
        },
      },
      output: {
        order_status: { type: 'string', description: 'Current status of order' },
        shipping_status: { type: 'string', description: 'Logistics tracking status' },
        days_delayed: { type: 'number', description: 'Total days shipment has been delayed' },
        refund_eligible: { type: 'boolean', description: 'Whether the order qualifies for a full refund' },
        reason: { type: 'string', description: 'Plain English reason for eligibility verdict' },
        recommended_action: { type: 'string', description: 'Next operational recommendation' },
        refund_confirmation: { type: 'object', description: 'Generated refund transaction details if approved' },
      },
      permissions: {
        read: ['orders', 'shipping', 'refund-policy'],
        write: ['refund'],
      },
      risk: 'MEDIUM',
      humanApprovalRequired: true,
      approvalReason: 'Capability can initiate a financial action (monetary customer refund).',
      endpointsUsed: ['/orders/{id}', '/shipping/{orderId}', '/refund-policy', '/refund'],
      totalTests: 9,
      status: 'VERIFIED',
    };

    return {
      id: 'resolve_customer_order',
      name: 'resolve_customer_order',
      description: 'Resolve delivery and refund questions for a customer order with safety guards.',
      status: 'VERIFIED',
      risk: 'MEDIUM',
      humanApprovalRequired: true,
      contract,
      steps,
      endpoints: ['/orders/{id}', '/shipping/{orderId}', '/refund-policy', '/refund'],
      evaluationSummary: {
        total: 9,
        passed: 9,
        failed: 0,
        lastRun: new Date().toISOString(),
      },
    };
  }

  /**
   * Real-world Petstore capability: order_pet_safely
   */
  private static compileOrderPetSafely(): Capability {
    const steps: CapabilityStep[] = [
      {
        id: 'step_1_pet',
        name: 'get_pet_details',
        type: 'API_CALL',
        endpointId: 'getPetById',
        method: 'GET',
        path: '/pet/{petId}',
        description: 'Verify pet status, breed, and health details',
      },
      {
        id: 'step_2_inventory',
        name: 'check_store_inventory',
        type: 'API_CALL',
        endpointId: 'getInventory',
        method: 'GET',
        path: '/store/inventory',
        description: 'Verify shelter capacity and stock levels before order creation',
      },
      {
        id: 'step_3_approval',
        name: 'request_human_approval',
        type: 'APPROVAL_GUARD',
        requiresHumanApproval: true,
        description: 'Confirm adoption placement and pricing with store manager',
      },
      {
        id: 'step_4_order',
        name: 'place_order',
        type: 'MUTATION',
        endpointId: 'placeOrder',
        method: 'POST',
        path: '/store/order',
        description: 'Record confirmed pet adoption purchase order',
      },
    ];

    const contract: CapabilityContract = {
      name: 'order_pet_safely',
      purpose: 'Verify pet availability and shelter inventory before issuing an adoption order.',
      inputs: {
        pet_id: { type: 'string', required: true, description: 'Pet ID in catalog (e.g. 1)' },
        quantity: { type: 'number', required: false, description: 'Quantity (default 1)' },
      },
      output: {
        pet_status: { type: 'string', description: 'Pet status (available/pending/sold)' },
        inventory_checked: { type: 'boolean', description: 'Whether inventory was verified' },
        order_status: { type: 'string', description: 'Resulting order status' },
      },
      permissions: {
        read: ['pet', 'store'],
        write: ['store/order'],
      },
      risk: 'MEDIUM',
      humanApprovalRequired: true,
      approvalReason: 'Order placement commits shelter resources and customer invoice.',
      endpointsUsed: ['/pet/{petId}', '/store/inventory', '/store/order'],
      totalTests: 6,
      status: 'VERIFIED',
    };

    return {
      id: 'order_pet_safely',
      name: 'order_pet_safely',
      description: 'Check pet availability and store inventory before safely placing a purchase order.',
      status: 'VERIFIED',
      risk: 'MEDIUM',
      humanApprovalRequired: true,
      contract,
      steps,
      endpoints: ['/pet/{petId}', '/store/inventory', '/store/order'],
      evaluationSummary: { total: 6, passed: 6, failed: 0 },
    };
  }

  /**
   * Real-world GitHub capability: triage_and_respond_issue
   */
  private static compileTriageGitHubIssue(): Capability {
    const steps: CapabilityStep[] = [
      {
        id: 'step_1_issue',
        name: 'get_issue',
        type: 'API_CALL',
        endpointId: 'get_issue',
        method: 'GET',
        path: '/repos/{owner}/{repo}/issues/{issue_number}',
        description: 'Fetch issue title, state, and author details',
      },
      {
        id: 'step_2_comments',
        name: 'list_issue_comments',
        type: 'API_CALL',
        endpointId: 'list_issue_comments',
        method: 'GET',
        path: '/repos/{owner}/{repo}/issues/{issue_number}/comments',
        description: 'Review discussion history to avoid duplicate replies',
      },
      {
        id: 'step_3_approval',
        name: 'request_human_approval',
        type: 'APPROVAL_GUARD',
        requiresHumanApproval: true,
        description: 'Review proposed public AI response before posting to GitHub',
      },
      {
        id: 'step_4_comment',
        name: 'create_issue_comment',
        type: 'MUTATION',
        endpointId: 'create_issue_comment',
        method: 'POST',
        path: '/repos/{owner}/{repo}/issues/{issue_number}/comments',
        description: 'Publish verified response to repository issue thread',
      },
    ];

    const contract: CapabilityContract = {
      name: 'triage_and_respond_issue',
      purpose: 'Review GitHub issue context and post an approved triage response.',
      inputs: {
        owner: { type: 'string', required: true, description: 'Repository owner (e.g. facebook)' },
        repo: { type: 'string', required: true, description: 'Repository name (e.g. react)' },
        issue_number: { type: 'number', required: true, description: 'Issue or PR number (e.g. 1042)' },
      },
      output: {
        issue_state: { type: 'string', description: 'State of the issue (open/closed)' },
        comment_posted: { type: 'boolean', description: 'Whether comment was published' },
        comment_id: { type: 'string', description: 'Public comment ID' },
      },
      permissions: {
        read: ['repos', 'issues'],
        write: ['comments'],
      },
      risk: 'MEDIUM',
      humanApprovalRequired: true,
      approvalReason: 'Posting public comments on GitHub impacts project reputation.',
      endpointsUsed: ['/repos/{owner}/{repo}/issues/{issue_number}', '/repos/{owner}/{repo}/issues/{issue_number}/comments'],
      totalTests: 5,
      status: 'VERIFIED',
    };

    return {
      id: 'triage_and_respond_issue',
      name: 'triage_and_respond_issue',
      description: 'Fetch repository issue metadata, review discussion, and post an approved triage response.',
      status: 'VERIFIED',
      risk: 'MEDIUM',
      humanApprovalRequired: true,
      contract,
      steps,
      endpoints: ['/repos/{owner}/{repo}/issues/{issue_number}', '/repos/{owner}/{repo}/issues/{issue_number}/comments'],
      evaluationSummary: { total: 5, passed: 5, failed: 0 },
    };
  }

  /**
   * Real-world Stripe capability: process_invoice_payment
   */
  private static compileProcessInvoicePayment(): Capability {
    const steps: CapabilityStep[] = [
      {
        id: 'step_1_customer',
        name: 'get_customer',
        type: 'API_CALL',
        endpointId: 'get_customer',
        method: 'GET',
        path: '/customers/{customer_id}',
        description: 'Verify customer billing entity and active payment methods',
      },
      {
        id: 'step_2_invoices',
        name: 'list_invoices',
        type: 'API_CALL',
        endpointId: 'list_invoices',
        method: 'GET',
        path: '/invoices',
        description: 'Retrieve pending unpaid invoices for account',
      },
      {
        id: 'step_3_approval',
        name: 'request_human_approval',
        type: 'APPROVAL_GUARD',
        requiresHumanApproval: true,
        description: 'Confirm monetary charge authorization with financial controller',
      },
      {
        id: 'step_4_pay',
        name: 'pay_invoice',
        type: 'MUTATION',
        endpointId: 'pay_invoice',
        method: 'POST',
        path: '/invoices/{invoice_id}/pay',
        description: 'Execute charge transaction and close invoice',
      },
    ];

    const contract: CapabilityContract = {
      name: 'process_invoice_payment',
      purpose: 'Review pending customer invoice and authorize payment charge with human sign-off.',
      inputs: {
        customer_id: { type: 'string', required: true, description: 'Customer identifier (e.g. cus_982)' },
        invoice_id: { type: 'string', required: true, description: 'Target invoice identifier' },
      },
      output: {
        customer_name: { type: 'string', description: 'Customer billing name' },
        invoice_status: { type: 'string', description: 'Resulting payment status (paid)' },
        charge_amount: { type: 'number', description: 'Amount charged' },
      },
      permissions: {
        read: ['customers', 'invoices'],
        write: ['invoices/pay'],
      },
      risk: 'HIGH',
      humanApprovalRequired: true,
      approvalReason: 'Financial mutation executes real credit card charge.',
      endpointsUsed: ['/customers/{customer_id}', '/invoices', '/invoices/{invoice_id}/pay'],
      totalTests: 7,
      status: 'VERIFIED',
    };

    return {
      id: 'process_invoice_payment',
      name: 'process_invoice_payment',
      description: 'Retrieve customer account, inspect invoice line items, and authorize payment with human sign-off.',
      status: 'VERIFIED',
      risk: 'HIGH',
      humanApprovalRequired: true,
      contract,
      steps,
      endpoints: ['/customers/{customer_id}', '/invoices', '/invoices/{invoice_id}/pay'],
      evaluationSummary: { total: 7, passed: 7, failed: 0 },
    };
  }

  private static compileTrackShipment(): Capability {
    const steps: CapabilityStep[] = [
      {
        id: 'step_1_order',
        name: 'get_order',
        type: 'API_CALL',
        endpointId: 'get_order',
        method: 'GET',
        path: '/orders/{id}',
        description: 'Verify order existence and recipient details',
      },
      {
        id: 'step_2_shipping',
        name: 'get_shipping',
        type: 'API_CALL',
        endpointId: 'get_shipping',
        method: 'GET',
        path: '/shipping/{orderId}',
        description: 'Fetch carrier tracking details, checkpoints, and arrival estimates',
      },
    ];

    const contract: CapabilityContract = {
      name: 'track_shipment',
      purpose: 'Retrieve live carrier shipment tracking information.',
      inputs: {
        order_id: { type: 'string', required: true, description: 'Order ID' },
      },
      output: {
        carrier: { type: 'string', description: 'Logistics provider' },
        tracking_number: { type: 'string', description: 'Tracking code' },
        status: { type: 'string', description: 'Shipment milestone' },
        expected_delivery: { type: 'string', description: 'Estimated delivery date' },
      },
      permissions: {
        read: ['orders', 'shipping'],
        write: [],
      },
      risk: 'LOW',
      humanApprovalRequired: false,
      endpointsUsed: ['/orders/{id}', '/shipping/{orderId}'],
      totalTests: 5,
      status: 'VERIFIED',
    };

    return {
      id: 'track_shipment',
      name: 'track_shipment',
      description: 'Track customer order shipment and delivery checkpoints.',
      status: 'VERIFIED',
      risk: 'LOW',
      humanApprovalRequired: false,
      contract,
      steps,
      endpoints: ['/orders/{id}', '/shipping/{orderId}'],
      evaluationSummary: { total: 5, passed: 5, failed: 0 },
    };
  }

  private static compileCheckProductAvailability(): Capability {
    const steps: CapabilityStep[] = [
      {
        id: 'step_1_product',
        name: 'get_product',
        type: 'API_CALL',
        method: 'GET',
        path: '/products/{id}',
        description: 'Retrieve product specifications and SKU',
      },
      {
        id: 'step_2_inventory',
        name: 'get_inventory',
        type: 'API_CALL',
        method: 'GET',
        path: '/inventory/{productId}',
        description: 'Query warehouse stock count',
      },
    ];

    const contract: CapabilityContract = {
      name: 'check_product_availability',
      purpose: 'Verify warehouse stock inventory for a product.',
      inputs: {
        product_id: { type: 'string', required: true, description: 'Product ID' },
      },
      output: {
        product_name: { type: 'string', description: 'Product Name' },
        in_stock: { type: 'boolean', description: 'Availability status' },
        available_quantity: { type: 'number', description: 'Stock quantity' },
      },
      permissions: {
        read: ['products', 'inventory'],
        write: [],
      },
      risk: 'LOW',
      humanApprovalRequired: false,
      endpointsUsed: ['/products/{id}', '/inventory/{productId}'],
      totalTests: 3,
      status: 'VERIFIED',
    };

    return {
      id: 'check_product_availability',
      name: 'check_product_availability',
      description: 'Check warehouse stock availability for an item.',
      status: 'VERIFIED',
      risk: 'LOW',
      humanApprovalRequired: false,
      contract,
      steps,
      endpoints: ['/products/{id}', '/inventory/{productId}'],
      evaluationSummary: { total: 3, passed: 3, failed: 0 },
    };
  }

  private static compileCancelOrder(): Capability {
    const steps: CapabilityStep[] = [
      {
        id: 'step_1_order',
        name: 'get_order',
        type: 'API_CALL',
        method: 'GET',
        path: '/orders/{id}',
        description: 'Fetch order and check if already shipped',
      },
      {
        id: 'step_2_approval',
        name: 'request_human_approval',
        type: 'APPROVAL_GUARD',
        requiresHumanApproval: true,
        description: 'Require operator approval to cancel active order',
      },
      {
        id: 'step_3_cancel',
        name: 'cancel_order',
        type: 'MUTATION',
        method: 'POST',
        path: '/orders/{id}/cancel',
        description: 'Execute cancellation',
      },
    ];

    const contract: CapabilityContract = {
      name: 'cancel_order',
      purpose: 'Cancel an order before fulfillment.',
      inputs: {
        order_id: { type: 'string', required: true, description: 'Order ID' },
      },
      output: {
        status: { type: 'string', description: 'Resulting order status' },
      },
      permissions: {
        read: ['orders'],
        write: ['orders'],
      },
      risk: 'MEDIUM',
      humanApprovalRequired: true,
      approvalReason: 'Order cancellation stops shipment processing.',
      endpointsUsed: ['/orders/{id}', '/orders/{id}/cancel'],
      totalTests: 3,
      status: 'COMPILED',
    };

    return {
      id: 'cancel_order',
      name: 'cancel_order',
      description: 'Validate and cancel an unfulfilled customer order.',
      status: 'COMPILED',
      risk: 'MEDIUM',
      humanApprovalRequired: true,
      contract,
      steps,
      endpoints: ['/orders/{id}', '/orders/{id}/cancel'],
      evaluationSummary: { total: 3, passed: 3, failed: 0 },
    };
  }

  private static compileCheckRefundEligibility(): Capability {
    const steps: CapabilityStep[] = [
      {
        id: 'step_1_order',
        name: 'get_order',
        type: 'API_CALL',
        method: 'GET',
        path: '/orders/{id}',
        description: 'Lookup order info',
      },
      {
        id: 'step_2_shipping',
        name: 'get_shipping',
        type: 'API_CALL',
        method: 'GET',
        path: '/shipping/{orderId}',
        description: 'Check shipping delay metrics',
      },
      {
        id: 'step_3_policy',
        name: 'get_refund_policy',
        type: 'API_CALL',
        method: 'GET',
        path: '/refund-policy',
        description: 'Query company refund policies',
      },
      {
        id: 'step_4_logic',
        name: 'evaluate_refund_eligibility',
        type: 'LOGIC',
        description: 'Calculate eligibility without mutating state',
      },
    ];

    const contract: CapabilityContract = {
      name: 'check_refund_eligibility',
      purpose: 'Evaluate customer refund eligibility in read-only mode.',
      inputs: {
        order_id: { type: 'string', required: true, description: 'Order ID' },
      },
      output: {
        refund_eligible: { type: 'boolean', description: 'Eligibility flag' },
        reason: { type: 'string', description: 'Detailed justification' },
      },
      permissions: {
        read: ['orders', 'shipping', 'refund-policy'],
        write: [],
      },
      risk: 'LOW',
      humanApprovalRequired: false,
      endpointsUsed: ['/orders/{id}', '/shipping/{orderId}', '/refund-policy'],
      totalTests: 4,
      status: 'VERIFIED',
    };

    return {
      id: 'check_refund_eligibility',
      name: 'check_refund_eligibility',
      description: 'Check if an order is eligible for refund without issuing funds.',
      status: 'VERIFIED',
      risk: 'LOW',
      humanApprovalRequired: false,
      contract,
      steps,
      endpoints: ['/orders/{id}', '/shipping/{orderId}', '/refund-policy'],
      evaluationSummary: { total: 4, passed: 4, failed: 0 },
    };
  }

  /**
   * Return all compiled capabilities available in the platform
   */
  public static listCompiledCapabilities(): Capability[] {
    return capabilityStore.getCapabilities();
  }
}

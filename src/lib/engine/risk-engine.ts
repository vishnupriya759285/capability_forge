import { HttpMethod, RiskLevel } from '@/lib/types';

export interface RiskEvaluation {
  risk: RiskLevel;
  requiresHumanApproval: boolean;
  reason: string;
  permissions: {
    read: string[];
    write: string[];
    destructive?: string[];
  };
}

export class RiskEngine {
  /**
   * Evaluate risk level and approval requirement for an operation or capability
   */
  public static evaluate(
    endpoints: Array<{ method: HttpMethod; path: string; resource: string }>
  ): RiskEvaluation {
    const reads: string[] = [];
    const writes: string[] = [];
    const destructive: string[] = [];

    let highestRisk: RiskLevel = 'LOW';
    let requiresApproval = false;
    let reason = 'Capability is read-only and queries non-sensitive state.';

    for (const ep of endpoints) {
      if (ep.method === 'GET') {
        if (!reads.includes(ep.resource)) reads.push(ep.resource);
      } else if (ep.method === 'DELETE') {
        if (!destructive.includes(ep.resource)) destructive.push(ep.resource);
        highestRisk = 'HIGH';
        requiresApproval = true;
        reason = `Destructive action: removes ${ep.resource} records permanently.`;
      } else if (['POST', 'PUT', 'PATCH'].includes(ep.method)) {
        if (!writes.includes(ep.resource)) writes.push(ep.resource);
        if (highestRisk !== 'HIGH') {
          highestRisk = 'MEDIUM';
        }
        if (ep.path.includes('refund') || ep.path.includes('payment')) {
          requiresApproval = true;
          reason = 'Capability can initiate a financial transaction (monetary refund).';
        } else if (ep.path.includes('cancel')) {
          requiresApproval = true;
          reason = 'Capability can alter order lifecycle status to CANCELLED.';
        }
      }
    }

    return {
      risk: highestRisk,
      requiresHumanApproval: requiresApproval,
      reason,
      permissions: {
        read: reads,
        write: writes,
        destructive: destructive.length > 0 ? destructive : undefined,
      },
    };
  }

  /**
   * Enforce security guard check before invoking an action
   */
  public static checkActionGuard(
    actionType: string,
    isHumanApproved: boolean,
    bypassGuard = false
  ): { allowed: boolean; violationReason?: string } {
    // In chaos mode, if bypassGuard is true, guard is skipped (this is the demo bug)
    if (bypassGuard) {
      return { allowed: true };
    }

    if (actionType === 'REFUND' || actionType === 'POST_REFUND') {
      if (!isHumanApproved) {
        return {
          allowed: false,
          violationReason: 'Execution halted: POST /refund requires explicit human operator approval.',
        };
      }
    }

    return { allowed: true };
  }
}

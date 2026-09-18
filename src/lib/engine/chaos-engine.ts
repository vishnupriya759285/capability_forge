// Chaos / Demo Bug Injection Engine

export interface ChaosState {
  isBroken: boolean;
  bugType: 'MISSING_APPROVAL_GUARD' | 'SCHEMA_CORRUPTION' | 'NONE';
  description: string;
  affectedFile: string;
  expectedBehavior: string;
  actualBehavior: string;
  failedTestIndex: number;
}

class ChaosEngineSingleton {
  private state: ChaosState = {
    isBroken: false,
    bugType: 'NONE',
    description: 'Capability integrity verified. All security guards active.',
    affectedFile: 'src/lib/engine/workflow-executor.ts',
    expectedBehavior: 'State-modifying mutations MUST require explicit human operator approval before execution.',
    actualBehavior: 'Mutations are guarded by operator approval.',
    failedTestIndex: -1,
  };

  public getState(): ChaosState {
    return { ...this.state };
  }

  /**
   * Intentionally inject approval guard bypass
   */
  public breakCapability(): ChaosState {
    this.state = {
      isBroken: true,
      bugType: 'MISSING_APPROVAL_GUARD',
      description: 'Human approval guard bypassed before write mutation.',
      affectedFile: 'src/lib/engine/workflow-executor.ts',
      expectedBehavior: 'Write mutations must require explicit operator approval.',
      actualBehavior: 'Mutation action was executed without approval guard (bypassed).',
      failedTestIndex: 4, // Test 5: Mutation safety approval guard
    };
    return this.getState();
  }

  /**
   * Reset / heal capability state
   */
  public repairCapability(): ChaosState {
    this.state = {
      isBroken: false,
      bugType: 'NONE',
      description: 'Human approval guard restored and verified.',
      affectedFile: 'src/lib/engine/workflow-executor.ts',
      expectedBehavior: 'Write mutations must require explicit operator approval.',
      actualBehavior: 'Human approval guard active. Safe execution verified.',
      failedTestIndex: -1,
    };
    return this.getState();
  }
}

export const chaosEngine = new ChaosEngineSingleton();

import { readMultiBarrelPlan } from "../utils/battery-fs.js";
import type { MultiBarrelPlanSummary } from "../types.js";

export interface PlanUpdateEvent {
  planFilePath: string;
  summary: MultiBarrelPlanSummary;
}

export type PlanListener = (event: PlanUpdateEvent) => void | Promise<void>;

/**
 * Monitors plan.md task progress across barrels
 */
export class MultiBarrelPlanWatcher {
  private listeners: PlanListener[] = [];

  public onPlanUpdated(listener: PlanListener): void {
    this.listeners.push(listener);
  }

  public async checkPlan(planFilePath: string): Promise<MultiBarrelPlanSummary> {
    const summary = await readMultiBarrelPlan(planFilePath);
    const event: PlanUpdateEvent = {
      planFilePath,
      summary,
    };

    for (const listener of this.listeners) {
      await listener(event);
    }

    return summary;
  }
}

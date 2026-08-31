import {
  CrossBarrelSpecInterceptor,
  type SpecValidationResult,
} from "./spec-interceptor.js";
import type { ValidationIssue } from "../utils/format.js";

export interface PreCommitHookOptions {
  workspacePath?: string;
  trackId?: string;
  stagedFiles?: string[];
  bypass?: boolean;
}

export interface PreCommitHookResult {
  success: boolean;
  exitCode: number;
  message: string;
  issues: ValidationIssue[];
}

export interface PreToolHookOptions {
  toolName: string;
  toolArgs?: Record<string, unknown>;
  workspacePath?: string;
  trackId?: string;
  bypass?: boolean;
}

export interface PreToolHookResult {
  allowed: boolean;
  reason?: string;
  issues?: ValidationIssue[];
}

const FILE_MUTATION_TOOLS = new Set([
  "write_to_file",
  "replace_file_content",
  "apply_diff",
]);

/**
 * Validates cross-barrel specs before a git commit completes
 */
export async function handlePreCommitHook(
  options: PreCommitHookOptions = {}
): Promise<PreCommitHookResult> {
  const interceptor = new CrossBarrelSpecInterceptor({
    workspacePath: options.workspacePath,
  });

  const result: SpecValidationResult = await interceptor.validateTrackChanges({
    trackId: options.trackId,
    modifiedFiles: options.stagedFiles,
    bypass: options.bypass,
  });

  if (result.bypassUsed) {
    return {
      success: true,
      exitCode: 0,
      message: "⚠️ [Battery SDD] Bypass active: spec validation skipped.",
      issues: [],
    };
  }

  if (!result.allowed) {
    const issueList = result.issues
      .map((i) => `  - ${i.file}${i.line ? `:${i.line}` : ""}: ${i.message}`)
      .join("\n");

    return {
      success: false,
      exitCode: 1,
      message: `❌ [Battery SDD] Commit blocked by SDD governance. Spec delta validation failed:\n${issueList}`,
      issues: result.issues,
    };
  }

  return {
    success: true,
    exitCode: 0,
    message: "✅ [Battery SDD] Spec validation passed.",
    issues: [],
  };
}

/**
 * Intercepts tool execution to enforce SDD guardrails on file modifications
 */
export async function handlePreToolHook(
  options: PreToolHookOptions
): Promise<PreToolHookResult> {
  if (!FILE_MUTATION_TOOLS.has(options.toolName)) {
    return { allowed: true };
  }

  const interceptor = new CrossBarrelSpecInterceptor({
    workspacePath: options.workspacePath,
  });

  const result = await interceptor.validateTrackChanges({
    trackId: options.trackId,
    bypass: options.bypass,
  });

  if (!result.allowed) {
    return {
      allowed: false,
      reason: "File modifications require valid living spec deltas in active track.",
      issues: result.issues,
    };
  }

  return {
    allowed: true,
  };
}

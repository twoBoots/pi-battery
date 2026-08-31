/**
 * Extension identifier constants
 */
export const EXTENSION_ID = "pi-battery";
export const EXTENSION_NAME = "Battery SDD Orchestrator";

/**
 * Slash command definitions
 */
export const COMMANDS = {
  STATUS: "/battery:status",
  BARRELS: "/battery:barrels",
  TRACKS: "/battery:tracks",
  SWITCH: "/battery:switch",
  VALIDATE: "/battery:validate",
  DISPATCH: "/battery:dispatch",
} as const;

export type CommandKey = keyof typeof COMMANDS;
export type CommandName = (typeof COMMANDS)[CommandKey];

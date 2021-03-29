import { AquamanStep } from "./Types";

/**
 * Dispatch to step forward in the current flow.
 *
 * If current step is last step in flow, the flow will end and `onEndFlow`
 * configuration will be called;
 *
 * @param data any value to be passed to action series's next step.
 * If branching, use integers which correspond the index of desired branch.
 * @returns Redux action of type `__Aquaman_NEXT__`
 */
export const aquamanNext = (
  data?: any
): {
  type: AquamanStep.NEXT;
  data?: any;
} => ({
  type: AquamanStep.NEXT,
  data,
});

/**
 * Dispatch to step backward through the current flow.
 *
 * @returns Redux action of type `__Aquaman_PREVIOUS__`
 */
export const aquamanPrevious = (): {
  type: AquamanStep.PREVIOUS;
} => ({
  type: AquamanStep.PREVIOUS,
});

/**
 * Dispatch to immediately end the current flow and call `onEndFlow` configuration.
 *
 * @returns Redux action of type `__Aquaman_CLOSE__`
 */
export const aquamanClose = (): {
  type: AquamanStep.CLOSE;
} => ({
  type: AquamanStep.CLOSE,
});

/**
 * Dispatch to trigger a desired flow. Use this to active a flow from
 * a user action (instead of as a side effect of a state change).
 *
 * @param key Unique key of flow to be started (not the flowId).
 * @param soft If `true`, flow will only be started if there are no
 * other active flows (ie a "soft" force flow won't override an active
 * flow, but a "hard" one will).
 * @returns Redux action of type `__Aquaman_FORCE_FLOW__`
 */
export const aquamanForceFlow = (
  key: string,
  soft?: boolean
): {
  type: AquamanStep.FORCE_FLOW;
  key: string;
  soft?: boolean;
} => ({
  type: AquamanStep.FORCE_FLOW,
  key,
  soft,
});

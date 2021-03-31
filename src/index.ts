export { applyAquamanAndMiddleware } from "./Middleware";
export {
  aquamanNext,
  aquamanPrevious,
  aquamanClose,
  aquamanForceFlow,
} from "./Actions";
export { branch } from "./Branch";
export {
  FlowObj,
  AquamanConfig,
  Branch,
  MapReduxToConfig,
  AquamanStep,
  MappedFunction,
} from "./Types";
import { AquamanStep } from "./Types";

/**
 * Use this in a multi-step action (an array within a series array) to
 * end the flow when the last step of the flow doesn't have a UI element
 * to it (and can't be aquamanNext-ed or aquamanClose-d out of).
 */
export const FORCE_END_MULTISTEP = AquamanStep.FORCE_END_MULTISTEP;
export { FlowStarter } from "./FlowStarter";

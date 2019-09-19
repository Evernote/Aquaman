export { applyAquamanAndMiddleware } from "./Middleware";
export {
  aquamanNext,
  aquamanPrevious,
  aquamanClose,
  aquamanForceFlow
} from "./Actions";
export { branch } from "./Branch";
export {
  FlowObj,
  AquamanConfig,
  Branch,
  MapReduxToConfig,
  AquamanStep,
  MappedFunction
} from "./Types";
import { AquamanStep } from "./Types";
export const END_FLOW = AquamanStep.END_FLOW;
export { FlowStarter } from './FlowStarter';
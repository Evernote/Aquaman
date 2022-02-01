import { Dispatch, AnyAction, Store } from "redux";
import { Observable } from "rxjs";
import { branchIterator } from "./Branch";

export interface FlowObj {
  flowId: string;
  actionSeries: ActionSeries;
  condition?: (...states: any) => boolean;
  persist: boolean;
  key?: string;
  observables?: Observable<any>[];
}

export interface PersistSettings {
  saveLocation(key: string, value: string): void;
  recoverLocation(key: string): Promise<void>;
}

export interface OnWillChooseFlowReturn {
  overridingFlow?: FlowObj,
  preventFlowStart?: boolean,
}

export interface AquamanConfig {
  persistSettings?: PersistSettings;
  onEndFlow: (flowId: string) => Promise<void>;
  onStep: (flowId: string, stepCount: number) => void;
  shouldStartFlow: (flowId: string) => boolean | void;
  onWillChooseFlow: (flow: FlowObj) => OnWillChooseFlowReturn | FlowObj | false | void;
  functionMap: { [functionName: string]: Function };
  mutuallyExclusiveFlows?: string[][];
}

export type AquamanConfigPartial = Partial<AquamanConfig>;

export type ActionOrCreator = AnyAction | ((...any: any[]) => AnyAction);
export type MultiActionStep = (
  | ActionOrCreator
  | (() => any)
  | AquamanStep.FORCE_END_MULTISTEP
)[];
export type AquamanAction =
  | ActionOrCreator
  | Branch
  | MultiActionStep
  | MappedFunction;
export type ActionSeries = AquamanAction[];

export interface Branch {
  __BRANCH__: true;
  [seriesIdx: string]: ActionSeries | boolean;
  [Symbol.iterator]?: typeof branchIterator;
}

export type MapReduxToConfig = (
  store: Store,
  dispatch: Dispatch<AnyAction>
) => AquamanConfigPartial;

export enum AquamanStep {
  NEXT = "__Aquaman_NEXT__",
  PREVIOUS = "__Aquaman_PREVIOUS__",
  CLOSE = "__Aquaman_CLOSE__",
  FORCE_FLOW = "__Aquaman_FORCE_FLOW__",
  FORCE_END_MULTISTEP = "__Aquaman_FORCE_END_MULTISTEP__",
}

export interface MappedFunction {
  __Aquaman_FUNCTION__: true;
  functionName: string;
  args: any[];
}

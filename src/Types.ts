import { Dispatch, AnyAction, Store } from 'redux';
import { Observable } from 'rxjs';
import { branchIterator } from './Branch';

export interface FlowObj {
  flowId: string;
  actionSeries: ActionSeries;
  condition?: (...states: any) => boolean;
  persist: boolean;
  key?: string;
  observables?: Observable<any>[];
}

export interface AquamanConfig {
  onEndFlow: (flowId: string) => void;
  onStep: () => void;
  shouldStartFlow: () => boolean | void;
  onWillChooseFlow: (flow: FlowObj) => FlowObj | false | void;
  functionMap: { [functionName: string]: Function };
}

export type AquamanConfigPartial = Partial<AquamanConfig>;

export type ActionOrCreator = AnyAction | ((...any: any[]) => AnyAction);
export type MultiActionStep = (ActionOrCreator | (() => any) | AquamanStep.END_FLOW)[];
export type AquamanAction = ActionOrCreator | Branch | MultiActionStep | MappedFunction;
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
  NEXT = '__Aquaman_NEXT__',
  PREVIOUS = '__Aquaman_PREVIOUS__',
  CLOSE = '__Aquaman_CLOSE__',
  FORCE_FLOW = '__Aquaman_FORCE_FLOW__',
  END_FLOW = '__Aquaman_END_FLOW__'
}

export interface MappedFunction {
  __Aquaman_FUNCTION__: true;
  functionName: string;
  args: any[];
}
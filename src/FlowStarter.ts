import { Store, Dispatch } from "redux";
import {
  Observable,
  combineLatest,
  EMPTY,
  observable as Symbol_observable,
} from "rxjs";
import { filter } from "rxjs/operators";

import flowController, {
  ControlledFlow,
  AQUAMAN_LOCATION_ID,
} from "./DispatchController";

import { FlowObj, MapReduxToConfig, AquamanConfig, OnWillChooseFlowReturn, FlowTriggerType } from "./Types";
import { Excluder, FlowExcluder } from "./FlowExcluder";

const defaultReduxConfig = {
  onEndFlow: async () => {},
  onStep: () => {},
  shouldStartFlow: () => true,
  onWillChooseFlow: () => {},
  functionMap: {},
  mutuallyExclusiveFlows: [],
};

function toObserable(store: Store) {
  return new Observable<any>((observer) => {
    observer.next(store.getState());

    const unsubscribe = store.subscribe(() => {
      observer.next(store.getState());
    });

    return unsubscribe;
  });
}

export class FlowStarter {
  constructor(
    flows: FlowObj[],
    mapReduxToConfig: MapReduxToConfig,
    store: Store,
    dispatch: Dispatch<any>
  ) {
    this.flows = flows;
    this.store = store;
    this.dispatch = dispatch;
    this.config = {
      ...defaultReduxConfig,
      ...mapReduxToConfig(store, dispatch),
    };

    this.excluder = FlowExcluder(this.config.mutuallyExclusiveFlows ?? []);

    this.initializeFlow();
  }

  flows: FlowObj[];
  store: Store;
  dispatch: Dispatch<any>;
  config: AquamanConfig;
  currentFlow: ControlledFlow | null = null;
  inProgress = false;
  stepCount = 0;
  excluder: Excluder;

  initializeFlow = () => {
    const storeObservable = toObserable(this.store);

    for (const flow of this.flows) {
      const observables = flow.observables ? flow.observables : [EMPTY];

      // fix mysteriously failing interop
      for (const observable of observables) {
        if (
          // @ts-ignore
          observable["@@observable"] != null &&
          // @ts-ignore
          observable[Symbol_observable] == null
        ) {
          // @ts-ignore
          observable[Symbol_observable] = observable["@@observable"];
        }
      }

      combineLatest([storeObservable, ...observables])
        .pipe(
          filter(
            () =>
              !this.inProgress &&
              !!this.config.shouldStartFlow(flow.flowId) &&
              !this.excluder.isExcluded(flow.flowId)
          )
        )
        .subscribe((states) => {
          const canStartFlow = flow.condition && flow.condition(...states);

          if (canStartFlow) {
            const flowOptions = {
              triggerType: FlowTriggerType.Conditions
            };
            const returnDataOrFlowObj = this.config.onWillChooseFlow(flow, flowOptions);

            const onWillChooseFlowReturn = ((): OnWillChooseFlowReturn => {
              if (typeof returnDataOrFlowObj == 'object' && returnDataOrFlowObj != null) {
                if ((returnDataOrFlowObj as FlowObj).flowId != null) {
                  return {
                      overridingFlow: returnDataOrFlowObj as FlowObj
                    };
                } else {
                  return returnDataOrFlowObj as OnWillChooseFlowReturn
                }
              } else {
                return {}
              }
            })();

            if (onWillChooseFlowReturn.preventFlowStart) {
              return;
            }

            this.currentFlow = flowController(
              onWillChooseFlowReturn?.overridingFlow || flow,
              this.config.functionMap,
              this.dispatch,
              this.config.persistSettings
            );
            this.inProgress = true;
            this.next();
          }
        });
    }
  };

  forceFlow = (flowKey: string, soft?: boolean) => {
    if (this.inProgress && soft) {
      return;
    }

    const forcedFlow = this.flows.find((flow) => flow.key === flowKey);

    if (!forcedFlow) {
      return;
    }

    const flowOptions = {
      triggerType: FlowTriggerType.ForceFlow
    };
    const returnDataOrFlowObj = this.config.onWillChooseFlow(forcedFlow, flowOptions);

    const onWillChooseFlowReturn = ((): OnWillChooseFlowReturn => {
      if (typeof returnDataOrFlowObj == 'object' && returnDataOrFlowObj != null) {
        if ((returnDataOrFlowObj as FlowObj).flowId != null) {
          return {
              overridingFlow: returnDataOrFlowObj as FlowObj
            };
        } else {
          return returnDataOrFlowObj as OnWillChooseFlowReturn
        }
      } else {
        return {}
      }
    })();

    if (onWillChooseFlowReturn.preventFlowStart) {
      return; 
    }

    this.setFlow(onWillChooseFlowReturn.overridingFlow || forcedFlow);
  };

  setFlow = (selectedFlow: FlowObj) => {
    this.currentFlow = flowController(
      selectedFlow,
      this.config.functionMap,
      this.dispatch
    );
    if (this.currentFlow) {
      this.inProgress = true;
      this.stepCount = 0;
      this.next();
    }
  };

  next = (data?: any) => {
    const { currentFlow } = this;
    const flowId = currentFlow?.getFlowId() ?? ''

    if (currentFlow) {
      this.stepCount++;
      this.config.onStep(flowId, this.stepCount);
      const done = currentFlow.next(data);
      if (done) {
        this.close(true);
      }
    }
  };

  previous = () => {
    const { currentFlow } = this;
    const flowId = currentFlow?.getFlowId() ?? ''
    if (currentFlow) {
      this.stepCount--
      this.config.onStep(flowId, this.stepCount);
      currentFlow.previous();
    }
  };

  close = async (isCompleted?: boolean) => {
    const { currentFlow } = this;
    if (currentFlow) {
      const flowId = currentFlow.getFlowId();
      this.excluder.setViewed(flowId);
      await this.config.onEndFlow(flowId, isCompleted);
      this.inProgress = false;
      this.currentFlow = null;
      this.stepCount = 0;
      this.config.persistSettings?.saveLocation(AQUAMAN_LOCATION_ID, "");
    }
  };
}

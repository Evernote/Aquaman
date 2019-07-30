import { Store, Dispatch } from 'redux';
import { Observable, combineLatest, of } from 'rxjs';

import flowController, { ControlledFlow, AQUAMAN_LOCATION_ID } from './DispatchController';

import { FlowObj, MapReduxToConfig, AquamanConfig } from './Types';

const defaultReduxConfig = {
  onEndFlow: () => {},
  onStep: () => {},
  shouldStartFlow: () => true,
  onWillChooseFlow: () => {},
  functionMap: {},
};

function toObserable(store: Store) {
  return new Observable(observer => {
    observer.next(store.getState());

    const unsubscribe = store.subscribe(() => {
      observer.next(store.getState());
    });

    return unsubscribe;
  })
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
    this.config = { ...defaultReduxConfig, ...mapReduxToConfig(store, dispatch) };

    this.initializeFlow();
  }

  flows: FlowObj[];
  store: Store;
  dispatch: Dispatch<any>;
  config: AquamanConfig;
  currentFlow: ControlledFlow | null = null;
  inProgress = false;

  initializeFlow = () => {
    const storeObservable = toObserable(this.store);

    for (const flow of this.flows) {
      const observables = flow.observables ? flow.observables : [of(undefined)];

      combineLatest(storeObservable, ...observables).subscribe(states => {
        if (this.inProgress) {
          return;
        }

        if (!this.config.shouldStartFlow()) {
          return;
        }

        const canStartFlow = flow.condition && flow.condition(...states);

        if (canStartFlow) {
          const overrridingFlow = this.config.onWillChooseFlow(flow);

          this.currentFlow = flowController(
            overrridingFlow || flow,
            this.config.functionMap,
            this.dispatch
          );
          this.inProgress = true;
          this.next();
        }
      })
    }
  };

  forceFlow = (flowKey: string, soft?: boolean) => {
    if (this.inProgress && soft) {
      return;
    }

    const forcedFlow = this.flows.find(flow => flow.key === flowKey);

    if (!forcedFlow) {
      return;
    }

    const selectedFlow = this.config.onWillChooseFlow(forcedFlow) || forcedFlow;

    this.setFlow(selectedFlow);
  };

  setFlow = (selectedFlow: FlowObj) => {
      this.currentFlow = flowController(
        selectedFlow,
        this.config.functionMap,
        this.dispatch
      );
      if (this.currentFlow) {
        this.inProgress = true;
        this.next();
      }
  }

  next = (data?: any) => {
    const { currentFlow } = this;

    if (currentFlow) {
      this.config.onStep();
      const done = currentFlow.next(data);

      if (done) {
        this.close();
      }
    }
  };

  previous = () => {
    const { currentFlow } = this;
    if (currentFlow) {
      this.config.onStep();
      currentFlow.previous();
    }
  };

  close = () => {
    const { currentFlow } = this;
    if (currentFlow) {
      const flowId = currentFlow.getFlowId();
      this.config.onEndFlow(flowId);
      this.inProgress = false;
      this.currentFlow = null;
      localStorage.setItem(AQUAMAN_LOCATION_ID, '');
    }
  };
}

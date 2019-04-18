import { Store, Dispatch } from 'redux';

import flowController, { ControlledFlow, AQUAMAN_LOCATION_ID } from './DispatchController';

import { FlowObj, MapReduxToConfig, AquamanConfig } from './Types';

const defaultReduxConfig = {
  onEndFlow: () => {},
  onStep: () => {},
  shouldPreventFlow: () => {},
  onWillChooseFlow: () => {},
  functionMap: {},
};

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
  }

  flows: FlowObj[];
  store: Store;
  dispatch: Dispatch<any>;
  config: AquamanConfig;
  currentFlow: ControlledFlow | null = null;
  done = true;

  initializeFlow = () => {
    if (this.config.shouldPreventFlow()) {
      return;
    }

    if (!this.done) {
      return;
    }

    this.currentFlow = flowController(
      this.flowPicker(),
      this.config.functionMap,
      this.dispatch
    );
    if (this.currentFlow) {
      this.done = false;
      this.next();
    }
  };

  flowPicker = () => {
    const state = this.store.getState();

    for (const flow of this.flows) {
      if (flow.condition && flow.condition(state)) {
        const overrridingFlow = this.config.onWillChooseFlow(flow);

        if (overrridingFlow) {
          return overrridingFlow;
        }

        return flow;
      }
    }

    return { actionSeries: [], flowId: '', persist: false };
  };

  forceFlow = (flowKey: string) => {
    if (!this.done) {
      return;
    }

    const forcedFlow = this.flows.find(flow => flow.key === flowKey);

    if (!forcedFlow) {
      return;
    }

    const selectedFlow = this.config.onWillChooseFlow(forcedFlow) || forcedFlow;

    this.currentFlow = flowController(
      selectedFlow,
      this.config.functionMap,
      this.dispatch
    );
    this.done = false;
    this.next();
  };

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
      this.done = true;
      this.currentFlow = null;
      localStorage.setItem(AQUAMAN_LOCATION_ID, '');
    }
  };
}

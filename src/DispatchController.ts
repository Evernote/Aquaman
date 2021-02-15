import { Dispatch } from "redux";

import FlowGraph from "./Graph";
import {
  FlowObj,
  AquamanAction,
  ActionOrCreator,
  MultiActionStep,
  AquamanStep,
  MappedFunction,
  PersistSettings,
} from "./Types";

export interface ControlledFlow {
  next: (data: any) => boolean;
  previous: () => void;
  getFlowId: () => string;
}

export const AQUAMAN_LOCATION_ID = "AQUAMAN_LOCATION_ID";

export default function flowController(
  { actionSeries, flowId, persist }: FlowObj,
  functionMap: { [functionKey: string]: Function },
  dispatch: Dispatch<any>,
  persistSettings?: PersistSettings
): ControlledFlow | null {
  if (!actionSeries || !actionSeries.length) {
    return null;
  }

  const flowGraph = new FlowGraph(actionSeries);

  if (persist) {
    recoverLocation();
  }

  function next(data: any): boolean {
    const nextAction = flowGraph.next(data);

    if (!nextAction) {
      return true;
    }

    return handleAction(nextAction, data);
  }

  function previous(): void {
    const prevAction = flowGraph.previous();

    if (!prevAction) {
      return;
    }

    handleAction(prevAction);
  }

  function handleAction(action: AquamanAction, data?: any): boolean {
    if (Array.isArray(action)) {
      const returnedYield = dispatchAll(action);

      if (returnedYield) {
        return returnedYield;
      }
    } else if (typeof action === "function") {
      const returnedYield = action(data);

      if (returnedYield.type) {
        dispatch(returnedYield);
        return false;
      }
    } else if (action) {
      dispatch(action);
    }

    if (persist) {
      saveLocation();
    }

    return false;
  }

  function saveLocation(): void {
    persistSettings?.saveLocation(
      AQUAMAN_LOCATION_ID,
      flowGraph.getCurrentNodeId()
    );
  }

  async function recoverLocation(): Promise<void> {
    const nodeId = await persistSettings?.recoverLocation(AQUAMAN_LOCATION_ID);

    if (nodeId) {
      flowGraph.setPosition(nodeId);
    }
  }

  function dispatchStep(currentStep: ActionOrCreator | MappedFunction): void {
    if (typeof currentStep === "function") {
      const action = currentStep();

      if (action && action.type) {
        dispatch(action);
      }
      // eslint-disable-next-line no-underscore-dangle
    } else if ((currentStep as MappedFunction).__Aquaman_FUNCTION__) {
      const func: Function =
        functionMap[(currentStep as MappedFunction).functionName];

      if (func) {
        func(...(currentStep as MappedFunction).args);
      }
    } else {
      dispatch(currentStep);
    }
  }

  function dispatchAll(stepArr: MultiActionStep): boolean | void {
    for (const subStep of stepArr) {
      if (subStep === AquamanStep.FORCE_END_MULTISTEP) {
        return true;
      }

      dispatchStep(subStep);
    }
  }

  function getFlowId(): string {
    return flowId;
  }

  return {
    next,
    previous,
    getFlowId,
  };
}

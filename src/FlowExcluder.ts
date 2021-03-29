export interface Excluder {
  setViewed(flowId: string): void;
  isExcluded(flowId: string): boolean;
}

export function FlowExcluder(coexclusiveFlows: string[][]) {
  const viewed = new Set<string>();
  const exclusions = setCoexclusives();

  function setViewed(flowId: string) {
    viewed.add(flowId);
  }

  function setCoexclusives() {
    const map = new Map<string, Set<string>>();

    for (const coexclusives of coexclusiveFlows) {
      for (const flowId of coexclusives) {
        if (map.has(flowId)) {
          const set = map.get(flowId)!;
          for (const val of coexclusives) {
            set.add(val);
          }
        } else {
          map.set(flowId, new Set(coexclusives));
        }
      }
    }

    return map;
  }

  function isExcluded(flowId: string) {
    const excludors = exclusions.get(flowId);

    if (!excludors) {
      return false;
    }

    for (const val of excludors) {
      if (viewed.has(val)) {
        return true;
      }
    }

    return false;
  }

  return {
    isExcluded,
    setViewed,
  };
}

export interface Excluder {
  setViewed(flowId: string): void;
  isExcluded(flowId: string): boolean;
}

export function FlowExcluder(mutuallyExclusiveFlows: string[][]) {
  const viewed = new Set<string>();
  const exclusions = setMutuallyExclusives();

  function setViewed(flowId: string) {
    if (!exclusions.has(flowId)) {
      exclusions.set(flowId, new Set([flowId]));
    }

    viewed.add(flowId);
  }

  function setMutuallyExclusives() {
    const map = new Map<string, Set<string>>();

    for (const mutuallyExclusives of mutuallyExclusiveFlows) {
      for (const flowId of mutuallyExclusives) {
        if (map.has(flowId)) {
          const set = map.get(flowId)!;
          for (const val of mutuallyExclusives) {
            set.add(val);
          }
        } else {
          map.set(flowId, new Set(mutuallyExclusives));
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

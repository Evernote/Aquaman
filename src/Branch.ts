import { Branch, ActionSeries } from "./Types";

/**
 * Use branch to generate conditional flows based off user actions.
 * Pass actionSeries arrays into branch. You can pass the index
 * of an actionSeries into `flow.next` to trigger that flow.
 * For example an `onClick` handler, which calls `() => flow.next(1)`
 * for `branch([flow1Step1, flow1Step2], [flow2Step1, flow2Step2])`
 * would start calling `[flow2Step1, flow2Step2]` since it is at
 * index 1 for branch's args.
 */
export function branch(...args: ActionSeries[]): Branch {
  const branches = args.reduce(
    (acc: { [key: number]: any }, curr: any, idx: number) => {
      acc[idx] = curr;
      return acc;
    },
    {}
  );

  return {
    __BRANCH__: true,
    ...branches,
  };
}

export function* branchIterator(this: Branch): IterableIterator<ActionSeries> {
  let i = 0;
  while ((this as Branch)[i]) {
    yield (this as Branch)[i] as ActionSeries;
    i++;
  }
}

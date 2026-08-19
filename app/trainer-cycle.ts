export type CycleId = string | number;

export type TrainerCycleState<Id extends CycleId> = {
  cycle: number;
  seenIds: Id[];
  activeRunIds: Id[];
  cursor: number;
};

type PrepareRunOptions<T, Id extends CycleId> = {
  items: T[];
  runSize: number;
  getId: (item: T) => Id;
  state?: TrainerCycleState<Id> | null;
};

const STORAGE_KEY = "endgegner-trainer-cycles-v1";

function shuffled<T>(items: T[]) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function emptyState<Id extends CycleId>(): TrainerCycleState<Id> {
  return { cycle: 1, seenIds: [], activeRunIds: [], cursor: 0 };
}

export function prepareCyclicRun<T, Id extends CycleId>({
  items,
  runSize,
  getId,
  state,
}: PrepareRunOptions<T, Id>) {
  if (!items.length || runSize <= 0) {
    return { items: [] as T[], state: emptyState<Id>() };
  }

  const byId = new Map(items.map((item) => [getId(item), item]));
  const current = state ?? emptyState<Id>();
  const activeRunIds = current.activeRunIds.filter((id) => byId.has(id));
  const cursor = Math.min(Math.max(current.cursor, 0), Math.max(activeRunIds.length - 1, 0));

  if (activeRunIds.length) {
    return {
      items: activeRunIds.map((id) => byId.get(id) as T),
      state: { ...current, activeRunIds, cursor },
    };
  }

  const validIds = new Set(byId.keys());
  const seen = new Set(current.seenIds.filter((id) => validIds.has(id)));
  const selected: T[] = [];
  let cycle = Math.max(1, current.cycle || 1);

  while (selected.length < runSize) {
    let unseen = items.filter((item) => !seen.has(getId(item)));
    if (!unseen.length) {
      cycle += 1;
      seen.clear();
      unseen = [...items];
    }

    const selectedIds = new Set(selected.map(getId));
    const candidates = shuffled(unseen);
    const ordered = [
      ...candidates.filter((item) => !selectedIds.has(getId(item))),
      ...candidates.filter((item) => selectedIds.has(getId(item))),
    ];
    const amount = Math.min(runSize - selected.length, ordered.length);

    for (const item of ordered.slice(0, amount)) {
      selected.push(item);
      seen.add(getId(item));
    }
  }

  const nextState: TrainerCycleState<Id> = {
    cycle,
    seenIds: [...seen],
    activeRunIds: selected.map(getId),
    cursor: 0,
  };

  return { items: selected, state: nextState };
}

export function advanceCyclicRun<Id extends CycleId>(state: TrainerCycleState<Id>) {
  return {
    ...state,
    cursor: Math.min(state.cursor + 1, Math.max(state.activeRunIds.length - 1, 0)),
  };
}

export function completeCyclicRun<Id extends CycleId>(state: TrainerCycleState<Id>) {
  return { ...state, activeRunIds: [], cursor: 0 };
}

export function loadTrainerCycleState<Id extends CycleId>(trainerId: string) {
  if (typeof window === "undefined") return null;
  try {
    const store = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Record<string, TrainerCycleState<Id>>;
    return store[trainerId] ?? null;
  } catch {
    return null;
  }
}

export function saveTrainerCycleState<Id extends CycleId>(trainerId: string, state: TrainerCycleState<Id>) {
  if (typeof window === "undefined") return;
  let store: Record<string, TrainerCycleState<Id>> = {};
  try {
    store = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Record<string, TrainerCycleState<Id>>;
  } catch {
    store = {};
  }
  store[trainerId] = state;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

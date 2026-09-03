import { hashString, mulberry32 } from "../random";

/**
 * L98's 9×9 memory-path puzzle. Pure and DOM-free so it can be unit
 * tested directly — the React component only consumes `generateMemoryPath`.
 */

export function startCell(gridSize: number): number {
  const row = gridSize - 2;
  const col = 1;
  return row * gridSize + col;
}

export function endCell(gridSize: number): number {
  const row = 1;
  const col = gridSize - 2;
  return row * gridSize + col;
}

function neighbors(cell: number, gridSize: number): number[] {
  const row = Math.floor(cell / gridSize);
  const col = cell % gridSize;
  const out: number[] = [];
  if (row > 0) out.push(cell - gridSize);
  if (row < gridSize - 1) out.push(cell + gridSize);
  if (col > 0) out.push(cell - 1);
  if (col < gridSize - 1) out.push(cell + 1);
  return out;
}

function shuffleInPlace<T>(rng: () => number, arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

/**
 * Randomized-DFS spanning tree over every cell in the grid. Unlike an
 * unbounded random walk, this always terminates in O(cells) and always
 * connects every cell to every other cell — a path between any two cells
 * always exists once this returns.
 */
function buildSpanningTree(gridSize: number, rng: () => number): number[][] {
  const n = gridSize * gridSize;
  const adj: number[][] = Array.from({ length: n }, () => []);
  const visited = new Set<number>([0]);
  const stack = [0];

  while (stack.length > 0) {
    const current = stack[stack.length - 1]!;
    const options = shuffleInPlace(rng, neighbors(current, gridSize)).filter(
      (c) => !visited.has(c)
    );
    if (options.length === 0) {
      stack.pop();
      continue;
    }
    const next = options[0]!;
    visited.add(next);
    adj[current]!.push(next);
    adj[next]!.push(current);
    stack.push(next);
  }

  return adj;
}

/** The unique simple path between two nodes of a tree. */
function treePath(adj: number[][], start: number, end: number): number[] {
  const prev = new Map<number, number>();
  const seen = new Set<number>([start]);
  const queue: number[] = [start];
  let qi = 0;

  while (qi < queue.length) {
    const cur = queue[qi++]!;
    if (cur === end) break;
    for (const next of adj[cur] ?? []) {
      if (!seen.has(next)) {
        seen.add(next);
        prev.set(next, cur);
        queue.push(next);
      }
    }
  }

  const path: number[] = [end];
  let cur = end;
  while (cur !== start) {
    const p = prev.get(cur);
    if (p === undefined) {
      // Unreachable: buildSpanningTree always connects every cell.
      throw new Error("generateMemoryPath: start/end disconnected");
    }
    path.push(p);
    cur = p;
  }
  return path.reverse();
}

const PREFERRED_MIN_LENGTH = 15;
const PREFERRED_MAX_LENGTH = 25;
const GENERATION_ATTEMPTS = 24;

/**
 * Deterministic START→END path on a `gridSize`×`gridSize` grid: no
 * diagonal jumps, no disconnected cells, no repeated cells. `seed` should
 * already encode run seed + level + attempt index (e.g. via a composite
 * key) so a rollback or retry regenerates a different, still-deterministic
 * route.
 */
export function generateMemoryPath(seed: string, gridSize = 9): number[] {
  const start = startCell(gridSize);
  const end = endCell(gridSize);
  let best: number[] | null = null;
  const targetLength = (PREFERRED_MIN_LENGTH + PREFERRED_MAX_LENGTH) / 2;

  for (let attempt = 0; attempt < GENERATION_ATTEMPTS; attempt++) {
    const rng = mulberry32(
      hashString(`memory-path:${seed}:${gridSize}:${attempt}`)
    );
    const adj = buildSpanningTree(gridSize, rng);
    const path = treePath(adj, start, end);
    if (
      path.length >= PREFERRED_MIN_LENGTH &&
      path.length <= PREFERRED_MAX_LENGTH
    ) {
      return path;
    }
    if (!best || Math.abs(path.length - targetLength) < Math.abs(best.length - targetLength)) {
      best = path;
    }
  }

  // Always non-null: GENERATION_ATTEMPTS >= 1 and buildSpanningTree/treePath
  // never fail to connect start and end on a grid with gridSize >= 2.
  return best!;
}

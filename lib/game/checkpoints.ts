/** Checkpoints retired. Kept so old imports resolve during beta cutover. */
export function checkpointForLevel(_level: number): number {
  return 1;
}

export function livesAfterCheckpointRestart(): number {
  return 0;
}

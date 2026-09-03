# Definitely Possible — Beta notes

Shippable product notes for agents and deployers. No puzzle solutions.

## Progression

| Event | Result |
|---|---|
| Success on level N | N+1 (or complete at 100) |
| Failure on level N | `max(1, N - 5)` after ~550ms “BACK 5.” |
| L96 micro-fail | Restart exam round 1 only |
| Browser refresh | Abandon unfinished run |

## Memory ownership

Choice memories are scrubbed on rollback when their origin level is ≥ the rollback target. Secrets stay found for the session. See `lib/game/memoryOwnership.ts`.

## Ranked vs assisted vs local

- **Ranked:** clean server-backed run, no hints/debug/skips
- **Assisted:** hint, skip (retired), or debug jumper
- **Local:** no DB / start fell back — valid completion, not “assisted”, no global submit

## Timer

Client display uses accumulated active play ms for the session. Timer keeps ticking while the tab process lives. Server finish uses server start/complete timestamps for ranked elapsed time.

## Env

- `DATABASE_URL` or `POSTGRES_URL` — optional
- Apply `docs/game-schema.sql` before first ranked finish

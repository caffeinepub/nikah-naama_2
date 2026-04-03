# Nikah Naama

## Current State
- `access-control.mo` `getUserRole` traps with `Runtime.trap("User is not registered")` for any principal not in the roles map
- `useActor.ts` still awaits `_initializeAccessControlWithSecret`, blocking actor resolution if the call is slow or fails
- Both bugs were previously "fixed" but regressed

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- `access-control.mo`: `getUserRole` returns `#guest` instead of trapping for unknown principals
- `access-control.mo`: `assignRole` returns silently for non-admins instead of trapping (defensive)
- `useActor.ts`: `_initializeAccessControlWithSecret` call is fire-and-forget (no await)

### Remove
- `Runtime` import from `access-control.mo` (no longer needed after trap removal)

## Implementation Plan
1. Fix `getUserRole` to return `#guest` for unregistered principals -- eliminates backend trap on every permission check
2. Fix `useActor.ts` to not await `_initializeAccessControlWithSecret` -- prevents actor blocking
3. Deploy

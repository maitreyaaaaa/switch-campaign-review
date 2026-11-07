# Real-world connection

## Example: a SaaS feature launch

A marketing teammate posts this line in a Switch room:

> CSV export is available to every account.

The source of truth is a product rollout record. It says that CSV export is enabled for internal testers in the US. The reviewer links the line to that record, marks the audience mismatch, and shows when the record was observed and checked. It may suggest “Internal testers in the US can use CSV export today.” A person chooses what to do in chat.

This is useful when product, marketing, support, and legal teams need to agree on launch language. It can catch claims that overstate availability, region, timing, compatibility, or measured outcomes.

## Production data contract

Connect the MCP adapter to an authenticated, read-only product service. Return one reviewed record per claimable promise:

- stable record and feature IDs
- approved status and reason
- eligible audience, plan, region, and rollout state
- source link and evidence summary
- source owner
- `observedAt` and `checkedAt` values
- optional expiry or next-review time

The service must check the caller's access before returning records. The Switch agent must use only the returned records. Missing, expired, conflicting, or out-of-scope evidence must produce `Unknown` or a clear stop.

## Safe next extensions

1. **Evidence freshness:** mark old records stale and ask the source owner to review them.
2. **Coverage report:** show which claims have evidence, missing evidence, or a scope mismatch.
3. **Review history:** keep the copy hash, evidence IDs, reviewer result, and person's chat decision in an approved audit store. Set a retention period and access rules first.
4. **More source systems:** add read-only connectors for release flags, product docs, support notices, and approved performance metrics. Keep source identity visible.
5. **Optional publishing handoff:** create a draft only after a separate approval step, and require a human to confirm the final text before any external publish action.

These are follow-up ideas. The current adapter uses one fictional endpoint. It does not connect to real company systems or store decisions outside the Switch room.

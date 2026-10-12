# Business analysis — broker-b2c-v3

**Status:** analysis complete; implementation scope is blocked pending product-owner input.

## Authoritative brief and analysis boundary

The supplied backlog item is titled `🔎 Промежуточный анализ — broker-b2c-v3`.
Its description, checklists and tags are empty.  It defines no desired customer
outcome, change boundary, priority, release target or acceptance conditions.

This document therefore records a testable **baseline** from the workspace. It
does not authorize a product change and must not be read as a decision to
replace the repository regulations.

## Current product baseline

The workspace is a TypeScript/Vite monorepo with three static frontend
applications:

| Surface | Purpose | Evidence |
| --- | --- | --- |
| `apps/site` | Public marketing site | `README.md`, `apps/site/src/app/App.tsx` |
| `apps/onboarding` | Client-type choice and prototype registration | `apps/onboarding/src/app/App.tsx`, `pages/register/RegisterPage.tsx` |
| `apps/cabinet` | Authenticated cabinet, onboarding, funding, investment and support UI | `apps/cabinet/src/app/App.tsx` |

The checked-in regulations declare themselves the current product source of
truth: a code/regulation discrepancy is a code defect until the regulation is
changed. They describe A0–A7 access, a linear onboarding process and a
product-entry fee model. See `docs/regulations/README.md`.

The shipped implementation is a browser-local prototype, not a production
financial system: onboarding state, session/profile data and funding data use
`localStorage`; funding actions directly mutate a browser balance. See
`packages/shared/src/onboarding.ts` and
`apps/cabinet/src/shared/lib/FundingContext.tsx`.

## Testable baseline user stories

These stories restate current regulated requirements that are expressly marked
as unimplemented or backend-dependent. They are candidates only after the
product owner confirms that the regulations remain authoritative for v3.

### BA-01 — consistently enforce onboarding access

As a client, I want each cabinet action to be available, read-only, blocked or
hidden according to my onboarding access level, so that I understand what I can
do and cannot bypass controls by opening a direct URL.

Acceptance criteria:

1. Given a client in an A1–A3 state, when they open Deposit, Withdrawal,
   Invest or Events from navigation or a direct URL, then the screen shows its
   regulated blocked/read-only state and explanatory text; it does not execute
   a monetary action.
2. Given a client in `APPROVED` (A4), when they open a regulated monetary
   action, then the action is available only if the other stated prerequisites
   (confirmed details, signed agreements and investor classification where
   applicable) are satisfied.
3. Given `REVERIFICATION_REQUIRED` (A5), when the client attempts to add new
   withdrawal details, then the action is refused; when the client selects an
   already-confirmed detail, the withdrawal request is permitted by the access
   rule.
4. Given `SUSPENDED` (A6) or `REJECTED` (A7), when the client requests a
   withdrawal, then no self-service withdrawal is submitted and the UI gives
   the applicable support route.
5. Given any protected API/action, when the UI is bypassed, then the server
   independently makes the same authorization decision.

Source: `docs/regulations/01-dostup-po-etapam-zayavki.md`, sections 2–7.

### BA-02 — create a trustworthy onboarding record

As a prospective client, I want my onboarding progress and decisions recorded
in a durable, controlled history, so that a failed step or repeated submission
does not lose completed work or create duplicate applications.

Acceptance criteria:

1. Given an action that changes onboarding state, when the same idempotency key
   is submitted again, then at most one transition is stored and the client
   receives the outcome of that transition.
2. Given a client attempts a step whose prerequisites are incomplete, when the
   request reaches the backend, then it is rejected even if the frontend guard
   was bypassed.
3. Given an identity-provider event arrives twice or after a fallback poll,
   when it represents an already-applied decision, then no second state
   transition occurs.
4. Given identity verification fails three times, when the third failure is
   recorded, then the case is routed to manual review rather than automatically
   starting another verification attempt.
5. Given a transition is recorded, then the history retains its prior state,
   next state, timestamp, reason and initiator and is not editable by the
   client.

Source: `docs/regulations/05-registraciya-investora.md`, sections 10–13;
`packages/shared/src/onboarding.ts`.

### BA-03 — account for funding and investments outside the browser

As an account holder, I want balances and transaction history to reflect
authoritative records rather than browser storage, so that the displayed amount
cannot be changed by a local client and is recoverable across devices.

Acceptance criteria:

1. Given a deposit, withdrawal or investment instruction is accepted, when the
   user reloads or signs in on another device, then the same authoritative
   status and balance are returned by the service.
2. Given a client alters or clears browser `localStorage`, when the cabinet is
   reopened, then the server-derived balance and transaction history are not
   altered.
3. Given an instruction cannot be completed, when it fails, then its stored
   status and resulting balance are explainable and no duplicate financial
   movement is created by a retry.
4. Given a client is not entitled to fund or invest under BA-01, when a
   financial request is submitted directly, then it is rejected before any
   balance mutation.

Source: `apps/cabinet/src/shared/lib/FundingContext.tsx` and regulation 1,
section 4. The regulations do not yet define a ledger model, correction policy
or provider contracts; those are prerequisites to detailed financial stories.

## Dependencies and risks

| Item | Impact | Required decision/owner |
| --- | --- | --- |
| Empty v3 change brief | No defensible feature scope, priority or release criteria | Product owner supplies outcome, users, in/out of scope and success measure |
| Regulations are declared normative | A new requirement may contradict binding in-repo policy | Product/compliance owner confirms whether each regulation remains authoritative or approves a superseding change |
| No backend or provider contracts evidenced | BA-01 server enforcement and BA-02/03 durability cannot be delivered as frontend work | Technical owner supplies service boundaries and contracts for auth, onboarding/KYC, financial records and integrations |
| Browser-local prototype state | It is mutable and device-local; not evidence for financial, audit or authorization controls | Architecture/security owner approves migration and data-disposition approach |
| Financial/legal policy gaps | Fee, custody, reversal, retention and electronic-consent rules affect acceptance testing | Compliance/finance owner provides approved policy and jurisdictional constraints |

## Explicitly out of scope for this analysis

- Implementing frontend, backend, provider integrations or database changes.
- Treating mock/local-storage data as production financial, identity or audit
  data.
- Selecting KYC, payment/custody, notification or document vendors.
- Changing the normative regulations, fee policy, client eligibility or legal
  disclosure without an approved product/compliance decision.
- Defining a v3 redesign from the title alone.

## Required clarification to make v3 implementable

Provide a concise product brief that answers:

1. What business/customer problem does v3 solve, and which surfaces are in
   scope (`site`, `onboarding`, `cabinet`, backend)?
2. Which current regulations are retained, superseded or amended?
3. Which user journeys and jurisdictions are priority, and what is explicitly
   out of scope for this release?
4. What measurable outcome/release acceptance decides that v3 is complete?
5. Who owns the required compliance, financial-policy and external-integration
   decisions?

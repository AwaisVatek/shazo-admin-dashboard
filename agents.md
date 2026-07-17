# Admin Dashboard (shazo-admin-dashboard-git) — Local Law
If what you need is not covered here, return to the root router: `../router.md`
(and read `../PRODUCT.md` for overall product direction and the map provider decision).

## Mission
This folder contains the React/Vite admin dashboard used by operators to manage Shazo Ride users, drivers, earnings, and system settings.

## Map (this floor only)
- `src/` — Source code for the frontend application.
- `src/components/` — Every view lives here as a component (there is no `src/pages/` — this app is a single-page shell with client-side tab state in `App.tsx`, not a router).
- `src/utils/api.ts` — hand-rolled fetch client. **Important convention**: it globally auto-unwraps any `{ items: [...], total }`-shaped response into just the array. Endpoints that return a different key (e.g. `{ requests: [...] }`) are NOT auto-unwrapped — read the actual key in the component instead of assuming an array comes back.

## Rules specific to this folder
- Ensure all styling adheres to the established Tailwind CSS theme.
- **Maps: Mapbox only (`react-map-gl/mapbox` + `mapbox-gl`), never Google Maps.** `LiveDispatch.tsx` was migrated off `@vis.gl/react-google-maps` this session. The map needs a **public** (`pk.`) Mapbox token in `VITE_MAPBOX_TOKEN` — never the secret `sk.` token used server-side.
- **Before trusting a component's TypeScript interface, verify it against the real backend response** (`information_schema.columns` for the underlying table, scoped to `table_schema = 'public'` — an unscoped query also returns Supabase's `auth.users` columns and will mislead you about what `public.users` has — or just call the endpoint). Several components in this app had interfaces guessing camelCase field names (`riderName`, `pickupAddress`, `driverName`) that never matched what the backend actually returns (snake_case, e.g. `rider_name`, `pickup_address`, `driver_name`) — meaning those fields silently rendered as `undefined` in production. Fixed in `AmbulanceBookings.tsx`, `RidesList.tsx`, `LiveDispatch.tsx`, `FinanceModule.tsx`, `RidersList.tsx`, `CustomersList.tsx`, `SettingsFares.tsx`, `SettingsCommissions.tsx`, `PromoCampaigns.tsx`, `SupportCenter.tsx`, `SafetyReports.tsx`, `NotificationCenter.tsx`, `AdminUsers.tsx`, `SettingsManualPayments.tsx`. **This repo's migration files are not a reliable schema reference either** — several tables (`support_tickets`, `safety_reports`, `notifications`, `manual_payment_accounts`) were altered directly against the live database outside of any tracked migration; see `../PRODUCT.md`'s "database reality" section for the specifics. Treat any other component's data-shape assumptions as unverified until checked directly against whichever database is actually in use.
- Ride/job status vocabulary is `requested → accepted → arrived → in_transit → completed` (+ `cancelled`) — there is no `pending_rider_match`/`assigned`/`trip_started`/`started`/`pending` in the real backend. `GET /api/dispatch/active` specifically only returns items that still need a rider assigned — there's no separate endpoint representing all trip stages at once.
- Wallet top-ups are two parallel systems: rider top-ups via `/api/admin/finance/topups*`, customer top-ups via `/api/finance/customer-topups` (different router, different auth guard — both accept an admin session). Both use an atomic approve guard; don't reintroduce a SELECT-then-UPDATE check.

## Support
- For pickup/handoff, follow root AGENTS.md §50.

# CleatBoard.App — installable app

This folder is the complete app. Put it on any website with HTTPS and coaches can install it on their tablet's home screen. It then opens full screen and works offline at the field.

## 1. Install it on a tablet

**iPad (Safari)**
1. Open the address in Safari.
2. Tap the **Share** button (square with an arrow).
3. Tap **Add to Home Screen**, then **Add**.

**Android tablet (Chrome)**
1. Open the address in Chrome.
2. Tap **Install App** in the yellow banner, or the browser menu → **Install app**.

Open the app once while online after installing so everything is saved for offline use. The app also shows these instructions in a banner until it's installed.

## Where coach data lives

Coaches sign in with an emailed link (Supabase Auth). Teams, rosters, levels and formations are saved on the tablet first, so the app works offline at the field, then sync to Supabase so they show up on any device where the coach signs in. Game history and the game in progress stay on each tablet, so **Back Up All Teams** on the Team screen is still worth doing now and then.

## Cleat Board settings (top of the script in index.html)

- `REQUIRE_SUBSCRIPTION` – set to `true` once the Stripe webhook is filling the `subscriptions` table. While `false`, any signed-in coach can use the app.
- `SUBSCRIBE_URL` – the AWeber landing page shown to coaches without an active membership.
- `BILLING_PORTAL_URL` – the Stripe customer portal login link for the Manage Billing button.
- `OFFLINE_GRACE_DAYS` – how long the app works offline after the last successful membership check.

## Database

Run `supabase/migrations/20261124_cleat_board_team_sync.sql` once in the Supabase SQL Editor. It adds the `level`, `formation`, `sort_order` and `updated_at` columns the app syncs.

When you change the Supabase library version, update it in both `index.html` and `sw.js`, and bump `VERSION` in `sw.js` with every release.

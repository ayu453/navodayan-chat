# Navodayan Chat — Modular Web Project

This project is based on the existing modular ZIP and preserves the existing HTML markup, CSS declarations, and script execution order. The primary change here is organization and fixing the wrapper iframe markup so the desktop/mobile documents actually load.

## Structure
- `index.html` — landing page and responsive desktop/mobile iframe selection
- `desktop.html`, `mobile.html` — existing app UIs
- `css/desktop.css`, `css/mobile.css` — original UI styles, kept separate
- `css/landing.css`, `css/layout.css` — landing and frame layout styles
- `js/desktop-app-core.js`, `js/mobile-app-core.js` — existing shared-state application logic (authentication, profile and chat are still coupled here intentionally to avoid risky behavior changes)
- `js/navigation.js` — bottom navigation and tab switching
- `js/card-menus.js` — card menu interactions
- `js/desktop-profile-panels.js`, `js/mobile-profile-panels.js` — profile/rules panels, with platform-specific existing code preserved
- `js/memories.js` — Memories interactions
- `js/creativity.js` — Creativity Corner interactions
- `js/board-scroll.js` — board scrolling behavior
- `js/mobile-viewport.js` — mobile viewport/keyboard adjustments
- `js/desktop-tailwind-config.js`, `js/mobile-tailwind-config.js` — original Tailwind theme configuration
- `js/landing.js` — landing button action
- `js/config.js` — Supabase public URL/key placeholders
- `sql/schema.sql` — database schema starter

The feature scripts are separate classic JavaScript files loaded in a deliberate order. The authentication/chat core remains in one file per layout because its state and helper functions are tightly coupled; splitting those further without regression tests could break current behavior. No placeholder `auth.js` or `chat.js` files are added just to inflate the file count.

## Run locally
Use a local web server rather than opening via `file://`:
```bash
python -m http.server 8000
```
Then open `http://localhost:8000`.

## Supabase setup
Edit `js/config.js` with your Supabase project URL and publishable/anon key, and run `sql/schema.sql` only after reviewing the schema and RLS policies for your deployment. Never put a service-role key in frontend code. Backend functionality is not live until credentials, schema, authentication settings and access policies are configured.

## Validation
The package includes `tests/smoke_test.py`, which checks local script/style references, iframe markup, script ordering, and JavaScript syntax when Node.js is installed. These checks are static smoke tests; they are not a substitute for interactive browser testing.

# PocketBase setup

The app uses the official PocketBase JavaScript SDK. Native builds persist auth tokens with Expo SecureStore; web builds use AsyncStorage.

1. Download the PocketBase executable from https://pocketbase.io/docs/.
2. Place it at the project root and run `pocketbase serve` (or `./pocketbase serve`).
3. The committed migration in `pb_migrations/` automatically creates the `users` auth collection.
4. Copy `.env.example` to `.env` and set `EXPO_PUBLIC_POCKETBASE_URL` to an address reachable by the app.

For a physical phone, `127.0.0.1` points to the phone itself. Use your computer's LAN address during development or a hosted HTTPS PocketBase URL in production.

The `users` collection permits public account creation and username-or-email password authentication. Full user records are owner-only. Signed-in students discover the limited `public_profiles` view, which exposes only name, username, grade, school, and interests; only each owner can update or delete their source account.

The deployed API URL is `https://majormap.duckdns.org`. PocketBase runs as a systemd service on the Ubuntu VPS and manages TLS certificates for this hostname.

Personalization and Try This Major use additive migrations in `pb_migrations/`. Challenge attempts are owner-only and immutable; retakes create new records. See `docs/TRY_THIS_MAJOR.md` before deploying the challenge migration.

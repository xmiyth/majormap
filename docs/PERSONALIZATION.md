# Personalization model and release notes

The questionnaire has 12 activity screens. Each screen collects two data points together: interest and the experience supporting that interest. They cover quantitative reasoning, computing, physical design, natural systems, experimentation, individual support, human behavior, organizations/markets, society/institutions, language/argument, visual creativity, and expression/presentation. Pairing the two prompts prevents the same activity from appearing as two consecutive questions while preserving all 24 evidence-weighted answers. These broad activities distinguish this catalog without creating a dimension per major. This is a compact editorial model, not a claim that 12 is a mathematically minimal or psychometrically validated set.

Each major has an ordered activity profile in `src/lib/matching.ts`. Primary, secondary, supporting, and contextual dimensions have relevance weights of 1, 0.72, 0.5, and 0.35. Other measured dimensions have low relevance of 0.12. Their target interest values are 0.95, 0.82, 0.64, 0.52, and 0.18 respectively. This lets the complete pattern distinguish related majors while keeping the strongest emphasis on central study activities. Unmeasured dimensions still have no effect. These are study-interest profiles, not ability requirements.

The current model is `interests-v3`. It compares the student's complete measured interest shape with each field instead of checking only two or three positive interests. Representative profiles now produce differentiated Top 5 scores; an all-very-appealing response produces about 63 rather than a list of perfect scores. True ties remain ties; no random deductions, rank-based deductions, or confidence penalties are applied. Historical assessment records and their original scores are preserved. Home, Explore, and Discover recalculate displayed matches from saved answers using the current model without changing the active assessment ID or writing over history. No retake is needed to fix stale perfect scores. Unsupported saved answer formats show an explicit retake message rather than stale results.

Discover gives immediate selection feedback followed by a 170 ms fade/slide out and a 200 ms fade/slide in, with a short initial hold. The next question commits while hidden; its entrance starts on the following animation frame. Option indicators reserve their space, evidence options retain the same minimum area, and transitions do not reset the scroll position. Input is locked until the transition finishes. Reduced-motion preferences skip the motion, and unmounting cancels pending animations. Results separate compatibility from confidence, show two concise supporting reasons, isolate supported mismatches, and reveal methodology on demand. Confidence labels are Early picture below 45, Developing from 45 to below 75, and Well supported from 75; exact confidence is available in the expanded explanation. These are editorial display bands, not statistical cutoffs.

For each measured relevant dimension:

- weight = major relevance * student evidence strength
- compatibility = 1 - abs(student interest - major target)
- Match Score = 100 * sum(weight * compatibility) / sum(weight)
- Confidence = 100 * sum(measured weights) / sum(all relevant major weights)

Experience strengths are 1 for repeated experience, 0.7 for once, 0.35 for imagined interest, and zero for unknown. An unanswered interest, unknown interest, or absent/unknown experience has no scoring weight and cannot produce a mismatch. Zero total evidence gives a null score, not zero compatibility. Reasons require fit >= 0.8; mismatches require fit < 0.5 with measured evidence. Scores remain unrounded until display. Exact ties use major ID, independent of catalog order; confidence never changes the ranking.

Limitations: this is not an admissions probability, aptitude test, or validated counseling instrument. Some broad and specialized fields tie. Supporting-interest targets can mildly favor moderate interest over very high interest. Confidence measures self-reported evidence coverage, not statistical certainty. Full measurement of a major's relevant activities can give full confidence for that major. Broad preferences and narrow evidence can still produce ties; inspect confidence alongside scores.

`npm run evaluate:matching` prints eight representative Top 10 lists and creates `evaluation/reachability.json`. Its seeded search uses only complete legal questionnaire choices, without reading major profiles. Every witness can be replayed through the same scoring function as the app. Reachability means a field can appear in Top 5, not that every plausible student will get a unique first result. Automated tests require all 56 to be reachable. The current evaluation reaches all 56 in Top 2.

Assessment answers, model version, complete ranked results, and completion time are saved as immutable owner-only records. A separate unique owner record points to the active assessment. Retakes save history first and require an explicit replacement confirmation. Declining keeps the old active map and the new history entry. Failed activation can be retried from history. Saved-major state changes only after PocketBase succeeds. History and saves reload on account change; stale responses cannot populate a different account's state.

`majormap_activity` stores only one reviewed-major checklist record per assessment. Assessment completion and saving a major are derived from their existing records. Nothing in this phase stores a general activity feed. Checklist completion is an explicit action in the shared detail screen.

Completed guest answers survive signing in while Discover remains open. Unsubmitted quiz drafts are session-only and are discarded when leaving Discover. Stored results are client-computed snapshots and are not suitable for trusted third-party certification. Old in-memory saved majors cannot be recovered after an app restart.

## PocketBase deployment (operator only)

1. Back up production PocketBase data and verify that the backup can be restored. The app and tests do not migrate the existing local `pb_data` directory.
2. Use the tested PocketBase version (0.39.9) in staging. Copy the new `pb_migrations/1789257600_add_personalization.js` alongside the existing migration files. Apply every outstanding migration in chronological order; inspect the pre-existing moderation migration separately if it is still pending.
3. Stop the staging service; run `./pocketbase migrate up --dir=./pb_data --migrationsDir=./pb_migrations` from its installation directory; restart and smoke-test two accounts, retake cancellation/confirmation, restart persistence, and failed network saves.
4. Repeat the approved process on production. For the existing service layout, the operator commands are:

```sh
sudo systemctl stop pocketbase
cd /home/ubuntu/pocketbase
./pocketbase migrate up --dir=./pb_data --migrationsDir=./pb_migrations
sudo systemctl start pocketbase
sudo systemctl status pocketbase --no-pager
```

Run migrations as the service's `ubuntu` user, with the service stopped and after taking the backup. Do not run migration rollback to erase student history; this migration intentionally refuses destructive down migration. An older client ignores the additive collections. Restore a backup only as a deliberate recovery operation.

The four collections are `major_assessments`, `majormap_active`, `saved_majors`, and `majormap_activity`. Ownership and immutable history rules are covered by the isolated PocketBase integration test. For rule syntax, see [PocketBase API rules](https://pocketbase.io/docs/api-rules-and-filters/).

## Before the next Android production AAB

From `C:\Users\Admin\MajorMap`, with Node 24 and `pocketbase.exe` 0.39.9 available for the isolated test:

```powershell
npm ci
npm run typecheck
npm test
npm run evaluate:matching
npx expo-doctor
npx expo install --check
npx eas-cli build --platform android --profile production
```

The last command starts the build and is for the operator, not this implementation session. Confirm the staging smoke test and production migration first. `eas.json` already supplies `https://majormap.duckdns.org` for production. No Android app was built/uploaded and no production migration was run here.

# Try This Major

## Architecture

Challenge definitions live in `src/data/majorChallenges.ts`. A definition supplies a stable challenge ID, major ID, version, scenario, estimated time, and 2–5 typed questions. The shared flow supports single choice, multiple choice, and short text responses. Adding another major normally requires one definition; unsupported majors show a quiet coming-soon message on their detail page and never open an empty flow.

`MajorChallengeFlow` owns the in-progress response and reflection state. Guest work remains in component state while the existing sign-in modal is shown. A completed attempt is written only after authentication succeeds. Save failures leave all answers on screen. Closing an unfinished flow emits an internal abandoned event.

`useChallengeAttempts` loads account-owned history and creates immutable attempts. Retakes append records. `MajorEvidenceSummary` derives descriptive evidence from attempts and never modifies assessment matches. With one attempt it says `Early evidence`; multiple attempts may produce `Strong`, `Mixed`, or `Consistent low interest`. These labels summarize self-reported reflections and are not recommendation confidence.

The dependency-free event hooks in `src/lib/challengeEvents.ts` expose `challenge_started`, `challenge_completed`, `challenge_abandoned`, `reflection_completed`, and `try_another_major_clicked`. No events leave the device unless a future analytics adapter subscribes.

## Initial challenges

- Psychology — Design a Research Study
- Computer Science — Logic & Debugging Challenge
- Business — Plan the Next Stage of Growth
- Economics — Reason Through an Economic Shift
- Biology — Investigate Plant Growth
- Engineering — Strengthen a Lightweight Structure
- Political Science — Compare Public Policy Options
- Marketing — Position a New Product
- Finance — Compare Two Investments
- Communications — Communicate an Important Change

The tasks are short samples of reasoning common to these fields. They are not validated aptitude tests, graded assignments, or proof that a student should choose a major.

## PocketBase

Migration `1790112000_add_major_challenge_attempts.js` adds the `major_challenge_attempts` collection. It stores owner, major/challenge IDs, responses, completion time, reflection answers, and challenge version. List, view, and create rules require `owner = @request.auth.id`. Update and delete are disabled so history remains immutable. The owner relation cascades when the user account is intentionally deleted.

Back up PocketBase first, then deploy the migration with the service stopped:

```sh
sudo systemctl stop pocketbase
cd /home/ubuntu/pocketbase
./pocketbase migrate up --dir=./pb_data --migrationsDir=./pb_migrations
sudo systemctl start pocketbase
sudo systemctl status pocketbase --no-pager
```

No dashboard fields or manual collection setup are needed after the migration runs.

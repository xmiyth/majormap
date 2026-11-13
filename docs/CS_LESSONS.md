# Interactive Computer Science pilot

Open Explore -> Computer Science -> Try This Major. The guided path includes debugging, replacing the duplicate quick-challenge entry. Historical quick-challenge attempts remain available from Profile. The lesson path uses existing React Native and AsyncStorage dependencies and runs in Expo Go; no backend migration is required.

Five sequential missions cover precise instructions, a programmable grid robot, debugging, conditions, tap events, and a customizable Star Collector game. Students check answers, receive explanatory feedback, and can use hints or retry without penalties. All three valid robot routes are accepted. Game rules are executed in the native UI; no user-supplied code is evaluated.

Each mission unlocks after the previous mission's reflection is saved. Completing a mission grants 20 XP once, including when the student reports low enjoyment. Finishing all five grants the CS Explorer badge and a replayable project. Practice does not add XP or overwrite the original reflection. There are no daily time locks, streaks, or leaderboards. These lesson results do not alter matching scores or existing challenge attempts.

Progress uses a versioned AsyncStorage key separated by signed-in account ID or the guest namespace. It is device-local, not cloud-synced. Guest progress stays separate after sign-in. Uninstalling the app or clearing its storage removes local progress. Successful activities checkpoint when Continue is pressed; leaving an unanswered activity restarts that activity. Final project settings save with the completed game activity. Reflections and completion dates save when Finish mission is pressed. A finished game can be edited and saved after testing it to a win.

Writes must succeed before the UI advances or awards XP. Failed loads block writes and show Retry; malformed saves are not silently overwritten. Closing the flow is disabled during a save. The App keys the lesson component by account so a session cannot expose another account's path after an account change.

Verification: `npm run typecheck` and `npm test`. The lesson tests cover the full five-mission flow, feedback and retries, robot alternatives, game win boundaries, replay XP, resume after reopening, storage errors, and account isolation. Device smoke test: open in Expo Go, finish the robot, close and reopen, finish all five missions, customize and replay the game, and check the dark theme and Android back button.


## Game-style learning update
The Code Lab now has a staggered adventure path, raised green buttons, a robot guide, XP and badge counters, a next-quest shortcut, five earned skill badges, and completion reward cards. Every mission includes a practical application and an optional transfer challenge. Practice prioritizes a completed mission with a less-positive interest reflection; this is an interest-based suggestion, not an assessment of ability.

Before starting a game, students predict the number of stars needed. The result compares the prediction with actual taps and explains the points calculation, including overshooting the target. Incorrect predictions never block learning. Existing activity IDs, ordering, XP rules, and storage format remain compatible with saved progress.

Automated coverage includes prediction gating, incorrect-prediction feedback, the practice shortcut, and the full saved journey. A physical-device visual check is still needed.


The merged Try This Major flow routes all new CS starts through the guided path. Instruction panels explain the goal, controls, and next button. A first mission is a short sample; the remaining missions are optional continued exploration. Completed signed-in samplers can save a three-question reflection and tested-project summary as a `cs-guided-sampler` attempt. Local mission saves and historical `cs-debug` attempts remain unchanged. Other major samplers now explain selection types and short written responses before asking for input.


## Beginner simplification
Activities now use everyday examples from one star game, with no required code reading or loop arithmetic. The robot moves immediately when a direction is tapped; invalid moves leave it in place, and Collect finishes at the goal. The exact route is provided so users can experience giving instructions rather than solve a navigation puzzle. Game predictions and advanced rules are optional; the main flow is name, color, play. Existing activity IDs, ordering, and progress format remain compatible. Earlier paragraphs describing queued robot commands or required predictions are superseded by this section.

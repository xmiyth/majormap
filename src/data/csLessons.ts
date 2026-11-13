export type LessonActivity = {
  id: string;
  kind: 'choice' | 'robot' | 'game';
  title: string;
  concept: string;
  prompt: string;
  options?: string[];
  answer?: number;
  hint: string;
  explanation: string;
  customize?: boolean;
};

export type Lesson = { id: string; title: string; subtitle: string; icon: string; activities: LessonActivity[] };

export const csLessons: Lesson[] = [
  {
    "id": "instructions",
    "title": "Guide the robot",
    "subtitle": "Tell a robot where to go",
    "icon": "01",
    "activities": [
      {
        "id": "precise",
        "kind": "choice",
        "title": "Give a clear instruction",
        "concept": "Computers follow instructions literally. You will tell a little robot where to go.",
        "prompt": "Which instruction tells the robot exactly what to do?",
        "options": [
          "Go somewhere nice",
          "Move one square right",
          "Do something"
        ],
        "answer": 1,
        "hint": "Choose a clear direction and distance: one square to the right.",
        "explanation": "A clear instruction tells the robot exactly where to move."
      },
      {
        "id": "route",
        "kind": "robot",
        "title": "Help the robot reach the star",
        "concept": "You control the robot with the buttons below. It moves as soon as you tap.",
        "prompt": "Reach the star using the fewest movement commands, then collect it. Plan your route before you tap.",
        "hint": "Try Right, Right, Down, Collect. Clear lets you start over.",
        "explanation": "You gave the computer simple steps to follow. That is the basic idea of programming."
      }
    ]
  },
  {
    "id": "debugging",
    "title": "Find the bug",
    "subtitle": "Fix a game that is not counting points",
    "icon": "02",
    "activities": [
      {
        "id": "boundary",
        "kind": "choice",
        "title": "Fix a broken score counter",
        "concept": "A score counter should keep its previous value when a new reward is added.",
        "prompt": "The score is 4. A star is worth 2, but collecting it changes the score to 2. Which update fixes the bug?",
        "options": [
          "score = 2",
          "score = score + 2",
          "score = score + 4"
        ],
        "answer": 1,
        "hint": "Compare replacing a value with adding to the value already stored.",
        "explanation": "score + 2 preserves the existing 4 points and adds the reward, producing 6."
      },
      {
        "id": "test",
        "kind": "choice",
        "title": "Check that it works",
        "concept": "Testing includes repeated actions, not just the first one.",
        "prompt": "Start at 1 point. Each star adds 2. What score should you expect after three stars?",
        "options": [
          "6 points",
          "5 points",
          "7 points"
        ],
        "answer": 2,
        "hint": "Write the score after each of the three updates.",
        "explanation": "The trace is 1 ? 3 ? 5 ? 7. Starting at zero would have hidden a different kind of bug."
      }
    ]
  },
  {
    "id": "conditions",
    "title": "Make a decision",
    "subtitle": "Decide when the player wins",
    "icon": "03",
    "activities": [
      {
        "id": "win",
        "kind": "choice",
        "title": "Choose when the game ends",
        "concept": "A player wins on reaching or passing a target. A reward can move the score past the exact target.",
        "prompt": "The target is 5. Stars award 2 points each. Which condition correctly ends the game?",
        "options": [
          "score == 5",
          "score >= 5",
          "score > 6"
        ],
        "answer": 1,
        "hint": "Trace 0, 2, 4, 6. Does your condition recognize the first score that reaches or passes 5?",
        "explanation": ">= handles both an exact target and an overshoot. Equality would never succeed for this sequence."
      },
      {
        "id": "predict",
        "kind": "choice",
        "title": "Predict the finish",
        "concept": "Predict the number of rewards needed from the current state.",
        "prompt": "Your score is 3, the target is 10, and each star adds 2. How many more stars are needed?",
        "options": [
          "Four more stars",
          "Three more stars",
          "Five more stars"
        ],
        "answer": 0,
        "hint": "Find the remaining points, then consider whether a partial star can be collected.",
        "explanation": "You need 7 more points. Three stars add 6, which is short. Four add 8 and take the score to 11."
      }
    ]
  },
  {
    "id": "build",
    "title": "Build Star Collector",
    "subtitle": "Tap stars and see your rules work",
    "icon": "04",
    "activities": [
      {
        "id": "event",
        "kind": "choice",
        "title": "Make a button do something",
        "concept": "Every button in an app needs an action. In this game, tapping a star should give you a point.",
        "prompt": "After a star tap, the score changes but the win message stays hidden. What should run after updating the score?",
        "options": [
          "Reset the score to zero",
          "Check whether the updated score reaches the target",
          "Only change the star color"
        ],
        "answer": 1,
        "hint": "The win condition needs the new state, not the old state.",
        "explanation": "Order matters: update the score, then evaluate the win condition using the updated value."
      },
      {
        "id": "play",
        "kind": "game",
        "title": "Play your first game",
        "concept": "This game is ready. Each star you tap adds a point.",
        "prompt": "Tap Start game. Then tap the star three times to win.",
        "hint": "The star moves after each tap. Find it and tap it again.",
        "explanation": "You tested the game: stars add points, and reaching the goal ends the round."
      }
    ]
  },
  {
    "id": "customize",
    "title": "Make it yours",
    "subtitle": "Choose a name and color for your game",
    "icon": "05",
    "activities": [
      {
        "id": "design",
        "kind": "choice",
        "title": "Make one small change",
        "concept": "Trying a major also means seeing whether you enjoy making something your own.",
        "prompt": "You want a new appearance while preserving the same difficulty. Which change fits?",
        "options": [
          "Double the points per star",
          "Change only the star color",
          "Reduce the target score"
        ],
        "answer": 1,
        "hint": "Ask whether the change affects how many actions it takes to win.",
        "explanation": "Color changes appearance. Points and targets change the number of stars needed, which changes gameplay."
      },
      {
        "id": "project",
        "kind": "game",
        "customize": true,
        "title": "Make the game yours",
        "concept": "You have a working game. Give it a name and choose a star color.",
        "prompt": "Choose a name and color, then tap Start game and collect stars.",
        "hint": "The starting settings work already. Name your game, choose a color, and play.",
        "explanation": "You changed and tested a game. Did you enjoy figuring things out and making something work?"
      }
    ]
  }
];

export const lessonSkills = [
  {
    "symbol": "\u2197",
    "name": "Clear instructions",
    "goal": "Tell a robot what to do, one step at a time.",
    "use": "Use this when breaking a homework task or app feature into small steps.",
    "challenge": "Think of an app you use. What is one small thing you would improve?"
  },
  {
    "symbol": "\u2315",
    "name": "Fixing mistakes",
    "goal": "Notice a mistake and choose a fix.",
    "use": "Use this when a spreadsheet, calculation, or program gives a surprising answer.",
    "challenge": "Think of an app you use. What is one small thing you would improve?"
  },
  {
    "symbol": "\u25c7",
    "name": "Simple rules",
    "goal": "Decide when the player wins.",
    "use": "The same conditions power spending limits, eligibility checks, and game rules.",
    "challenge": "Think of an app you use. What is one small thing you would improve?"
  },
  {
    "symbol": "\u2605",
    "name": "Testing a game",
    "goal": "Try a game and check that it works.",
    "use": "Buttons, shopping carts, and games all respond to events by updating state.",
    "challenge": "Think of an app you use. What is one small thing you would improve?"
  },
  {
    "symbol": "\u2691",
    "name": "Making it yours",
    "goal": "Give a working game your own style.",
    "use": "Controlled experiments help you explain why a change improved a product.",
    "challenge": "Think of an app you use. What is one small thing you would improve?"
  }
];

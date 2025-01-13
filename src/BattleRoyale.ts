import type { CsvRow } from "./CsvDropzone";

export type BrRow = CsvRow & {
  alive: boolean;
};

export type BrState = {
  remainingPlayers: BrRow[];
  eliminatedPlayers: BrRow[];
  newPlayers: BrRow[];
};

type BrAction =
  | {
      type: "game";
      payload: { data: CsvRow[]; numEliminate: number };
    }
  | {
      type: "toggleState";
      payload: { username: string };
    }
  | {
      type: "reset";
    };

function createState(game: CsvRow[]): BrState {
  return {
    remainingPlayers: game.map((r) => ({ ...r, alive: true })),
    eliminatedPlayers: [],
    newPlayers: [],
  };
}

function eliminatePlayers(state: BrState, numEliminate: number): BrState {
  if (numEliminate <= 0) {
    return state;
  }

  return {
    remainingPlayers: state.remainingPlayers.slice(0, -numEliminate),
    eliminatedPlayers: [
      ...state.remainingPlayers
        .slice(-numEliminate)
        .map((item) => ({ ...item, alive: false })),
      ...state.eliminatedPlayers,
    ],
    newPlayers: state.newPlayers,
  };
}

function separateAlivePlayers(state: BrState): BrState {
  return {
    remainingPlayers: [
      ...state.remainingPlayers,
      ...state.eliminatedPlayers,
      ...state.newPlayers,
    ].filter((player) => player.alive),
    eliminatedPlayers: state.eliminatedPlayers.filter(
      (player) => !player.alive
    ),
    newPlayers: state.newPlayers.filter((player) => !player.alive),
  };
}

function removeInactivePlayers(state: BrState, game: CsvRow[]): BrState {
  const users = new Set(game.map((row) => row.username));
  return {
    remainingPlayers: state.remainingPlayers.filter((player) =>
      users.has(player.username)
    ),
    eliminatedPlayers: [
      ...state.remainingPlayers
        .filter((player) => !users.has(player.username))
        .map((player) => ({ ...player, alive: false })),
      ...state.eliminatedPlayers,
    ],
    newPlayers: state.newPlayers,
  };
}

function detectNewPlayers(state: BrState, game: CsvRow[]): BrState {
  const existingUsers = new Set(
    [
      ...state.remainingPlayers,
      ...state.eliminatedPlayers,
      ...state.newPlayers,
    ].map((row) => row.username)
  );
  return {
    remainingPlayers: state.remainingPlayers,
    eliminatedPlayers: state.eliminatedPlayers,
    newPlayers: [
      ...state.newPlayers,
      ...game
        .filter((row) => !existingUsers.has(row.username))
        .map((row) => ({
          username: row.username,
          totalScore: 0,
          alive: false,
        })),
    ],
  };
}

function scoreAndSort(state: BrState, game: CsvRow[]): BrState {
  const scoreMap = new Map(game.map((row) => [row.username, row.totalScore]));
  const sortedRemainingPlayers = state.remainingPlayers.map((player) => ({
    ...player,
    totalScore: scoreMap.get(player.username) || 0,
  }));

  return {
    remainingPlayers: sortedRemainingPlayers.sort(
      (a, b) => b.totalScore - a.totalScore
    ),
    eliminatedPlayers: state.eliminatedPlayers.map((player) => ({
      ...player,
      totalScore: 0,
    })),
    newPlayers: state.newPlayers,
  };
}

function toggleUser(data: BrRow[], username: string) {
  return data.map((r) => {
    if (r.username == username) {
      return { ...r, alive: !r.alive };
    } else {
      return r;
    }
  });
}

export function updateBattleRoyale(state: BrState, action: BrAction): BrState {
  switch (action.type) {
    case "game":
      const game = action.payload.data;
      if (state.remainingPlayers.length == 0) {
        const newState = createState(game);
        return eliminatePlayers(newState, action.payload.numEliminate);
      } else {
        const newState = separateAlivePlayers(state);
        const removeInactive = removeInactivePlayers(newState, game);
        const detectNew = detectNewPlayers(removeInactive, game);
        const sortedState = scoreAndSort(detectNew, game);
        return eliminatePlayers(sortedState, action.payload.numEliminate);
      }
    case "toggleState":
      return {
        remainingPlayers: toggleUser(
          state.remainingPlayers,
          action.payload.username
        ),
        eliminatedPlayers: toggleUser(
          state.eliminatedPlayers,
          action.payload.username
        ),
        newPlayers: toggleUser(state.newPlayers, action.payload.username),
      };
    case "reset":
      return {
        remainingPlayers: [],
        eliminatedPlayers: [],
        newPlayers: [],
      };
  }
}

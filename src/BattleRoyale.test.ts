import { expect, test } from "vitest";
import { updateBattleRoyale } from "./BattleRoyale";

test("new game adds all players", () => {
  const state = {
    remainingPlayers: [],
    eliminatedPlayers: [],
    newPlayers: [],
  };
  const game = [
    { username: "player 1", totalScore: 1000 },
    { username: "player 2", totalScore: 500 },
  ];
  const newState = updateBattleRoyale(state, {
    type: "game",
    payload: { data: game, numEliminate: 0 },
  });
  expect(newState.remainingPlayers.length).toBe(game.length);
  expect(newState.eliminatedPlayers.length).toBe(0);
  expect(newState.newPlayers.length).toBe(0);
});

test("new game removes worst players", () => {
  const state = {
    remainingPlayers: [],
    eliminatedPlayers: [],
    newPlayers: [],
  };
  const game = [
    { username: "player 1", totalScore: 1000 },
    { username: "player 2", totalScore: 500 },
    { username: "player 3", totalScore: 400 },
    { username: "player 4", totalScore: 300 },
  ];
  const newState = updateBattleRoyale(state, {
    type: "game",
    payload: { data: game, numEliminate: 2 },
  });
  expect(newState.remainingPlayers.length).toBe(2);
  expect(newState.remainingPlayers[0].alive).toBeTruthy();
  expect(newState.remainingPlayers[1].alive).toBeTruthy();
  expect(newState.eliminatedPlayers.length).toBe(2);
  expect(newState.eliminatedPlayers[0].alive).toBeFalsy();
  expect(newState.eliminatedPlayers[1].alive).toBeFalsy();
  expect(newState.newPlayers.length).toBe(0);
});

test("Handles second game", () => {
  const state = {
    remainingPlayers: [
      { username: "remaining 1", alive: true, totalScore: 10000 },
      { username: "remaining 2", alive: true, totalScore: 9000 },
    ],
    eliminatedPlayers: [
      { username: "eliminated 1", alive: false, totalScore: 3000 },
      { username: "eliminated 2", alive: false, totalScore: 0 },
    ],
    newPlayers: [{ username: "previously new 1", totalScore: 0, alive: false }],
  };

  // Given a second game
  const game = [
    { username: "new 1", totalScore: 9000 },
    { username: "remaining 2", totalScore: 6000 },
    { username: "eliminated 2", totalScore: 5000 },
    { username: "remaining 1", totalScore: 3000 },
    { username: "previously new 1", totalScore: 2000 },
    { username: "eliminated 1", totalScore: 1000 },
  ];
  const newState = updateBattleRoyale(state, {
    type: "game",
    payload: { data: game, numEliminate: 1 },
  });

  // Then only one player remains
  expect(newState.remainingPlayers).toStrictEqual([
    { username: "remaining 2", totalScore: 6000, alive: true },
  ]);
  // Eliminated players has the previous remaining players first with their score, other scores 0
  expect(newState.eliminatedPlayers).toStrictEqual([
    { username: "remaining 1", totalScore: 3000, alive: false },
    { username: "eliminated 1", totalScore: 0, alive: false },
    { username: "eliminated 2", totalScore: 0, alive: false },
  ]);
  // And new players are detected
  expect(newState.newPlayers).toStrictEqual([
    { username: "previously new 1", totalScore: 0, alive: false },
    { username: "new 1", totalScore: 0, alive: false },
  ]);
});

test("Removes inactive players before eliminating", () => {
  const state = {
    remainingPlayers: [
      { username: "remaining 1", alive: true, totalScore: 10000 },
      { username: "remaining 2", alive: true, totalScore: 9000 },
      { username: "remaining 3", alive: true, totalScore: 8000 },
    ],
    eliminatedPlayers: [
      { username: "eliminated 1", alive: false, totalScore: 3000 },
      { username: "eliminated 2", alive: false, totalScore: 0 },
    ],
    newPlayers: [{ username: "wants in 1", totalScore: 0, alive: false }],
  };

  // Given a second game where one remaining doesn't play
  const game = [
    { username: "remaining 3", totalScore: 9000 },
    { username: "eliminated 1", totalScore: 8000 },
    { username: "remaining 2", totalScore: 6000 },
  ];
  const newState = updateBattleRoyale(state, {
    type: "game",
    payload: { data: game, numEliminate: 1 },
  });

  // Then only one player remains
  expect(newState.remainingPlayers).toStrictEqual([
    { username: "remaining 3", totalScore: 9000, alive: true },
  ]);
  // Both the last scoring player and the n/a player are eliminated
  expect(newState.eliminatedPlayers).toStrictEqual([
    { username: "remaining 2", totalScore: 6000, alive: false },
    { username: "remaining 1", totalScore: 0, alive: false },
    { username: "eliminated 1", alive: false, totalScore: 0 },
    { username: "eliminated 2", alive: false, totalScore: 0 },
  ]);
  // New players doesn't change
  expect(newState.newPlayers).toStrictEqual(state.newPlayers);
});

test("toggleState changes players", () => {
  const state = {
    remainingPlayers: [
      { username: "remaining 1", alive: true, totalScore: 10000 },
      { username: "remaining 2", alive: true, totalScore: 9000 },
    ],
    eliminatedPlayers: [
      { username: "eliminated 1", alive: false, totalScore: 3000 },
      { username: "eliminated 2", alive: false, totalScore: 0 },
    ],
    newPlayers: [{ username: "new 1", alive: false, totalScore: 0 }],
  };
  const changeRemaining = updateBattleRoyale(state, {
    type: "toggleState",
    payload: { username: "remaining 1" },
  });
  expect(changeRemaining.remainingPlayers[0].alive).toBeFalsy();
  expect(changeRemaining.remainingPlayers[1].alive).toBeTruthy();

  const changeEliminated = updateBattleRoyale(state, {
    type: "toggleState",
    payload: { username: "eliminated 2" },
  });
  expect(changeEliminated.eliminatedPlayers[0].alive).toBeFalsy();
  expect(changeEliminated.eliminatedPlayers[1].alive).toBeTruthy();

  const newState = updateBattleRoyale(state, {
    type: "toggleState",
    payload: { username: "new 1" },
  });
  expect(newState.newPlayers[0].alive).toBeTruthy();
});

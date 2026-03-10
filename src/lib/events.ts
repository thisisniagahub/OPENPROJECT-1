import type { GameEventMap } from "@/types/game";

type Listener<T extends unknown[]> = (...args: T) => void;

class GameEventBus {
  private listeners = new Map<string, Set<Listener<unknown[]>>>();

  on<K extends keyof GameEventMap>(event: K, fn: Listener<GameEventMap[K]>): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(fn as Listener<unknown[]>);
    return () => this.off(event, fn);
  }

  off<K extends keyof GameEventMap>(event: K, fn: Listener<GameEventMap[K]>) {
    this.listeners.get(event)?.delete(fn as Listener<unknown[]>);
  }

  emit<K extends keyof GameEventMap>(event: K, ...args: GameEventMap[K]) {
    this.listeners.get(event)?.forEach((fn) => {
      try {
        fn(...args);
      } catch (err) {
        console.error(`[GameEventBus] listener error on "${event}":`, err);
      }
    });
  }
}

export const gameEvents = new GameEventBus();

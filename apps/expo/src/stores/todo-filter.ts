import { create } from "zustand";

// Example zustand store — client-only UI state (server state lives in
// Convex and comes through useQuery, which is already reactive).
export type TodoFilter = "all" | "active" | "done";

interface TodoFilterState {
  filter: TodoFilter;
  setFilter: (filter: TodoFilter) => void;
}

export const useTodoFilter = create<TodoFilterState>((set) => ({
  filter: "all",
  setFilter: (filter) => set({ filter }),
}));

"use client";

// Demo feature — realtime todos. Open this page on web and mobile at the
// same time to watch mutations sync live. Remove via `pnpm init:template`.
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";

import { api } from "@acme/backend/convex/_generated/api";
import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";

export function Todos() {
  const todos = useQuery(api.todos.list);
  const addTodo = useMutation(api.todos.add);
  const toggleTodo = useMutation(api.todos.toggle);
  const removeTodo = useMutation(api.todos.remove);
  const [text, setText] = useState("");

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (text.trim().length === 0) return;
    void addTodo({ text });
    setText("");
  };

  return (
    <div className="w-full max-w-md">
      <h2 className="mb-4 text-2xl font-bold">Todos</h2>
      <form onSubmit={onSubmit} className="mb-4 flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What needs doing?"
        />
        <Button type="submit">Add</Button>
      </form>

      {todos === undefined ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : todos.length === 0 ? (
        <p className="text-muted-foreground">
          Nothing yet. Add one here, watch it appear on mobile in realtime.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {todos.map((todo) => (
            <li
              key={todo._id}
              className="bg-muted flex items-center gap-3 rounded-lg p-3"
            >
              <button
                type="button"
                role="checkbox"
                aria-checked={todo.completed}
                onClick={() => void toggleTodo({ id: todo._id })}
                className={cn(
                  "border-primary size-5 shrink-0 rounded border",
                  todo.completed && "bg-primary",
                )}
              />
              <span
                className={cn(
                  "grow",
                  todo.completed && "text-muted-foreground line-through",
                )}
              >
                {todo.text}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void removeTodo({ id: todo._id })}
              >
                ✕
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

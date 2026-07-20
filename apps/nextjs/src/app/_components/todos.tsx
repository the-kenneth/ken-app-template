"use client";

import { useMutation, useQuery } from "convex/react";
// Demo feature — realtime todos. Open this page on web and mobile at the
// same time to watch mutations sync live. Remove via `pnpm init:template`.
import { useState } from "react";

import { track } from "@ken/analytics";
import { api } from "@ken/backend/convex/_generated/api";
import { cn } from "@ken/ui";
import { Button } from "@ken/ui/button";
import { Input } from "@ken/ui/input";
import { Skeleton } from "@ken/ui/skeleton";

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
    track("todo_added", { platform: "web" });
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
        // h-14 matches a real row: p-3 plus the h-8 ghost delete button.
        <div className="flex flex-col gap-2" role="status" aria-busy="true">
          <span className="sr-only">Loading todos</span>
          <Skeleton className="h-14 rounded-lg" />
          <Skeleton className="h-14 rounded-lg" />
          <Skeleton className="h-14 rounded-lg" />
        </div>
      ) : todos.length === 0 ? (
        <p className="text-muted-foreground">
          Nothing yet. Add one here, watch it appear on mobile in realtime.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {todos.map((todo) => (
            <li
              key={todo._id}
              className="flex items-center gap-3 rounded-lg bg-muted p-3"
            >
              <button
                type="button"
                role="checkbox"
                aria-checked={todo.completed}
                onClick={() => void toggleTodo({ id: todo._id })}
                className={cn(
                  "size-5 shrink-0 rounded border border-primary",
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

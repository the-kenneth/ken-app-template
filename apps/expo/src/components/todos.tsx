import { useMutation, useQuery } from "convex/react";
// Demo feature — realtime todos. Open web and mobile side by side to watch
// mutations sync live. Remove via `pnpm init:template`.
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";

import type { Tokens } from "@ken/tokens/native";
import type { TodoFilter } from "~/stores/todo-filter";

import { track } from "@ken/analytics";
import { api } from "@ken/backend/convex/_generated/api";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Skeleton,
  Text,
  useTokens,
} from "@ken/ui-mobile";
import { useTodoFilter } from "~/stores/todo-filter";

const FILTERS: TodoFilter[] = ["all", "active", "done"];

const FILTER_LABELS: Record<TodoFilter, string> = {
  all: "All",
  active: "Active",
  done: "Done",
};

const isTodoFilter = (value: string): value is TodoFilter =>
  (FILTERS as string[]).includes(value);

export function Todos() {
  const todos = useQuery(api.todos.list);
  const addTodo = useMutation(api.todos.add);
  const toggleTodo = useMutation(api.todos.toggle);
  const removeTodo = useMutation(api.todos.remove);
  const { filter, setFilter } = useTodoFilter();
  const [text, setText] = useState("");

  const tokens = useTokens();
  const styles = useMemo(() => buildStyles(tokens), [tokens]);

  const onAdd = () => {
    if (text.trim().length === 0) return;
    void addTodo({ text });
    track("todo_added", { platform: "mobile" });
    setText("");
  };

  const visible = (todos ?? []).filter((todo) =>
    filter === "all"
      ? true
      : filter === "done"
        ? todo.completed
        : !todo.completed,
  );

  return (
    <View style={styles.container}>
      <Text variant="h3">Todos</Text>

      <View style={styles.row}>
        <View style={styles.grow}>
          <Input
            value={text}
            onChangeText={setText}
            placeholder="What needs doing?"
            onSubmitEditing={onAdd}
            returnKeyType="done"
          />
        </View>
        <Button onPress={onAdd}>Add</Button>
      </View>

      {/* Client-only UI state, held in zustand rather than Convex. The menu
          itself is the same JSX as the web app's — only the import differs. */}
      <View style={styles.row}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Show: {FILTER_LABELS[filter]}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Filter</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={filter}
              onValueChange={(value) => {
                if (isTodoFilter(value)) setFilter(value);
              }}
            >
              {FILTERS.map((option) => (
                <DropdownMenuRadioItem key={option} value={option}>
                  {FILTER_LABELS[option]}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </View>

      {todos === undefined ? (
        // `accessible` collapses the placeholders into one element, so
        // VoiceOver announces the label instead of three anonymous views.
        <View
          style={styles.list}
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel="Loading todos"
        >
          <Skeleton style={styles.skeletonRow} />
          <Skeleton style={styles.skeletonRow} />
          <Skeleton style={styles.skeletonRow} />
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(todo) => todo._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text tone="muted">
              Nothing here. Add one, or add one on the web app and watch it
              appear in realtime.
            </Text>
          }
          renderItem={({ item: todo }) => (
            <View style={styles.todoRow}>
              <Pressable
                style={[styles.checkbox, todo.completed && styles.checkboxDone]}
                onPress={() => void toggleTodo({ id: todo._id })}
                // Brings the 20pt box up to the 44pt minimum tap target.
                hitSlop={12}
                accessibilityRole="checkbox"
                accessibilityLabel={todo.text}
                accessibilityState={{ checked: todo.completed }}
              />
              <Text
                style={[styles.grow, todo.completed && styles.done]}
                tone={todo.completed ? "muted" : "default"}
              >
                {todo.text}
              </Text>
              <Button
                variant="ghost"
                size="sm"
                onPress={() => void removeTodo({ id: todo._id })}
                accessibilityLabel={`Delete ${todo.text}`}
              >
                ✕
              </Button>
            </View>
          )}
        />
      )}
    </View>
  );
}

const buildStyles = (t: Tokens) =>
  StyleSheet.create({
    container: { flex: 1, gap: t.spacing * 3 },
    row: { flexDirection: "row", alignItems: "center", gap: t.spacing * 2 },
    grow: { flex: 1 },
    list: { gap: t.spacing * 2 },
    // Matches a real row: 12pt padding plus the 32pt sm button inside it.
    skeletonRow: { height: 56, borderRadius: t.radius.lg },
    todoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing * 3,
      padding: t.spacing * 3,
      borderRadius: t.radius.lg,
      backgroundColor: t.colors.muted,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: t.colors.primary,
    },
    checkboxDone: { backgroundColor: t.colors.primary },
    done: { textDecorationLine: "line-through" },
  });

// Demo feature — realtime todos. Open web and mobile side by side to watch
// mutations sync live. Remove via `pnpm init:template`.
import { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useMutation, useQuery } from "convex/react";

import { api } from "@acme/backend/convex/_generated/api";

import type { TodoFilter } from "~/stores/todo-filter";
import { useTodoFilter } from "~/stores/todo-filter";

const FILTERS: TodoFilter[] = ["all", "active", "done"];

export function Todos() {
  const todos = useQuery(api.todos.list);
  const addTodo = useMutation(api.todos.add);
  const toggleTodo = useMutation(api.todos.toggle);
  const removeTodo = useMutation(api.todos.remove);
  const { filter, setFilter } = useTodoFilter();
  const [text, setText] = useState("");

  const onAdd = () => {
    if (text.trim().length === 0) return;
    void addTodo({ text });
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
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="What needs doing?"
          onSubmitEditing={onAdd}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.addButton} onPress={onAdd}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === f && styles.filterChipTextActive,
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {todos === undefined ? (
        <Text style={styles.muted}>Loading…</Text>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(todo) => todo._id}
          ListEmptyComponent={
            <Text style={styles.muted}>
              Nothing here. Add one, or add one on the web app and watch it
              appear in realtime.
            </Text>
          }
          renderItem={({ item: todo }) => (
            <View style={styles.todoRow}>
              <TouchableOpacity
                style={[styles.checkbox, todo.completed && styles.checkboxDone]}
                onPress={() => void toggleTodo({ id: todo._id })}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: todo.completed }}
              />
              <Text
                style={[styles.todoText, todo.completed && styles.todoTextDone]}
              >
                {todo.text}
              </Text>
              <TouchableOpacity
                onPress={() => void removeTodo({ id: todo._id })}
              >
                <Text style={styles.delete}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D4D4D8",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#6366F1",
    borderRadius: 10,
    paddingHorizontal: 18,
    justifyContent: "center",
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: "#D4D4D8",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  filterChipActive: {
    backgroundColor: "#6366F1",
    borderColor: "#6366F1",
  },
  filterChipText: {
    color: "#3F3F46",
    textTransform: "capitalize",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  muted: {
    color: "#71717A",
  },
  todoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E4E4E7",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#6366F1",
  },
  checkboxDone: {
    backgroundColor: "#6366F1",
  },
  todoText: {
    flex: 1,
    fontSize: 16,
  },
  todoTextDone: {
    color: "#A1A1AA",
    textDecorationLine: "line-through",
  },
  delete: {
    color: "#DC2626",
    fontSize: 16,
    padding: 4,
  },
});

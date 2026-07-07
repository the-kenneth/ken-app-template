import { useAction } from "convex/react";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

import { track } from "@acme/analytics";
import { api } from "@acme/backend/convex/_generated/api";

/**
 * Demo: asks Convex to push a notification to all of this user's devices.
 * Needs a real device + EAS projectId (`eas init`) — see README.
 */
export function PushTestButton() {
  const sendTest = useAction(api.push.sendTestToMe);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  const onPress = async () => {
    setStatus("sending");
    try {
      await sendTest({});
      track("test_notification_sent", { platform: "mobile" });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={() => void onPress()}>
      <Text style={styles.text}>
        {status === "sending"
          ? "Sending…"
          : status === "sent"
            ? "Sent! Check your notifications"
            : status === "error"
              ? "Failed — see Convex logs"
              : "Send me a test notification"}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderColor: "#6366F1",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  text: {
    color: "#6366F1",
    fontWeight: "600",
  },
});

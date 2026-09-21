import { useAction } from "convex/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { TranslationString } from "~/locale/i18n";

import { track } from "@ken/analytics";
import { api } from "@ken/backend/convex/_generated/api";
import { Button } from "@ken/ui-mobile";

type Status = "idle" | "sending" | "sent" | "error";

const LABEL_KEYS: Record<Status, TranslationString> = {
  idle: "mobile.push.idle",
  sending: "mobile.push.sending",
  sent: "mobile.push.sent",
  error: "mobile.push.error",
};

/**
 * Demo: asks Convex to push a notification to all of this user's devices.
 * Needs a real device + EAS projectId (`eas init`) — see README.
 */
export function PushTestButton() {
  const { t } = useTranslation();
  const sendTest = useAction(api.push.sendTestToMe);
  const [status, setStatus] = useState<Status>("idle");

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
    <Button
      variant="outline"
      size="lg"
      disabled={status === "sending"}
      onPress={() => void onPress()}
    >
      {t(LABEL_KEYS[status])}
    </Button>
  );
}

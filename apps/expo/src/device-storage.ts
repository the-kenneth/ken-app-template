import { useMemo } from "react";
import { createMMKV, useMMKVString } from "react-native-mmkv";

// App-owned values share one instance so persistence remains discoverable.
export const deviceStorage = createMMKV({ id: "ken" });

/** A typed value persisted on this device. */
export interface DeviceStore<T> {
  readonly key: string;
  read: () => T;
  write: (value: T) => void;
  forget: () => void;
  use: () => T;
}

interface DeviceStoreSpec<T> {
  key: string;
  parse: (payload: unknown) => T | null;
  empty: T;
}

// Builds a validated store owned by the feature that declares it.
export function createStore<T>({
  key,
  parse,
  empty,
}: DeviceStoreSpec<T>): DeviceStore<T> {
  const decode = (stored: string | undefined): { value: T } | null => {
    if (stored === undefined) return { value: empty };

    let payload: unknown;
    try {
      payload = JSON.parse(stored);
    } catch {
      return null;
    }

    const parsed = parse(payload);
    return parsed === null ? null : { value: parsed };
  };

  return {
    key,

    read() {
      const decoded = decode(deviceStorage.getString(key));
      if (decoded !== null) return decoded.value;

      deviceStorage.remove(key);
      return empty;
    },

    write(value) {
      deviceStorage.set(key, JSON.stringify(value));
    },

    forget() {
      deviceStorage.remove(key);
    },

    use() {
      const [stored] = useMMKVString(key, deviceStorage);
      return useMemo(() => decode(stored)?.value ?? empty, [stored]);
    },
  };
}

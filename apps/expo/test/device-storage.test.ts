import { createStore, deviceStorage } from "~/device-storage";

const setting = createStore({
  key: "test-setting-v1",
  empty: "default",
  parse: (payload) => (typeof payload === "string" ? payload : null),
});

describe("device storage", () => {
  beforeEach(() => deviceStorage.clearAll());

  it("round-trips a feature-owned value", () => {
    setting.write("remembered");

    expect(setting.read()).toBe("remembered");
  });

  it("returns the empty value when nothing is stored", () => {
    expect(setting.read()).toBe("default");
  });

  it("drops values this build cannot parse", () => {
    deviceStorage.set(setting.key, JSON.stringify({ old: "shape" }));

    expect(setting.read()).toBe("default");
    expect(deviceStorage.getString(setting.key)).toBeUndefined();
  });
});

const stores = new Map<string, Map<string, string>>();

class MockMMKV {
  private readonly store: Map<string, string>;

  constructor(id: string) {
    this.store = stores.get(id) ?? new Map();
    stores.set(id, this.store);
  }

  getString(key: string) {
    return this.store.get(key);
  }
  set(key: string, value: string) {
    this.store.set(key, value);
  }
  remove(key: string) {
    this.store.delete(key);
  }
  clearAll() {
    this.store.clear();
  }
}

export const createMMKV = ({ id = "mmkv.default" } = {}) => new MockMMKV(id);

export const useMMKVString = (key: string, instance: MockMMKV) => [
  instance.getString(key),
];

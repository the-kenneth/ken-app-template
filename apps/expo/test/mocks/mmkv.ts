const store = new Map<string, string>();

export class MMKV {
  getString(key: string) {
    return store.get(key);
  }
  set(key: string, value: string) {
    store.set(key, value);
  }
  delete(key: string) {
    store.delete(key);
  }
  clearAll() {
    store.clear();
  }
}

export const useMMKVString = (key: string, instance: MMKV) => [
  instance.getString(key),
];

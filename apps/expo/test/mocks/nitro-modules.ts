// Nitro has no native side under Jest; native libraries receive a clear failure.
export const NitroModules = {
  createHybridObject: () => {
    throw new Error("Nitro has no native side under Jest.");
  },
};

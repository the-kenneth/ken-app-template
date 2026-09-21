import { View } from "react-native";

export const useSharedValue = <T,>(initial: T) => ({ value: initial });
export const useAnimatedStyle = <T,>(factory: () => T) => factory();
export const useReducedMotion = () => true;
export const withTiming = <T,>(target: T) => target;
export const withRepeat = <T,>(animation: T) => animation;

export default {
  View,
  createAnimatedComponent: <T,>(component: T) => component,
};

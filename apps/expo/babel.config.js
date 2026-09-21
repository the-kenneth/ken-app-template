// Metro reads babel-preset-expo by default; Jest's transform needs it stated.
module.exports = function (api) {
  api.cache(true);
  return { presets: ["babel-preset-expo"] };
};

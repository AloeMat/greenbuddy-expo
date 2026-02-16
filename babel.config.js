module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind", unstable_transformImportMeta: true }],
      "nativewind/babel",
    ],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./src"],
          alias: {
            "@": "./src",
            "@features": "./src/features",
            "@plants": "./src/features/plants",
            "@gamification": "./src/features/gamification",
            "@auth": "./src/features/auth",
            "@onboarding": "./src/features/onboarding",
            "@design-system": "./src/design-system",
            "@tokens": "./src/design-system/tokens",
            "@lib": "./src/lib",
            "@appTypes": "./src/types",
            "@components": "./components",
            "@utils": "./utils"
          }
        }
      ],
      "react-native-reanimated/plugin",
    ],
  };
};

module.exports = function (api) {
  api.cache(true);
  const isTestEnv = process.env.NODE_ENV === 'test';
  
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ...(!isTestEnv ? ['react-native-reanimated/plugin'] : []),
    ],
  };
};

const webpack = require("webpack");

module.exports = {
  resolve: {
    fallback: {
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      process: require.resolve("process/browser"),
      url: false,
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: "process/browser",
    }),
    new webpack.NormalModuleReplacementPlugin(
      /node:crypto/,
      require.resolve("crypto-browserify")
    ),
    new webpack.DefinePlugin({
      global: "globalThis",
    }),
  ],
};
const path = require("path");

module.exports = {
  mode: "production",
  target: "node",
  devtool: "source-map",
  entry: {
    authorizer: "./build/authorizer/index.js"
  },
  resolve: {
    extensions: [".js"],
  },
  module: {
    rules: [],
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name]/index.js",
    library: "main",
    libraryTarget: "commonjs2",
  },
};

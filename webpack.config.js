const path = require("path");

module.exports = {
  mode: 'production',
  entry: "./src/index.ts",
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, "dist"),
    library: 'aquaman-redux',
    libraryTarget: 'commonjs2'
  }
};

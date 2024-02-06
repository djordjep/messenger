const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: "./src/index.js", // Your entry point, adjust as necessary
  output: {
    path: path.resolve(__dirname, "public"), // Adjust the output directory as necessary
    filename: "bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    // other plugins
    new webpack.DefinePlugin({
      "process.env": JSON.stringify(process.env), // Pass all environment variables
      // Or define specific variables, e.g., 'process.env.NODE_ENV': JSON.stringify('production')
    }),
  ],
  mode: "development", // Use 'production' for production build
};

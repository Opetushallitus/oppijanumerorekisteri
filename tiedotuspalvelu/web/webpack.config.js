const path = require("node:path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = function () {
  return {
    mode: "development",
    entry: {
      main: path.resolve(__dirname, "src", "index.tsx"),
    },
    devServer: {
      port: 8086,
      devMiddleware: {
        publicPath: "/omat-viestit/",
      },
      proxy: [
        {
          context: ["/omat-viestit/ui"],
          target: "http://localhost:8085",
        },
      ],
    },
    output: {
      path: path.resolve(__dirname, "../src/main/resources/static/web-build"),
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: "index.html",
        template: path.resolve(__dirname, "src", "index.html"),
        chunks: ["main"],
      }),
    ],
  };
};

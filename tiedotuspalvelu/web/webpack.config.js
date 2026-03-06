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
          // Everything under /omat-viestit goes to Spring, except static assets
          context: ["/omat-viestit"],
          target: "http://localhost:8085",
          changeOrigin: true,
        },
        {
          // Shared-domain paths that exist in prod but are separate services
          context: ["/oppija-raamit", "/koski"],
          target: "https://testiopintopolku.fi",
          changeOrigin: true,
        },
      ],
    },
    output: {
      path: path.resolve(__dirname, "../src/main/resources/static/web-build"),
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js", ".css"],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: [
            "style-loader",
            {
              loader: "css-loader",
              options: {
                esModule: false,
              },
            },
          ],
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

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
          context: [
            "/omat-viestit/ui",
            "/omat-viestit/logout",
            "/omat-viestit/j_spring_cas_security_check",
          ],
          target: "http://localhost:8085",
        },
        {
          context: ["/oppija-raamit"],
          target: "https://testiopintopolku.fi",
          changeOrigin: true,
        },
        {
          context: ["/koski"],
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

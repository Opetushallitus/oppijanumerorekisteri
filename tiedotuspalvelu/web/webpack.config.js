const path = require("node:path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const commonRules = [
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
];

const commonResolve = {
  extensions: [".tsx", ".ts", ".js", ".css"],
};

module.exports = function () {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8085";

  return [
    {
      mode: "development",
      entry: {
        oppija: path.resolve(__dirname, "oppija", "index.tsx"),
      },
      devServer: {
        port: 8086,
        devMiddleware: {
          publicPath: "/omat-viestit",
        },
        proxy: [
          {
            context: ["/omat-viestit"],
            target: backendUrl,
            changeOrigin: true,
          },
          {
            context: ["/oppija-raamit", "/koski"],
            target: "https://testiopintopolku.fi",
            changeOrigin: true,
          },
        ],
      },
      output: {
        filename: "omat-viestit/[name].js",
        path: path.resolve(__dirname, "../src/main/resources/static"),
      },
      resolve: commonResolve,
      module: { rules: commonRules },
      plugins: [
        new HtmlWebpackPlugin({
          filename: "omat-viestit/index.html",
          template: path.resolve(__dirname, "oppija", "index.html"),
          chunks: ["oppija"],
        }),
      ],
    },
    {
      mode: "development",
      entry: {
        virkailija: path.resolve(__dirname, "virkailija", "index.tsx"),
      },
      devServer: {
        port: 8087,
        devMiddleware: {
          publicPath: "/tiedotuspalvelu",
        },
        proxy: [
          {
            context: ["/tiedotuspalvelu"],
            target: backendUrl,
          },
        ],
      },
      output: {
        filename: "tiedotuspalvelu/[name].js",
        path: path.resolve(__dirname, "../src/main/resources/static"),
      },
      resolve: commonResolve,
      module: { rules: commonRules },
      plugins: [
        new HtmlWebpackPlugin({
          filename: "tiedotuspalvelu/index.html",
          template: path.resolve(__dirname, "virkailija", "index.html"),
          chunks: ["virkailija"],
        }),
      ],
    },
  ];
};

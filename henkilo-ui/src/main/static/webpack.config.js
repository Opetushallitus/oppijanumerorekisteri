const path = require('path');
const webpack = require('webpack');
const resolve = require('resolve');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { createHash } = require('crypto');

const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';
const imageInlineSizeLimit = parseInt(process.env.IMAGE_INLINE_SIZE_LIMIT || '10000');

const isEnvDevelopment = process.env.NODE_ENV === 'development';
const isEnvProduction = process.env.NODE_ENV === 'production';
const isEnvProductionProfile = isEnvProduction && process.argv.includes('--profile');

const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;

const createEnvironmentHash = () => {
    const hash = createHash('md5');
    hash.update(JSON.stringify({ NODE_ENV: process.env.NODE_ENV }));
    return hash.digest('hex');
};

module.exports = function () {
    return {
        target: ['browserslist'],
        stats: 'errors-warnings',
        mode: isEnvProduction ? 'production' : 'development',
        bail: isEnvProduction,
        devtool: isEnvProduction ? (shouldUseSourceMap ? 'source-map' : false) : 'cheap-module-source-map',
        devServer: {
            allowedHosts: 'auto',
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*',
                'Access-Control-Allow-Headers': '*',
            },
            compress: true,
            static: {
                directory: path.resolve(__dirname, 'public'),
                publicPath: ['/henkilo-ui/'],
                watch: {
                    ignored: {},
                },
            },
            client: {
                overlay: {
                    errors: true,
                    warnings: false,
                },
            },
            devMiddleware: {
                publicPath: '/henkilo-ui',
            },
            host: '127.0.0.1',
            hot: true,
            historyApiFallback: {
                disableDotRule: true,
                index: '/henkilo-ui/',
            },
            port: 3000,
            proxy: [
                {
                    target: 'http://localhost:8080',
                    context: (pathname) => !/^\/henkilo-ui/.test(pathname),
                },
                {
                    target: 'http://localhost:8080',
                    context: (pathname) => /^\/henkilo-ui\/l10n/.test(pathname),
                },
                {
                    target: 'http://localhost:8080',
                    context: (pathname) => /^\/henkilo-ui\/config\/frontProperties/.test(pathname),
                },
            ],
        },
        entry: path.resolve(__dirname, 'src', 'index.tsx'),
        output: {
            path: path.resolve(__dirname, 'build'),
            pathinfo: isEnvDevelopment,
            filename: isEnvProduction
                ? 'static/js/[name].[contenthash:8].js'
                : isEnvDevelopment && 'static/js/bundle.js',
            chunkFilename: isEnvProduction
                ? 'static/js/[name].[contenthash:8].chunk.js'
                : isEnvDevelopment && 'static/js/[name].chunk.js',
            assetModuleFilename: 'static/media/[name].[hash][ext]',
            publicPath: '/henkilo-ui/',
            devtoolModuleFilenameTemplate: isEnvProduction
                ? (info) => path.relative(path.resolve(__dirname, 'src'), info.absoluteResourcePath).replace(/\\/g, '/')
                : isEnvDevelopment && ((info) => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/')),
        },
        cache: {
            type: 'filesystem',
            version: createEnvironmentHash(),
            cacheDirectory: path.resolve(__dirname, 'node_modules', '.cache'),
            store: 'pack',
            buildDependencies: {
                defaultWebpack: ['webpack/lib/'],
                config: [__filename],
                tsconfig: [path.resolve(__dirname, 'tsconfig.json')],
            },
        },
        resolve: {
            extensions: [
                '.web.mjs',
                '.mjs',
                '.web.js',
                '.js',
                '.web.ts',
                '.ts',
                '.web.tsx',
                '.tsx',
                '.json',
                '.web.jsx',
                '.jsx',
            ],
            alias: {
                ...(isEnvProductionProfile && {
                    'react-dom$': 'react-dom/profiling',
                    'scheduler/tracing': 'scheduler/tracing-profiling',
                }),
            },
        },
        module: {
            strictExportPresence: true,
            rules: [
                shouldUseSourceMap && {
                    enforce: 'pre',
                    test: /\.(js|mjs|jsx|ts|tsx|css)$/,
                    loader: require.resolve('source-map-loader'),
                },
                {
                    oneOf: [
                        {
                            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                            type: 'asset',
                            parser: {
                                dataUrlCondition: {
                                    maxSize: imageInlineSizeLimit,
                                },
                            },
                        },
                        { test: /\.svg/, type: 'asset/inline' },
                        {
                            test: /\.(js|mjs|jsx|ts|tsx)?$/,
                            exclude: /node_modules/,
                            use: [
                                {
                                    loader: 'ts-loader',
                                    options: {
                                        transpileOnly: isEnvDevelopment,
                                    },
                                },
                            ],
                        },
                        {
                            test: cssRegex,
                            exclude: cssModuleRegex,
                            use: ['style-loader', 'css-loader'],
                            sideEffects: true,
                        },
                        {
                            test: cssModuleRegex,
                            use: ['style-loader', 'css-loader'],
                        },
                        {
                            exclude: [/^$/, /\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
                            type: 'asset/resource',
                        },
                    ],
                },
            ].filter(Boolean),
        },
        plugins: [
            new HtmlWebpackPlugin(
                Object.assign(
                    {},
                    {
                        inject: true,
                        template: path.resolve(__dirname, 'public', 'index.html'),
                    },
                    isEnvProduction
                        ? {
                              minify: {
                                  removeComments: true,
                                  collapseWhitespace: true,
                                  removeRedundantAttributes: true,
                                  useShortDoctype: true,
                                  removeEmptyAttributes: true,
                                  removeStyleLinkTypeAttributes: true,
                                  keepClosingSlash: true,
                                  minifyJS: true,
                                  minifyCSS: true,
                                  minifyURLs: true,
                              },
                          }
                        : undefined
                )
            ),
            new webpack.DefinePlugin({
                'process.env': {
                    NODE_ENV: JSON.stringify(process.env.NODE_ENV),
                },
            }),
            isEnvProduction &&
                new MiniCssExtractPlugin({
                    filename: 'static/css/[name].[contenthash:8].css',
                    chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
                }),
            new CopyWebpackPlugin({
                patterns: [{ from: path.resolve(__dirname, 'public', 'favicon.ico') }],
            }),
            new WebpackManifestPlugin({
                fileName: 'asset-manifest.json',
                publicPath: '/henkilo-ui/',
                generate: (seed, files, entrypoints) => {
                    const manifestFiles = files.reduce((manifest, file) => {
                        manifest[file.name] = file.path;
                        return manifest;
                    }, seed);
                    const entrypointFiles = entrypoints.main.filter((fileName) => !fileName.endsWith('.map'));

                    return {
                        files: manifestFiles,
                        entrypoints: entrypointFiles,
                    };
                },
            }),
            new webpack.IgnorePlugin({
                resourceRegExp: /^\.\/locale$/,
                contextRegExp: /moment$/,
            }),
            new ForkTsCheckerWebpackPlugin({
                async: isEnvDevelopment,
                typescript: {
                    typescriptPath: resolve.sync('typescript', {
                        basedir: path.resolve(__dirname, 'node_modules'),
                    }),
                    configOverwrite: {
                        compilerOptions: {
                            sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
                            skipLibCheck: true,
                            inlineSourceMap: false,
                            declarationMap: false,
                            noEmit: true,
                            incremental: true,
                            tsBuildInfoFile: path.resolve(__dirname, 'node_modules', '.cache', 'tsconfig.tsbuildinfo'),
                        },
                    },
                    context: path.resolve(__dirname),
                    diagnosticOptions: {
                        syntactic: true,
                    },
                    mode: 'write-references',
                },
                issue: {
                    include: [{ file: '**/src/**/*.{ts,tsx}' }],
                    exclude: [
                        { file: '**/src/**/__tests__/**' },
                        { file: '**/src/**/?(*.){spec|test}.*' },
                        { file: '**/src/setupProxy.*' },
                    ],
                },
                logger: {
                    log: (message) => console.log(message),
                    error: (message) => console.error(message),
                },
            }),
        ].filter(Boolean),
    };
};

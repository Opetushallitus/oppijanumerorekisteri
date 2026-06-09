import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpack from 'webpack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isEnvDevelopment = process.env.NODE_ENV === 'development';
const isEnvProduction = process.env.NODE_ENV === 'production';
const isPlaywright = process.env.PLAYWRIGHT === 'true';

const cssModuleRegex = /\.module\.css$/;

export default function () {
    return {
        stats: 'errors-warnings',
        bail: isEnvProduction,
        devtool: isEnvProduction ? false : 'eval-source-map',
        devServer: {
            allowedHosts: ['localhost'],
            static: {
                directory: path.resolve(__dirname, 'public'),
                publicPath: ['/henkilo-ui/'],
            },
            client: {
                overlay: {
                    warnings: false,
                },
            },
            devMiddleware: {
                publicPath: '/henkilo-ui',
            },
            host: '127.0.0.1',
            historyApiFallback: {
                disableDotRule: true,
                index: '/henkilo-ui/',
                rewrites: [
                    { from: /^\/henkilo-ui\/kayttaja/, to: '/henkilo-ui/kayttaja.html' },
                    { to: '/henkilo-ui/main.html' },
                ],
            },
            port: isPlaywright ? 8686 : 3000,
            proxy: [
                {
                    target: `http://localhost:${isPlaywright ? '8585' : '8080'}`,
                    context: (pathname) => !/^\/henkilo-ui/.test(pathname),
                    changeOrigin: true,
                },
            ],
        },
        entry: {
            main: path.resolve(__dirname, 'src', 'index.tsx'),
            kayttaja: path.resolve(__dirname, 'src', 'kayttaja', 'index.tsx'),
        },
        output: {
            path: path.resolve(__dirname, 'build'),
            filename: isEnvProduction ? 'static/js/[name].[contenthash:8].js' : 'static/js/[name].bundle.js',
            chunkFilename: isEnvProduction ? 'static/js/[name].[contenthash:8].chunk.js' : 'static/js/[name].chunk.js',
            assetModuleFilename: 'static/media/[name].[hash][ext]',
            publicPath: '/henkilo-ui/',
        },
        cache: {
            type: 'filesystem',
            buildDependencies: {
                tsconfig: [path.resolve(__dirname, 'tsconfig.json')],
            },
        },
        resolve: {
            extensions: ['.mjs', '.js', '.ts', '.tsx', '.json'],
        },
        module: {
            strictExportPresence: true,
            rules: [
                isEnvDevelopment && {
                    enforce: 'pre',
                    test: /\.(js|mjs|jsx|ts|tsx|css)$/,
                    loader: 'source-map-loader',
                },
                {
                    oneOf: [
                        {
                            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                            type: 'asset',
                        },
                        { test: /\.svg$/, type: 'asset/inline' },
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
                            test: /\.css$/,
                            exclude: cssModuleRegex,
                            use: ['style-loader', 'css-loader'],
                            sideEffects: true,
                        },
                        {
                            test: cssModuleRegex,
                            use: [
                                'style-loader',
                                {
                                    loader: 'css-loader',
                                    options: {
                                        esModule: false,
                                    },
                                },
                            ],
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
            new HtmlWebpackPlugin({
                filename: 'main.html',
                template: path.resolve(__dirname, 'public', 'index.html'),
                favicon: path.resolve(__dirname, 'public', 'favicon.ico'),
                chunks: ['main'],
            }),
            new HtmlWebpackPlugin({
                filename: 'kayttaja.html',
                template: path.resolve(__dirname, 'public', 'index.html'),
                favicon: path.resolve(__dirname, 'public', 'favicon.ico'),
                chunks: ['kayttaja'],
            }),
            new ForkTsCheckerWebpackPlugin({
                typescript: {
                    configOverwrite: {
                        compilerOptions: {
                            sourceMap: isEnvDevelopment,
                            noEmit: true,
                            incremental: true,
                            tsBuildInfoFile: path.resolve(__dirname, 'node_modules', '.cache', 'tsconfig.tsbuildinfo'),
                        },
                    },
                    diagnosticOptions: {
                        syntactic: true,
                    },
                    mode: 'write-references',
                },
            }),
        ],
    };
}

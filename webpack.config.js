const path = require('path')
const { DefinePlugin } = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { execSync } = require('child_process')

module.exports = (env, argv) => {
  const commitHash = execSync('git rev-parse HEAD').toString().substr(0, 12)
  const server =
    argv.mode === 'production'
      ? 'api.partyline.chat'
      : 'api-staging.partyline.chat'
  const apiEndpoint = `https://${server}`
  const wsEndpoint = `wss://${server}/ws`

  const commonConfig = {
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.(png|mp3)$/,
          loader: 'file-loader',
          options: {
            name: '[name]-[contenthash].[ext]',
          },
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
  }

  const mainConfig = {
    ...commonConfig,
    entry: './src/index.tsx',
    output: {
      filename: '[name]-[contenthash].js',
      path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
      new DefinePlugin({
        'process.env.GIT_COMMIT_HASH': JSON.stringify(commitHash),
        'process.env.API_ENDPOINT': JSON.stringify(apiEndpoint),
        'process.env.WS_ENDPOINT': JSON.stringify(wsEndpoint),
      }),
      new HtmlWebpackPlugin({
        title: 'PartyLine',
        template: 'src/index.ejs',
      }),
    ],
  }

  const swConfig = {
    ...commonConfig,
    entry: './src/firebase-messaging-sw.js',
    output: {
      filename: 'firebase-messaging-sw.js',
      path: path.resolve(__dirname, 'dist'),
    },
  }

  return [mainConfig, swConfig]
}

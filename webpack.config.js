import TerserPlugin from 'terser-webpack-plugin';
import webpack from 'webpack';

/** @type {import('webpack').Configuration} */
export default (_, args) => ({
  entry: {
    index: './src/index.ts',
    ...(args.mode !== 'production' && { test: './__tests__/test.tsx' }),
  },

  experiments: {
    outputModule: true,
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },

  ...(args.mode !== 'production' && { devtool: 'eval' }),

  externals:
    args.mode !== 'production'
      ? []
      : ['react', 'react-dom', 'react/jsx-runtime'],

  resolve: {
    extensions: ['.ts', '.tsx', '.json', '...'],
  },

  optimization: {
    minimize: args.mode !== 'development',
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          sourceMap: args.mode !== 'development',
          compress: {
            drop_console: true,
          },
        },
      }),
    ],
  },

  plugins: [
    // TODO: remove this when https://github.com/webpack/webpack/issues/13252 is resolved
    // @sokra says it will go into webpack core
    // Inspired by https://github.com/webpack/webpack/issues/13252#issuecomment-828587290
    new webpack.NormalModuleReplacementPlugin(/\.js$/, (resource) => {
      if (
        resource.contextInfo.issuer.match(/\.tsx?$/) &&
        resource.request.indexOf('.') === 0 &&
        !resource.request.includes('node_modules')
      ) {
        resource.request = resource.request.replace(/\.js$/, '');
      }
    }),
  ],

  output: {
    path: 'build',
    module: true,
    filename: '[name].js',
    library: {
      type: 'module',
    },
  },

  stats: {
    errorDetails: true,
  },
});

/* eslint-env node */
module.exports = {
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.glb$/i,
        use: ['file-loader'],
      },
    ],
  },
  devServer: {
    contentBase: './dist',
  },
};

module.exports = {
  context: __dirname,

  entry: "./src/index.jsx",

  output: {
    filename: "bundle.js",
    path: __dirname,
  },
  watchOptions: {
    ignored: [
      /node_modules/, 
    ]
  },
  // Existing Code ....
  module : {
    rules: [
      {
        test : /\.jsx?/,
        exclude: /(node_modules|bower_components)/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ['@babel/preset-env']
            }
          }
        ]
      },
      {
        test: /\.(scss|css)$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      }, 
    ]
  }
};

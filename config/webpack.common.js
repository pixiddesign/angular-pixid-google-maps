const webpack = require('webpack');
const helpers = require('./helpers');

/*
 * Webpack Plugins
 */
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

/*
 * Webpack Constants
 */
const METADATA = {
  app: 'pixid.googleMaps',
  title: 'Pixid Google Maps',
  baseUrl: '/'
};

/*
 * Webpack configuration
 *
 * See: http://webpack.github.io/docs/configuration.html#cli
 */
module.exports = {

  /*
   * Static metadata for index.html
   *
   * See: (custom attribute)
   */
  metadata: METADATA,

  /*
   * Cache generated modules and chunks to improve performance for multiple incremental builds.
   * This is enabled by default in watch mode.
   * You can pass false to disable it.
   *
   * See: http://webpack.github.io/docs/configuration.html#cache
   */
  // cache: false,

  /*
   * The entry point for the bundle
   * Our Angular.js app
   *
   * See: http://webpack.github.io/docs/configuration.html#entry
   */
  entry: {

    'polyfills': './src/polyfills.js',
    'vendor': './src/vendor.js',
    'main': './src/main.browser.js',

  },

  /*
   * Options affecting the resolving of modules.
   *
   * See: http://webpack.github.io/docs/configuration.html#resolve
   */
  resolve: {

    /*
     * An array of extensions that should be used to resolve modules.
     *
     * See: http://webpack.github.io/docs/configuration.html#resolve-extensions
     */
    extensions: ['', '.js'],

    // Make sure root is src
    root: helpers.root('src'),

    // Remove other default values
    modulesDirectories: [helpers.root('node_modules')],

    // Aliases
    alias: {
      'lodash/isPlainObject': 'lodash.isplainobject'
    },

  },

  /*
   * Options affecting the normal modules.
   *
   * See: http://webpack.github.io/docs/configuration.html#module
   */
  module: {

    /*
     * An array of applied pre and post loaders.
     *
     * See: http://webpack.github.io/docs/configuration.html#module-preloaders-module-postloaders
     */
    preLoaders: [

      /*
       * Eslint loader support for *.js files
       *
       * See: https://github.com/MoOx/eslint-loader
       */
      {
        test: /\.jsx?$/,
        loader: 'eslint-loader',
        exclude: [
          helpers.root('node_modules')
        ]
      },

      /*
       * Source map loader support for *.js files
       * Extracts SourceMaps for source files that as added as sourceMappingURL comment.
       *
       * See: https://github.com/webpack/source-map-loader
       */
      {
        test: /\.js$/,
        loader: 'source-map-loader',
        exclude: [
          // these packages have problems with their sourcemaps
          helpers.root('node_modules/rxjs')
        ]
      }

    ],

    /*
     * An array of automatically applied loaders.
     *
     * IMPORTANT: The loaders here are resolved relative to the resource which they are applied to.
     * This means they are not resolved relative to the configuration file.
     *
     * See: http://webpack.github.io/docs/configuration.html#module-loaders
     */
    loaders: [

      /*
       * ES6 loader support for .js and .jsx
       *
       * See: https://github.com/huston007/ng-annotate-loader
       * See: https://github.com/babel/babel-loader
       */
      {
        test: /\.jsx?$/,
        loaders: [
          'ng-annotate-loader',
          'babel-loader?presets[]=es2015&presets[]=stage-2'
        ],
        exclude: [
          helpers.root('node_modules'),
          /\.(spec|e2e)\.js$/
        ]
      },

      /*
       * CSS and SASS loader support for *.css and *.scss files
       *
       * See: https://github.com/webpack/css-loader
       * See: https://github.com/jtangelder/sass-loader
       */
      {
        test: /\.css$|\.scss$/,
        loader: ExtractTextPlugin.extract('style-loader', [
          'css-loader?sourceMap',
          'postcss-loader',
          'sass-loader?sourceMap'
        ])
      },

      /*
       * Font loader support
       *
       * See: https://github.com/webpack/file-loader
       * See: https://github.com/webpack/url-loader
       */
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader?limit=10000&minetype=application/font-woff'
      },
      {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader',
        exclude: [
          helpers.root('src/assets/images')
        ]
      },

      /*
       * Image loader support
       *
       * See: https://github.com/tcoopman/image-webpack-loader
       */
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: [
          `file-loader?name=[path][name].[ext]&context=${helpers.root('src')}`,
          'image-webpack-loader?bypassOnDebug&optimizationLevel=7&interlaced=false'
        ],
        include: [
          helpers.root('src/assets/images')
        ]
      },

      /*
       * Json loader support for *.json files.
       *
       * See: https://github.com/webpack/json-loader
       */
      {
        test: /\.json$/,
        loader: 'json-loader'
      },

      /*
       * Pug loader support for *.pug files.
       *
       * See: https://github.com/willyelm/pug-html-loader
       */
      {
        test: /\.pug$/,
        loaders: [
          `ngtemplate-loader?relativeTo=${helpers.root('src')}`,
          'pug-html-loader?doctype=html'
        ]
      },

      /*
       * Raw loader support for *.html
       * Returns file content as string
       *
       * See: https://github.com/webpack/raw-loader
       */
      {
        test: /\.html$/,
        loader: 'raw-loader',
        exclude: [
          helpers.root('src/index.html')
        ]
      },

    ]

  },

  /*
   * PostCSS configuration
   *
   * See: https://github.com/postcss/postcss-loader
   */
  postcss: [
    require('autoprefixer')
  ],

  /*
   * Add additional plugins to the compiler.
   *
   * See: http://webpack.github.io/docs/configuration.html#plugins
   */
  plugins: [

    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      moment: 'moment',
      'window.moment': 'moment'
    }),

    /*
     * Plugin: ExtractTextPlugin
     * Description: Moves all CSS or SCSS entries into a single CSS output file.
     *
     * See: https://github.com/webpack/extract-text-webpack-plugin
     */
    new ExtractTextPlugin('styles.css', {
      allChunks: true
    }),

    /*
     * Plugin: OccurenceOrderPlugin
     * Description: Varies the distribution of the ids to get the smallest id length
     * for often used ids.
     *
     * See: https://webpack.github.io/docs/list-of-plugins.html#occurrenceorderplugin
     * See: https://github.com/webpack/docs/wiki/optimization#minimize
     */
    new webpack.optimize.OccurenceOrderPlugin(true),

    /*
     * Plugin: CopyWebpackPlugin
     * Description: Copy files and directories in webpack.
     *
     * Copies project static assets.
     *
     * See: https://www.npmjs.com/package/copy-webpack-plugin
     */
    new CopyWebpackPlugin([
      {
        from: 'src/assets',
        to: 'assets',
        ignore: [
          '.DS_Store'
        ]
      },
      {
        from: {
          glob: 'src/*',
          dot: false
        },
        flatten: true,
        ignore: [
          '*.js',
          '*.html',
          '.DS_Store'
        ]
      }
    ])

  ],

  /*
   * Include polyfills or mocks for various node stuff
   * Description: Node configuration
   *
   * See: https://webpack.github.io/docs/configuration.html#node
   */
  node: {
    global: 'window',
    crypto: 'empty',
    module: false,
    clearImmediate: false,
    setImmediate: false
  },
};

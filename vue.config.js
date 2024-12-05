const path = require('path');
const webpack = require('webpack');
// const AddAssetHtmlWebpackPlugin = require('add-asset-html-webpack-plugin');
function resolve(dir) {
  return path.join(__dirname, dir);
}
const CompressionWebpackPlugin = require('compression-webpack-plugin');
// const UselessFile = require('useless-files-webpack-plugin');
// 压缩规则
const productionGzipExtensions = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i;
const isProduction = process.env.NODE_ENV === 'production';

// 多线程打包
const HappyPack = require('happypack');
const os = require('os');
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });

// 图片压缩规则
// 默认设置
const defaultOptions = {
  bypassOnDebug: true
};
//  自定义设置
const customOptions = {
  ...defaultOptions,
  mozjpeg: {
    progressive: true,
    quality: 65
  },
  optipng: {
    enabled: false
  },
  pngquant: {
    quality: [0.65, 0.9],
    speed: 4
  },
  gifsicle: {
    interlaced: false
  }
  // 不支持WEBP就不要写这一项
  // webp: {
  //   quality: 75
  // }
};

// const image-webpack-loader = require('image-webpack-loader');
module.exports = {
  chainWebpack: (config) => {
    config.module
      .rule('pdf-worker')
      .test(/pdf\.worker\.js$/)
      .use('worker-loader')
      .loader('worker-loader')
      .options({ inline: 'no-fallback' });
  },
  configureWebpack: {
    plugins: [new webpack.ProgressPlugin()]
  },
  publicPath: './',

  outputDir: 'dist',
  transpileDependencies: [],

  // 关闭eslint校验
  lintOnSave: true,

  runtimeCompiler: false, // babel-loader默认会跳过`node_modules`依赖. // 通过这个选项可以显示转译一个依赖

  productionSourceMap: false,

  // 调整内部的webpack配置.
  chainWebpack: (config) => {
    // 别名
    config.resolve.alias
      .set('@', resolve('src'))
      .set('_conf', resolve('config'))
      .set('@img', resolve('src/assets/imgs'))
      .set('@css', resolve('src/assets/css'));

    // 多线程打包
    // const jsRule = config.module.rule('js');
    // jsRule.uses.clear();
    // jsRule
    //   .use('happypack/loader?id=babel')
    //   .loader('happypack/loader?id=babel')
    //   .end();
    // config.plugin('happyPack').use(
    //   new HappyPack({
    //     id: 'babel',
    //     loaders: ['babel-loader?cacheDirectory=true'],
    //     threadPool: happyThreadPool
    //   })
    // );

    if (isProduction) {
      // 图片压缩
      // image-webpack-loader 用 cnpm的方式安装
      // config.module
      //   .rule('images')
      //   .test(/\.(png|jpe?g|gif)(\?.*)?$/)
      //   .use('image-webpack-loader')
      //   .loader('image-webpack-loader')
      //   .options(customOptions)
      //   .end();

      // config.optimization.minimizer('terser').tap(args => {
      //   args[0].terserOptions.cache = true;
      //   args[0].terserOptions.paraller = true;
      //   args[0].terserOptions.compress.pure_funcs = ['console.log', 'console.info'];
      //   return args;
      // });

      // 压缩，分割
      config.optimization.splitChunks({
        chunks: 'all',
        cacheGroups: {
          libs: {
            name: 'chunk-libs',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: 'initial'
          },
          elementUI: {
            name: 'chunk-elementUI',
            priority: 20,
            test: /[\\/]node_modules[\\/]_?element-ui(.*)/
          }
        }
      });
    }

    // 删除文件
    // config.plugin('uselessFile').use(
    //   new UselessFile({
    //     root: path.resolve(__dirname, './src/assets/images'),
    //     clean: true,
    //     exclude: /node_modules/
    //   })
    // );
  },

  // 外部配置一些webpack的插件
  configureWebpack: (config) => {
    const plugins = [
      new webpack.ProgressPlugin()
      // new webpack.ProvidePlugin({
      //   $: 'jquery',
      //   jQuery: 'jquery'
      // }),
      //html引入js文件
      // new AddAssetHtmlWebpackPlugin({
      //   filepath: resolve('public/static/js/load.min.js')
      // })
    ];
    if (isProduction) {
      plugins.push(new CompressionWebpackPlugin());
    }
    config.plugins = [...config.plugins, ...plugins];
  },

  // css: {
  //   extract: false, // 允许生成 CSS source maps?
  //   sourceMap: false,
  //   requireModuleExtension: false
  // },

  parallel: require('os').cpus().length > 1,

  devServer: {
    open: false,
    // disableHostCheck: false,
    allowedHosts: 'all',

    // host: local,
    port: 9000,
    https: false,
    hot: true,
    // proxy: null
    proxy: {
      '/api': {
        // 匹配所有到 /api 的请求
        target: process.env.VUE_APP_HOST, // 代理的目标地址
        changeOrigin: true, // 是否更改请求头中的Origin字段
        pathRewrite: {
          '^/api': '' // 重写路径：去掉路径中的 /api
        }
      }
    }
    // open: process.platform === 'darwin',
  },
  // css: {
  //   loaderOptions: {
  //     // 引入全局的公共样式
  //     scss: {
  //       // 注意：在 sass-loader v7 中，这个选项名是 "data", v8 的是prependData
  //       data: `@import "@/theme/index.scss";`
  //     }
  //   }
  // }
  css: {
    loaderOptions: {
      sass: {
        // 加载全局scss文件
        additionalData: `@import "@/theme/index.scss";`
      }
    }
  }
};

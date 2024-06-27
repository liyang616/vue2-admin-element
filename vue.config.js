const { defineConfig } = require("@vue/cli-service")
const path = require("path")
const defaultSettings = require("./src/settings.js")

function resolve(dir) {
  return path.join(__dirname, dir)
}

const name = defaultSettings.title // page title

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8081,
    https: false,
    proxy: {
      //配置跨域
      "/": {
        target: process.env.VUE_APP_BASE_API, // 接口地址
        changeOrigin: true,
        ws: false,
        secure: true
      }
    }
  },
  publicPath: "./",
  outputDir: "dist",
  assetsDir: "static",
  configureWebpack: {
    // 在 webpack 的 name 字段中提供应用程序的标题，以便
    // 可以在 index.html 中访问它以注入正确的标题。
    name: name,
    resolve: {
      alias: {
        "@": resolve("src")
      }
    }
  },
  chainWebpack(config) {
    // 防止当页面很多时，会导致过多无意义的请求
    config.plugins.delete("prefetch")

    config.when(process.env.NODE_ENV !== "development", (config) => {
      config
        .plugin("ScriptExtHtmlWebpackPlugin")
        .after("html")
        .use("script-ext-html-webpack-plugin", [
          {
            // `runtime` must same as runtimeChunk name. default is `runtime`
            inline: /runtime\..*\.js$/
          }
        ])
        .end()
      config.optimization.splitChunks({
        chunks: "all",
        cacheGroups: {
          libs: {
            name: "chunk-libs",
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: "initial" // only package third parties that are initially dependent
          },
          elementUI: {
            name: "chunk-elementUI", // split elementUI into a single package
            priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
            test: /[\\/]node_modules[\\/]_?element-ui(.*)/ // in order to adapt to cnpm
          },
          commons: {
            name: "chunk-commons",
            test: resolve("src/components"), // can customize your rules
            minChunks: 3, //  minimum common number
            priority: 5,
            reuseExistingChunk: true
          }
        }
      })
      // https:// webpack.js.org/configuration/optimization/#optimizationruntimechunk
      config.optimization.runtimeChunk("single")
    })
  }
})

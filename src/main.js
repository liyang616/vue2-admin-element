import Vue from "vue"
import App from "./App.vue"
import router from "./router"
import store from "./store"

import "normalize.css/normalize.css"

import ElementUI from "element-ui"
import "element-ui/lib/theme-chalk/index.css"
Vue.use(ElementUI)

import "@/styles/index.scss" // global css

import "./permission" // permission control
import "./utils/error-log" // error log

Vue.config.productionTip = false

import './mock/index'
// api接口
import { $api } from "@/api/index.js"
Vue.prototype.$api = $api

// 日期处理类库
import moment from "moment"
Vue.prototype.$moment = moment

// table满屏，最佳高度
Vue.prototype.$tableHeight = document.documentElement.clientHeight - 150

// 判断是否为手机端
let flag = navigator.userAgent.match(
  /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
)
flag ? (Vue.prototype.$isMobile = true) : (Vue.prototype.$isMobile = false)

// 图片查看器
import "viewerjs/dist/viewer.css"
import Viewer from "v-viewer"
Vue.use(Viewer)

new Vue({
  router,
  store,
  render: (h) => h(App)
}).$mount("#app")

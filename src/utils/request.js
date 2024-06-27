import Vue from "vue"
import axios from "axios"
import { MessageBox, Message } from "element-ui"
import store from "@/store"
import { getToken } from "@/utils/auth"
import { sign } from "@/utils/sign"
import router from "@/router"

// 创建一个 axios 实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  // withCredentials: true, // 跨域请求时发送cookies
  timeout: 5000 // 请求超时
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 在发送请求之前做一些事情

    // 接口签名,安全加固
    let sumJson = {}
    let keyName = config.method == "get" || config.method == "delete" ? "params" : "data" // 判断是什么类型的接口取不同字段的数据
    let requestData = config[keyName]

    // // 去除空值
    // let old_request_data = config[keyName]
    // let requestData = {}
    // if (old_request_data)
    //   requestData = Object.keys(old_request_data)
    //     .filter((key) => old_request_data[key] !== "" && old_request_data[key] !== null && old_request_data[key] !== undefined)
    //     .reduce((acc, key) => ({ ...acc, [key]: old_request_data[key] }), {})

    sumJson = sign(requestData)
    config[keyName] = sumJson

    if (getToken()) {
      config.headers["vue2-admin-token"] = "Bearer " + getToken()
    }

    return config
  },
  (error) => {
    // 处理请求错误
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    console.log(response)
    const res = response.data

    // 登录失效
    if (res.code == 2001) {
      MessageBox.confirm("登录失效，请重新登入", "提示", {
        confirmButtonText: "重新登录",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        store.dispatch("user/resetToken").then(() => {
          location.reload()
        })
      })
      return
    }

    // 业务code
    if (res.code != 200) {
      // 业务异常
      Message({
        message: res.msg || "Error",
        type: "error",
        duration: 3 * 1000
      })
      // return Promise.reject(new Error(res.msg || "Error"))
    }
    return res
  },
  (error) => {
    console.log("err" + error) // for debug
    if (error.response.status == 401) {
      // 无权限，去401页面
      router.push("/401")
    } else if (error.response.status == 404) {
      // 404页面
      router.push("/404")
    } else {
      // 其他异常，抛提示信息
      Message({
        message: error.response.data.msg,
        type: "error",
        duration: 3 * 1000
      })
    }
    // return Promise.reject(error)
  }
)

export default service

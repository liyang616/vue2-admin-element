import router from "./router"
import store from "./store"
import { Message } from "element-ui"
import NProgress from "nprogress"
import "nprogress/nprogress.css"
import { getToken } from "@/utils/auth"
import getPageTitle from "@/utils/get-page-title"

NProgress.configure({ showSpinner: false }) // NProgress Configuration

// 无需重定向，路由白名单
const whiteList = ["/login", "/auth-redirect"]

router.beforeEach(async (to, from, next) => {
  // 开始进度条
  NProgress.start()

  // 设置页面标题
  document.title = getPageTitle(to.meta.title)

  // 判断用户是否登录
  const hasToken = getToken()

  if (hasToken) {
    if (to.path === "/login") {
      // 如果已登录，则重定向到主页
      next({ path: "/" })
      NProgress.done()
    } else {
      // 判断用户是否通过getRoles获取了自己的权限角色
      const hasRoles = store.getters.roles && store.getters.roles.length > 0
      if (hasRoles) {
        next()
      } else {
        try {
          // 获取用户信息
          // 注意：角色必须是对象数组！ 如：['admin'] 或 ,['developer','editor']
          const { roles } = await store.dispatch("user/getRoles")

          // 根据角色生成可访问的路由映射
          const accessRoutes = await store.dispatch("permission/generateRoutes", roles)

          // 动态添加可访问的路由
          if (accessRoutes.length > 0) {
            for (let i = 0; i < accessRoutes.length; i++) {
              router.addRoute(accessRoutes[i])
            }
            // hack 方法来确保 addRoutes 执行完毕
            // 设置replace: true，导航不会留下历史记录
            next({ ...to, replace: true })
          }
        } catch (error) {
          // 移除token并进入登录页面重新登录
          await store.dispatch("user/resetToken")
          Message.error(error || "Has Error")
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    /* has no token*/

    if (whiteList.indexOf(to.path) !== -1) {
      // 在免费登录白名单中，直接进入
      next()
    } else {
      // 其他无权访问的页面被重定向到登录页面。
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // 完成进度条
  NProgress.done()
})

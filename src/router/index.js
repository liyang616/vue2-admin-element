import Vue from "vue"
import Router from "vue-router"

Vue.use(Router)

// 解决vue-router在3.1.0版本之后，push和replace方法会返回一个promise对象, 跳转到相同的路由报promise uncaught异常
const originalPush = Router.prototype.push
Router.prototype.push = function push(location, onResolve, onReject) {
  if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject)
  return originalPush.call(this, location).catch((err) => err)
}

/* Layout */
import Layout from "@/layout"

/**
 *
 * hidden: true                   如果设置为 true，项目将不会显示在侧边栏中(默认为 false)
 * alwaysShow: true               如果设置 true，这样它就会忽略之前定义的规则，一直显示根路由
 *                                如果不设置 alwaysShow，当你一个路由下面的 children 声明的路由大于1个时，自动会变成嵌套的模式，
 *                                只有一个时，会将那个子路由当做根路由显示在侧边栏
 * redirect: noRedirect           当设置 noRedirect 的时候该路由在面包屑导航中不可被点击
 * name:'router-name'             设定路由的名字，一定要填写不然使用<keep-alive>时会出现各种问题
 * meta : {
    roles: ['admin','editor']    设置该路由进入的权限，支持多个权限叠加
    title: 'title'               设置该路由在侧边栏和面包屑中展示的名字
    icon: 'svg-name'/'el-icon-x' 设置该路由的图标，支持 el-icon-x element-ui 的 icon
    noCache: true                设置为true，则不会被 <keep-alive> 缓存(默认 false)
    affix: true                  设置为false，则不会在breadcrumb面包屑中显示(默认 true)
    breadcrumb: false            设置为true，它则会固定在tags-view中(默认 false)
    activeMenu: '/example/list'  当路由设置了该属性，则会高亮相对应的侧边栏
  }
 */

/**
 * constantRoutes
 * 没有权限要求的基本页面
 * 所有角色都可以访问
 */
export const constantRoutes = [
  {
    path: "/redirect",
    component: Layout,
    hidden: true,
    children: [
      {
        path: "/redirect/:path(.*)",
        component: () => import("@/views/redirect/index")
      }
    ]
  },
  {
    path: "/login",
    component: () => import("@/views/login/index"),
    hidden: true
  },
  {
    path: "/404",
    component: () => import("@/views/error-page/404"),
    hidden: true
  },
  {
    path: "/401",
    component: () => import("@/views/error-page/401"),
    hidden: true
  },
  {
    path: "/",
    component: Layout,
    redirect: "/home",
    children: [
      {
        path: "home",
        component: () => import("@/views/home/index"),
        name: "home",
        meta: { title: "首页", icon: "el-icon-s-home", affix: true }
      }
    ]
  },
  {
    path: "/personal",
    component: Layout,
    redirect: "/personal/index",
    hidden: true,
    children: [
      {
        path: "index",
        component: () => import("@/views/personal/index"),
        name: "personal",
        meta: { title: "个人中心" }
      }
    ]
  }
]

/**
 * asyncRoutes
 * 需要根据用户角色动态加载的路由集合
 */
export const asyncRoutes = [
  {
    path: "/permissions",
    component: Layout,
    redirect: "/permissions/menu",
    name: "permissions",
    meta: {
      title: "权限管理",
      icon: "el-icon-s-tools",
      roles: ["admin"]
    },
    children: [
      {
        path: "menu",
        component: () => import("@/views/permissions/menu"),
        name: "permissions_menu",
        meta: {
          title: "菜单管理"
        }
      },
      {
        path: "role",
        component: () => import("@/views/permissions/role"),
        name: "permissions_role",
        meta: {
          title: "角色管理"
        }
      },
      {
        path: "user",
        component: () => import("@/views/permissions/user"),
        name: "permissions_user",
        meta: {
          title: "账号管理"
        }
      }
    ]
  },
  {
    path: "/demo",
    component: Layout,
    redirect: "/demo/table",
    name: "demo",
    alwaysShow: true,
    meta: {
      title: "常用示例",
      icon: "el-icon-menu"
    },
    children: [
      {
        path: "table",
        component: () => import("@/views/demo/table"),
        name: "demo_table",
        meta: {
          title: "数据报表"
        }
      }
    ]
  },
  // 404页面一定要放在最后！！！
  { path: "*", redirect: "/404", hidden: true }
]

const createRouter = () =>
  new Router({
    // mode: 'history', // require service support
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRoutes
  })

const router = createRouter()

export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router

import { asyncRoutes, constantRoutes } from "@/router"
import { $api } from "@/api/index.js"

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some((role) => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach((route) => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })
  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  generateRoutes({ commit }, roles) {
    return new Promise((resolve) => {
      $api.userMenu().then((res) => {
        if (res.code != 200) return
        let userMenu = res.data.list
        let route = []
        for (let i = 0; i < userMenu.length; i++) {
          // 用户菜单树，转为一维数组
          route.push({
            name: userMenu[i].route_name,
            hidden: !userMenu[i].depth ? false : !userMenu[i].is_show,
            noCache: !userMenu[i].depth ? false : !userMenu[i].is_cache,
            title: userMenu[i].display_name,
            icon: userMenu[i].icon
          })
          if (userMenu[i].children) {
            for (let i2 = 0; i2 < userMenu[i].children.length; i2++) {
              route.push({
                name: userMenu[i].children[i2].route_name,
                hidden: !userMenu[i].children[i2].depth ? false : !userMenu[i].children[i2].is_show,
                noCache: !userMenu[i].children[i2].depth
                  ? false
                  : !userMenu[i].children[i2].is_cache,
                title: userMenu[i].children[i2].display_name,
                icon: userMenu[i].children[i2].icon
              })
            }
          }
        }
        for (let i = 0; i < route.length; i++) {
          // 将用户菜单配置，添加到路由里
          for (let ii = 0; ii < asyncRoutes.length - 1; ii++) {
            if (!asyncRoutes[ii].meta.roles) {
              asyncRoutes[ii].meta.roles = []
            }
            if (asyncRoutes[ii].name == route[i].name) {
              asyncRoutes[ii].hidden = route[i].hidden
              asyncRoutes[ii].meta.noCache = route[i].noCache
              asyncRoutes[ii].meta.title = route[i].title
              asyncRoutes[ii].meta.icon = route[i].icon
              asyncRoutes[ii].meta.roles = roles
            }
            if (asyncRoutes[ii].children) {
              for (let ii2 = 0; ii2 < asyncRoutes[ii].children.length; ii2++) {
                if (!asyncRoutes[ii].children[ii2].meta.roles) {
                  asyncRoutes[ii].children[ii2].meta.roles = []
                }
                if (asyncRoutes[ii].children[ii2].name == route[i].name) {
                  asyncRoutes[ii].children[ii2].hidden = route[i].hidden
                  asyncRoutes[ii].children[ii2].meta.noCache = route[i].noCache
                  asyncRoutes[ii].children[ii2].meta.title = route[i].title
                  asyncRoutes[ii].children[ii2].meta.icon = route[i].icon
                  asyncRoutes[ii].children[ii2].meta.roles = roles
                }
              }
            }
          }
        }

        let accessedRoutes
        if (roles.includes("admin")) {
          // 超级管理员，无需过滤，直接拥有所有权限
          accessedRoutes = asyncRoutes || []
        } else {
          // 通过roles标识，过滤出有权限的路由
          accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
        }
        commit("SET_ROUTES", accessedRoutes)
        resolve(accessedRoutes)
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

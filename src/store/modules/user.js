import { $api } from "@/api/index"
import { setToken, removeToken } from "@/utils/auth"
import router, { resetRouter } from "@/router"

const state = {
  roles: [],
  userInfo: {}
}

const mutations = {
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_USER_INFO: (state, userInfo) => {
    state.userInfo = userInfo
  }
}

const actions = {
  // get user roles
  getRoles({ commit, state }) {
    return new Promise((resolve, reject) => {
      $api.adminUserInfo().then((res) => {
        if (res.code != 200) return
        // res.data.roles = ["admin"]  // 调试专用
        const { data } = res
        const { roles, info } = data
        if (!data) {
          reject("验证失败，请重新登录。")
        }
        if (!roles || roles.length <= 0) {
          reject("权限不足，请联系管理员！")
        }
        commit("SET_ROLES", roles)
        commit("SET_USER_INFO", info)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, dispatch }) {
    return new Promise((resolve, reject) => {
      $api
        .logout()
        .then((res) => {
          if (res.code == 200) {
            commit("SET_ROLES", [])
            commit("SET_USER_INFO", {})
            removeToken()
            resetRouter()

            // reset visited views and cached views
            dispatch("tagsView/delAllViews", null, { root: true })
          }
          resolve()
        })
        .catch((error) => {
          reject(error)
        })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise((resolve) => {
      commit("SET_ROLES", [])
      commit("SET_USER_INFO", {})
      removeToken()
      resolve()
    })
  },

  // dynamically modify permissions
  async changeRoles({ commit, dispatch }, role) {
    const token = role + "-token"

    setToken(token)

    const { roles } = await dispatch("getRoles")

    resetRouter()

    // generate accessible routes map based on roles
    const accessRoutes = await dispatch("permission/generateRoutes", roles, { root: true })
    // dynamically add accessible routes
    router.addRoutes(accessRoutes)

    // reset visited views and cached views
    dispatch("tagsView/delAllViews", null, { root: true })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

import http from "@/utils/request"

export const $api = {
  login: (json) => http.post("/login", json),
  logout: () => http.post("/logout"),
  phoneCode: (json) => http.get("/phone-code", { params: json }),
  adminUserInfo: (json) => http.post("/user-info", json),
  userMenu: () => http.get("/user-menu"),
  menuList: (json) => http.get("/menu-list", { params: json }),
  rolesList: (json) => http.get("/roles-list", { params: json }),
  userList: (json) => http.get("/user-list", json),
  rolesOption: () => http.get("/roles-option"),
  uploadAli: () => http.get("/upload-ali"),
  uploadQn: () => http.get("/upload-qn"),
  tableList: (json) => http.get("/table-list", { params: json }),
  tableAdd: (json) => http.post("/table-add", json),
  tableUpdate: (json) => http.post("/table-update", json),
  tableDelete: (json) => http.delete("/table-delete", { params: json })
}

import { getQueryObject } from "@/utils/index"
const Mock = require("mockjs")
let baseUrl = process.env.VUE_APP_BASE_API

Mock.setup({
  // 延迟时间200毫秒
  timeout: 200
})
Mock.Random.extend({
  phone: function () {
    var phonePrefixs = ["132", "135", "189"] // 前缀
    return this.pick(phonePrefixs) + Mock.mock(/\d{8}/) //Number()
  }
})

Mock.mock(baseUrl + "/login", "post", (req) => {
  const { mobile, password, code } = JSON.parse(req.body)
  if (mobile == "13516588888" && password == "123" && code == "123") {
    return {
      code: 200,
      msg: "登录成功",
      data: {
        token: "vue2admin123"
      }
    }
  } else {
    return {
      code: 401,
      msg: "登录失败",
      data: {}
    }
  }
})
Mock.mock(RegExp(baseUrl + "/phone-code.*"), "get", (req) => {
  return {
    code: 200,
    msg: "验证码已发送！(模拟发送，输入123使用即可)",
    data: {
      code: 123
    }
  }
})
Mock.mock(baseUrl + "/user-info", "post", (req) => {
  return {
    code: 200,
    msg: "用户信息",
    data: {
      info: {
        avatar: "http://resource.fntmob.com/file/2022-09-13/piVWkRkVwflGKoTXjbEZ.jpg",
        email: "123@qq.com",
        id: 1,
        mobile: "13516588888",
        platfrom_auth: '["admin"]',
        username: "vue2-admin"
      },
      roles: ["admin"]
    }
  }
})
Mock.mock(RegExp(baseUrl + "/user-menu.*"), "get", (req) => {
  return {
    code: 200,
    msg: "用户菜单",
    data: {
      list: [
        {
          id: 1,
          display_name: "权限管理",
          icon: "el-icon-s-tools",
          route_name: "permissions",
          is_show: 0,
          is_cache: 0,
          depth: 0,
          children: [
            {
              id: 11,
              display_name: "菜单管理",
              icon: "",
              route_name: "permissions_menu",
              is_show: 1,
              is_cache: 1,
              depth: 1
            },
            {
              id: 12,
              display_name: "角色管理",
              icon: "",
              route_name: "permissions_role",
              is_show: 1,
              is_cache: 1,
              depth: 1
            },
            {
              id: 13,
              display_name: "账号管理",
              icon: "",
              route_name: "permissions_user",
              is_show: 1,
              is_cache: 1,
              depth: 1
            }
          ]
        }
      ]
    }
  }
})
Mock.mock(baseUrl + "/logout", "post", (req) => {
  return {
    code: 200,
    msg: "退出登录",
    data: {}
  }
})
Mock.mock(RegExp(baseUrl + "/menu-list.*"), "get", (req) => {
  return {
    code: 200,
    msg: "菜单列表",
    data: {
      list: [
        {
          id: 1,
          display_name: "权限管理",
          icon: "el-icon-s-tools",
          route_name: "permissions",
          is_show: 0,
          is_cache: 0,
          depth: 0,
          children: [
            {
              id: 11,
              display_name: "菜单管理",
              icon: "",
              route_name: "permissions_menu",
              is_show: 1,
              is_cache: 1,
              depth: 1
            },
            {
              id: 12,
              display_name: "角色管理",
              icon: "",
              route_name: "permissions_role",
              is_show: 1,
              is_cache: 1,
              depth: 1
            },
            {
              id: 13,
              display_name: "账号管理",
              icon: "",
              route_name: "permissions_user",
              is_show: 1,
              is_cache: 1,
              depth: 1
            }
          ]
        }
      ]
    }
  }
})
Mock.mock(RegExp(baseUrl + "/roles-list.*"), "get", (req) => {
  return {
    code: 200,
    msg: "角色列表",
    data: {
      list: [
        {
          role_name: "超级管理员",
          role_code: "admin",
          role_menus: [
            [1, 11],
            [1, 12],
            [1, 13]
          ],
          role_desc: "管理员"
        }
      ],
      pages: { total: 2 }
    }
  }
})
Mock.mock(RegExp(baseUrl + "/user-list.*"), "get", (req) => {
  return {
    code: 200,
    msg: "角色列表",
    data: {
      list: [
        {
          id: 1,
          username: "admin",
          email: "123@qq.com",
          mobile: "13516588888",
          ip: "61.140.182.2",
          status: 0,
          create_time: 1653299598,
          update_time: 1687242745,
          avatar: "https://tool-officel.oss-cn-guangzhou.aliyuncs.com/account/2023-06-26/5187%E5%A4%B4%E5%83%8F.jpg",
          user_roles: [{ id: 1, name: "超级管理员" }]
        }
      ],
      pages: { total: 1 }
    }
  }
})
Mock.mock(RegExp(baseUrl + "/roles-option.*"), "get", (req) => {
  return {
    code: 200,
    msg: "角色列表",
    data: [
      {
        id: 1,
        role_code: "admin",
        role_name: "超级管理员"
      },
      {
        id: 2,
        role_code: "test",
        role_name: "测试"
      }
    ]
  }
})
Mock.mock(RegExp(baseUrl + "/upload-ali.*"), "get", (req) => {
  return {
    code: 200,
    msg: "阿里oss上传信息",
    data: {
      region: "oss-cn-guangzhou",
      accessKeyId: "STS.NTbPCnVXgieW7ZkScvxTKqhqB",
      accessKeySecret: "3EPzmtBacFy1FXBD5DTrZruZEGKgb7VCS8aVAq9bWPjy",
      stsToken:
        "CAIS9gF1q6Ft5B2yfSjIr5fXG/nau4dG3qe8NXzat2MjdNtnnq3aoDz2IH1JfXdpA+wesfQ/mm1Q6P4SlqJ2TJBYAFHcacx54syOa7U5ndOT1fau5Jko1beHewHKeTOZsebWZ+LmNqC/Ht6md1HDkAJq3LL+bk/Mdle5MJqP+/UFB5ZtKWveVzddA8pMLQZPsdITMWCrVcygKRn3mGHdfiEK00he8TovtPrhmpbMtUSF1Q2nl7Uvyt6vcsT+Xa5FJ4xiVtq55utye5fa3TRYgxowr/or1fIdo2uf4YHNXQQJvU3WKY7I9dpraQh3aKkxFqpUHCoxSTGCdIcagAG0Tb9sf7DptkIBFLdiQxLLVCwcg83hEmuc+JoG6v/PKQTWYk/xMv4PcyB3KLJN0UTmIVgUrze2ba2N/FUUP7OLt1JVQlD55EAqPiWX8Jpj6mI2EA0pqeKYQb06qbM8GeMhs5EfZ0qDM/gOVwlCbIHUzIGz7FUWp3Zzmq75Hhxr5w==",
      bucket: "tool-officel"
    }
  }
})
Mock.mock(RegExp(baseUrl + "/upload-qn.*"), "get", (req) => {
  return {
    code: 200,
    msg: "七牛云上传信息",
    data: {
      action: "https://up-z2.qiniup.com",
      token:
        "Xrhd5dp7yRqOP63iGKpesCEmBhHTBLqciDyMRGfm:-4rzB0cX2luTZ5AhokJa-HNhf3M=:eyJzY29wZSI6ImZ0YXBwLXJlc291cmNlIiwiZGVhZGxpbmUiOjE2ODc4NTcxMDd9",
      key: "file/2023-06-27/gqquJeCDWDzftMRnBcwE",
      domain: "http://resource.fntmob.com/"
    }
  }
})

let tableList = Mock.mock({
  "list|30-100": [
    {
      "id|1-1000": 1,
      user_name: "@cname",
      phone: "@phone",
      email: "@email",
      "cate_pid|1-2": 1,
      "cate_id|21-23": 21,
      "user_type|1-3": 1,
      vip_time: "@datetime()",
      remark: "1.演示demo的数据是mock模拟, id可能不唯一。<br>2.只支持用户名称查询。<br>3.实际开发时，请在对应的方法里按需修改即可。",
      ip: "@ip",
      create_time: "@datetime()",
      "avatar|1-39": 1,
      upload_img: "https://pic.rmb.bdstatic.com/bjh/528d649d23a0625d2cbbada101f99afd.jpeg"
    }
  ]
})
Mock.mock(RegExp(baseUrl + "/table-list.*"), "get", (req) => {
  let body = getQueryObject(req.url)
  let [current_page, page_size, name] = [body.current_page, body.page_size, body.name]
  let newList = tableList.list.slice((current_page - 1) * page_size, current_page * page_size)
  let total = tableList.list.length
  if (name) {
    // 用户名查询
    var reg = new RegExp(name)
    newList = []
    for (let i = 0; i < tableList.list.length; i++) {
      if (reg.test(tableList.list[i].user_name)) {
        newList.push(tableList.list[i])
      }
    }
    total = newList.length
  }
  return {
    code: 200,
    msg: "table数据",
    data: {
      total: total,
      list: newList
    }
  }
})
let add_number = 1000
Mock.mock(baseUrl + "/table-add", "post", (req) => {
  let body = JSON.parse(req.body)
  add_number += 1
  body.id = add_number
  tableList.list.unshift(body)
  return {
    code: 200,
    msg: "table新增",
    data: {}
  }
})
Mock.mock(baseUrl + "/table-update", "post", (req) => {
  let body = JSON.parse(req.body)
  let id = body.id
  for (let i = 0; i < tableList.list.length; i++) {
    if (tableList.list[i].id == id) {
      tableList.list[i] = body
      break
    }
  }
  return {
    code: 200,
    msg: "table修改",
    data: {}
  }
})
Mock.mock(RegExp(baseUrl + "/table-delete.*"), "delete", (req) => {
  let id = getQueryObject(req.url).id
  for (let i = 0; i < tableList.list.length; i++) {
    if (tableList.list[i].id == id) {
      tableList.list.splice(i, 1)
      break
    }
  }
  return {
    code: 200,
    msg: "table删除",
    data: {}
  }
})

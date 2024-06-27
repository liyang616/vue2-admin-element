<template>
  <div class="login-page">
    <el-card shadow="always" class="login-card">
      <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" autocomplete="on" label-position="left">
        <div class="title-container">
          <h3 class="title">vue2-admin</h3>
        </div>
        <h2>登 录</h2>
        <el-divider />
        <el-form-item prop="phone">
          <span class="svg-container"> 手机号 </span>
          <el-input
            ref="phone"
            v-model="loginForm.phone"
            prefix-icon="el-icon-user"
            placeholder="请输入账号"
            name="phone"
            type="text"
            tabindex="1"
            autocomplete="on"
          />
        </el-form-item>
        <el-form-item prop="password">
          <span class="svg-container"> 密 码 </span>
          <el-input
            :key="passwordType"
            ref="password"
            v-model="loginForm.password"
            prefix-icon="el-icon-lock"
            show-password
            clearable
            :type="passwordType"
            placeholder="请输入密码"
            name="password"
            tabindex="2"
            autocomplete="on"
            @keyup.enter.native="handleLogin"
          />
        </el-form-item>
        <el-form-item prop="code">
          <span class="svg-container"> 验证码 </span>
          <div class="form-get-code">
            <el-input
              ref="code"
              v-model="loginForm.code"
              placeholder="请输入验证码"
              name="code"
              type="text"
              tabindex="1"
              maxlength="8"
              autocomplete="on"
            />
            <div v-if="!codeDisabled" class="code-label" @click="getCode">获取验证码</div>
            <div v-else class="code-label disabled">{{ timeLabel }}</div>
          </div>
        </el-form-item>

        <div class="clearfix">
          <el-button class="login-btn" type="primary" @click.native.prevent="handleLogin">
            <i class="el-icon-s-promotion" /> 登 录
          </el-button>
        </div>
        <el-divider></el-divider>
        <div class="bottom">管理系统 @copyright 2022-{{ time }}</div>
      </el-form>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
@import "./index.scss";
</style>

<script>
import moment from "moment"
import { setToken } from "@/utils/auth"

let validatorPhone = (rule, value, callback) => {
  if (value === "") {
    callback(new Error("手机号不能为空"))
  } else if (!/^1\d{10}$/.test(value)) {
    callback(new Error("手机号格式错误"))
  } else {
    callback()
  }
}

export default {
  name: "login",
  data() {
    return {
      time: "",
      loginForm: {
        phone: "13516588888",
        password: "123",
        code: "123"
      },
      loginRules: {
        phone: [{ required: true, trigger: "blur", validator: validatorPhone }],
        password: [{ required: true, trigger: "blur", message: "请输入密码" }],
        code: [{ required: true, trigger: "blur", message: "请输入验证码" }]
      },
      passwordType: "password",
      redirect: undefined,
      otherQuery: {},
      timer: null,
      codeDisabled: false,
      timeLabel: "60秒后重试"
    }
  },
  watch: {
    $route: {
      handler: function (route) {
        const query = route.query
        if (query) {
          this.redirect = query.redirect
          this.otherQuery = this.getOtherQuery(query)
        }
      },
      immediate: true
    }
  },
  mounted() {
    this.time = moment().format("YYYY")
    if (this.loginForm.phone === "") {
      this.$refs.phone.focus()
    } else if (this.loginForm.password === "") {
      this.$refs.password.focus()
    }
  },
  methods: {
    handleLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.$api
            .login({
              mobile: this.loginForm.phone,
              password: this.loginForm.password,
              code: this.loginForm.code
            })
            .then((res) => {
              if (res.code != 200) return
              res = res.data
              setToken(res.token)
              this.$router.push({ path: this.redirect || "/", query: this.otherQuery })
            })
        }
      })
    },
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== "redirect") {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
    },
    //获取手机验证码，倒数60秒
    getCode() {
      this.$api.phoneCode({ mobile: this.loginForm.phone }).then((res) => {
        if (res.code != 200) return
        let time = 59
        this.codeDisabled = true
        this.$message({
          message: res.msg,
          type: "success"
        })
        this.timer = setInterval(() => {
          if (time == 0) {
            clearInterval(this.timer)
            this.timer = null
            this.timeLabel = "60秒后重试"
            const reg = /^1[23456789]\d{9}$/
            if (reg.test(this.loginForm.phone)) this.codeDisabled = false
          } else {
            this.codeDisabled = true
            this.timeLabel = time + "秒后重试"
            time--
          }
        }, 1000)
      })
    }
  }
}
</script>

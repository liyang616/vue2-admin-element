<template>
  <div :style="$isMobile ? 'width: 100%;' : 'width: 600px;'">
    <el-form ref="ruleForm" :model="ruleForm" :rules="rules" autocomplete="on" label-position="left">
      <el-form-item label="头像" class="avatar">
        <el-upload
          :action="uploadConfig.action || 'nourl'"
          :data="uploadConfig.data"
          list-type="picture-card"
          :file-list="fileList"
          :before-upload="(file) => handleBefore(file)"
          :on-remove="(file) => handleRemove(file)"
          :on-success="(file) => handleSuccess(file)"
          :on-preview="(file) => handlePreview(file)"
          :on-exceed="handleExceed"
          :limit="1"
          accept=".jpg,.jpeg,.png,.gif,.bmp,.JPG,.JPEG,.GIF,.BMP"
        >
          <i class="el-icon-plus"></i>
        </el-upload>
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="ruleForm.password" type="password" show-password clearable></el-input>
      </el-form-item>
      <el-form-item label="邮箱">
        <el-input v-model="ruleForm.email" clearable></el-input>
      </el-form-item>
      <el-form-item prop="code">
        <span class="code-tit"> 验证码 </span>
        <div class="form-get-code">
          <el-input
            ref="code"
            v-model="ruleForm.code"
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
    </el-form>
    <div class="form-btn">
      <el-button type="primary" size="small" @click="submitForm">修改信息</el-button>
    </div>

    <el-dialog :visible.sync="dialogVisible" :fullscreen="$isMobile ? true : false">
      <img width="100%" :src="dialogImageUrl" alt="" />
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.avatar {
  .el-form-item__content {
    line-height: initial;
  }
  .el-upload-list--picture-card .el-upload-list__item {
    margin: 0 8px 0 0;
  }
}
.code-tit {
  color: #606266;
  font-weight: bold;
}
</style>

<script>
import { mapGetters } from "vuex"
import { qnUpload } from "@/utils/upload.js"
export default {
  name: "personal",
  computed: {
    ...mapGetters(["userInfo"])
  },
  data() {
    return {
      uploadConfig: {},
      fileList: [],
      dialogImageUrl: "",
      dialogVisible: false,
      ruleForm: {
        mobile: "",
        password: "",
        code: "",
        avatar: "",
        email: ""
      },
      rules: {
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
  mounted() {
    this.getUserInfo()
  },
  methods: {
    getUserInfo() {
      this.fileList = [{ url: this.userInfo.avatar }]
      this.ruleForm.avatar = this.userInfo.avatar
      this.ruleForm.mobile = this.userInfo.mobile
      this.ruleForm.email = this.userInfo.email
    },
    /**
     * 上传文件
     */
    handleBefore(file) {
      return new Promise((resolve, reject) => {
        this.$api.uploadQn().then((res) => {
          qnUpload(this, res, file.name)
          if (!this.uploadConfig) {
            reject(false)
          } else {
            let fileType = ["jpg", "jpeg", "png", "gif", "bmp"]
            if (fileType.includes(this.uploadConfig.fileType)) {
              resolve(true)
              reject(false)
            } else {
              this.$message.error("只能上传图片")
              reject(false)
            }
          }
        })
      })
    },
    handleSuccess(res) {
      this.ruleForm.avatar = this.uploadConfig.domain + this.uploadConfig.data.key
    },
    handleRemove(file, fileList) {
      this.ruleForm.avatar = ""
    },
    handlePreview(file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    handleExceed(files, fileList) {
      this.$message({
        type: "warning",
        message: "头像只能上传一个"
      })
    },
    //获取手机验证码，倒数60秒
    getCode() {
      this.$api.phoneCode({ mobile: this.ruleForm.mobile }).then((res) => {
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
    },
    submitForm() {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          this.$message({
            type: "error",
            message: "演示环境暂不支持!"
          })
          return

          this.$api.updateUser(this.ruleForm).then((res) => {
            if (res.code != 200) return
            this.$message({
              type: "success",
              message: "修改成功！"
            })
          })
        } else {
          return false
        }
      })
    }
  }
}
</script>
@/utils/upload.js
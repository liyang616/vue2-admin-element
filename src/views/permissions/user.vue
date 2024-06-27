<template>
  <div>
    <el-form size="small" :inline="true" class="search-area">
      <el-form-item>
        <el-button type="primary" @click="showForm('add')">新增</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="tableData" :max-height="$tableHeight" row-key="id" border size="medium">
      <el-table-column prop="username" label="用户名" width="150"></el-table-column>
      <el-table-column prop="mobile" label="手机号" width="180"></el-table-column>
      <el-table-column prop="email" label="邮箱" width="180"></el-table-column>
      <el-table-column prop="ip" label="登录ip" width="180"></el-table-column>
      <el-table-column label="启用" width="100">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            :inactive-value="1"
            :active-value="0"
            @change="switchChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="角色权限" min-width="200" :width="$isMobile ? '200' : 'auto'">
        <template slot-scope="scope">
          <span v-for="item in scope.row.user_roles" :key="item.id">{{ item.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" width="160">
        <template slot-scope="scope">
          <span>{{ $moment(scope.row.update_time * 1000).format("YYYY-MM-DD HH:mm:ss") }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" :fixed="$isMobile ? false : 'right'">
        <template slot-scope="scope">
          <el-button size="mini" @click="showForm('edit', scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="del(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      class="table-page"
      @size-change="pageSizeChange"
      @current-change="pageCurrentChange"
      :current-page="pages.current_page"
      :page-sizes="[10, 30, 50, 100, 300]"
      :page-size="pages.page_size"
      :pager-count="5"
      :layout="$isMobile ? 'total, sizes, jumper' : 'total, sizes, prev, pager, next, jumper'"
      background
      :total="pages.total"
    >
    </el-pagination>

    <el-dialog
      :title="formTitle"
      :fullscreen="$isMobile ? true : false"
      :visible.sync="dialogForm"
      :close-on-click-modal="false"
      :before-close="cancel"
      width="700px"
    >
      <el-form :model="ruleForm" :rules="rules" :inline="$isMobile ? false : true" size="small" ref="ruleForm" label-width="96px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="ruleForm.username" clearable></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="ruleForm.mobile" clearable></el-input>
        </el-form-item>
        <el-form-item label="权限" prop="user_roles">
          <el-select v-model="ruleForm.user_roles" clearable filterable multiple placeholder="请选择" style="width: 100%">
            <el-option v-for="item in rolesData" :key="item.id" :label="item.role_name" :value="item.id"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="密码" :prop="type == 'add' ? 'password' : ''">
          <el-input v-model="ruleForm.password" type="password" show-password clearable></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="ruleForm.email" clearable></el-input>
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="ruleForm.status" :inactive-value="1" :active-value="0"></el-switch>
        </el-form-item>
        <el-form-item label="头像">
          <el-upload
            action="#"
            list-type="picture-card"
            :file-list="fileList"
            :http-request="httpUpload"
            :before-upload="handleBefore"
            :on-remove="handleRemove"
            :on-success="(res, file, fileList) => handleSuccess(fileList)"
            :on-preview="handlePreview"
            :on-exceed="handleExceed"
            :limit="1"
            accept=".jpg,.jpeg,.png,.gif,.bmp,.JPG,.JPEG,.GIF,.BMP"
          >
            <i class="el-icon-plus"></i>
          </el-upload>
        </el-form-item>
      </el-form>
      <div class="form-btn">
        <el-button type="primary" size="small" @click="submitForm">确定</el-button>
        <el-button size="small" @click="cancel">取消</el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogVisible" :fullscreen="$isMobile ? true : false">
      <img width="100%" :src="dialogImageUrl" alt="" />
    </el-dialog>
  </div>
</template>

<script>
import { aliUpload } from "@/utils/upload.js"
export default {
  name: "permissions_user",
  data() {
    const validateMobile = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("手机号不能为空"))
      } else {
        const reg = /^1[23456789]\d{9}$/
        if (reg.test(value)) {
          callback()
        } else {
          callback(new Error("请输入正确的手机号"))
        }
      }
    }
    return {
      fileList: [],
      dialogImageUrl: "",
      dialogVisible: false,
      pages: {
        current_page: 1,
        page_size: 10,
        total: 10
      }, // 分页信息
      rolesData: [],
      type: "", // add: 新增， edit: 编辑
      formTitle: "",
      currRow: {},
      dialogForm: false,
      ruleForm: {
        username: "",
        mobile: "",
        password: "",
        user_roles: [],
        email: "",
        avatar: "",
        status: 0 // 0启用, 1禁用
      },
      rules: {
        username: [{ required: true, message: "请输入", trigger: "blur" }],
        mobile: [{ required: true, validator: validateMobile, trigger: "blur" }],
        password: [{ required: true, message: "请输入", trigger: "blur" }],
        user_roles: [{ required: true, message: "请选择", trigger: "change" }]
      },
      tableData: []
    }
  },
  mounted() {
    this.getList()
    this.$api.rolesOption().then((res) => {
      if (res.code != 200) return
      this.rolesData = res.data
    })
  },
  methods: {
    getList() {
      let json = JSON.parse(JSON.stringify(this.pages))
      delete json.total
      this.$api.userList(json).then((res) => {
        if (res.code != 200) return
        this.tableData = res.data.list
        this.pages.total = res.data.pages.total
      })
    },
    pageSizeChange(val) {
      this.pages.page_size = val
      this.pages.current_page = 1
      this.getList()
    },
    pageCurrentChange(val) {
      this.pages.current_page = val
      this.getList()
    },

    // 上传
    handleBefore(file) {
      return new Promise((resolve, reject) => {
        let fileType = file.name.substring(file.name.lastIndexOf(".") + 1).toLowerCase()
        let typeAll = ["jpg", "jpeg", "png", "gif", "bmp"]
        if (typeAll.includes(fileType)) {
          resolve(true)
        } else {
          this.$message.error("只能上传图片")
          reject(false)
        }
      })
    },
    httpUpload(obj) {
      aliUpload(this, obj)
    },
    handleSuccess(fileList) {
      let url = []
      for (let i = 0; i < fileList.length; i++) {
        url.push(fileList[i].response)
      }
      this.ruleForm.avatar = url.toString()
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

    showForm(type, row) {
      this.dialogForm = true
      this.ruleForm = {
        username: "",
        mobile: "",
        password: "",
        user_roles: [],
        email: "",
        avatar: "",
        status: 0
      }
      setTimeout(() => {
        this.$refs.ruleForm.clearValidate()
      }, 100)

      this.type = type
      row ? (this.currRow = row) : (this.currRow = {})
      if (type == "add") this.formTitle = "新增"
      if (type == "edit") {
        this.formTitle = "编辑"
        this.ruleForm = JSON.parse(JSON.stringify(row))
        this.ruleForm.user_roles = []
        for (let i = 0; i < row.user_roles.length; i++) {
          this.ruleForm.user_roles.push(row.user_roles[i].id)
        }
        if (row.avatar) {
          this.fileList = [{ url: this.ruleForm.avatar }]
        }
      }
    },
    switchChange(row) {
      let json = {
        id: row.id,
        status: row.status
      }

      this.$message({
        type: "error",
        message: "演示环境暂不支持!"
      })
      return

      this.$api.adminStore(json).then((res) => {
        if (res.code != 200) return
        this.$message({
          type: "success",
          message: "编辑成功！"
        })
        this.getList()
      })
    },
    submitForm() {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          let json = JSON.parse(JSON.stringify(this.ruleForm))
          json.user_roles = json.user_roles.join(",")
          if (this.type == "edit") {
            json.id = this.currRow.id
          }

          this.$message({
            type: "error",
            message: "演示环境暂不支持!"
          })
          this.cancel()
          return

          this.$api.adminStore(json).then((res) => {
            if (res.code != 200) return
            this.$message({
              type: "success",
              message: this.type == "edit" ? "编辑成功！" : "新增成功！"
            })
            this.getList()
            this.cancel()
          })
        } else {
          return false
        }
      })
    },
    del(row) {
      this.$confirm("此操作将永久删除, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$message({
            type: "error",
            message: "演示环境暂不支持!"
          })
          return

          this.$api.adminDelete({ id: row.id }).then((res) => {
            if (res.code != 200) return
            this.$message({
              type: "success",
              message: "删除成功!"
            })
            this.getList()
          })
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          })
        })
    },
    cancel() {
      this.dialogForm = false
      // Dialog关闭时，清空上传list，解决重置数据导致闪动的问题
      this.fileList = []
    }
  }
}
</script>
@/utils/upload.js
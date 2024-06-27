<template>
  <div>
    <!-- 搜索 -->
    <el-form size="small" inline class="search-area">
      <el-form-item label="用户名称">
        <el-input v-model="searchForm.name" placeholder="只支持此项搜索" clearable />
      </el-form-item>
      <el-form-item label="用户分类">
        <el-cascader
          v-model="cate"
          :options="options"
          :props="{ value: 'id', label: 'name', children: 'submenu' }"
          @change="handleChange"
          clearable
        ></el-cascader>
      </el-form-item>
      <el-form-item label="用户类型">
        <el-select v-model="searchForm.type" placeholder="请选择" clearable>
          <el-option v-for="item in 3" :key="item" :label="'类型' + item" :value="item"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-if="!$isMobile">
        <el-date-picker
          v-model="dateTime"
          :picker-options="pickerOptions"
          type="daterange"
          value-format="yyyy-MM-dd"
          range-separator="至"
          start-placeholder="周期时间(开始)"
          end-placeholder="周期时间(结束)"
          align="right"
        >
        </el-date-picker>
      </el-form-item>
      <template v-else>
        <el-form-item>
          <el-date-picker
            v-model="dateTime[0]"
            :picker-options="pickerOptions"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="周期时间(开始)"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-date-picker
            v-model="dateTime[1]"
            :picker-options="pickerOptions"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="周期时间(结束)"
          >
          </el-date-picker>
        </el-form-item>
      </template>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="getList(true)">搜索</el-button>
      </el-form-item>
      <el-form-item>
        <el-button class="filter-item" type="primary" size="small" @click="showForm('add')">新增</el-button>
      </el-form-item>
    </el-form>

    <!-- 列表 -->
    <el-table :data="tableData" :max-height="$tableHeight" border size="medium">
      <el-table-column prop="id" label="id" min-width="60"></el-table-column>
      <el-table-column prop="user_name" label="用户名" min-width="100"></el-table-column>
      <el-table-column prop="phone" label="手机号" min-width="130"></el-table-column>
      <el-table-column prop="email" label="邮箱" min-width="200"></el-table-column>
      <el-table-column prop="ip" label="ip" min-width="160"></el-table-column>
      <el-table-column prop="create_time" label="创建时间" min-width="160"></el-table-column>
      <el-table-column label="图片预览" min-width="222">
        <template slot-scope="scope">
          <div class="table-img" v-if="scope.row.avatar">
            <img :src="require('@/assets/picture/img' + scope.row.avatar + '.jpg')" v-viewer alt="" />
          </div>
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

    <!-- 添加、修改 -->
    <el-dialog
      :title="formTitle"
      :fullscreen="$isMobile ? true : false"
      :visible.sync="dialogForm"
      :close-on-click-modal="false"
      @close="cancel"
      width="700px"
    >
      <el-form :model="ruleForm" :rules="rules" :inline="$isMobile ? false : true" size="small" ref="ruleForm" label-width="96px">
        <el-form-item label="用户名" prop="user_name">
          <el-input v-model="ruleForm.user_name" clearable placeholder="请输入" class="width-215" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="ruleForm.phone" clearable placeholder="请输入" class="width-215" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="ruleForm.email" clearable placeholder="请输入" class="width-215" />
        </el-form-item>
        <el-form-item label="用户分类" prop="cate_pid">
          <el-cascader
            v-model="cate2"
            :options="options"
            :props="{ value: 'id', label: 'name', children: 'submenu' }"
            @change="handleChange2"
            clearable
          ></el-cascader>
        </el-form-item>
        <el-form-item label="用户类型" prop="user_type">
          <el-select v-model="ruleForm.user_type" placeholder="请选择" clearable>
            <el-option v-for="item in 3" :key="item" :label="'类型' + item" :value="item"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="会员有效期" prop="vip_time">
          <el-date-picker
            v-model="ruleForm.vip_time"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="会员有效期"
            align="right"
            class="width-215"
          >
          </el-date-picker>
        </el-form-item>
        <div>
          <el-form-item label="图片" prop="avatar">
            <el-upload
              action="#"
              list-type="picture-card"
              :http-request="httpUpload"
              :file-list="fileList"
              :before-upload="(file) => handleBefore(file)"
              :on-remove="(file, fileList) => handleRemove()"
              :on-success="(res, file, fileList) => handleSuccess(fileList)"
              :on-preview="(file) => handlePreview(file)"
              :on-exceed="handleExceed"
              :limit="1"
              accept=".jpg,.jpeg,.png,.gif,.bmp,.JPG,.JPEG,.GIF,.BMP"
            >
              <i class="el-icon-plus"></i>
            </el-upload>
          </el-form-item>
        </div>
        <el-form-item label="备注">
          <div :class="$isMobile ? 'width-215' : 'width-536'">
            <editor ref="TEditer" v-model="ruleForm.remark"></editor>
          </div>
        </el-form-item>
      </el-form>
      <div class="form-btn">
        <el-button type="primary" size="small" @click="submitForm()">确定</el-button>
        <el-button size="small" @click="cancel()">取消</el-button>
      </div>
    </el-dialog>

    <!-- 查看物料 -->
    <el-dialog :visible.sync="dialogVisible" :fullscreen="$isMobile ? true : false">
      <img width="100%" :src="dialogImageUrl" alt="" />
    </el-dialog>
  </div>
</template>

<script>
import Editor from "@/components/TinymceEditor"
import { aliUpload } from "@/utils/upload.js"
export default {
  name: "demo_table",
  components: { Editor },
  data() {
    return {
      pickerOptions: {
        disabledDate: (time) => {
          return time.getTime() <= this.$moment().format("x") - 24 * 60 * 60 * 1000
        }
      },
      searchForm: {
        name: "",
        cate_pid: "",
        cate_id: "",
        user_type: "",
        start_time: "",
        end_time: ""
      },
      pages: {
        current_page: 1,
        page_size: 10,
        total: 10
      }, // 分页信息
      tableData: [],
      cate: [],
      cate2: [],
      options: [],
      dateTime: [],
      options: [
        {
          id: 1,
          name: "普通用户"
        },
        {
          id: 2,
          name: "会员用户",
          submenu: [
            {
              id: 21,
              name: "月vip"
            },
            {
              id: 22,
              name: "季vip"
            },
            {
              id: 23,
              name: "年vip"
            }
          ]
        }
      ],
      ruleForm: {
        user_name: "",
        phone: "",
        email: "",
        cate_pid: "",
        user_type: "",
        vip_time: "",
        avatar: "",
        upload_img: "",
        remark: ""
      },
      rules: {
        user_name: [{ required: true, message: "请输入", trigger: "blur" }],
        phone: [
          { required: true, message: "请输入", trigger: "blur" },
          { validator: this.validatePhoneNumber, trigger: "blur" }
        ],
        email: [
          { required: true, message: "请输入", trigger: "blur" },
          { validator: this.validateEmail, trigger: "blur" }
        ],
        cate_pid: [{ required: true, message: "请选择", trigger: "change" }],
        user_type: [{ required: true, message: "请选择", trigger: "change" }],
        vip_time: [{ required: true, message: "请选择", trigger: "change" }]
      },
      formTitle: "",
      dialogForm: false,
      dialogVisible: false,
      dialogImageUrl: "",
      dialogType: "",
      fileList: []
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    handleChange(value) {
      this.searchForm.cate_pid = value[0]
      this.searchForm.cate_id = value[1]
    },
    handleChange2(value) {
      this.ruleForm.cate_pid = value[0]
      this.ruleForm.cate_id = value[1]
    },

    getList(search) {
      if (search) this.pages.current_page = 1
      let page = JSON.parse(JSON.stringify(this.pages))
      delete page.total
      let json = Object.assign(page, this.searchForm)
      json.start_time = this.dateTime[0] || ""
      json.end_time = this.dateTime[1] || ""
      this.$api.tableList(json).then((res) => {
        if (res.code != 200) return
        this.tableData = res.data.list
        this.pages.total = res.data.total
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

    cancel() {
      this.dialogForm = false

      // Dialog关闭时，清空上传list，解决重置数据导致闪动的问题
      this.fileList = []
    },
    showForm(type, row) {
      this.dialogForm = true
      this.ruleForm = {
        user_name: "",
        phone: "",
        email: "",
        cate_pid: "",
        user_type: "",
        vip_time: "",
        avatar: "",
        upload_img: "",
        remark: ""
      }
      setTimeout(() => {
        this.$refs.ruleForm.clearValidate()
      }, 100)

      this.dialogType = type
      row ? (this.currRow = row) : (this.currRow = {})
      if (this.dialogType == "add") {
        this.formTitle = "新增"
      }
      if (this.dialogType == "edit") {
        this.formTitle = "编辑"
        this.ruleForm = row
        this.fileList = [{ url: row.upload_img }]
        this.cate2 = row.cate_pid === 2 ? [row.cate_pid, row.cate_id] : [row.cate_pid] // 模拟数据
        // this.cate2 = row.cate_id ? [row.cate_pid, row.cate_id] : [row.cate_pid] // 正常数据

        // this.$api.articleShow({ id: this.currRow.id }).then((res) => {
        //   if (res.code != 200) return
        //   this.ruleForm = res.data.info
        // })
      }
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
      this.ruleForm.upload_img = url.toString()
    },
    handleRemove() {
      this.ruleForm.upload_img = ""
    },
    handlePreview(file) {
      this.dialogImageUrl = file.url || file.response
      this.dialogVisible = true
    },
    handleExceed(files, fileList) {
      this.$message({
        type: "warning",
        message: "只能上传一个文件"
      })
    },

    validatePhoneNumber(rule, value, callback) {
      const reg = /^1[3456789]\d{9}$/
      if (reg.test(value)) {
        callback()
      } else {
        callback(new Error("请输入正确的手机号"))
      }
    },
    validateEmail(rule, value, callback) {
      const reg = /^[\w.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,63})$/
      if (reg.test(value)) {
        callback()
      } else {
        callback(new Error("请输入有效的邮箱"))
      }
    },

    submitForm() {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          let json = JSON.parse(JSON.stringify(this.ruleForm))
          if (!json.upload_img) {
            // 演示环境，暂不支持上传，新增/编辑，用固定图片
            json.upload_img = "https://pic4.zhimg.com/v2-edb0d83ffe6b884c1a1481cc9706ca03_r.jpg"
          }
          if (this.dialogType == "add") {
            delete json.id
          }
          this.$api[this.dialogType == "edit" ? "tableUpdate" : "tableAdd"](json).then((res) => {
            if (res.code != 200) return
            this.$message({
              type: "success",
              message: this.dialogType == "edit" ? "编辑成功！" : "新增成功！"
            })
            this.getList()
            this.dialogForm = false
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
          this.$api.tableDelete({ id: row.id }).then((res) => {
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
    }
  }
}
</script>
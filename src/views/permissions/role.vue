<template>
  <div>
    <el-form size="small" inline class="search-area">
      <el-form-item>
        <el-button type="primary" @click="showForm('add')">新增</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="tableData" :max-height="$tableHeight" row-key="id" border size="medium">
      <el-table-column prop="role_name" label="角色名称" width="180"></el-table-column>
      <el-table-column prop="role_code" label="角色标识" width="180"></el-table-column>
      <el-table-column prop="role_desc" label="角色描述" min-width="180" :width="$isMobile ? '180' : 'auto'"></el-table-column>
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
      :page-sizes="[10, 20, 30, 50, 100]"
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
      width="700px"
    >
      <el-form :model="ruleForm" :rules="rules" :inline="$isMobile ? false : true" size="small" ref="ruleForm" label-width="90px">
        <el-form-item label="角色名称" prop="role_name">
          <el-input v-model="ruleForm.role_name" clearable></el-input>
        </el-form-item>
        <el-form-item label="角色标识" prop="role_code">
          <el-input v-model="ruleForm.role_code" clearable></el-input>
        </el-form-item>
        <el-form-item label="权限菜单" prop="role_menus">
          <el-cascader
            v-model="ruleForm.role_menus"
            :options="menuData"
            :props="{ value: 'id', label: 'display_name', multiple: true }"
            collapse-tags
            clearable
          ></el-cascader>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="ruleForm.role_desc" clearable></el-input>
        </el-form-item>
      </el-form>
      <div class="form-btn">
        <el-button type="primary" size="small" @click="submitForm">确定</el-button>
        <el-button size="small" @click="cancel">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "permissions_role",
  data() {
    return {
      pages: {
        current_page: 1,
        page_size: 10,
        total: 10
      }, // 分页信息
      menuData: [],
      defaultProps: {
        children: "children",
        label: "role_name"
      },
      type: "", // add: 新增， edit: 编辑
      formTitle: "",
      currRow: {},
      dialogForm: false,
      ruleForm: {
        role_name: "",
        role_code: "",
        role_menus: [],
        role_desc: ""
      },
      rules: {
        role_name: [{ required: true, message: "请输入角色名称", trigger: "blur" }],
        role_code: [{ required: true, message: "请输入角色标识", trigger: "blur" }],
        role_menus: [{ required: true, message: "请选择", trigger: "change" }]
      },
      tableData: []
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    getList() {
      let json = JSON.parse(JSON.stringify(this.pages))
      delete json.total
      this.$api.rolesList(json).then((res) => {
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
    showForm(type, row) {
      this.dialogForm = true
      this.ruleForm = {
        role_name: "",
        role_code: "",
        role_menus: [],
        role_desc: ""
      }
      this.$api.menuList().then((res) => {
        if (res.code != 200) return
        this.menuData = res.data.list
      })
      setTimeout(() => {
        this.$refs.ruleForm.clearValidate()
      }, 100)

      this.type = type
      row ? (this.currRow = row) : (this.currRow = {})
      if (type == "add") this.formTitle = "新增"
      if (type == "edit") {
        this.formTitle = "编辑"
        this.ruleForm = JSON.parse(JSON.stringify(row))
      }
    },
    submitForm() {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          let json = JSON.parse(JSON.stringify(this.ruleForm))
          if (this.type == "edit") {
            json.id = this.currRow.id
          }

          this.$message({
            type: "error",
            message: "演示环境暂不支持!"
          })
          this.dialogForm = false
          return

          this.$api.rolesStore(json).then((res) => {
            if (res.code != 200) return
            this.$message({
              type: "success",
              message: this.type == "edit" ? "编辑成功！" : "新增成功！"
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
          this.$message({
            type: "error",
            message: "演示环境暂不支持!"
          })
          this.dialogForm = false
          return

          this.$api.rolesDelete({ id: row.id }).then((res) => {
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
    }
  }
}
</script>

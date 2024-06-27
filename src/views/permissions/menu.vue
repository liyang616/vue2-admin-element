<template>
  <div>
    <el-form size="small" inline class="search-area">
      <el-form-item>
        <el-button type="primary" @click="showForm('add0')">新增一级菜单</el-button>
      </el-form-item>
    </el-form>
    <el-table
      :data="tableData"
      :max-height="$tableHeight"
      row-key="id"
      border
      default-expand-all
      size="medium"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column prop="display_name" label="菜单名称" width="180"></el-table-column>
      <el-table-column prop="route_name" label="路由name" min-width="180" :width="$isMobile ? '180' : 'auto'"></el-table-column>
      <el-table-column label="菜单启用" width="180">
        <template slot-scope="scope">
          <el-switch
            v-if="scope.row.depth != 0"
            v-model="scope.row.is_show"
            :inactive-value="0"
            :active-value="1"
            @change="switchChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="页面缓存" width="180">
        <template slot-scope="scope">
          <el-switch
            v-if="scope.row.depth != 0"
            v-model="scope.row.is_cache"
            :inactive-value="0"
            :active-value="1"
            @change="switchChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="210" :fixed="$isMobile ? false : 'right'">
        <template slot-scope="scope">
          <div class="table-operate">
            <el-button v-if="scope.row.depth == 0" size="mini" type="primary" @click="showForm('add', scope.row)"
              >新增
            </el-button>
            <el-button size="mini" @click="showForm('edit', scope.row)">编辑 </el-button>
            <el-button size="mini" type="danger" @click="del(scope.row)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      :title="formTitle"
      :fullscreen="$isMobile ? true : false"
      :visible.sync="dialogForm"
      :close-on-click-modal="false"
      width="700px"
    >
      <el-form :model="ruleForm" :rules="rules" :inline="$isMobile ? false : true" size="small" ref="ruleForm" label-width="96px">
        <el-form-item label="菜单名称" prop="display_name">
          <el-input v-model="ruleForm.display_name" clearable placeholder="请输入"></el-input>
        </el-form-item>
        <el-form-item label="路由name" prop="route_name">
          <el-input v-model="ruleForm.route_name" clearable placeholder="请输入"></el-input>
        </el-form-item>
        <el-form-item label="菜单图标">
          <el-input v-model="ruleForm.icon" clearable ref="iconShow" @focus="iconShow" placeholder="请选择"></el-input>
        </el-form-item>
        <template v-if="showName">
          <el-form-item label="缓存页面">
            <el-switch v-model="ruleForm.is_cache" :inactive-value="0" :active-value="1"></el-switch>
          </el-form-item>
          <el-form-item label="菜单启用">
            <el-switch v-model="ruleForm.is_show" :inactive-value="0" :active-value="1"></el-switch>
          </el-form-item>
        </template>
      </el-form>
      <div class="form-btn">
        <el-button type="primary" size="small" @click="submitForm">确定</el-button>
        <el-button size="small" @click="cancel">取消</el-button>
      </div>
    </el-dialog>

    <el-dialog
      title="菜单图标"
      :fullscreen="$isMobile ? true : false"
      :visible.sync="showIcon"
      :close-on-click-modal="false"
      width="70%"
    >
      <div class="icon-grid">
        <div v-for="(item, i) in elementIcons" :key="i" @click="iconClick(item)">
          <div class="icon-item">
            <i :class="item" />
            <span>{{ item }}</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.icon-grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  .icon-item {
    margin: 20px;
    height: 85px;
    text-align: center;
    width: 100px;
    float: left;
    font-size: 30px;
    color: #24292e;
    cursor: pointer;
    span {
      display: block;
      font-size: 16px;
      margin-top: 10px;
    }
  }
}
</style>

<script>
import elementIcons from "./element-icons"
export default {
  name: "permissions_menu",
  data() {
    return {
      showName: true,
      type: "", // add0: 新增一级菜单， add: 新增二级菜单, edit: 编辑菜单
      formTitle: "",
      currRow: {},
      elementIcons,
      showIcon: false,
      dialogForm: false,
      ruleForm: {
        display_name: "",
        route_name: "",
        icon: "",
        is_cache: 1,
        is_show: 1
      },
      rules: {
        display_name: [{ required: true, message: "请输入菜单名称", trigger: "blur" }],
        route_name: [{ required: true, message: "请输入路由name", trigger: "blur" }]
      },
      tableData: []
      // tableData: [
      //   {
      //     id: 1, // 后端生成的id
      //     is_show: 1, // 菜单是否显示, 0关，1开
      //     route_name: "permissions", // 路由name
      //     display_name: "权限管理", // 菜单标题
      //     icon: "el-icon-s-tools", // 菜单icon
      //     is_cache: 1, // 是否缓存页面
      //     children: [
      //       {
      //         id: 11,
      //         is_show: true,
      //         route_name: "p-menu",
      //         display_name: "菜单管理",
      //         is_cache: 1
      //       }
      //     ]
      //   }
      // ]
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    getList() {
      this.$api.menuList().then((res) => {
        if (res.code != 200) return
        this.tableData = res.data.list
      })
    },
    iconShow() {
      this.showIcon = true
      this.$refs.iconShow.blur()
    },
    iconClick(item) {
      this.ruleForm.icon = item
      this.showIcon = false
    },
    showForm(type, row) {
      this.dialogForm = true
      this.ruleForm = {
        display_name: "",
        route_name: "",
        icon: "",
        is_cache: 1,
        is_show: 1
      }
      setTimeout(() => {
        this.$refs.ruleForm.clearValidate()
      }, 100)

      this.type = type
      row ? (this.currRow = row) : (this.currRow = {})
      !this.currRow.depth ? (this.showName = false) : (this.showName = true)
      if (this.type == "add0") this.formTitle = "新增一级菜单"
      if (this.type == "add") {
        this.formTitle = "新增"
        this.showName = true
        this.ruleForm.route_name = this.currRow.route_name + "_"
      }
      if (this.type == "edit") {
        this.formTitle = "编辑"
        this.ruleForm = row
      }
    },
    switchChange(row) {
      let json = {
        id: row.id,
        parent_id: row.parent_id,
        is_show: row.is_show,
        is_cache: row.is_cache
      }

      this.$message({
        type: "error",
        message: "演示环境暂不支持!"
      })
      this.dialogForm = false
      return
      
      this.$api.menuStore(json).then((res) => {
        if (res.code != 200) return
        this.$message({
          type: "success",
          message: "编辑成功！"
        })
        this.getList()
        this.dialogForm = false
      })
    },
    submitForm() {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          let json = JSON.parse(JSON.stringify(this.ruleForm))
          if (this.type == "add0") {
            json.parent_id = 0
          }
          if (this.type == "add") {
            json.parent_id = this.currRow.id
          }
          if (this.type == "edit") {
            json.parent_id = this.currRow.parent_id
            json.id = this.currRow.id
          }

          this.$message({
            type: "error",
            message: "演示环境暂不支持!"
          })
          this.dialogForm = false
          return

          this.$api.menuStore(json).then((res) => {
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
          return

          this.$api.menuDelete({ id: row.id }).then((res) => {
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

<template>
  <div class="tinymce-editor">
    <editor
      id="editors"
      v-model="myValue"
      :init="init"
      :disabled="disabled"
      @onChange="onChange"
    >
    </editor>
  </div>
</template>

<script>
import tinymce from "tinymce/tinymce";
import Editor from "@tinymce/tinymce-vue";
import "tinymce/themes/silver/theme";
import "tinymce/icons/default/icons";
import "tinymce/plugins/link";
import "tinymce/plugins/code";
import "tinymce/plugins/image";
import "tinymce/plugins/table";
import "tinymce/plugins/lists";
import "tinymce/plugins/contextmenu";
import "tinymce/plugins/wordcount";
import "tinymce/plugins/textpattern";
import "tinymce/plugins/colorpicker";
import "tinymce/plugins/textcolor";
export default {
  components: {
    Editor,
  },
  props: {
    //传入一个value，使组件支持v-model绑定
    value: {
      type: String,
      default: "",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    plugins: {
      type: [String, Array],
      default:
        "link lists image code table colorpicker textcolor wordcount contextmenu textpattern",
    },
    toolbar: {
      type: [String, Array],
      default:
        "bold italic underline strikethrough | formatselect | fontselect | fontsizeselect | forecolor backcolor | alignleft aligncenter alignright alignjustify | link image | bullist numlist | outdent indent blockquote | undo redo | removeformat",
    },
  },
  data() {
    return {
      //初始化配置
      init: {
        language_url: "/tinymce/zh_CN.js",
        language: "zh_CN",
        skin_url: "/tinymce/skins/ui/oxide",
        content_css: "/tinymce/skins/content/default/content.css",
        height: 450,
        plugins: this.plugins,
        toolbar: this.toolbar,
        toolbar_drawer: false,
        deprecation_warnings: false, // 禁用弃用警告
        font_formats:
          "微软雅黑=Microsoft YaHei,Helvetica Neue,PingFang SC,sans-serif;苹果苹方=PingFang SC,Microsoft YaHei,sans-serif;宋体=simsun,serif;仿宋体=FangSong,serif;黑体=SimHei,sans-serif;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Book Antiqua=book antiqua,palatino;",
        branding: false, // 是否禁用“Powered by TinyMCE”
        menubar: true, // 顶部菜单栏显示
        // 此处为图片上传处理函数，不添加则只有网络图片上传形式
        // 本来直接用了base64的图片形式上传图片, 但因长度超出后台的设置的数据库字段长度，后更换为接口上传
        // 目前暂时使用前台上传图片接口 因此需设置该接口无需token验证
        images_upload_handler: (blobInfo, success, failure) => {
          let formData = new FormData();
          formData.append("file", blobInfo.blob());
          this.$apis
            .UploadImage(formData)
            .then((res) => {
              if (res.code != 200) {
                  failure(res.msg)
              } else {
                success(res.data.file_url);
              }
            })
            .catch((res) => {
              failure("error");
            });

          //   const img = "data:image/jpeg;base64," + blobInfo.base64();
          //   success(img);
        },
      },
      myValue: this.value,
    };
  },
  watch: {
    // 数据回填
    value(newValue) {
      this.myValue = newValue
    }
  },
  mounted() {
    tinymce.init({});
  },
  methods: {
    //添加相关的事件，可用的事件参照文档=> https://github.com/tinymce/tinymce-vue => All available events
    //需要什么事件可以自己增加
    onChange() {
      this.$emit("onChange", this.myValue);
    },
    //可以添加一些自己的自定义事件，如清空内容
    clear() {
      this.myValue = "";
    },
    // 获取富文本内容
    getContent() {
      return tinymce.editors["editors"].getContent();
    },
    // 设置富文本内容
    setContent() {
      return tinymce.editors["editors"].setContent(this.value);
    },
    // 显示编辑器
    showTiny() {
      tinymce.editors["editors"].show();
    },
    // 隐藏编辑器
    hideTiny() {
      tinymce.editors["editors"].hide();
    },
    // 销毁编辑器
    destroyTiny() {
      tinymce.editors["editors"].destroy();
    },
  },
};
</script>

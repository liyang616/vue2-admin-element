<template>
  <div class="home-page" ref="homePage">
    <h2>首页内容自由发挥</h2>
    <p>富文本</p>
    <editor ref="TEditer" v-model="editorVal"></editor>
    <br>
    <div id="echarts" style="width: 100%; height: 400px"></div>
    <p>图片查看器</p>
    <div class="img-dom" v-viewer>
      <img :src="require('@/assets/picture/img26.jpg')" />
      <img :src="require('@/assets/picture/img14.jpg')" />
      <img :src="require('@/assets/picture/img39.jpg')" />
    </div>
  </div>
</template>

<style lang="scss">
@import "./index.scss";
</style>

<script>
import axios from "axios"
import * as echarts from "echarts"
import elementResizeDetector from "element-resize-detector"
import Editor from "@/components/TinymceEditor"
export default {
  name: "home",
  components: { Editor },
  data() {
    return {
      myChart: "",
      editorVal:
        "1.阿里云上传，/upload-ali接口，向后端获取相关上传信息 region、accessKeyId、accessKeySecret、stsToken、bucket。<br>2.七牛云上传，/upload-qn接口，向后端获取相关上传信息 action、token、key、domain。"
    }
  },
  methods: {
    watchSize() {
      // 监听页面宽度变化， 图表尺寸自适应
      let $this = this
      let erd = elementResizeDetector()
      erd.listenTo(this.$refs.homePage, (element) => {
        $this.$nextTick(() => {
          this.myChart.resize()
        })
      })
    },
    myEcharts() {
      this.myChart = echarts.init(document.getElementById("echarts"))
      //配置图表
      let option = {
        title: {
          text: "echarts入门示例"
        },
        tooltip: {},
        legend: {
          data: ["销量"]
        },
        xAxis: {
          data: ["衬衫", "羊毛衫", "雪纺衫", "裤子", "高跟鞋", "袜子"]
        },
        yAxis: {},
        series: [
          {
            name: "销量",
            type: "bar",
            data: [5, 20, 36, 10, 10, 20]
          }
        ]
      }
      this.myChart.setOption(option)
    }
  },
  mounted() {
    axios.get("/static/1.md").then((res) => {
      // console.log(res)
      this.editorVal = res.data
    })
    this.myEcharts()
    this.watchSize()
  }
}
</script>

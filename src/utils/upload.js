// 七牛云直传配置
const qnUpload = ($this, res, fileName) => {
  if (res.code != 200) {
    $this.uploadConfig = false
    $this.$message.error("上传信息获取失败！")
    return false
  } else {
    let fileType = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase()
    $this.uploadConfig = {
      action: res.data.action,
      data: {
        token: res.data.token,
        key: res.data.key + "." + fileType
      },
      domain: res.data.domain,
      fileType: fileType
    }
  }
}

// alioss直传
let oss = require("ali-oss")
const aliUpload = ($this, obj) => {
  let fileName = "account/" + $this.$moment().format("YYYY-MM-DD") + "/" + obj.file.size + obj.file.name
  $this.$api.uploadAli().then((res) => {
    if (res.code == 200) {
      let ossClient = new oss({
        region: res.data.region,
        accessKeyId: res.data.accessKeyId,
        accessKeySecret: res.data.accessKeySecret,
        stsToken: res.data.stsToken,
        bucket: res.data.bucket
      })

      let partSize = 1024 * 1024 // 每个分片大小,1M
      let parallel = 3 // 同时上传的分片数
      ossClient
        .multipartUpload(fileName, obj.file, {
          parallel,
          partSize,
          progress: function (progress, checkpoint) {
            obj.onProgress({ percent: progress * 100 })
            localStorage.setItem(fileName, JSON.stringify(checkpoint)) //记录断点续传信息
          },
          checkpoint: JSON.parse(localStorage.getItem(fileName)) || {}
        })
        .then((result) => {
          // 上传成功
          localStorage.removeItem(fileName) //删除断点续传信息
          let url = "https://" + res.data.bucket + "." + res.data.region + ".aliyuncs.com/" + result.name
          obj.onSuccess(url) // 上传组件成功钩子，返回文件url
        })
        .catch((err) => {
          $this.$message.error("上传失败")
        })
    } else {
      $this.$message.error("上传失败")
    }
  })
}

export { qnUpload, aliUpload }

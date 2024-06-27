import md5 from "js-md5"
import moment from "moment"
let Base64 = require("js-base64").Base64

/**
 * 接口签名,安全加固
 */
const sign = (httpParams) => {
  let secret = "QzAzOTRDOTlFNTMyNDdDM0QxODAxRDZEQTRFOTBEOEY="
  secret = Base64.decode(secret).split("").reverse().join("")
  let json = {
    app_key: 20220216000001,
    timestamp: moment().format("X"),
    platfrom: "listen",
    format: "json"
  }
  let sumJson = Object.assign(json, httpParams || {})

  let sumJson2 = JSON.parse(JSON.stringify(sumJson))
  delete sumJson2.content  // 去除富文本字段(接口统一该字段 content)
  let sumStr = ""
  Object.keys(sumJson2)
    .sort()
    .forEach((key) => {
      sumStr += key + encodeURIComponent(sumJson[key])
    })
  // console.log(secret + sumStr + secret)
  let signStr = md5(secret + sumStr + secret)

  sumJson.sign = signStr
  return sumJson
}

export { sign }

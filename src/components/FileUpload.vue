<template>
  <div>
    <!-- Styled -->
    <b-form-group label="上传文件:" label-cols-sm="2">
      <b-form-file
          id="file-small"
          ref="file-input"
          v-model="file1"
          placeholder="点击选择或拖动文件至此处"
          browse-text="添加"
          @input="fileInputChange"

      >

      </b-form-file>
    </b-form-group>
  </div>
</template>

<script>

// import CosAuth from '../js/cos-auth.js'
var COS = require('cos-js-sdk-v5');

import SparkMD5 from "spark-md5";
import {uploadAxios} from "@/js/NETapi";

export default {
  /* eslint-disable */
  name: "FileUpload",
  components: {},
  data() {
    return {
      file1: null,

    }
  },
  methods: {
    fileInputChange: function (file) {
      console.log(file)
      const that = this
      let fileReader = new FileReader()
      fileReader.readAsBinaryString(file)
      fileReader.onload = function(str) {
        let spark = new SparkMD5()
        // console.log(str.currentTarget.result)
        spark.appendBinary(str.currentTarget.result)
        let md5 = spark.end()
        let uploadModel = {
          type: file.type,
          //TODO 从父组件取得path
          path: '/users/admin/'+ file.name,
          size: file.size,
          md5: md5
        }
        uploadAxios(uploadModel, that.$cookies.get('token')).then(res => {
          console.log(uploadModel)
          console.log(res)
          // TODO 给用户的反馈
          if (res.status!==200) {
            alert("HTTP请求错误")
            return
          }
          if (!(res.data.status===100||res.data.status===101)) {
            alert(".NET请求错误")
            return
          }
          // const authData = res.data.data
          var cos = new COS({
            getAuthorization: function (options, callback) {
              callback({
                TmpSecretId: res.data.data.token.credentials.tmpSecretId,
                TmpSecretKey: res.data.data.token.credentials.tmpSecretKey,
                XCosSecurityToken: res.data.data.token.credentials.token,
                // 建议返回服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
                StartTime: res.data.data.token.startTime, // 时间戳，单位秒，如：1580000000
                ExpiredTime: res.data.data.token.expiredTime, // 时间戳，单位秒，如：1580000900
              })
            }
          })
          // console.log(s)
          cos.putObject({
            Bucket: res.data.data.tencentCos.bucket, /* 必须 */
            Region: res.data.data.tencentCos.region,     /* 存储桶所在地域，必须字段 */
            Key: res.data.data.file.storageName,              /* 必须 */
            StorageClass: 'STANDARD',
            Body: file, // 上传文件对象
            onProgress: function(progressData) {
              console.log(JSON.stringify(progressData));
            }
          }, function(err, data) {
            console.log(err || data);
          })
          // console.log(cosAuth)
        })
      }
      //将当次文件添加到队列后清除file1，以便用户选择新的文件
      //this.$refs['file-input'].reset()
    },
  }
}
</script>

<style scoped>


</style>

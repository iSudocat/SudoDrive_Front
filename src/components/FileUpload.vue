<template>
  <div>
    <!-- Styled -->
    <b-form-group label="上传文件" label-cols-sm="2">
      <b-form-file
          id="file-small"
          ref="file-input"
          v-model="file1"
          placeholder="点击选择或拖动文件至此处"
          browse-text="添加"
          @input="fileInputChange"
          :multiple="true"
      >
      </b-form-file>

    </b-form-group>
    <div class="view view-cascade gradient-card-header narrower d-flex justify-content-between align-items-center">
<!--      <div>-->

<!--      </div>-->
      <a href="" class="white-text mx-3"></a>
      <div>
        <button type="button" class="btn btn-rounded btn-sm px-3" @click="continueAllTask">
          <i class="fas fa-reply-all"></i>
          <strong style="margin-left: 5px">全部继续</strong>
        </button>
        <button type="button" class="btn btn-rounded btn-sm px-3" @click="pauseAllTask">
          <i class="fas fa-pause-circle"></i>
          <strong style="margin-left: 5px">全部暂停</strong>
        </button>
      </div>
    </div>
    <mdb-tbl responsive>
      <mdb-tbl-head>
        <tr>
          <th @click="getVersion">文件名</th>
          <th style="width:120px">进度</th>
          <th style="width:100px">操作</th>
        </tr>
      </mdb-tbl-head>
      <mdb-tbl-body>
        <tr v-for="task in tasks" :key="task.id">
          <td>{{task.file.name}}</td>
          <td>
            <b-progress style="margin-left: -30px" :value="task.file.progress" max="100" precision="2" :variant="task.file.variant" show-progress animated></b-progress>
          </td>
          <td>
            <i class="fas fa-play"
               v-if="task.file.status==='pause'"
               @click="continueTask(task)">
            </i>
            <i class="fas fa-pause"
               v-if="task.file.status==='running'"
               @click="pauseTask(task)">
            </i>
            <i class="fas fa-stop"
               v-if="task.file.status==='running'||task.file.status==='pause'" style="margin-left: 10px"
               @click="stopTask(task)">
            </i>
            <span v-if="task.file.status==='success'">上传成功</span>
            <span v-if="task.file.status==='stop'">已取消</span>
            <span v-if="task.file.status==='error'">上传出错</span>
          </td>
        </tr>
      </mdb-tbl-body>
    </mdb-tbl>
  </div>
</template>

<script>

// import CosAuth from '../js/cos-auth.js'
var COS = require('cos-js-sdk-v5');
var mime = require('mime-types')

import SparkMD5 from "spark-md5";
import {uploadAxios, confirmAxios, versionAxios} from "@/js/NETapi";
import { mdbTbl, mdbTblHead, mdbTblBody } from 'mdbvue';

export default {
  /* eslint-disable */
  name: "FileUpload",
  components: {
    mdbTbl,
    mdbTblHead,
    mdbTblBody,
  },
  data() {
    return {
      file1: null,
      tasks: [
      //   {
      //   id: 0,
      //   file: {
      //     name: 'test1',
      //     progress: 50,
      //     status: 'running' // running stop pause success
      //   },
      //   cos: null
      // }
      ],
      path: this.$route.query.folder + '/',
      progressValue: 50,
      progressMax: 100
    }
  },
  methods: {
    fileInputChange: function (uploadFiles) {
      const that = this
      uploadFiles.forEach(uploadFile => {
        let fileReader = new FileReader()
        fileReader.readAsBinaryString(uploadFile)
        // 老长的回调
        fileReader.onload = function(str) {
          let spark = new SparkMD5()
          // console.log(str.currentTarget.result)
          spark.appendBinary(str.currentTarget.result)
          let md5 = spark.end()
          let uploadModel = {
            type: uploadFile.type === '' ?
                (mime.lookup(uploadFile.name) === false ? 'file/others' : mime.lookup(uploadFile.name)) : uploadFile.type,
            path: that.path + uploadFile.name,
            size: uploadFile.size,
            md5: md5
          }
          console.log(uploadModel)
          // const uploadModel = this.getUploadModel(file)
          uploadAxios(uploadModel, that.$cookies.get('token')).then(res => {
            // console.log(uploadModel)
            // console.log(res)
              if (res.status===0) {
                throw '文件已存在'
              }
              if (res.status!==200) {
                throw 'HTTP请求错误'
              }
              if (!(res.data.status===100||res.data.status===101)) {
                throw '.NET请求错误'
              }

            if (res.data.status===101){ //秒传
              let task = {
                id: that.tasks.length,
                file: {
                  name: uploadFile.name,
                  progress: 0,
                  status: 'running', // running pause stop success
                  variant: null
                },
                taskId: null,
                cos: null
              }
              that.tasks.unshift(task)
              task.file.progress = 100
              task.file.variant = 'success'
              task.file.status = 'success'
              return
            }

              // 新建cos
              let cos = that.getCosByRes(res)
              // 新建Task表格里的对象
              let task = {
                id: that.tasks.length,
                file: {
                  name: uploadFile.name,
                  progress: 0,
                  status: 'running', // running pause stop success
                  variant: null
                },
                taskId: null,
                cos: cos
              }
              that.tasks.unshift(task)
              cos.sliceUploadFile({
                Bucket: res.data.data.tencentCos.bucket, /* 必须 */
                Region: res.data.data.tencentCos.region,     /* 存储桶所在地域，必须字段 */
                Key: res.data.data.file.storageName,              /* 必须 */
                StorageClass: 'STANDARD',
                Body: uploadFile, // 上传文件对象
                // 进度回调
                onProgress: function(progressData) {
                  // console.log(`loaded:${progressData.loaded},total:${progressData.total}`)
                  if (progressData.loaded === 0) return
                  task.file.progress = progressData.loaded / progressData.total * 100
                },
                // 创建任务成功的回调 取得TaskId用于任务的控制： 暂停 停止 重新启动
                onTaskReady: function (taskId) {
                  task.taskId = taskId
                },
              }, function(err, data) {
                if (err == null) {
                  task.file.progress = 100
                  task.file.variant = 'success'
                  confirmAxios(res.data.data.file.id, res.data.data.file.guid, that.$cookies.get('token')).then(confirm => {
                    // console.log(confirm)
                    task.file.status = 'success'
                  })
                }
                else {
                  task.file.status = 'error'
                }
              })
            // console.log(cosAuth)
          }).catch(axiosErr => {
            that.$bvToast.toast(`上传失败。`, {
              title: axiosErr.response.data.message,
              toaster: 'b-toaster-top-center',
              solid: true,
              variant: 'danger'
            })
          })
        }
      })
    },
    // 从net的响应中构造cos
    getCosByRes: function(res) {
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
      return cos
    },
    // 暂停某个任务
    pauseTask: function (task) {
      task.cos.pauseTask(task.taskId)
      task.file.status = 'pause'
      task.file.variant = 'warning'
      console.log('pause:'+task.file.name)
    },
    // 继续某个任务
    continueTask: function (task) {
      task.cos.restartTask(task.taskId)
      task.file.status = 'running'
      task.file.variant = null
      console.log('continue:'+task.file.name)
    },
    // 取消某个任务
    stopTask: function (task) {
      task.cos.cancelTask(task.taskId)
      task.file.status = 'stop'
      task.file.variant = 'danger'
      console.log('stop:'+task.file.name)
    },
    // 暂停所有任务
    pauseAllTask: function () {
      this.tasks.forEach(task => {
        this.pauseTask(task)
      })
    },
    // 继续所有任务
    continueAllTask: function () {
      this.tasks.forEach(task => {
        this.continueTask(task)
      })
    },
    getVersion: function () {
      versionAxios(this.$cookies.get('token')).then(versionRes => {
        console.log(versionRes.data)
      })
    }
  }
}
</script>

<style scoped>
i {
  cursor:pointer
}

</style>

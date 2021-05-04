<template>
  <div id="files">

    <mdb-row class="justify-content-md-center">
      <mdb-col col="2">
        <div>
          <b-button variant="primary" size="sm" v-b-toggle.sidebar-right>上传</b-button>
          <b-sidebar id="sidebar-right" title="上传任务" right width="500px"
                     header-class="background-color: grey lighten-5">
            <div class="px-3 py-2 grey lighten-5" style="height: 100%; ">
              <file-upload></file-upload>
            </div>
          </b-sidebar>
        </div>
      </mdb-col>
    </mdb-row>
    <mdb-row class="justify-content-md-center animated fadeIn">
      <mdb-col col="10">
        <table style="margin-top: 20px" id="table" data-pagination="false" data-show-footer="false">
        </table>
      </mdb-col>
    </mdb-row>

  </div>

</template>

<script>
/* eslint-disable */
import $ from 'jquery'
import CosAuth from '../js/cos-auth.js'
import {mdbRow, mdbCol} from 'mdbvue'
import FileUpload from "./FileUpload";

export default {
  name: "Files",
  components: {
    FileUpload,
    mdbRow,
    mdbCol,


  },
  data() {
    return {
      selections: [],
      amount: 0,  //文件总数，从get中取得
      allFileData: [],  //所有文件data，amount超过1000时使用
      username: '',
      token: '',
      folder: ''
    }
  },
  beforeMount() {
    this.username = this.$cookies.get('username')
    this.token = this.$cookies.get('token')
    this.folder = this.$route.query.folder
    if (this.username === null) {
      this.$router.push('/login')
    }
  },
  async mounted() {
    const _this = this
    let response = await this.axios.get('/api/storage/file?offset=0&amount=1000&folder=' + this.folder, {headers: {Authorization: "Bearer " + this.token}})
    console.log(response.data)
    this.amount = response.data.data.amount

    if(this.amount <= 1000){
      this.initTable(response.data.data)
    }else{
      let offset = 1000
      this.allFileData.push(response.data.data)
      while(offset <= this.amount){
        let response = await this.axios.get('/api/storage/file?offset=' + offset + '&amount=1000&folder=' + this.folder, {headers: {Authorization: "Bearer " + this.token}})
        this.allFileData.push(response.data.data)
        offset = offset + 1000
      }
    }

  },
  methods: {
    initTable: function (data) {
      const _this = this
      let fileData = []
      // 数据预处理
      data.files.forEach((element) => {

        fileData.push({
          id: element.id,
          name: element.name,
          size: _this.convertFileSize(element.size),
          updatedAt: new Date(element.updatedAt).toLocaleString(undefined, {hour12: false}),
          type: element.type !== 'text/directory' ? element.type : '文件夹',
          path: element.path
        })
      })

      let operateEvents = {
        'click .download': function (e, value, row, index) {
          _this.downloadCosFile(row.id)
        },
        'click .delete': function (e, value, row, index) {
          _this.deleteFile([row.path])
        },
      }

      const $table = $('#table')
      $table.bootstrapTable({
        locale: 'zh-CN',
        sortName: "type",
        sortOrder: "",
        columns: [
          {
            field: 'state',
            checkbox: true,
            align: 'center',
            valign: 'middle',
            //formatter: checkBoxFormatter
          },
          {
            field: 'name',
            title: '文件名',
            sortable: true,
            align: 'left',
            formatter: _this.fileNameFormatter
          },
          {
            field: 'type',
            title: '类型',
            sortable: true,
            align: 'left',
            visible: false
          },
          {
            field: 'size',
            title: '大小',
            sortable: false,
            align: 'left'
          },
          {
            field: 'updatedAt',
            title: '修改日期',
            sortable: false,
            align: 'left'
          },
          {
            field: 'operate',
            title: '操作',
            align: 'center',
            clickToSelect: false,
            events: operateEvents,
            formatter: _this.operateFormatter,
            width: 100
          }],
        data: fileData
      })
    },
    convertFileSize: function (value) {
      if (value === 0)
        return '-';
      const unitArr = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
      let index;
      const srcSize = parseFloat(value);
      index = Math.floor(Math.log(srcSize) / Math.log(1024));
      let size = srcSize / Math.pow(1024, index);
      size = size.toFixed(2);//保留的小数位数
      return size + unitArr[index];
    },
    fileNameFormatter: function (value, row, index) {
      if (row.type === '文件夹') {
        const folder = this.folder + '/' + row.name
        return [
          '<a class="folder" href="/files?folder=',
          folder,
          '" style="color:#3F729B">',
          '<i style="margin-right:5px" class="fas fa-folder"></i>',
          row.name,
          '</a>'
        ].join('')
      } else {
        return [
          '<div class="file">',
          '<i style="margin-right:5px" class="fas fa-file-alt"></i>',
          row.name,
          '</div>'
        ].join('')
      }
    },
    operateFormatter: function () {
      return [
        '<a class="download" href="javascript:void(0)" title="下载">',
        '<i class="fas fa-download"></i>',
        '</a>',
        '<a class="delete" style="margin-left:10px" href="javascript:void(0)" title="删除">',
        '<i class="fas fa-trash-alt"></i>',
        '</a>'
      ].join('')
    },
    camSafeUrlEncode: function (str) {// 和 cam 保持一致的 url encode
      return encodeURIComponent(str)
          .replace(/!/g, '%21')
          .replace(/'/g, '%27')
          .replace(/\(/g, '%28')
          .replace(/\)/g, '%29')
          .replace(/\*/g, '%2A')
    },
    fileDownloadCreate: function (filePath, fileName) {
      let link = document.createElement("a"); //创建a标签
      link.style.display = "none"; //使其隐藏
      link.href = filePath; //赋予文件下载地址
      link.setAttribute("download", fileName); //设置下载属性 以及文件名
      document.body.appendChild(link); //a标签插至页面中
      link.click(); //强制触发a标签事件
    },
    downloadCosFile: async function (fileID) {
      let response = await this.axios.get('/api/storage/file?download=true&id=' + fileID, {
        headers: {Authorization: "Bearer " + this.$cookies.get('token')}
      })
      //console.log(response.data)
      let auth = CosAuth(
          response.data.data.token.credentials.tmpSecretId,
          response.data.data.token.credentials.tmpSecretKey,
          response.data.data.token.credentials.token,
          response.data.data.token.startTime,
          response.data.data.token.expiredTime,
          "get",
          {'response-content-disposition': 'attachment; filename=' + response.data.data.files[0].name},
          {},
          '/' + response.data.data.files[0].storageName
      )
      let link = 'https://' + response.data.data.tencentCos.bucket + '.cos.' + response.data.data.tencentCos.region + '.myqcloud.com' +
          '/' + response.data.data.files[0].storageName +
          '?response-content-disposition=attachment%3B%20filename%3D' + this.camSafeUrlEncode(response.data.data.files[0].name) +
          "&" + auth
      //console.log(link)
      this.fileDownloadCreate(link)
    },
    deleteFile: async function (filePath) {
      let response = await this.axios.delete('/api/storage/file', {
        data: {path: filePath},
        headers: {Authorization: "Bearer " + this.$cookies.get('token')}
      })
      console.log(response.data)
    }

  }
}
</script>

<style scoped>


</style>
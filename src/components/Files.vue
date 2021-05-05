<template>
  <div id="files">

    <mdb-row class="justify-content-center">
      <mdb-col col="10">
        <div>
          <mdb-btn-group>
            <mdb-btn color="primary" size="md" v-b-toggle.sidebar-right>上传</mdb-btn>
            <mdb-btn style="margin-left: 5px" color="primary" size="md" v-on:click="batchDownload">批量下载</mdb-btn>
            <mdb-btn style="margin-left: 5px" color="primary" size="md" v-on:click="batchDelete">批量删除</mdb-btn>

          </mdb-btn-group>
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
import {mdbRow, mdbCol, mdbBtn, mdbBtnGroup} from 'mdbvue'
import FileUpload from "./FileUpload";

export default {
  name: "Files",
  components: {
    FileUpload,
    mdbRow,
    mdbCol,
    mdbBtn,
    mdbBtnGroup

  },
  data() {
    return {
      idSelections: [],
      pathSelections: [],
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
    //console.log(response.data)
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
          this.$router.go(0)
        },
      }

      const $table = $('#table')
      const $remove = $('#remove')

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
            visible: true
          },
          {
            field: 'size',
            title: '大小',
            sortable: false,
            align: 'left',
            width: 100
          },
          {
            field: 'updatedAt',
            title: '修改日期',
            sortable: false,
            align: 'left',
            width: 200
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

      function getIdSelections() {
        return $.map($table.bootstrapTable('getSelections'), function (row) {
          return row.id
        })
      }
      function getPathSelections() {
        return $.map($table.bootstrapTable('getSelections'), function (row) {
          return row.path
        })
      }

      $table.on('check.bs.table uncheck.bs.table ' + 'check-all.bs.table uncheck-all.bs.table',
          function () {
            $remove.prop('disabled', !$table.bootstrapTable('getSelections').length)
            _this.idSelections = getIdSelections()
            _this.pathSelections = getPathSelections()
            //console.log(_this.idSelections)
            //console.log(_this.pathSelections)
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
        '<a class="delete" style="margin-left:20px" href="javascript:void(0)" title="删除">',
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
    },
    batchDownload: function (){
      const _this = this
      let i = 0
      this.idSelections.forEach((element) => {
        setTimeout(function() {
          _this.downloadCosFile(element)
        }, i * 500)  // 不延时下载可能被吞
        i++
      })
    },
    batchDelete: function (){
      this.deleteFile(this.pathSelections)
      this.$router.go(0)
    }
  }
}
</script>

<style scoped>


</style>
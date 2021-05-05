<template>
  <div id="files" v-if="showPage">
    <mdb-row class="justify-content-center">
      <mdb-col col="10">
        <div>
          <mdb-btn-group>
            <mdb-btn color="primary" size="md" v-b-toggle.sidebar-right><i class="fas fa-upload" style="padding-right: 5px;"></i>上传</mdb-btn>
            <mdb-btn style="margin-left: 5px" color="primary" size="md" v-on:click="addFolder($event.target)"><i class="fas fa-folder-plus" style="padding-right: 5px;"></i>新建文件夹</mdb-btn>
            <mdb-btn style="margin-left: 5px" color="primary" size="md" v-on:click="batchDownload"><i class="fas fa-download" style="padding-right: 5px;"></i>批量下载</mdb-btn>
            <mdb-btn style="margin-left: 5px" color="primary" size="md" v-on:click="batchDelete"><i class="fas fa-trash-alt" style="padding-right: 5px;"></i>批量删除</mdb-btn>
          </mdb-btn-group>
          <b-sidebar id="sidebar-right" title="上传任务" right width="500px"
                     header-class="background-color: grey lighten-5">
            <div class="grey lighten-5" style="height: 100%;">
              <div class="px-3 py-2 grey lighten-5">
                <file-upload></file-upload>
              </div>
            </div>

          </b-sidebar>
        </div>
      </mdb-col>
      <mdb-col col="10">
        <b-breadcrumb style="margin-top: 15px; margin-bottom: -5px;" :items="breadItems"></b-breadcrumb>
      </mdb-col>
    </mdb-row>
    <mdb-row class="justify-content-md-center animated fadeIn">
      <mdb-col col="10">
        <table style="margin-top: 20px" id="table" data-pagination="true" data-show-footer="false">
        </table>
      </mdb-col>
    </mdb-row>

    <b-modal size="md" :id="newFolderModal.id" :title="newFolderModal.title">
      <form>
        <b-form-group label="文件夹名称：">
          <b-form-input v-model="newFolderModal.folderName"></b-form-input>
        </b-form-group>
      </form>

      <template v-slot:modal-footer>
        <mdb-btn color="grey" size="sm" @click="handleCancel">
          取消
        </mdb-btn>
        <mdb-btn color="success" size="sm" @click="handleOk">
          确定
        </mdb-btn>
      </template>
    </b-modal>
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
      showPage: false,
      idSelections: [],
      pathSelections: [],
      typeSelections: [],
      allFileData: [],  //所有文件data，amount超过1000时使用
      username: '',
      token: '',
      folder: '',
      newFolderModal: {
        index: null,
        id: 'info-modal',
        title: '新建文件夹',
        folderName: ''
      }
    }
  },
  beforeMount() {
    this.username = this.$cookies.get('username')
    this.token = this.$cookies.get('token')
    this.folder = this.$route.query.folder
    if (this.username === null) {
      this.$router.push('/login')
    }else{
      this.showPage = true
    }
  },
  async mounted() {
    if(this.showPage === false) return
    
    try{
      let response = await this.axios.get('/api/storage/file?offset=0&amount=1000&folder=' + this.folder, {headers: {Authorization: "Bearer " + this.token}})
      //console.log(response.data)
      let amount = response.data.data.amount

      if(amount < 1000){
        this.initTable(response.data.data.files)
      }else{
        let offset = 1000
        this.allFileData=this.allFileData.concat(response.data.data.files)
        while(amount === 1000){
          let response = await this.axios.get('/api/storage/file?offset=' + offset + '&amount=1000&folder=' + this.folder, {headers: {Authorization: "Bearer " + this.token}})
          this.allFileData=this.allFileData.concat(response.data.data.files)
          offset = offset + 1000
          amount = response.data.data.amount
        }
        //console.log(this.allFileData)
        this.initTable(this.allFileData)
      }
    }catch (e) {
      //console.log(e)
      this.$bvToast.toast(`请检查网络连接或刷新重试。`, {
        title: `文件列表加载失败`,
        toaster: 'b-toaster-top-center',
        solid: true,
        variant: 'danger'
      })
    }
  },
  computed:{
    breadItems: function (){
      let items = []

      const userFolder = '/users/' + this.username
      const groupFolder = '/groups'

      items.push({
        html: '<i class="fas fa-home"></i> ' + this.username,
        href: '/files?folder=' + userFolder
      })

      if(this.folder.startsWith(userFolder)){
        let t = this.folder.substring(userFolder.length).split('/')
        //console.log(t)
        t.forEach((element) => {
          if(element !== ''){
            items.push({
              text: element,
              href: '/files?folder=' + userFolder + "/" + element
            })
          }
        })
      }else{
        let t = this.folder.substring(groupFolder.length).split('/')
        //console.log(t)
        items.push({
          text: '共享',
          href: '/files?folder=' + groupFolder
        })
        t.forEach((element) => {
          if(element !== ''){
            items.push({
              text: element,
              href: '/files?folder=' + groupFolder + "/" + element
            })
          }
        })
      }

      return items
    }
  },
  methods: {
    initTable: function (data) {
      const _this = this
      let fileData = []

      // 若为用户根目录则先添加共享文件夹根目录
      if(this.folder === '/users/' + this.username){
        fileData.push({
          id: 666,
          name: '共享',
          size: '-',
          updatedAt: '',
          type: '共享文件夹',
          path: '/groups'
        })
      }

      data.forEach((element) => {
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
          _this.$router.go(0)
        },
      }

      const $table = $('#table')
      const $remove = $('#remove')

      $table.bootstrapTable({
        locale: 'zh-CN',
        sortName: "type",
        sortOrder: "",
        paginationParts: ['pageInfo', 'pageList'],
        paginationSuccessivelySize: 5,
        paginationPagesBySide: 2,
        pageSize: 10,
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
      function getTypeSelections() {
        return $.map($table.bootstrapTable('getSelections'), function (row) {
          return row.type
        })
      }

      $table.on('check.bs.table uncheck.bs.table ' + 'check-all.bs.table uncheck-all.bs.table',
          function () {
            $remove.prop('disabled', !$table.bootstrapTable('getSelections').length)
            _this.idSelections = getIdSelections()
            _this.pathSelections = getPathSelections()
            _this.typeSelections = getTypeSelections()
            console.log(_this.idSelections)
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
      } else if (row.type === '共享文件夹') {
        const folder = '/groups'
        return [
          '<a class="folder" href="/files?folder=',
          folder,
          '" style="color:#3F729B">',
          '<i style="margin-right:5px" class="fas fa-share-alt"></i>',
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
    operateFormatter: function (value, row, index) {
      if (row.type !== '共享文件夹' && this.folder !== '/groups') {
        return [
          '<a class="download" href="javascript:void(0)" title="下载">',
          '<i class="fas fa-download"></i>',
          '</a>',
          '<a class="delete" style="margin-left:20px" href="javascript:void(0)" title="删除">',
          '<i class="fas fa-trash-alt"></i>',
          '</a>'
        ].join('')
      }else{
        return  []
      }

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
      try{
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

      }catch (e) {
        this.$bvToast.toast(`请检查网络连接或重试操作。`, {
          title: `文件下载失败`,
          toaster: 'b-toaster-top-center',
          solid: true,
          variant: 'danger'
        })
      }
    },
    deleteFile: async function (filePath) {
      try{
        let response = await this.axios.delete('/api/storage/file', {
          data: {path: filePath},
          headers: {Authorization: "Bearer " + this.$cookies.get('token')}
        })
      }catch (e) {
        this.$bvToast.toast(`请检查网络连接或重试操作。`, {
          title: `文件删除失败`,
          toaster: 'b-toaster-top-center',
          solid: true,
          variant: 'danger'
        })
      }
    },
    batchDownload: function (){
      const _this = this
      let i = 0
      this.idSelections.forEach((element,index) => {
        if(this.typeSelections[index] !== '文件夹' && this.typeSelections[index] !== '共享文件夹'){
          setTimeout(function() {
            _this.downloadCosFile(element)
          }, i * 500)  // 不延时下载可能被吞
          i++
        }
      })
    },
    batchDelete: function (){
      this.deleteFile(this.pathSelections)
      this.$router.go(0)
    },
    addFolder: function (button){
      this.$root.$emit('bv::show::modal', this.newFolderModal.id, button)
    },
    handleCancel() {
      this.$nextTick(() => {
        this.$bvModal.hide(this.newFolderModal.id)
      })
    },
    async handleOk() {
      const _this = this
      try{
        let response = await this.axios.post('/api/storage/file',
            {type: 'text/directory', path: _this.folder + "/" + _this.newFolderModal.folderName, size:0, md5: '00000000000000000000000000000000' },
            {headers: {Authorization: "Bearer " + _this.token}})
        _this.$router.go(0)
      }catch (e) {
        if(e.response.data.status === -100){
          this.$bvToast.toast(`请检查文件夹名是否合格或网络连接是否正常。`, {
            title: `新建文件夹失败`,
            toaster: 'b-toaster-top-center',
            solid: true,
            variant: 'danger'
          })
        }
      }
    },

  }
}
</script>

<style scoped>


</style>
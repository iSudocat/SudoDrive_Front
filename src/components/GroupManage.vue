<template>
  <div class="animated fadeIn">
    <mdb-row class="justify-content-center">
      <mdb-col col="10" xl="5">
        <mdb-card cascade narrow class="mt-5">
          <mdb-view class="gradient-card-header blue darken-2">
            <h4 class="h4-responsive text-white">群组</h4>
          </mdb-view>
          <mdb-card-body>
            <mdb-row style="display: flex; margin-top: -25px; justify-content: center; align-content:center;">
              <mdb-col col="12">
                <mdb-input label="请输入群组名" v-model="newGroupName" small="命名规则：4-16位英文字母大小写、数字和下划线的组合"></mdb-input>
                <mdb-btn color="primary" style="margin-top: -10px;" block v-on:click="addGroup" size="sm">添加新群组</mdb-btn>
              </mdb-col>
            </mdb-row>
            <table style="margin-top: 30px;" id="table" data-pagination="false" data-show-footer="false">
            </table>
          </mdb-card-body>
        </mdb-card>

      </mdb-col>
      <mdb-col col="10" xl="5" v-show="showGroupMember">
        <mdb-card cascade narrow class="mt-5">
          <mdb-view class="gradient-card-header blue darken-2">
            <h4 class="h4-responsive text-white">群组成员</h4>
          </mdb-view>
          <mdb-card-body>
            <mdb-row style="display: flex; margin-top: -25px; justify-content: center; align-content:center;">
              <mdb-col col="12">
                <mdb-input label="请输入用户名" v-model="newMemberName" small="请确保填写了真实存在的用户名"></mdb-input>
                <mdb-btn color="primary" style="margin-top: -10px;" block v-on:click="addMember" size="sm">添加新成员</mdb-btn>
              </mdb-col>
            </mdb-row>
            <table style="margin-top: 30px;" id="table2" data-pagination="false" data-show-footer="false">
            </table>
          </mdb-card-body>
        </mdb-card>
      </mdb-col>
    </mdb-row>
  </div>
</template>

<script>
/* eslint-disable */
import {mdbCol, mdbRow, mdbCard, mdbView, mdbCardBody, mdbBtn, mdbInput} from "mdbvue";
import $ from "jquery";

export default {
  name: "GroupManage",
  components: {
    mdbRow,
    mdbCol,
    mdbCard,
    mdbView,
    mdbCardBody,
    mdbBtn,
    mdbInput

  },
  data() {
    return {
      amount: 0,  //群组总数，从get中取得
      username: '',
      token: '',
      groupName: '',
      showGroupMember: false,
      newGroupName: '',
      newMemberName: ''
    }
  },
  beforeMount() {
    this.username = this.$cookies.get('username')
    this.token = this.$cookies.get('token')
    this.groupName = this.$route.query.groupName
    if (this.username === null) {
      this.$router.push('/login')
    }
  },
  async mounted() {
    if(this.username === 'admin')   // 管理员账户
    {
      if(this.groupName === undefined){
        this.showGroupMember = false
        try{
          let response = await this.axios.get('/api/group', {headers: {Authorization: "Bearer " + this.token}})
          console.log(response.data)
          this.initGroupTable(response.data.data)
        }catch (e) {
          this.$bvToast.toast(`请检查网络连接或刷新重试。`, {
            title: `群组列表加载失败`,
            toaster: 'b-toaster-top-center',
            solid: true,
            variant: 'danger'
          })
        }
      }else{
        try{
          let response = await this.axios.get('/api/group', {headers: {Authorization: "Bearer " + this.token}})
          console.log(response.data)

          this.initGroupTable(response.data.data)
        }catch (e) {
          this.$bvToast.toast(`请检查网络连接或刷新重试。`, {
            title: `群组列表加载失败`,
            toaster: 'b-toaster-top-center',
            solid: true,
            variant: 'danger'
          })
        }

        try{

          let response1 = await this.axios.get('/api/group/' + this.groupName + '/member', {headers: {Authorization: "Bearer " + this.token}})
          console.log(response1.data)

          this.initGroupMemberTable(response1.data.data)
          this.showGroupMember = true
        }catch (e) {
          this.$bvToast.toast(`请检查网络连接或刷新重试。`, {
            title: `群组成员列表加载失败`,
            toaster: 'b-toaster-top-center',
            solid: true,
            variant: 'danger'
          })
        }
      }
    }
    else  // 非管理员账户
    {
      if(this.groupName === undefined){
        this.showGroupMember = false
        try{
          let response = await this.axios.get('/api/user/' + this.username, {headers: {Authorization: "Bearer " + this.token}})
          console.log(response.data)
          this.initGroupTable(response.data.data)
        }catch (e) {
          this.$bvToast.toast(`请检查网络连接或刷新重试。`, {
            title: `群组列表加载失败`,
            toaster: 'b-toaster-top-center',
            solid: true,
            variant: 'danger'
          })
        }
      }else{
        try{
          let response = await this.axios.get('/api/user/' + this.username, {headers: {Authorization: "Bearer " + this.token}})
          console.log(response.data)
          this.initGroupTable(response.data.data)
        }catch (e) {
          this.$bvToast.toast(`请检查网络连接或刷新重试。`, {
            title: `群组列表加载失败`,
            toaster: 'b-toaster-top-center',
            solid: true,
            variant: 'danger'
          })
        }

        try{
          let response1 = await this.axios.get('/api/group/' + this.groupName + '/member', {headers: {Authorization: "Bearer " + this.token}})
          console.log(response1.data)
          this.initGroupMemberTable(response1.data.data)
          this.showGroupMember = true
        }catch (e) {
          this.$bvToast.toast(`请检查网络连接或刷新重试。`, {
            title: `群组成员列表加载失败`,
            toaster: 'b-toaster-top-center',
            solid: true,
            variant: 'danger'
          })
        }
      }



    }
  },
  methods:{
    initGroupTable: function (data) {
      const _this = this
      let groupData = []

      data.groups.forEach((element) => {

        groupData.push({
          id: element.id,
          groupName: element.groupName,
          createdAt: new Date(element.createdAt).toLocaleString(undefined, {hour12: false}),
          canAddMember: element.canAddMember ?? true,
          canRemoveMember: element.canRemoveMember ?? true
        })
      })

      let operateEvents = {
        'click .deleteGroup': function (e, value, row, index) {
          _this.axios.delete('/api/group/' + row.groupName, {headers: {Authorization: "Bearer " + _this.token}})
          _this.$router.go(0)
        },
      }

      const $table = $('#table')
      $table.bootstrapTable({
        locale: 'zh-CN',
        columns: [
          {
            field: 'id',
            title: '#',
            sortable: true,
            align: 'left',
            width: 30
          },
          {
            field: 'groupName',
            title: '群组名称',
            sortable: true,
            align: 'left',
            width: 200,
            formatter: _this.groupNameFormatter

          },
          {
            field: 'createdAt',
            title: '创建时间',
            sortable: true,
            align: 'left',
            width: 200
          },
          {
            field: 'canAddMember',
            title: '添加成员权限',
            visible: false
          },
          {
            field: 'canRemoveMember',
            title: '删除成员权限',
            visible: false
          },
          {
            field: 'operate',
            title: '操作',
            align: 'center',
            clickToSelect: false,
            events: operateEvents,
            formatter: _this.groupOperateFormatter,
            width: 60
          }],
        data: groupData
      })
    },
    initGroupMemberTable: function (data) {
      const _this = this
      let groupMemberData = []

      data.users.forEach((element) => {

        groupMemberData.push({
          id: element.id,
          username: element.username,
          createdAt: new Date(element.createdAt).toLocaleString(undefined, {hour12: false}),
        })
      })

      let operateEvents = {
        'click .deleteMember': function (e, value, row, index) {
          _this.axios.delete('api/group/' + _this.groupName + '/member', {data:{username: row.username}, headers: {Authorization: "Bearer " + _this.token}})
          _this.$router.go(0)
        },
      }

      const $table = $('#table2')
      $table.bootstrapTable({
        locale: 'zh-CN',
        columns: [
          {
            field: 'id',
            title: '#',
            sortable: true,
            align: 'left',
            width: 30
          },
          {
            field: 'username',
            title: '用户名',
            sortable: true,
            align: 'left',
            width: 200
          },
          {
            field: 'createdAt',
            title: '创建时间',
            sortable: true,
            align: 'left',
            width: 200
          },
          {
            field: 'operate',
            title: '操作',
            align: 'center',
            clickToSelect: false,
            events: operateEvents,
            formatter: _this.groupMemberOperateFormatter,
            width: 60
          }],
        data: groupMemberData
      })
    },
    groupNameFormatter: function (value, row, index) {
      if(row.canAddMember !== true || row.canRemoveMember !== true){
        return value
      }else{
        return [
          '<a class="groupMember" href="/groupManage?groupName=',
          value,
          '" style="color:#3F729B">',
          value,
          '</a>'
        ].join('')
      }

    },
    groupOperateFormatter: function (value, row) {
      if(row.canAddMember !== true || row.canRemoveMember !== true){
        return []
      }else {
        if (row.groupName !== 'Admin' && row.groupName !== 'User' && row.groupName !== 'Guest') {
          return [
            '<a class="deleteGroup" href="javascript:void(0)" title="删除用户组">',
            '<i class="fas fa-trash-alt"></i>',
            '</a>',
          ].join('')
        } else {
          return []
        }
      }
    },
    groupMemberOperateFormatter: function (value, row) {
      if(row.username !== 'admin'){
        return [
          '<a class="deleteMember" href="javascript:void(0)" title="删除用户">',
          '<i class="fas fa-user-times"></i>',
          '</a>',
        ].join('')
      }else{
        return []
      }
    },
    addGroup: async function (){
      try{
        let response = await this.axios.post('/api/group', {groupname: this.newGroupName}, {headers: {Authorization: "Bearer " + this.token}})
        this.$router.go(0)
      }catch (e) {
        if(e.response.data.status === -100){
          this.$bvToast.toast(`请检查群组名是否符合命名规则。`, {
            title: `添加群组失败`,
            toaster: 'b-toaster-top-center',
            solid: true,
            variant: 'danger'
          })
        }
      }
    },
    addMember: async function (){
      try{
        let response = await this.axios.post('api/group/' + this.groupName + '/member', {username: this.newMemberName}, {headers: {Authorization: "Bearer " + this.token}})
        this.$router.go(0)
      }catch (e) {
        if(e.response.data.status === -100){
          this.$bvToast.toast(`请检查用户名是否正确。`, {
            title: `添加用户失败`,
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

.card.card-cascade .view.gradient-card-header {
  padding: 1rem 1rem;
  text-align: center;
  margin-top: -30px;
}

.card.card-cascade h3,
.card.card-cascade h4 {
  margin-bottom: 0;
}

</style>
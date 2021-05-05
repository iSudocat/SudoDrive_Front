<template>
  <div class="animated fadeIn">
    <mdb-row class="justify-content-md-center">
      <mdb-col col="10">
        <table style="margin-top: 20px" id="table" data-pagination="false" data-show-footer="false">
        </table>
      </mdb-col>
    </mdb-row>
  </div>
</template>

<script>
/* eslint-disable */
import {mdbCol, mdbRow} from "mdbvue";
import $ from "jquery";

export default {
  name: "UserManage",
  components: {
    mdbRow,
    mdbCol,

  },
  data() {
    return {
      amount: 0,  //用户总数，从get中取得
      username: '',
      token: '',

    }
  },
  beforeMount() {
    this.username = this.$cookies.get('username')
    this.token = this.$cookies.get('token')

    if (this.username === null) {
      this.$router.push('/login')
    }else if(this.username !== 'admin'){
      this.$router.push('/login')
    }
  },
  async mounted() {
    try{
      let response = await this.axios.get('/api/user', {headers: {Authorization: "Bearer " + this.token}})
      console.log(response.data)
      this.amount = response.data.data.amount
      this.initTable(response.data.data)
    }catch (e) {
      if(e.response.data.status === -100){
        this.$bvToast.toast(`请检查网络连接或刷新重试。`, {
          title: `用户列表加载失败`,
          toaster: 'b-toaster-top-center',
          solid: true,
          variant: 'danger'
        })
      }
    }
  },
  methods:{
    initTable: function (response) {
      const _this = this
      let userData = []

      response.users.forEach((element) => {
        let groups = ''
        element.groups.forEach((element) => {
          groups = groups + element.groupName+ ","
        })
        userData.push({
          id: element.user.id,
          username: element.user.username,
          createdAt: new Date(element.user.createdAt).toLocaleString(undefined, {hour12: false}),
          status: element.user.status,
          groups: groups
        })
      })

      let operateEvents = {
        'click .ban': async function (e, value, row, index) {
          try{
            let response = await _this.axios.patch('/api/user/' + row.username, {status: 1}, {headers: {Authorization: "Bearer " + _this.token}})
            _this.$router.go(0)
          }catch (e) {
            if(e.response.data.status === -100){
              this.$bvToast.toast(`请检查网络连接或重试操作。`, {
                title: `封禁用户失败`,
                toaster: 'b-toaster-top-center',
                solid: true,
                variant: 'danger'
              })
            }
          }
        },
        'click .unban': async function (e, value, row, index) {
          try{
            let response = await _this.axios.patch('/api/user/' + row.username, {status: 0}, {headers: {Authorization: "Bearer " + _this.token}})
            _this.$router.go(0)
          }catch (e) {
            if(e.response.data.status === -100){
              this.$bvToast.toast(`请检查网络连接或重试操作。`, {
                title: `解封用户失败`,
                toaster: 'b-toaster-top-center',
                solid: true,
                variant: 'danger'
              })
            }
          }
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
            field: 'username',
            title: '用户名',
            sortable: true,
            align: 'left',
            formatter: _this.usernameFormatter,
            width: 200
          },
          {
            field: 'groups',
            title: '所在用户组',
            sortable: false,
            align: 'left',
          },
          {
            field: 'createdAt',
            title: '注册时间',
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
            formatter: _this.operateFormatter,
            width: 60
          }],
        data: userData
      })
    },
    operateFormatter: function (value, row) {
      if (row.username === 'admin'){
        return []
      }else if (row.status === 0){
        return [
          '<a class="ban" href="javascript:void(0)" title="封禁用户">',
          '<i class="fas fa-user-slash"></i>',
          '</a>',
        ].join('')
      }else{
        return [
          '<a class="unban" href="javascript:void(0)" title="解封用户">',
          '<i class="fas fa-user-check"></i>',
          '</a>',
        ].join('')
      }
    },
    usernameFormatter: function (value, row) {
      if (row.status === 0){
        return value
      }else{
        return [
          '<div style="color: red">',
          value,
          '（封禁）</div>',
        ].join('')
      }

    },
  }
}
</script>

<style scoped>

</style>
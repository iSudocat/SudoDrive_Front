<template>
  <div>
    <mdb-navbar class="flexible-navbar white" light position="top" scrolling>
      <mdb-navbar-brand href="" target="_blank"
      >SudoDrive
      </mdb-navbar-brand
      >
      <mdb-navbar-toggler>
        <mdb-navbar-nav left>
          <mdb-nav-item waves-fixed :href="getFilePath" @click.native="activeItem = 'files'"
                        v-bind:class="{active: activeItem === 'files'}">文件
          </mdb-nav-item>
          <mdb-nav-item waves-fixed to="/groupManage" @click.native="activeItem = 'groupManage'"
                        v-bind:class="{active: activeItem === 'groupManage'}">群组管理
          </mdb-nav-item>
          <mdb-nav-item waves-fixed to="/userManage" @click.native="activeItem = 'userManage'"
                        v-bind:class="{active: activeItem === 'userManage'}" v-if="showUserManage">用户管理
          </mdb-nav-item>
        </mdb-navbar-nav>
        <mdb-navbar-nav right>
          <mdb-nav-item style="padding-top: 4px;">{{ getUsername }}</mdb-nav-item>
          <mdb-nav-item>
            <mdb-btn outline="blue-grey" size="sm" class="my-0" type="submit" @click='logoutClick'>
              <mdb-icon icon="sign-out-alt"/>
              注销
            </mdb-btn>
          </mdb-nav-item>
        </mdb-navbar-nav>
      </mdb-navbar-toggler>
    </mdb-navbar>

    <div class="main">
      <div class="mt-5 p-5">
        <router-view></router-view>
      </div>
    </div>

    <div class="ft">
    <ftr color="primary-color-dark" class="text-center font-small darken-2">
      <p class="footer-copyright mb-0 py-3 text-center">
        &copy; {{ new Date().getFullYear() }} Copyright:
        <a href="https://github.com/iSudocat/SudoDrive"> SudoDrive </a>
        <a href="https://github.com/iSudocat/SudoDrive_Front"> SudoDrive-FrontEnd </a>
      </p>
    </ftr>
    </div>
  </div>

</template>

<script>
/* eslint-disable */
import {
  mdbNavbar,
  mdbNavbarBrand,
  mdbNavItem,
  mdbNavbarNav,
  mdbNavbarToggler,
  mdbBtn,
  mdbIcon,
  mdbListGroup,
  mdbListGroupItem,
  mdbFooter,
  waves
} from "mdbvue";

export default {
  name: "Content",
  components: {
    mdbNavbar,
    mdbNavbarBrand,
    mdbNavItem,
    mdbNavbarNav,
    mdbNavbarToggler,
    mdbBtn,
    mdbListGroup,
    mdbListGroupItem,
    mdbIcon,
    ftr: mdbFooter
  },
  mixins: [waves],
  data() {
    return {
      activeItem: ''
    };
  },
  beforeMount() {

    this.activeItem = this.$route.matched[1].props.default.page;
    //console.log(this.activeItem)
  },
  computed: {
    getUsername: function () {
      if (this.$cookies.get('username') !== null) {
        return '欢迎您，' + this.$cookies.get('nickname')
      } else {
        return ''
      }
    },
    getFilePath: function () {
      if (this.$cookies.get('username') !== null) {
        return '/files?folder=/users/' + this.$cookies.get('username')
      } else {
        return '/login'
      }
    },
    showUserManage: function () {
      return this.$cookies.get('username') === 'admin'
    }
  },
  methods: {
    logoutClick: function () {
      //console.log('注销')
      this.$cookies.remove('username')
      this.$cookies.remove('token')
      this.$router.push('/login')
    }
  },
};
</script>

<style>

</style>

<style scoped>

.main {
  min-height: calc(100vh - 122px);
}

.ft {
  line-height: 18px;
  height: 50px;
}

@media (max-width: 1199.98px) {
  .flexible-navbar {
    padding-left: 10px;
  }
}
</style>

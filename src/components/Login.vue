<template>
  <div class="bg animated fadeIn">
    <div class="front">
      <mdb-row class="justify-content-center">
        <mdb-col col="10" sm="8" md="6" lg="5" xl="4">
          <mdb-card style="margin-top: 10vh;">
            <mdb-view>
              <div style="display: flex; justify-content:center; align-items: center; height: 100px;">
                <mdb-card-image src="/SudoDrive.png" alt="Card image cap"/>
              </div>
            </mdb-view>
            <mdb-card-body v-if="!showRegister" class="animated fadeIn" >
              <form @submit="onSubmit">
                <p class="h2 text-center mb-4">登录</p>
                <div class="grey-text">
                  <mdb-row class="justify-content-center">
                    <mdb-col col="10">
                      <mdb-alert color="danger" v-if="loginError" @closeAlert="loginError=false" dismiss>
                        <strong>{{ loginErrorTips }}</strong>
                      </mdb-alert>
                      <mdb-input required label="用户名" icon="user-circle" type="text" v-model="loginForm.username"/>
                      <mdb-input required label="密码" icon="lock" type="password" v-model="loginForm.password"/>
                    </mdb-col>
                  </mdb-row>
                </div>
                <div class="text-center">
                  <mdb-row>
                    <mdb-col>
                      <mdb-btn color="primary" type="submit">登录</mdb-btn>
                    </mdb-col>
                    <mdb-col>
                      <p>
                        <mdb-btn color="white" @click="showRegister = true">注册</mdb-btn>
                      </p>
                    </mdb-col>
                  </mdb-row>
                </div>
              </form>
            </mdb-card-body>

            <mdb-card-body v-if="showRegister" class="animated fadeIn" >
              <form>
                <p class="h2 text-center mb-4">注册</p>
                <div class="grey-text">
                  <mdb-row class="justify-content-center">
                    <mdb-col col="10">
                      <mdb-alert color="danger" v-if="registerError" @closeAlert="registerError=false" dismiss>
                        <strong>{{ registerErrorTips }}</strong>
                      </mdb-alert>
                      <mdb-input required label="用户名" icon="user-circle" type="text" v-model="registerForm.username"
                                 small="4-16位英文字母大小写、数字和下划线的组合"/>
                      <mdb-input required label="昵称" icon="signature" type="text" v-model="registerForm.nickname"
                                 small="4-16位任意字符的组合"/>
                      <mdb-input required label="密码" icon="lock" type="password" v-model="registerForm.password"
                                 small="8位以上任意字符的组合"/>
                      <mdb-input required label="确认密码" icon="lock" type="password"
                                 v-model="registerForm.passwordAgain"/>
                    </mdb-col>
                  </mdb-row>
                </div>
                <div class="text-center">
                  <mdb-col>
                    <p>
                      <mdb-btn color="primary" @click="userRegister">注册</mdb-btn>
                    </p>
                  </mdb-col>
                </div>
              </form>
            </mdb-card-body>
          </mdb-card>
        </mdb-col>
      </mdb-row>
    </div>

  </div>

</template>

<script>
/* eslint-disable */
import {
  mdbContainer,
  mdbRow,
  mdbCol,
  mdbInput,
  mdbBtn,
  mdbCard,
  mdbCardImage,
  mdbCardBody,
  mdbCardTitle,
  mdbCardText,
  mdbView,
  mdbMask,
  mdbAlert
} from 'mdbvue';

export default {
  name: "Login",
  components: {
    mdbContainer,
    mdbRow,
    mdbCol,
    mdbInput,
    mdbBtn,
    mdbCard,
    mdbCardImage,
    mdbCardBody,
    mdbCardTitle,
    mdbCardText,
    mdbView,
    mdbMask,
    mdbAlert
  },
  data() {
    return {
      showRegister: false,
      loginForm: {
        username: '',
        password: ''
      },
      loginError: false,
      loginErrorTips: '',
      registerError: false,
      registerErrorTips: '',
      registerForm: {
        username: '',
        password: '',
        passwordAgain: '',
        nickname: ''
      },
    }
  },
  methods: {
    onSubmit: async function (evt) {
      evt.preventDefault()
      try {
        let response = await this.axios.post('/api/login', this.loginForm)
        //console.log(response)
        if (response.data.status === 0) {
          if (response.data.data.user.status === 1) {
            this.loginError = true
            this.loginErrorTips = '您的账号已被封禁，暂时无法登录！'
          } else {
            this.$cookies.set('username', response.data.data.user.username, "1d")
            this.$cookies.set('nickname', response.data.data.user.nickname, "1d")
            this.$cookies.set('token', response.data.data.token, "1d")
            await this.$router.push({name: 'files', query: {folder: '/users/' + response.data.data.user.username}})
          }
        }
      } catch (error) {
        //console.log(error.response)
        if (error.response.data.status === -2 || error.response.data.status === -100) {
          this.loginError = true
          this.loginErrorTips = '用户名或密码错误！'
        } else if (error.response.status === 500) {
          this.loginError = true
          this.loginErrorTips = 'Internal Server Error'
        } else {
          this.loginError = true
          this.loginErrorTips = '未知错误'
        }
      }
    },
    userRegister: async function () {
      if (this.registerForm.password !== this.registerForm.passwordAgain) {
        this.registerError = true
        this.registerErrorTips = '两次输入的密码不一致！'
      } else {
        try {
          let response = await this.axios.post('/api/register', {
            username: this.registerForm.username,
            password: this.registerForm.password,
            nickname: this.registerForm.nickname
          })
          this.$bvToast.toast(`使用您的账号登录系统，畅享便捷存储！`, {
            title: `注册成功`,
            toaster: 'b-toaster-top-center',
            solid: true,
            variant: 'success'
          })
          this.showRegister = false
          this.registerError = false

        } catch (error) {
          //console.log(error.response)
          if (error.response.data.status === -100) {
            if (error.response.data.data.errors.Username !== undefined){
              this.registerError = true
              this.registerErrorTips = '用户名不合规，请检查后再试！'
            }else if(error.response.data.data.errors.Password !== undefined){
              this.registerError = true
              this.registerErrorTips = '密码不合规，请检查后再试！'
            }else if(error.response.data.data.errors.Nickname !== undefined){
              this.registerError = true
              this.registerErrorTips = '昵称不合规，请检查后再试！'
            }
          } else if (error.response.data.status === -101) {
            this.registerError = true
            this.registerErrorTips = '用户名已存在！'
          } else if (error.response.status === 500) {
            this.registerError = true
            this.registerErrorTips = 'Internal Server Error'
          } else {
            this.registerError = true
            this.registerErrorTips = '未知错误'
          }
        }
      }
    }
  }
}

</script>

<style scoped>

.bg {
  background-image: url('../assets/bg.jpg');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center center;
  height: 100%;
  width: 100%;
  margin: 0 0 0 0;
  overflow: hidden hidden;
  z-index: 1;
}

.bg:after {
  content: "";
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  background: inherit;
  filter: blur(2px);
  z-index: 2;
}

.front {
  position: relative;
  z-index: 11;
}

.form-horizontal {
  background-color: #fff;
  font-family: 'Arimo', sans-serif;
  text-align: center;
  padding: 50px 30px 50px;
  box-shadow: 12px 12px 0 0 rgba(0, 0, 0, 0.3);
}

.form-horizontal .heading {
  color: #555;
  font-size: 30px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: capitalize;
  margin: 0 0 50px 0;
}

.form-horizontal .form-group {
  margin: 0 auto 30px;
  position: relative;
}

.form-horizontal .form-group:nth-last-child(2) {
  margin-bottom: 20px;
}

.form-horizontal .form-group:last-child {
  margin: 0;
}

.form-horizontal .form-group > i {
  color: #999;
  transform: translateY(-50%);
  position: absolute;
  left: 5px;
  top: 50%;
}

.form-horizontal .form-control {
  color: #7AB6B6;
  background-color: #fff;
  font-size: 17px;
  letter-spacing: 1px;
  height: 40px;
  padding: 5px 10px 2px 25px;
  box-shadow: 0 0 0 0 transparent;
  border: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 0;
  display: inline-block;
}

.form-control::placeholder {
  color: rgba(0, 0, 0, 0.2);
  font-size: 16px;
}

.form-horizontal .form-control:focus {
  border-bottom: 1px solid #7AB6B6;
  box-shadow: none;
}

.form-horizontal .btn {
  color: #7AB6B6;
  background-color: #EDF6F5;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 1px;
  border-radius: 5px;
  width: 50%;
  height: 45px;
  padding: 7px 30px;
  margin: 0 auto 25px;
  border: none;
  display: block;
  position: relative;
  transition: all 0.3s ease;
}

.form-horizontal .btn:focus,
.form-horizontal .btn:hover {
  color: #fff;
  background-color: #7AB6B6;
}

.form-horizontal .btn:before,
.form-horizontal .btn:after {
  content: '';
  background-color: #7AB6B6;
  height: 50%;
  width: 2px;
  position: absolute;
  left: 0;
  bottom: 0;
  z-index: 1;
  transition: all 0.3s;
}

.form-horizontal .btn:after {
  bottom: auto;
  top: 0;
  left: auto;
  right: 0;
}

.form-horizontal .btn:hover:before,
.form-horizontal .btn:hover:after {
  height: 100%;
  width: 50%;
  opacity: 0;
}

.form-horizontal .create_account {
  color: #D6BC8B;
  font-size: 16px;
  font-weight: 600;
  display: inline-block;
}

.form-horizontal .create_account:hover {
  color: #7AB6B6;
  text-decoration: none;
}

</style>
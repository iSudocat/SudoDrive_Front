import Vue from 'vue';
import Router from 'vue-router';
import BadGateway from '../components/BadGateway'
import Content from "../layout/Content";
import Login from "../components/Login.vue"
import GroupManage from "../components/GroupManage";
import Files from "../components/Files";
import UserManage from "../components/UserManage";

Vue.use(Router);

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      redirect: 'login',
      component: Content,
      children: [
        {
          path: '/groupManage',
          name: 'groupManage',
          component: GroupManage,
          props: { page: 'groupManage' }
        },
        {
          path: '/files',
          name: 'files',
          component: Files,
          props: { page: 'files' }
        },
        {
          path: '/UserManage',
          name: 'userManage',
          component: UserManage,
          props: { page: 'userManage' }
        },
      ]
    },
    {
      path: '/404',
      name: 'BadGateway',
      props: { page: 5 },
      component: BadGateway
    },
    {
      path: '*',
      props: { page: 5 },
      redirect: '/404'
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
  ]
})


export default router;
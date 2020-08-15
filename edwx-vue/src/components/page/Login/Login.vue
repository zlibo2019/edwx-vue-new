<template>
  <div id="Login">
    <div class="head-box">
      <dl>
        <dt>登录</dt>
        <dd>
          <div>{{title}}</div>
        </dd>
      </dl>
    </div>
    <ul class="sign-in">
      <li class="account" v-if="$params.mode==='1'">
        <img :src="companyId.length != ''|| comActive ? companyAc:companyNo">
        <input type="text" placeholder="请输入企业编号" v-model="companyId" @focus="comFocus;move()" @click="move()"
               @blur="comBlur" />
      </li>
      <li class="account">
        <img :src="account.length != ''|| accActive ? accountAc:accountNo">
        <input type="text" placeholder="请输入工号/手机号" v-model="account" @focus="accFocus;move()" @click="move()"
               @blur="accBlur" />
      </li>
      <li class="password">
        <img :src="password != '' || psdActive ? passwordAc:passwordNo" class="left">
        <input :type="psdOpen ? 'text':'password'" placeholder="请输入密码" maxlength="10" v-model="password"
               @input="psdInput(password)"
               @focus="psdFocus;move()" @click="move()"
               @blur="psdBlur" ref="pwdRef" />
        <img :src="psdOpen ? passwordOpen:passwordClose" class="right" @click="openPsd">
      </li>
      <li v-if="showhide">
        <input class="accountad" type="text" placeholder="请输入服务器ip地址:xx.xx.xx.xx" v-model="ipcon" />
      </li>
      <li v-if="showhide">
        <input class="accountad" type="text" placeholder="请输入端口号:xxxx" v-model="port" />
      </li>
      <div class="role-box">
        <div style="height: 0.4rem"></div>
        <!--<Radio :id="1" :data="radioData" @choose="choose"></Radio>-->
      </div>
    </ul>
    <div class="confirm-box">
      <x-button text="登录并绑定微信账号" @click.native="login" type="primary"
                :style="{'box-shadow':account===''||password===''?'2px 2px 10px #A2A2A2':'2px 2px 10px #3399ff'}"
                :disabled="account===''||password===''"></x-button>
    </div>
    <div class="logo-box">
      <!--<img src="@/assets/LOGO.png" alt="">-->
    </div>
  </div>
</template>

<script>
  import Radio from '@/components/common/Radio/Radio.vue';
  import {XButton} from 'vux';

  export default {
    name: 'Login',
    components: {
      Radio,
      XButton,
    },
    data() {
      return {
        toast: '', //toast内容
        comActive: false, //账号输入状态1
        companyAc: require('@/assets/company_active.png'),
        companyNo: require('@/assets/company_no.png'),
        accActive: false, //账号输入状态1
        accountAc: require('@/assets/account_active.png'),
        accountNo: require('@/assets/account_no.png'),
        psdActive: false, //密码输入状态
        passwordAc: require('@/assets/password_active.png'),
        passwordNo: require('@/assets/password_no.png'),
        psdOpen: false, //是否显示密码
        passwordOpen: require('@/assets/password_open.png'),
        passwordClose: require('@/assets/password_close.png'),
//				logoUrl: require("../assets/login_logo.png"), //头像
        radioData: [
          {
            checked: false,
            title: '个人',
          }, {
            checked: false,
            title: '商户',
          },
        ],
        companyId: '',
        account: '', //账号
        password: '',
        isPsd: true, //密码输入格式是否正确
        timer: null,
        otherType: '',
        ipcon: '',
        port: '',
        showhide: false,
        loginType: '0',   //默认选中
        title: '欢迎使用微信平台',
      };
    },
    methods: {
      getHashParameters() {
        var arr = (window.location.href || '').split('?')[1].split('&');
        var params = {};
        for (var i = 0; i < arr.length; i++) {
          var data = arr[i].split('=');
          if (data.length === 2) {
            params[data[0]] = data[1];
          }
        }

        return params;
      },
      click1() {//选择商户或个人登录，改变预设loginType的值，0为个人，1为商户
        // alert($("input[name='identity']:checked").val());
        this.loginType = $('input[name=\'identity\']:checked').val();
        // console.log(this.loginType);
      },
      move() {//输入法键盘冒起时上移输入框使其不被键盘覆盖
        setTimeout(() => {
          $('#Login').scrollTop(170);
        }, 700);
      },
      psdInput(password) {//密码格式验证
        var str = password;
        if (str == null || str.length < 6 || str.length > 16) {
          this.isPsd = false;
          //console.log("密码格式错误");
          return false;
        }
        var reg1 = new RegExp(/^[0-9A-Za-z]+$/);
        if (!reg1.test(str)) {
          //console.log("密码格式错误");
          this.isPsd = false;
          return false;
        }
        var reg = new RegExp(/[A-Za-z].*[0-9]|[0-9].*[A-Za-z]/);
        if (reg.test(str)) {
          //console.log("成功");
          this.isPsd = true;
          return true;
        } else {
          //console.log("密码格式错误");
          this.isPsd = false;
          return false;
          // this.$utils.Store.getItem('UserSerial')
        }
      },
      choose(item) {
        //传参
        if (item.title === '个人') {
          this.loginType = 0;
        } else if (item.title === '商户') {
          this.loginType = 1;
        }
      },
      updateInfo(data) {
        let user = data;
        this.$utils.Store.setLocalItem('account', this.account);
        this.$utils.Store.setLocalItem('companyId', this.companyId);
        this.$utils.Store.setItem('companyId', this.companyId);
        this.$utils.Custom.setUserInfo(data);
        if (this.$params.mode === '1') {
          this.$api.Login.updateInfo({
            openId: data.openId,
            companyId: this.companyId,
            unionId: data.unionId,
            userSerial: data.userSerial,
            userNo: data.userNo,
            userLname: data.userLname,
            orgId: data.orgId,
            orgName: data.orgName,
          }).then(response => {
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg);
            } else {
              this.goPage(user);
            }
          }).catch(err => {
            this.$utils.Tools.httpError();
          });
        } else {
          this.goPage(user);
        }
      },
      goPage(data) {
        let page = this.$route.params.page;
        if (page !== undefined) {
          this.$router.replace({
            name: page,
            params: {
              state: this.$route.params.state,
            },
          });
        } else {
          this.$router.replace({
            path: '/',
            query: {
              loginType: '1',
              safePwd: data.safePwd,
            },
          });
        }
      },
      login() {
        this.companyId = this.companyId.trim().substring(this.companyId.trim().length - 8, this.companyId.trim().length);
        // 登录按钮点击量
        document.body && (document.body.scrollTop = document.body.scrollTop);
        this.$utils.Tools.loadShow();
        if (this.isbtnDis === false) {
          this.$api.Login.login({
            userNo: this.account,
            userPassword: this.password,
            openId: this.$utils.Store.getItem('openId'), //?this.$utils.Store.getItem('openid'):null//openid，登录需要
            companyId: this.companyId,
            loginType: this.loginType, // 登录类型，商户和普通用户
          }).then(response => {
            this.$utils.Tools.loadHide();
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg);
            } else {
              this.updateInfo(data);
            }
          }).catch(err => {
            this.$utils.Tools.httpError();
          });
        }
      },
      accFocus() {
        //输入账号获取焦点时
        //console.log("获取焦点");
        this.accActive = true;
      },
      accBlur() {
        //输入账号失去焦点时
        //console.log("失去焦点");
        document.body && (document.body.scrollTop = document.body.scrollTop);
        this.accActive = false;
      },
      comFocus() {
        this.comActive = true;
      },
      comBlur() {
        document.body && (document.body.scrollTop = document.body.scrollTop);
        this.comActive = false;
      },
      psdFocus() {
        //输入密码获取焦点时
        //console.log("获取焦点");
        this.psdActive = true;
      },
      psdBlur() {
        document.body && (document.body.scrollTop = document.body.scrollTop);
        //输入密码失去焦点时
        //console.log("失去焦点");
        this.psdActive = false;
      },
      openPsd() {
        //是否显示密码
        //console.log("睁眼，闭眼");
        this.psdOpen = !this.psdOpen;
        this.$refs.pwdRef.focus();
      },
      hideToast() {
        this.isToast = false;
      },
      showToast() {
        this.isToast = true;
      },
    },
    computed: {
      isbtnDis() {
        return !(this.account !== '' && this.password !== '');
      },
    },
    destroyed() {
      clearTimeout(this.timer);
    },
    mounted() {
    },
    created() {
      this.$api.Sys.getSysSetting().then(res => {
        this.title = res.title;
      });

      this.$utils.Store.removeItem('init');
      let temp = this.$utils.Store.getLocalItem('account');
      this.account = temp === null ? '' : temp;
      temp = this.$utils.Store.getLocalItem('companyId');
      this.companyId = temp === null ? '' : temp;
      // this.login();
    },
  };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style type="text/scss" lang="scss">
  #Login {
    overflow-x: hidden;
    overflow-y: auto;
    width: 100%;
    height: 100%;
    margin: 0 auto;
    background-size: 100%;
    background-color: #fff;
    font-size: 0.17rem;

    .head-box {
      width: 100%;
      height: 1.8rem;
      padding: 0.4rem 0 0.4rem 12%;
      overflow: hidden;

      dl {
        dt {
          font-size: 0.5rem;
          color: #B4D7FA;
        }

        dd {
          height: 0.3rem;
          font-size: 0.16rem;
          color: #3399FF;
          position: relative;

          > div {
            width: auto;
            height: 0.3rem;
            padding-right: 0.1rem;
            position: absolute;
            z-index: 10;
            background: #fff;
          }

          &:after {
            content: "";
            width: 100%;
            height: 1px;
            position: absolute;
            top: 0;
            bottom: 0;
            right: 0;
            margin: auto;
            z-index: 8;
            background: #C1E0FF;
          }
        }
      }
    }

    .sign-in {
      li {
        width: 100%;

        margin: auto;
        position: relative;
        margin-bottom: 0.1rem;
        height: 0.5rem;

        &:nth-last-child(1) {
          margin-bottom: 0;
        }

        img {
          position: absolute;
        }

        input {
          width: 70%;
          height: 0.5rem;
          padding-left: 0.4rem;
          display: block;
          margin: 0 auto;
          background-color: transparent;
          font-size: 0.17rem;
          border: 0;
          outline: none;
          border-bottom: 1px solid #eaeaea;
          color: #000;
        }

        .accountad {
          width: 70%;
          height: 0.5rem;
          padding-left: 0.4rem;
          display: block;
          margin: 0 auto;
          padding-left: 0;
          background-color: transparent;
          font-size: 0.17rem;
          border: 0;
          outline: none;
          border-bottom: 1px solid #eaeaea;
          color: #000;
        }
      }

      .account {
        img {
          left: 0.54rem;
          top: 0.06rem;
          width: 0.3rem;
        }
      }

      .password {
        .left {
          left: 0.54rem;
          top: 0.06rem;
          width: 0.3rem;
        }

        .right {
          right: 0.54rem;
          top: 0.07rem;
          width: 0.3rem;
        }
      }

      input[type="radio"] + label::before {
        content: "\a0"; /*不换行空格*/
        display: inline-block;
        vertical-align: middle;
        font-size: 18px;
        width: 1em;
        height: 1em;
        margin-right: 0.4em;
        border-radius: 50%;
        border: 1px solid #00c5ff;
        text-indent: 0.15em;
        line-height: 1;
        position: relative;
        top: -0.02rem;
      }

      input[type="radio"]:checked + label::before {
        background-color: #00c5ff;
        background-clip: content-box;
      }

      input[type="radio"] {
        position: absolute;
        clip: rect(0, 0, 0, 0);
      }

      .checking {
        color: blue;
      }
    }

    .role-box {
      margin: 0.3rem 14%;

      p {
        color: #999999;
      }
    }

    .confirm-box {
      padding: 0 10%;
      margin-top: 0.5rem;
      width: 100%; //设置按钮的宽度
      height: 0.5rem; //阴影按钮--要设高度
      > div.confirm {
        width: 100%;
        height: 0.5rem;

        button.studBtn3 {
          background: #3399FF;
          box-shadow: 0 10px 15px rgba(51, 153, 255, 0.3);
          font-size: 0.18rem;
        }
      }
    }

    .logo-box {
      width: 100%;
      height: auto;
      text-align: center;
      margin: 0.4rem auto;

      img {
        width: 1rem;
        height: auto;
      }
    }
  }
</style>

<template>
  <div class="changePWD">
    <group label-width="4.5em" label-margin-right="1em" class="pass-box">
      <x-input class="oldPwd btn-default" v-model="oldPwd" placeholder="请输入原密码" type="password" min="6" max="10"
               :should-toast-error="false"></x-input>
      <x-input class="newPwd" v-model="newPwd" placeholder="请输入新密码" type="password" min="6" max="10"
               :should-toast-error="false"></x-input>
      <x-input v-model="confirmPwd" placeholder="请确认新密码" type="password" min="6" max="10"
               :should-toast-error="false"></x-input>
    </group>
    <p>密码为6-10位数字或字母组合</p>
    <div class="my-operate">
      <x-button type="primary" @click.native="sumitClick">确认</x-button>
    </div>

  </div>
</template>
<script>
  import {
    XInput, XButton, Group, Popover,
  } from 'vux';

  export default {
    name: 'ChangePWD',
    components: {
      XInput, XButton, Group, Popover,
    },
    data() {
      return {
        oldPwd: '',  //原密码
        newPwd: '',  //新密码
        confirmPwd: '',  //确认密码
      };
    },
    computed: {},
    methods: {
      sumitClick() {
        let reg = /^[0-9a-zA-Z]{6,10}$/;
        if (reg.test(this.oldPwd) && reg.test(this.newPwd) && reg.test(this.confirmPwd)) {
          // console.log(88, this.oldPwd, this.newPwd, this.confirmPwd)
          if (this.newPwd == this.confirmPwd) {
            this.$utils.Tools.loadShow();
            this.$api.My.updatePwd({
              userSerial: this.$utils.Store.getItem('userSerial'),
              newPassword: this.newPwd,
              userPassword: this.oldPwd,
            }).then(response => {
              const {code, msg, data} = response;
              this.$utils.Tools.loadHide();
              if (+code !== this.$code.success) {
                this.$utils.Tools.toastShow(msg);
              } else {
                this.$utils.Tools.toastShow('密码修改成功');
                setTimeout(() => {
                  this.$router.go(-1);
                }, 1000);
              }
            }).catch(err => {
              this.$utils.Tools.httpError();
            });
          } else {
            this.$utils.Tools.toastShow('新密码输入不一致');
          }

        } else {
          if (!reg.test(this.oldPwd)) {
            this.$utils.Tools.toastShow('旧密码必须为6-10位的数字或字母组合');
          } else if (!reg.test(this.newPwd)) {
            this.$utils.Tools.toastShow('新密码必须为6-10位的数字或字母组合');
          } else if (!reg.test(this.confirmPwd)) {
            this.$utils.Tools.toastShow('二次确认密码必须为6-10位的数字或字母组合');
          }
        }
      },
    },
    created() {

    },
    mounted() {

    },
    destroyed() {

    },
  };
</script>
<style type="text/scss" lang="scss">
  .changePWD {
    width: 100%;
    height: 100%;
    background: #F4F5F9;

    .pass-box {
      .weui-cells {
        margin-top: 0;

      }
    }

    .weui-cell {
      height: 0.5rem;
      padding-left: 0.3rem;
      position: relative;
      font-size: 0.13rem;
      background: #fff;

      &:before {
        left: 0;
      }

      &:after {
        width: 0.2rem;
        height: 0.5rem;
        content: "*";
        position: absolute;
        top: 0.15rem;
        left: 0.15rem;
        font-size: 0.2rem;
        color: red;
        border: none;
        transform: scaleY(1);
      }

      .weui-label {
        color: #999;
        font-size: 0.13rem;
      }

      .vux-label {
        color: #999;
      }

      .weui-cell__primary {
        color: #333;
        height: 0.5rem;
        padding: 0.1rem 0;

        .weui-input {
          height: 0.3rem;
          line-height: 0.3rem;
        }
      }
    }

    p {
      font-size: 0.13rem;
      color: #666;
      line-height: 0.4rem;
      padding-left: 0.2rem;
    }

    .my-operate {
      width: 100%;
      height: 0.5rem;
      margin: 0.3rem 0 0.1rem 0;

      .weui-btn {
        width: 80%;
        font-size: 0.18rem;

        &.disabled {
          background: #A2A2A2;
        }
      }
    }

    .popover-demo-content {
      padding: 5px 10px;
    }

  }

  .weui-toast {
    top: 0.8rem !important;
  }
</style>

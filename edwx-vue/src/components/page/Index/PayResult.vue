<template>
  <div class="pay-result">
    <msg :title="title" :icon="icon">
      <template slot="description">
        <div class="description" v-if="flag">
          <p><span>付款金额：</span><span style="color: red">{{Number(addMoney)/100}}</span>&nbsp;元</p>
          <p><span>下单时间：</span><span>{{sj}}</span></p>
        </div>
      </template>
      <template slot="buttons">
        <x-button text="返回充值" @click.native="backPay" type="primary"></x-button>
      </template>
    </msg>
  </div>
</template>
<script>
  import {Msg, XButton} from 'vux';

  export default {
    name: 'PayResult',
    components: {
      Msg, XButton,
    },
    data() {
      return {
        addMoney: '',
        sj: '',
        flag: false,
        icon: '',
        title: '',
      };
    },
    // beforeRouteLeave(to, from, next) {
    //   next({replace: true, redirect: '/Recharge'}); //目标路由 重定向
    // },
    methods: {
      backPay() {
        this.$utils.Tools.getEnv(res => {
          if (res === 0) {
            this.$wechat.miniProgram.navigateBack({delta: 1});
          } else {
            this.$router.go(-1);
            // this.$router.replace('/Recharge');
          }
        });
      },
      getWxResultDetail() {
        this.$api.Home.getResultDetail({
          orderId: this.$route.query.outTradeNo,
          userSerial: this.$utils.Store.getItem('userSerial'),
        }).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.icon = 'warn';
            this.title = '充值失败';
            this.$utils.Tools.toastShow(msg);
          } else {
            this.addMoney = data.addMoney;
            this.sj = data.sj;
            this.icon = 'success';
            this.title = '充值成功';
            this.flag = true;
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      getDtResultDetail() {
        this.$api.Home.getDtResultDetail({
          orderId: this.$route.query.outTradeNo,
          userSerial: this.$utils.Store.getItem('userSerial'),
        }).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.icon = 'warn';
            this.title = '充值失败';
            this.$utils.Tools.toastShow(msg);
          } else {
            this.addMoney = data.addMoney;
            this.sj = data.sj;
            this.icon = 'success';
            this.title = '充值成功';
            this.flag = true;
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
    },
    created() {
      this.$utils.Tools.getEnv(res => {
        if (res === 0 || res === 1) {
          this.getWxResultDetail();
        } else {
          this.getDtResultDetail();
        }
      });
    },
  };
</script>

<style type="text/scss" lang="scss" scoped>
  .pay-result {
    height: 100%;
    width: 100%;

    .description {
      margin-top: 0.2rem;
      text-align: left;
      color: black;

      p {
        line-height: 0.3rem;
      }

      span {
        padding-left: 0.1rem;
      }
    }
  }
</style>

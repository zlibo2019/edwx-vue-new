<template>
  <div class="my-qrcode">
    <div class="qrcode">
      <qrcode :value="value" v-if="showFlag" @click.native="getQrcode"></qrcode>
    </div>
    <p v-if="showFlag">{{p1}}</p>
    <p v-if="showFlag">{{p2}}</p>
  </div>
</template>
<script>
  import {
    Qrcode
  } from "vux"

  export default {
    name: "MyQrcode",
    components: {
      Qrcode
    },
    data() {
      return {
        showFlag: false,
        p1: '将二维码对准设备，即可自动扫描',
        p2: '该二维码可用于考勤、门禁和消费',
        p3: '',
        timer: null,    //定时器
        value: '',
      }
    },
    computed: {},
    methods: {
      getQrcode() {
        this.showFlag = false;
        this.$api.Home.getQrcode({
          userSerial: this.$utils.Store.getItem('userSerial')
        }).then(response => {
            const {code, msg, data} = response;
            this.$utils.Tools.loadHide();
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg);
              setTimeout(() => {
                this.$router.go(-1);
              }, 2000);
            } else {
              this.value = data.codeStr;
              this.showFlag = true;
            }
          }).catch(err => {
          });
      }
    },
    created() {
      this.$utils.Tools.loadShow();
      // this.value = this.$route.params.codeStr;
      clearInterval(this.timer);
      this.getQrcode();
      this.timer = setInterval(() => {
        this.getQrcode();
      }, 30000)
    },
    destroyed() {
      clearInterval(this.timer);
    }
  }
</script>
<style type="text/scss" lang="scss">
  .my-qrcode {
    width: 100%;
    height: 100%;
    font-size: 0.14rem;
    text-align: center;

    .qrcode {
      padding-top: 1rem;
      padding-bottom: 0.2rem;
      font-size: 0.16rem;

      img {
        height: 2.1rem !important;
        width: 2.1rem !important;
      }
    }
  }
</style>

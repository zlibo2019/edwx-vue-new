<template>
  <div>
    <msg :title="title" :icon="icon" v-if="msgShow">
      <template slot="buttons">
        <x-button text="重新扫码" type="primary" @click.native="scanCode"></x-button>
        <x-button text="取消扫码" @click.native="cancelScan"></x-button>
      </template>
    </msg>
  </div>
</template>

<script>
  import {Msg, XButton} from 'vux';

  export default {
    name: 'RichScan',
    components: {
      Msg,
      XButton,
    },
    data() {
      return {
        msgShow: false,
        title: '',
        icon: '',
        repeat: false,
      };
    },
    methods: {
      cancelScan: function () {
        this.$router.go(-(history.length - 1));
      },
      getScanResult: function (codeStr) {
        let _that = this;
        this.$api.Home.getScanResult({
          codeStr: codeStr,
          userSerial: this.$utils.Store.getItem('userSerial'),
        }).then(response => {
          // this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          _that.title = msg;
          if (+code !== this.$code.success) {
            _that.icon = 'warn';
            _that.repeat = true;
          } else {
            _that.icon = 'success';
            _that.repeat = false;
          }
        });
      },
      dtScanCode: function () {
        let that = this;
        this.$dd.biz.util.scan({
          type: 'all', // type 为 all、qrCode、barCode，默认是all。
          onSuccess: function (data) {
            if (data.text) {
              that.getScanResult(data.text);
              that.msgShow = true;
            } else {
              that.$router.go(-(history.length - 1));
            }
          },
          onFail: function (err) {
            this.icon = 'warn';
            this.repeat = true;
            this.title = '扫码异常';
          },
        });
      },
      wxScanQRCode: function () {
        let _that = this;
        this.$utils.WeiXin.wxScanQRCode((data) => {
          if (data.code !== this.$code.success) {
            if (data.code === this.$code.cancel) {
              this.$router.go(-(history.length - 1));
            } else {
              _that.icon = 'warn';
              _that.repeat = true;
              _that.title = data.codeStr;
            }
          } else {
            this.getScanResult(data.codeStr);
          }
          _that.msgShow = true;
        });
      },
      scanCode: function () {
        this.$utils.Tools.getEnv(res => {
          if (res === 0 || res === 1) {
            this.wxScanCode();
          } else {
            this.dtScanCode();
          }
        });
      },
      wxScanCode: function () {
        this.msgShow = false;
        this.$utils.Tools.loadShow();
        let localUrl = window.location.href.split('#')[0];
        this.$api.Sys.getConfig(localUrl, this.$params.mode).then(response => {
          const {code, msg, data} = response;
          this.$utils.Tools.loadHide();
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.$utils.WeiXin.wxReady(this.wxScanQRCode);
            this.$utils.WeiXin.wxConfig(data);
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
    },
    created() {
      this.$utils.Tools.getEnv(res => {
        if (res === 0 || res === 1) {
          this.wxScanCode();
        } else {
          this.dtScanCode();
        }
      });
    },
    mounted() {
    },
  };
</script>

<style type="text/scss" lang="scss" scoped>
  #rich-scan {
    width: 100%;
    height: 100%;
    position: fixed;
    left: 0;
    top: 0;
    background: #fff;
  }
</style>

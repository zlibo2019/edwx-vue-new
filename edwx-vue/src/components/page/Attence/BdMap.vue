<template>
  <div id="Map">
    <div id="allmap"></div>
  </div>
</template>
<script>
  import {XButton} from 'vux';

  export default {
    name: 'BdMap',
    components: {
      XButton,
    },
    data() {
      return {
        mapcontrol: '',
        flag: '',
      };
    },
    methods: {
      onPosition: function () {
        let that = this;
        that.$utils.Tools.loadShow();
        that.$utils.WeiXin.wxGetLocation('allmap', this.mapcontrol, this.flag, (data) => {
          if (data.flag === false) {
            this.$utils.Tools.toastShow(i18n.t('location.failed'));
          } else {
            this.$utils.Store.setItem('address', data.address);
            this.$utils.Store.setItem('latitude', data.latitude);
            this.$utils.Store.setItem('longitude', data.longitude);
          }
          this.$utils.Tools.loadHide();
        });
      },
      onDtPosition: function () {
        let that = this;
        that.$utils.Tools.loadShow();
        that.$utils.DingTalk.dtGetLocation('allmap', this.mapcontrol, this.flag, (data) => {
          if (data.flag === false) {
            this.$utils.Tools.toastShow(i18n.t('location.failed'));
          } else {
            this.$utils.Store.setItem('address', data.address);
            this.$utils.Store.setItem('latitude', data.latitude);
            this.$utils.Store.setItem('longitude', data.longitude);
          }
          this.$utils.Tools.loadHide();
        });
      },
    },
    destroy() {
      this.$utils.Tools.loadHide();
    },
    mounted() {
      this.$utils.Tools.loadShow();
      this.mapcontrol = this.$route.params.mapcontrol;
      this.flag = this.$route.params.flag;
      // mapcontrol = 10;
      // flag = true;
      if (+this.mapcontrol === 20) {
        this.$utils.Store.removeItem('address');
        this.$utils.Store.removeItem('latitude');
        this.$utils.Store.removeItem('longitude');
        // let ua = navigator.userAgent.toLowerCase();
        // let localUrl = window.location.href.split('#')[0];
        // this.$api.Sys.getConfig(localUrl, this.$params.mode).then(response => {
        //   const {code, msg, data} = response;
        //   if (+code !== this.$code.success) {
        //     this.$utils.Tools.toastShow(msg);
        //   } else {
        //     this.onPosition();
        //   }
        // }).catch(err => {
        //   this.$utils.Tools.httpError();
        // });

        this.$utils.Tools.getEnv(res => {
          if (res === 0 || res === 1) {
            this.onPosition();
          } else {
            this.onDtPosition();
          }
        });
      } else {
        let longitude = +this.$utils.Store.getItem('longitude');
        let latitude = +this.$utils.Store.getItem('latitude');
        // longitude = 116.331398;
        // latitude = 39.897445;
        this.$utils.Position.getMarkerBd('allmap', longitude, latitude, this.mapcontrol, this.flag,
          (data) => {
            if (data.flag === false) {
              this.$utils.Tools.toastShow(i18n.t('location.failed'));
            } else {
              this.$utils.Store.setItem('address', data.address);
              this.$utils.Store.setItem('latitude', data.latitude);
              this.$utils.Store.setItem('longitude', data.longitude);
            }
            this.$utils.Tools.loadHide();
          },
        );
      }
    },
  };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style type="text/scss" lang="scss" scoped>
  #Map {
    width: 100%;
    height: 100%;
    overflow: hidden;
    margin: 0;
    padding: 0;
    font-size: 0.15rem;
    position: fixed;
    left: 0;
    top: 0;
    background-color: white;
    color: black;

    #allmap {
      width: 100%;
      height: 100%;
      overflow: hidden;
      margin: 0;
      font-family: "微软雅黑";
    }
  }
</style>

<template>
  <div class="outside-detail">
    <div class="outside-detail-body">
      <group gutter="0">
        <x-input title="当前时间" :value="fmtDate" readonly text-align="right"></x-input>
        <cell title="当前地点" :is-link="true" :value="address" @click.native="jumpMapSmall"></cell>
        <cell style="background: #F4F5F9">
          <span style="color:blue;font-size: 0.12rem;" @click="jumpMapSmall">定位不准?点我重试</span>
        </cell>
        <x-input title="客户名称" placeholder="请输入客户名称" placeholder-align="right" v-model="customerName"
                 text-align="right"></x-input>
      </group>
      <group :gutter="10">
        <x-textarea placeholder="请描述详情" :rows="5" v-model="info"></x-textarea>
      </group>
      <upload-image :limitNum="limitNum" :imgList="imgList" :source-type="['camera']"
                    v-if="$params.attence === '1'"></upload-image>
      <group :gutter="10">
        <radio :options="commonList" v-model="radioValue"></radio>
      </group>
    </div>
    <div class="outside-detail-bottom">
      <x-button type="primary" text="提交" style="width:80%" @click.native="onSubmitOs"></x-button>
    </div>
    <div id="allmap2"></div>
  </div>
</template>

<script>
  import {
    Group,
    XInput,
    XTextarea,
    Cell,
    Radio,
    XButton,
  } from 'vux';

  import UploadImage from '@/components/common/UploadImage/UploadImage';

  export default {
    name: 'OutSide',
    components: {
      Group,
      XInput,
      XTextarea,
      Cell,
      Radio,
      XButton,
      UploadImage,
    },
    data() {
      return {
        interval: '',
        imgList: [],   //图片列表数组
        limitNum: 1,     //最多上传图片张数
        point: [],
        jing: '',
        wei: '',
        userSerial: '',
        currDate: '',
        fmtDate: '',
        address: '',
        customerName: '',
        info: '',
        radioValue: '0',
        commonList: this.$params.commonList,
      };
    },
    methods: {
      jumpMapSmall() {
        this.$router.push({
          name: 'BdMap',
          params: {
            mapcontrol: 20,
            flag: true,
          },
        });
      },
      submit: function () {
        if (this.customerName === '' || this.customerName === null) {
          this.$utils.Tools.loadHide();
          this.$utils.Tools.toastShow('请输入客户名称');
          return;
        }

        if (this.imgList.length === 0 && this.$params.attence === '1') {
          this.$utils.Tools.loadHide();
          this.$utils.Tools.toastShow('请上传照片');
          return;
        }

        let images = [];
        for (const image of this.imgList) {
          images.push(image.serverId);
        }
        this.$api.Attence.insertOutSide({
          address: this.address,
          customerName: this.customerName,
          fx: this.radioValue,
          jing: this.jing,
          wei: this.wei,
          lx: '0',
          outsideInfo: this.info.replace(/[\r\n]/g, ''),
          sj: this.currDate,
          userSerial: this.userSerial,
          userNo: this.$utils.Store.getItem('userNo'),
          openId: this.$utils.Store.getItem('openId'),
          lname: this.$utils.Store.getItem('userLname'),
          images: images.join(','),
        }).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(i18n.t('attence.norepeat'));
          } else {
            this.$utils.Tools.toastShow(i18n.t('attence.submit'));
            // this.$router.push('/StartWork');
            setTimeout(() => {
              history.go(-1);
            }, 1500);
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      getSysDate: function () {
        this.$api.Sys.getSystemDate(this.$params.mode).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.currDate = data.sysDate;
            this.fmtDate = this.$utils.DateUtils.formatDate(
              data.sysDate,
              'YYYY-MM-DD HH:mm',
            );
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      setDtConfig: function () {
        let localUrl = window.location.href.split('#')[0];
        this.$api.DingTalk.getDtConfig(localUrl).then(response => {
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.$utils.DingTalk.getConfig(data);
            setTimeout(() => {
              this.onDtPosition();
            }, 500);
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      onDtPosition: function () {
        let that = this;
        that.$utils.Tools.loadShow();
        that.$utils.DingTalk.dtGetLocation('allmap2', 14, false, resp => {
          if (resp.flag === true) {
            if (this.point.length > 0) {
              let range = that.$utils.Position.isRange('allmap2', resp.longitude, resp.latitude, this.point);
              if (range) {
                that.submit();
              } else {
                that.$utils.Tools.loadHide();
                that.$utils.Tools.toastShow('位置已失效，请重新定位');
              }
            } else {
              that.$utils.Tools.loadHide();
              this.point.push({longitude: resp.longitude, latitude: resp.latitude, range: 1000});
              that.wei = resp.latitude;
              that.jing = resp.longitude;
              that.address = resp.address;
            }
          } else {
            that.$utils.Tools.loadHide();
            that.$utils.Tools.toastShow(i18n.t('location.failed'));
          }
        });
      },
      setConfig: function () {
        let localUrl = window.location.href.split('#')[0];
        this.$api.Sys.getConfig(localUrl, this.$params.mode).then(response => {
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.$utils.WeiXin.wxConfig(data);
            setTimeout(() => {
              this.onPosition();
            }, 500);
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
        // this.$utils.WeiXin.wxReady(this.onPosition);
      },
      onSubmitOs: function () {
        this.$utils.Tools.getEnv(res => {
          if (res === 0 || res === 1) {
            this.onPosition();
          } else {
            this.onDtPosition();
          }
        });
      },
      onPosition: function () {
        let that = this;
        that.$utils.Tools.loadShow();
        that.$utils.WeiXin.wxGetLocation('allmap2', 14, false, resp => {
          if (resp.flag === true) {
            if (this.point.length > 0) {
              let range = that.$utils.Position.isRange('allmap2', resp.longitude, resp.latitude, this.point);
              if (range) {
                that.submit();
              } else {
                that.$utils.Tools.loadHide();
                that.$utils.Tools.toastShow('位置已失效，请重新定位');
              }
            } else {
              that.$utils.Tools.loadHide();
              this.point.push({longitude: resp.longitude, latitude: resp.latitude, range: 1000});
              that.wei = resp.latitude;
              that.jing = resp.longitude;
              that.address = resp.address;
            }
          } else {
            that.$utils.Tools.loadHide();
            that.$utils.Tools.toastShow(i18n.t('location.failed'));
          }
        });
      },
    },
    computed: {},
    created() {
      this.point = [];
      this.$utils.Tools.loadShow();
      this.userSerial = this.$utils.Store.getItem('userSerial');
      this.jing = this.$utils.Store.getItem('longitude');
      this.wei = this.$utils.Store.getItem('latitude');
      if (this.jing !== null && this.wei !== null) {
        this.address = this.$utils.Store.getItem('address');
        this.point.push({longitude: this.jing, latitude: this.wei, range: 1000});
      } else {
        this.$utils.Tools.getEnv(res => {
          if (res === 0 || res === 1) {
            this.setConfig();
          } else {
            this.setDtConfig();
          }
        });
      }

      this.getSysDate();
      this.interval = setInterval(() => {
        this.getSysDate();
      }, 60000);
    },
    mounted() {
    },
    destroyed() {
      clearInterval(this.interval);
      this.$utils.Tools.loadHide();
    },
  };
</script>

<style type="text/scss" lang="scss">
  .outside-detail {
    height: 100%;
    width: 100%;
    background: #F4F5F9;
    position: relative;

    .outside-detail-body {
      padding-bottom: 0.62rem;
      height: 100%;
      overflow-y: auto;
      padding-top: 0.1rem;
    }

    .outside-detail-bottom {
      position: absolute;
      bottom: 0;
      width: 100%;
      background: #F4F5F9;
      padding: 0.1rem 0;
    }
  }
</style>

<template>
  <div class="face-take">
    <i class="iconfont icon-close face-del" @click="delFace" v-if="delFlag==='1'"></i>
    <div class="face-photo" @click="chooseImage">
      <x-img :src="faceSrc" v-if="delFlag==='1'"></x-img>
      <div class="camera-img" v-if="delFlag==='0'">
        <x-img :src="cameraImg" style="width:100px;margin-top: calc((3.2rem - 100px) / 2)"></x-img>
      </div>
    </div>
    <div class="face-bottom">
      <group style="margin-bottom: 0.2rem;">
        <cell title="姓名" :value="userInfo.userLname"></cell>
        <cell title="工号" :value="userInfo.userNo"></cell>
        <cell title="部门" :value="userInfo.userDepname"></cell>
      </group>
      <x-button type="primary" @click.native="updateFace">确定</x-button>
    </div>
  </div>
</template>

<script>
  import {XButton, XImg, Cell, Group} from 'vux';

  export default {
    name: 'FaceTake',
    components: {
      XButton,
      XImg,
      Cell,
      Group,
    },
    data() {
      return {
        userSerial: '',
        userInfo: {},
        faceSrc: '',
        delFlag: '-1',
        serverId: '',
        cameraImg: require('@/assets/camera.png'),
      };
    },
    methods: {
      // 'http://pic75.nipic.com/file/20150821/9448607_145742365000_2.jpg'
      delFace() {
        this.faceSrc = '';
        this.delFlag = '0';
      },
      updateFace() {
        if (this.faceSrc) {
          if (this.serverId) {
            this.$utils.Tools.loadShow();
            this.$api.User.addFace({
              type: '1',
              userSerial: this.userSerial,
              userFacePhoto: this.serverId,
            }).then(response => {
              this.$utils.Tools.loadHide();
              const {code, msg, data} = response;
              if (+code !== this.$code.success) {
                this.$utils.Tools.toastShow(msg);
              } else {
                this.$utils.Tools.toastShow(msg);
                setTimeout(() => {
                  this.$router.push('/');
                }, 1500);
              }
            }).catch(err => {
              this.$utils.Tools.httpError();
            });
          } else {
            this.$router.push('/');
          }
        } else {
          this.$utils.Tools.loadShow();
          this.$api.User.delFace(this.userSerial).then(response => {
            this.$utils.Tools.loadHide();
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg);
            } else {
              this.$utils.Tools.toastShow(msg);
              setTimeout(() => {
                this.$router.push('/');
              }, 1500);
            }
          }).catch(err => {
            this.$utils.Tools.httpError();
          });
        }
      },
      getConfig() {
        let localUrl = window.location.href.split('#')[0];
        this.$utils.Tools.getEnv(res => {
          if (res === 0 || res === 1) {
            this.$api.Sys.getConfig(localUrl, this.$params.mode).then(response => {
              const {code, msg, data} = response;
              if (+code !== this.$code.success) {
                this.$utils.Tools.toastShow(msg);
              } else {
                this.$utils.WeiXin.wxConfig(data);
              }
            }).catch(err => {
              this.$utils.Tools.httpError();
            });
          } else {
            this.$api.DingTalk.getDtConfig(localUrl).then(response => {
              const {code, msg, data} = response;
              if (+code !== this.$code.success) {
                this.$utils.Tools.toastShow(msg);
              } else {
                this.$utils.DingTalk.getConfig(data);
              }
            }).catch(err => {
              this.$utils.Tools.httpError();
            });
          }
        });
      },
      chooseImage() {
        this.$utils.Tools.getEnv(res => {
          if (res === 0 || res === 1) {
            this.wxChooseImage();
          } else {
            this.dtChooseImage();
          }
        });
      },
      dtChooseImage() {
        this.$utils.DingTalk.uploadImage(res => {
          if (this.$utils.Tools.isArray(res)) {
            this.faceSrc = res[0];
            this.serverId = res[0];
            this.delFlag = '1';
          }
        }, 1);
      },
      wxChooseImage() {
        this.$utils.WeiXin.wxChooseImage(res => {
          if (res.length > 0) {
            this.uploadImage(res, 0);
          }
        }, 1);
      },
      uploadImage(res, i) {
        this.$utils.WeiXin.wxUploadImage(serverId => {
          this.$api.Sys.getWxImageUrl(serverId, this.$params.mode).then(ress => {
            this.faceSrc = ress.data;
            this.serverId = serverId;
            this.delFlag = '1';
          }).catch();
        }, res[i]);
      },
      getUserInfo: function () {
        this.$utils.Tools.loadShow();
        this.$api.User.getUser(this.userSerial).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.userInfo = data;
            this.faceSrc = data.userFacePhoto;
            if (data.userFacePhoto) {
              this.delFlag = '1';
            } else {
              this.delFlag = '0';
            }
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
    },
    created() {
      this.userSerial = this.$utils.Store.getItem('userSerial');
      this.getUserInfo();
      this.getConfig();
    },
  };
</script>

<style type="text/scss" lang="scss">
  .face-take {
    height: 100%;
    width: 100%;
    font-size: 0.14rem;
    overflow: hidden;

    .face-del {
      position: absolute;
      top: 0;
      color: red;
      right: 0.57rem;
      font-size: 0.2rem;
      z-index: 100;

      &:before {
        background-color: #ffffff;
        border-radius: 50%;
      }
    }

    .face-photo {
      margin: 0.1rem auto;
      text-align: center;
      border: 1px #ECECEC solid;
      width: 2.42rem;

      .camera-img, > img {
        display: inline-block;
        vertical-align: middle;
        height: 3.2rem;
      }
    }

    .face-bottom {
      .weui-cells:before {
        border: none;
      }

      position: absolute;
      padding: 0.1rem;
      width: 100%;
      bottom: 0;
      font-size: 0.14rem;
    }
  }
</style>

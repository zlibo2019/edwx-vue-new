<template>
  <div class="my">
    <div class="info-box" v-if="$params.mytheme === '0'">
      <dl>
        <dt>
          <div class="head-circle">
            <img class="head-image" :src="headImage" @click="chooseImage">
          </div>
        </dt>
        <dd>
          <span>姓&nbsp;&nbsp;名</span>
          <span>{{userName}}</span>
        </dd>
        <dd>
          <span>工&nbsp;&nbsp;号</span>
          <span>{{userNo}}</span>
        </dd>
      </dl>
      <svg class="icon" aria-hidden="true" @click="$router.push('/MyQrcode')">
        <use xlink:href="#icon-ziyuan"></use>
      </svg>
    </div>
    <div v-else class="head-info">
      <div class="head-content">
        <div class="head-circle">
          <!--<img class="head-image" :src="headImage">-->
          <img class="previewer-demo-img head-image" v-for="(item, index) in list" :src="item.src"
               @click="show(index)">
          <div v-transfer-dom>
            <previewer :list="list" ref="previewer" :options="options"></previewer>
          </div>
        </div>
        <div class="head-user">
          <p><span>姓名</span><span>{{userName}}</span></p>
          <p><span>电话</span><span>{{$utils.Store.getItem('userTelephone')}}</span></p>
        </div>
      </div>
      <p>童泰方舟超级会员</p>
      <p><span>会员卡</span><span>{{userNo}}</span></p>
    </div>

    <div class="menu">
      <group class="menu-box" gutter="0">
        <cell :title="item.menuName"
              :is-link="item.menuId !== '990403000000' || (item.menuId === '990403000000' && cardState !== 11)"
              v-for="(item,index) in navData" :key="index" :disabled="item.menuId === '990403000000' && cardState === 0"
              v-if="item.menuId !== '990404000000'"
              @click.native="navClick(item.iconUrlId, index, cardState)">
          <i slot="icon" :class="item.iconId" :style="{'color': item.spareCol3}"></i>
          <span slot="after-title" v-if="item.menuId === '990403000000' && cardState === -1"></span>
          <span slot="after-title" v-if="item.menuId === '990403000000' && cardState === 11"
                style="color:#FF9B0E;">未发卡</span>
          <span slot="after-title" v-else-if="item.menuId === '990403000000' && cardState === 0">已发卡</span>
          <span slot="after-title" v-else-if="item.menuId === '990403000000' && cardState === 1">已挂失</span>
        </cell>
        <cell :title="item.menuName" v-for="(item,index) in navData" :key="index" v-if="item.menuId === '990404000000'">
          <i slot="icon" class="iconfont icon-xiaoxi"></i>
          <inline-x-switch v-model="pushValue" @on-change="pushClick" :value-map="[1, 0]"></inline-x-switch>
        </cell>
      </group>
      <div class="my-operate" v-if="$params.unlock === '1'">
        <x-button type="primary" @click.native="unbind">解除绑定</x-button>
      </div>
    </div>
    <div v-transfer-dom>
      <confirm v-model="showToast"
               show-input
               ref="confirm"
               title="请输入密码"
               :input-attrs="{type: 'password', onblur:'document.body && (document.body.scrollTop = document.body.scrollTop);'}"
               @on-confirm="onConfirm" @on-hide="onHide">
        <p style="text-align:center;">确认要解除绑定吗？</p>
      </confirm>
    </div>
  </div>
</template>
<script>
  import {
    Cell, Group, XButton, InlineXSwitch, Confirm, Previewer, TransferDomDirective as TransferDom,
  } from 'vux';

  export default {
    name: 'My',
    directives: {
      TransferDom,
    },
    components: {
      Cell, Group, XButton, InlineXSwitch, Confirm, Previewer,
    },
    beforeRouteLeave(to, from, next) {
      next(this.$route.params.flag);
    },
    data() {
      return {
        options: {
          getThumbBoundsFn(index) {
            let thumbnail = document.querySelectorAll('.previewer-demo-img')[index];
            let pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
            let rect = thumbnail.getBoundingClientRect();
            return {x: rect.left, y: rect.top + pageYScroll, w: rect.width};
          },
        },
        navData: [],        //导航数组
        showToast: false,
        userName: this.$utils.Store.getItem('userLname'),
        userNo: this.$utils.Tools.isnull(this.$utils.Store.getItem('spareCol1'), this.$utils.Store.getItem('userNo')),
        userPassword: '',
        pushValue: +this.$utils.Store.getLocalItem('pushValue'),    //是否推送消息，
        headImage: this.$utils.Store.getLocalItem('headImage') || require('@/assets/head.png'),   //默认头像
        cardState: -1,    //卡片状态  0 已发卡；1已挂失；11未发卡
        list: [{
          msrc: this.$utils.Store.getLocalItem('headImage') || require('@/assets/head.png'),
          src: this.$utils.Store.getLocalItem('headImage') || require('@/assets/head.png'),
        }],
      };
    },
    computed: {},
    methods: {
      show(index) {
        this.$refs.previewer.show(index);
      },
      getWxHeadImage() {
        this.$api.My.getWxHeadImage(this.$utils.Store.getItem('userSerial')).then(response => {
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            if (data !== null && data.headImage !== '' && data.headImage !== null) {
              this.headImage = data.headImage;
              this.$utils.Store.setLocalItem('headImage', data.headImage);
            }
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      getUserHeadImage() {
        this.$api.My.getUserHeadImage(this.$utils.Store.getItem('userSerial')).then(response => {
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            if (data !== null) {
              this.list = [];
              this.headImage = data;
              this.list.push({msrc: data, src: data});
              this.$utils.Store.setLocalItem('headImage', data);
            } else {
              this.$utils.Store.removeLocalItem('headImage');
            }
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      getCardState() {
        this.$api.My.getCardState({
          userSerial: this.$utils.Store.getItem('userSerial'),
        }).then(response => {
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.cardState = data.cardType;
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
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
            this.$api.My.setWxHeadImage({
              mediaId: res.join(','),
              userSerial: this.$utils.Store.getItem('userSerial'),
            }).then(ress => {
              this.headImage = ress.data;
              this.$utils.Store.setLocalItem('headImage', ress.data);
              i++;
              if (i < res.length) {
                this.uploadImage(res, i);
              }
            }).catch();
          }
        }, 1);
      },
      wxChooseImage() {
        let i = 0;
        this.$utils.WeiXin.wxChooseImage(res => {
          if (res.length > 0) {
            this.uploadImage(res, i);
          }
        }, 1);
      },
      uploadImage(res, i) {
        this.$utils.WeiXin.wxUploadImage(serverId => {
          this.$api.My.setWxHeadImage({
            mediaId: serverId,
            userSerial: this.$utils.Store.getItem('userSerial'),
          }).then(ress => {
            this.headImage = ress.data;
            this.$utils.Store.setLocalItem('headImage', ress.data);
            i++;
            if (i < res.length) {
              this.uploadImage(res, i);
            }
          }).catch();
        }, res[i]);
      },
      wxInitConfig() {
        let localUrl = window.location.href.split('#')[0];
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
      },
      dtInitConfig() {
        let localUrl = window.location.href.split('#')[0];
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
      },
      getHomeMenu() {
        this.$utils.Tools.loadShow();
        this.$api.Home.getHomeMenu({
          companyId: 0,
          userId: this.$utils.Store.getItem('userSerial'),
          spareCol2: 2,
        }).then(response => {
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.loadHide();
            this.$utils.Tools.toastShow(msg);
          } else {
            this.navData = data;
            this.$utils.Store.setLocalItem('menuMy', JSON.stringify(data));
            this.$utils.Tools.loadHide();
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      onHide() {
        document.body && (document.body.scrollTop = document.body.scrollTop);
      },
      navClick(value, index, state) {
        if (index === 2 && state === 11) {
          this.$utils.Tools.toastShow('请联系管理员发卡');
        } else {
          this.$router.push(value);
        }
      },
      unbind() {
        this.showToast = true;
      },
      getPushState() {
        this.$utils.Tools.loadShow();
        this.$api.My.selectSendState({
          userSerial: this.$utils.Store.getItem('userSerial'),
        }).then(response => {
          const {code, msg, data} = response;
          this.$utils.Tools.loadHide();
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.pushValue = data.sendStatus;
          }
        }).catch(err => {
        });
      },
      pushClick(val) {
        this.$utils.Tools.loadShow();
        this.$api.My.pushMessage({
          userSerial: this.$utils.Store.getItem('userSerial'),
          sendStatus: this.pushValue,
        }).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.$utils.Store.setLocalItem('pushValue', this.pushValue);
          }
        }).catch(err => {
        });
      },
      onCancel() {
        // console.log('on cancel')
      },
      logout() {
        let openId = this.$utils.Store.getItem('openId');
        this.$utils.Store.clear();
        this.$utils.Store.setItem('openId', openId);
        this.$utils.Tools.getEnv(res => {
          if (res === 0) {
            this.$wechat.miniProgram.navigateBack({delta: 1});
          } else {
            this.$router.replace('/Login');
          }
        });
      },
      deleteInfo() {
        this.$api.My.deleteInfo(this.$utils.Store.getItem('openId')).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.logout();
          }
          return 1;
        }).catch(err => {
        });
      },
      onConfirm(value) {
        this.$utils.Tools.loadShow();
        this.$refs.confirm.setInputValue('');
        this.userPassword = value;
        this.$api.My.loginOut({
          openId: this.$utils.Store.getItem('openId'),
          userPassword: value,
          userSerial: this.$utils.Store.getItem('userSerial'),
        }).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            if (+code === 610) {
              if (this.$params.mode === '1') {
                this.deleteInfo();
              } else {
                this.logout();
              }
            } else {
              this.$utils.Tools.toastShow(msg);
            }
          } else {
            if (this.$params.mode === '1') {
              this.deleteInfo();
            } else {
              this.logout();
            }
          }
          return 1;
        }).catch(err => {
        });
      },
    },
    created() {
      this.navData = JSON.parse(this.$utils.Store.getLocalItem('menuMy'));
      if (this.$params.mytheme === '0') {
        this.getWxHeadImage();
      } else {
        this.getUserHeadImage();
      }

      this.$utils.Tools.getEnv(res => {
        if (res === 0 || res === 1) {
          this.wxInitConfig();
        } else {
          this.dtInitConfig();
        }
      });

      this.getHomeMenu();
      this.getPushState();
      this.getCardState();
      // console.log(66, this.$utils.Store.getLocalItem("headImage"))
    },
    mounted() {
      // window.onpopstate = () => {
      //   WeixinJSBridge.call('closeWindow');
      // }
    },
    destroyed() {
    },
  };
</script>
<style type="text/scss" lang="scss">
  .my {
    width: 100%;
    height: 100%;
    overflow-y: scroll;

    .head-info {
      background: url("../../../assets/my-bk.png") no-repeat;
      background-size: contain;
      height: 2.1rem;
      border-bottom: 0.1rem solid #F4F5F9;
      font-size: 0.16rem;
      padding: 0.2rem;

      .head-content {
        display: flex;
        align-items: center;

        .head-circle {
          height: 0.7rem;
          width: 0.7rem;
          border-radius: 50%;
          border: 1px solid #eee;
          overflow: hidden;
          float: left;
          text-align: center;

          .head-image {
            /*height: 100%;*/
            height: 0.7rem;
            width: 100%;
          }
        }

        i {
          display: block;
          font-size: 1rem;
          color: #ccc;
        }

        .head-user {
          margin-left: 0.1rem;
        }
      }

      p {
        line-height: 0.4rem;

        span + span {
          padding-left: 0.1rem;
        }
      }
    }

    .info-box {
      width: 100%;
      height: 2.1rem;
      border-bottom: 0.1rem solid #F4F5F9;
      padding: 0.1rem;
      position: relative;

      dl {
        width: 1.8rem;
        height: 2rem;
        margin: 0 auto;

        dt {
          text-align: center;
          height: 1.25rem;
          padding-top: 0.2rem;

          .head-circle {
            height: 0.9rem;
            width: 0.9rem;
            display: flex;
            margin: 0 auto;
            border-radius: 50%;
            border: 1px solid #eee;
            justify-content: center;
            align-items: center;
            overflow: hidden;

            .head-image {
              width: 0.9rem;
            }
          }

          i {
            display: block;
            font-size: 1.2rem;
            color: #ccc;
          }
        }

        dd {
          font-size: 0.13rem;
          margin-bottom: 0.1rem;
          color: #A7A7A7;
          text-align: center;
          display: flex;
          flex-direction: row;

          span {
            flex: 1;
            display: inline-block;
            color: #6C6C6C;

            &:first-child {
              padding-right: 0.05rem;
              text-align: right;
            }

            &:last-child {
              padding-left: 0.05rem;
              text-align: left;
            }
          }
        }
      }

      .icon {
        font-size: 0.3rem;
        position: absolute;
        right: 0.45rem;
        bottom: 0.25rem;
        color: #ccc;
      }
    }

    .menu {
      .menu-box {
        .weui-cells {
          .weui-cell {
            .weui-cell__hd {
              .iconfont {
                color: #3399ff;
                font-size: 0.25rem;
                margin-right: 0.05rem;
              }
            }

            .vux-cell-bd {
              p {
                span {
                  float: right;
                  /*padding-right: 0.1rem;*/
                }
              }
            }

            .weui-cell__ft {
              .weui-switch {
                margin-top: 0.05rem;
              }
            }
          }
        }
      }

      .my-operate {
        width: 100%;
        height: 0.5rem;
        margin: 0.3rem 0 0.1rem 0;

        .weui-btn {
          width: 80%;
          font-size: 0.18rem;
        }
      }
    }
  }
</style>

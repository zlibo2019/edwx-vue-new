<template>
  <div class="index">
    <div class="top-box">
      <grid :show-lr-borders="false" :show-vertical-dividers="false" v-if="headFlag === '1'">
        <grid-item v-for="item in navTopData" :key="item.iconUrlId" @on-item-click="navClick(item.iconUrlId)">
          <i slot="icon" :class="item.iconId" :style="{'color':item.spareCol3}"></i>
          <span slot="label">{{item.menuName}}</span>
        </grid-item>
      </grid>
      <div class="top-info" v-if="headFlag === '2'">
        <div class="top-user">
          <span>{{$utils.Tools.isnull($utils.Store.getItem('userLname'))}}</span>
          <span>{{$utils.Tools.isnull($utils.Store.getItem('spareCol1'), $utils.Store.getItem('userNo'))}}</span>
        </div>
        <div class="top-title">{{title}}</div>
      </div>
    </div>
    <div class="nav-box">
      <grid :show-lr-borders="false" :show-vertical-dividers="false" :cols="4">
        <grid-item v-for="item in navData" :key="item.iconUrlId" @on-item-click="navClick(item.iconUrlId)">
          <div class="weui-grid__icon" :style="{'background':item.spareCol3}">
            <i :class="item.iconId"></i>
          </div>
          <span>{{item.menuName}}</span>
          <div slot="icon" class="point" v-if="false"><!--消息提示红色小圆点，本期不显示-->
            <i class="iconfont icon-dot point"></i>
          </div>
        </grid-item>
        <grid-item @on-item-click="moreClick">
          <i slot="icon" class="iconfont icon-gengduo"></i>
          <span slot="label">更多</span>
        </grid-item>
      </grid>
    </div>
    <div class="message-box" @click="mesageClick">
      <h4>通知公告</h4>
      <div class="content-box">
        <div class="empty" v-if="newsFlag===0">暂无通知公告</div>
        <div v-for="item in messageList" :key="item.xh" v-else-if="newsFlag===1">
          <div class="info-box" style="padding:0.05rem 0.1rem">
            <flexbox :gutter="0">
              <flexbox-item :span="7">{{newsTitle(item.newsTitle)}}</flexbox-item>
              <flexbox-item :span="5" style="text-align: right">
                {{$utils.DateUtils.getYYYYMMDDHHmm(item.newsDate)}}
                <badge v-if="item.isRead===0"></badge>
              </flexbox-item>
            </flexbox>
          </div>
        </div>
        <marquee :style="{height: 0.29*msgLen + 'rem'}" :interval="5000" v-if="newsFlag===2">
          <marquee-item v-for="item in messageList" :key="item.xh">
            <div class="info-box" style="padding:0.05rem 0.1rem">
              <flexbox :gutter="0" style="overflow: hidden">
                <badge v-if="item.isRead===0"></badge>
                <flexbox-item :span="7">

                  {{newsTitle(item.newsTitle)}}
                </flexbox-item>
                <flexbox-item :span="5" style="text-align: right">
                  {{$utils.DateUtils.getYYYYMMDDHHmm(item.newsDate)}}
                </flexbox-item>
              </flexbox>
            </div>
          </marquee-item>
        </marquee>
      </div>

    </div>
  </div>
</template>
<script>
  import {
    Grid, GridItem, Cell, Group, Marquee, MarqueeItem, Flexbox, FlexboxItem, Badge,
  } from 'vux';

  export default {
    name: 'Index',
    components: {
      Grid,
      GridItem,
      Cell,
      Group,
      Marquee,
      MarqueeItem,
      Flexbox,
      FlexboxItem,
      Badge,
    },
    beforeRouteLeave(to, from, next) {
      next(this.$route.params.flag);
    },
    data() {
      return {
        navData: [],
        navTopData: [],
        messageList: [],
        newsHandler: '',
        newsFlag: 0,
        msgLen: 2,
        title: '',
        headFlag: '0',
      };
    },
    computed: {},
    methods: {
      newsTitle: function (value) {
        return value.length > 13 ? value.substring(0, 12) + '…' : value;
      },
      navClick(value) {
        if (value === '' || value === null) {
          this.$utils.Tools.toastShow('功能暂未开放');
        } else {
          this.$router.push(value);
        }
      },
      getMesageLen: function () {
        return this.$api.Sys.getSystemParams(0, this.$constant.msgShowLen).then(response => {
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            if (data === null) {
              return 2;
            } else {
              this.msgLen = +data.paramValue;
              return data.paramValue;
            }
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
          return Promise.reject();
        });
      },
      getMesageData: function (len) {
        this.$api.Message.getMessageData({
          pageIndex: 1,
          pageSize: 10,
          search: {
            userSerial: this.$utils.Store.getItem('userSerial'),
          },
        }).then(response => {
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.messageList = data.records;
            if (this.messageList.length === 0) {
              this.newsFlag = 0;
            } else if (this.messageList.length > 0 && this.messageList.length <= 2) {
              this.newsFlag = 1;
            } else {
              this.newsFlag = 2;
            }
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      moreClick() {
        // this.$utils.Tools.toastShow("更多功能敬请期待");
        // this.$router.push('/Test');
        // this.$router.push('/MealOrdering');
        this.$router.push('/AllPrograms');
      },
      mesageClick() {
        this.$router.push('/MessageList');
      },
      getHomeMenu() {
        this.$utils.Tools.loadShow();
        this.$api.Home.getHomeMenu({
          companyId: 0,
          userId: this.$utils.Store.getItem('userSerial'),
          spareCol1: 1,
          spareCol2: 0,
        }).then(response => {
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.loadHide();
            this.$utils.Tools.toastShow(msg);
          } else {
            this.navData = data;
            this.$utils.Store.setLocalItem('menuIndex', JSON.stringify(data));
            this.$utils.Tools.loadHide();
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      getHomeTopMenu() {
        this.$utils.Tools.loadShow();
        this.$api.Home.getHomeMenu({
          companyId: 0,
          userId: this.$utils.Store.getItem('userSerial'),
          spareCol1: 0,
          spareCol2: 0,
        }).then(response => {
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.loadHide();
            this.$utils.Tools.toastShow(msg);
          } else {
            this.navTopData = data;
            if (this.navTopData && this.navTopData.length > 0) {
              this.headFlag = '1';
            } else {
              this.headFlag = '2';
            }
            this.$utils.Store.setLocalItem('menuTopIndex', JSON.stringify(data));
            this.$utils.Tools.loadHide();
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      pushHistory() {
        var state = {
          title: 'title',
          url: '',
        };
        window.history.pushState(state, state.title, state.url);
      },
      initData() {
        // this.$utils.Store.removeItem('init');
        this.$utils.Store.removeItem('longitude');
        this.$utils.Store.removeItem('latitude');
        this.$utils.Store.removeItem('address');
        this.$utils.Store.removeItem('typeList');
      },
    },
    created() {
      this.$api.Sys.getSysSetting().then(res => {
        this.title = res.title;
      });
      this.initData();
      this.navData = JSON.parse(this.$utils.Store.getLocalItem('menuIndex'));
      this.navTopData = JSON.parse(this.$utils.Store.getLocalItem('menuTopIndex'));
      this.getHomeMenu();
      this.getHomeTopMenu();
      this.getMesageLen().then(this.getMesageData);
      // this.newsHandler = setInterval(() => {
      //   this.getMesageData();
      // }, 5000)
      let loginType = this.$route.query.loginType;
      let safePwd = this.$route.query.safePwd;
      if (loginType === '1' && safePwd === false) {
        this.$vux.confirm.show({
          showCancelButton: false,
          closeOnConfirm: false,
          title: '修改密码',
          showInput: true,
          inputAttrs: {
            'type': 'password',
          },
          onConfirm: (val) => {
            let reg = /^[0-9a-zA-Z]{6,10}$/;
            if (reg.test(val)) {
              this.$utils.Tools.loadShow();
              this.$api.My.updateDefaultPwd({
                userSerial: this.$utils.Store.getItem('userSerial'),
                newPassword: val,
              }).then(response => {
                const {code, msg, data} = response;
                this.$utils.Tools.loadHide();
                if (+code !== this.$code.success) {
                  this.$utils.Tools.toastShow(msg);
                } else {
                  this.$utils.Tools.toastShow('密码修改成功');
                  this.$vux.confirm.hide();
                }
              }).catch(err => {
                this.$utils.Tools.httpError();
              });
            } else {
              this.$utils.Tools.toastShow('密码必须为6-10位的数字或字母组合');
            }
          },
        });
      }
    },
    mounted() {
      // this.pushHistory();
    },
    destroyed() {
      // clearInterval(this.newsHandler);
    },
  };
</script>
<style type="text/scss" lang="scss">
  .index {
    flex: 1;
    overflow-y: scroll;

    .top-box {
      width: 100%;
      height: 0.9rem;
      background: #3399ff;

      .top-info {
        color: #ffffff;
        padding: 0.1rem;

        .top-user {
          font-size: 0.25rem;
          padding-bottom: 0.1rem;

          span:last-child {
            font-size: 0.15rem;
          }
        }

        .top-title {
          font-size: 0.15rem;
        }
      }

      .weui-grids {
        height: 100%;
        display: flex;
        flex-direction: row;

        .weui-grid {
          flex: 1;
          padding: 0.1rem;
          /*display: flex;*/
          /*flex-direction: column;*/

          &:active {
            background: none;
          }

          &:after {
            display: none;
          }

          .weui-grid__icon {
            width: 100%;
            /*flex:2;*/
            height: 0.5rem;
            text-align: center;
            padding: 0.05rem 0;

            i {
              display: block;
              margin: 0 auto;
              font-size: 0.4rem;
              color: #fff;
            }
          }

          > span {
            font-size: 0.15rem !important;
          }

          .weui-grid__label {
            /*flex:1.4;*/
            height: 0.2rem;
            margin-top: 0;
            color: #fff;
            font-size: 0.15rem;
          }
        }

        &:before {
          border-top: none !important;
        }
      }
    }

    .nav-box {
      width: 100%;
      height: auto;
      border-bottom: 0.1rem solid #F4F5F9;
      padding: 0.1rem 0;

      .weui-grids {
        height: 100%;
        /*display: grid;
        grid-template-columns: auto auto auto;
        grid-template-rows: auto auto auto;*/
        &:before {
          border-top: none;
        }

        .weui-grid {
          width: 100%;
          padding: 0.1rem;
          /*margin:0.1rem 0;*/
          .weui-grid__icon {
            width: 0.35rem;
            height: 0.35rem;
            border-radius: 50%;
            position: relative;
            text-align: center;
            margin-top: 0.1rem;

            i {
              width: 0.23rem;
              height: 0.23rem;
              position: absolute;
              top: 0;
              bottom: 0;
              left: 0;
              right: 0;
              margin: auto;
              font-size: 0.23rem;
              color: #fff;
            }

            .point {
              width: 0.12rem;
              height: 0.12rem;
              display: block;
              position: absolute;
              top: -0.05rem;
              right: -0.05rem;

              i.icon-dot {
                width: 100%;
                height: 100%;
                /*color: #FF0000;*/
                font-size: 0.35rem;

                &:before {
                  width: 100%;
                  height: 100%;
                  position: absolute;
                  top: -0.1rem;
                  right: 0.1rem;
                }
              }
            }
          }

          span {
            font-size: 0.15rem;
            display: block;
            height: 0.3rem;
            line-height: 0.3rem;
            color: #666666;
            text-align: center;
          }

          .weui-grid__label {
            margin-top: 0;
            color: #666666;
            font-size: 0.15rem;
          }

          &:after {
            border-bottom: none;
          }

          .weui-grid__icon {
            background: #BBBBBB;
          }
        }
      }
    }

    .message-box {
      width: 100%;
      height: auto;
      font-size: 0.14rem;

      h4 {
        height: 0.38rem;
        font-size: 0.16rem;
        line-height: 0.3rem;
        padding-left: 0.2rem;
        font-weight: normal;
        padding-top: 0.08rem;
      }

      .content-box {
        height: 0.62rem;
        position: relative;

        .empty {
          width: 50%;
          height: 0.2rem;
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          margin: auto;
          text-align: center;
          font-size: 0.14rem;
          line-height: 0.2rem;
        }

        .vux-marquee {
          .vux-marquee-box {
            li {
              height: 0.3rem;

              .info-box {
                .vux-flexbox {
                  position: relative;

                  .vux-flexbox-item {
                    padding-left: 0.1rem;
                  }

                  .vux-badge-dot {
                    position: absolute;
                    top: 0.06rem;
                    left: 0;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
</style>

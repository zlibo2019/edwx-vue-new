<template>
  <div class="visitor-detail">
    <group class="boxs visitor-info" :gutter="0" label-width="6em">
      <cell title="来访人" :value="visitor.visLname" value-align="left"></cell>
      <cell title="身份证" :value="visitor.visId?visitor.visId.replace(/^(.{6})(?:\d+)(.{4})$/,'$1******$2'):'未填'"
            value-align="left"></cell>
      <cell title="联系电话" :value="visitor.visTelephone" value-align="left"></cell>
      <cell title="公司名称" :value="visitor.compName" value-align="left"></cell>
      <cell title="随行人数" :value="register.visNums?register.visNums:0" value-align="left"></cell>
      <cell title="随行车辆" :value="register.visCars?register.visCars:'无'" value-align="left"></cell>
      <cell title="预约开始" :value="register.visKssj" value-align="left"></cell>
      <cell title="预约结束" :value="register.visJssj" value-align="left"></cell>
      <cell title="来访事由" :value="register.thingName?register.thingName:'无'" value-align="left"></cell>
      <cell title="备注" :value="register.visBz?register.visBz:'无'" value-align="left" readonly></cell>
    </group>
    <group class="boxs check-info" :gutter="0" label-width="6em"
           v-if="register.state === '0' || register.state === '8' || register.state === '9'">
      <cell title="进入时间" :value="register.visKssjReal" value-align="left"
            v-if="register.state === '8' || register.state === '9'"></cell>
      <cell title="离开时间" :value="register.visJssjReal" value-align="left" v-if="register.state === '9'"></cell>
      <datetime title="来访开始" v-model="kssj" format="YYYY-MM-DD HH:mm"
                :start-date="$utils.DateUtils.getFullDate(currDate)"
                placeholder="请选择时间" v-if="register.state === '0'"></datetime>
      <datetime title="来访结束" v-model="jssj" format="YYYY-MM-DD HH:mm"
                :start-date="$utils.DateUtils.getFullDate(currDate)"
                placeholder="请选择时间" v-if="register.state === '0'"></datetime>
    </group>
    <div class="face-box">
      <img :src="visitor.facePhoto" alt="" v-if="visitor.facePhoto">
      <i class="iconfont icon-daishenpi"
         :style="visitor.facePhoto?'bottom:-0.6rem;color:#999;text-shadow: 0px 0px 5px rgba(51,51,51,.2) ;':'bottom:0.2rem;color:#999;'"
         v-if="register.state === '0'"></i>
      <i class="iconfont icon-yitongguo"
         :style="visitor.facePhoto?'bottom:-0.6rem;color:#00CC66;text-shadow: 0px 0px 5px rgba(51,51,51,.2) ;':'bottom:0.2rem;color:#00CC66;'"
         v-else-if="register.state === '1'"></i>
      <i class="iconfont icon-yijujue"
         :style="visitor.facePhoto?'bottom:-0.6rem;color:#FF3333;text-shadow: 0px 0px 5px rgba(51,51,51,.2) ;':'bottom:0.2rem;color:#FF3333;'"
         v-else-if="register.state === '2'"></i>
      <i class="iconfont icon-yiyaoqing"
         :style="visitor.facePhoto?'bottom:-0.6rem;color:#339933;text-shadow: 0px 0px 5px rgba(51,51,51,.2) ;':'bottom:0.2rem;color:#339933;'"
         v-else-if="register.state === '3'"></i>
      <!--<i class="iconfont icon-yiqueren"-->
         <!--:style="visitor.facePhoto?'bottom:-0.6rem;color:#999;text-shadow: 0px 0px 5px rgba(51,51,51,.2) ;':'bottom:0.2rem;color:#999;'"-->
         <!--v-else-if="register.state === '3'"></i>-->
      <i class="iconfont icon-fangwenzhong"
         :style="visitor.facePhoto?'bottom:-0.6rem;color:#3399FF;text-shadow: 0px 0px 5px rgba(51,51,51,.2) ;':'bottom:0.2rem;color:#3399FF;'"
         v-else-if="register.state === '8'"></i>
      <!--<i class="iconfont icon-yishixiao"-->
         <!--:style="visitor.facePhoto?'bottom:-0.6rem;color:#00CC66;text-shadow: 0px 0px 5px rgba(51,51,51,.2) ;':'bottom:0.2rem;color:#999;'"-->
         <!--v-else-if="register.state === '7'"></i>-->
      <i class="iconfont icon-yifangwen"
         :style="visitor.facePhoto?'bottom:-0.6rem;color:#00CC66;text-shadow: 0px 0px 5px rgba(51,51,51,.2) ;':'bottom:0.2rem;color:#00CC66;'"
         v-else-if="register.state === '9'"></i>
    </div>
    <div class="my-operate" v-if="register.state === '0' && register.visitorState !== '10'"><!---->
      <x-button class="refused" type="primary" @click.native="refuseClick">拒绝</x-button>
      <x-button class="agreed" type="primary" @click.native="agreeClick">同意</x-button>
    </div>
  </div>
</template>
<script>
  import {Cell, Group, XButton, Datetime, XTextarea, PopupPicker, Checker, CheckerItem} from "vux"

  export default {
    name: "VisitorDetail",
    components: {Cell, Group, XButton, Datetime, XTextarea, PopupPicker, Checker, CheckerItem},
    data() {
      return {
        currDate: '',
        visitor: {},   //来访信息
        register: {},  //注册信息
        identity: '',
        busFlag: ['1'],
        isOperate: true,
        xh: '',
        kssj: '',
        jssj: '',
        curTime: '', //当前时间
      }
    },
    computed: {},
    methods: {
      /**
       *  function获取当前时间
       *  @wzx
       *  @2019-04-01
       **/
      getSysDate: function () {
        this.$utils.Tools.loadShow();
        this.$api.Sys.getSystemDate(this.$params.mode).then(response => {
            this.$utils.Tools.loadHide();
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg);
            } else {
              this.currDate = data.sysDate.substring(0, 10);
              this.curTime = data.sysDate.substring(0, 16);
            }
          }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      /**
       *  function获取访客基本信息
       *  @wzx
       *  @2019-04-01
       **/
      getVisitorInfo(xh) {
        this.$utils.Tools.loadShow();
        this.$api.Visit.selectByPrimaryKey(xh).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.visitor = data.visUserEntity;
            this.register = data.visRegisterEntity;
            this.kssj = data.visRegisterEntity.visKssj;
            this.jssj = data.visRegisterEntity.visJssj;
          }
        }).catch(err => {
            this.$utils.Tools.httpError();
          });
      },
      /**
       *  function拒绝来访
       *  @wzx
       *  @2019-04-02
       **/
      refuseClick() {
        this.$utils.Tools.loadShow();
        this.$api.Visit.updateByPrimaryKey({
          xh: +this.xh,
          approveState: '2'
        }).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            window.location.reload();
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
          console.log(66, err)
        });
      },
      /**
       *  function同意来访
       *  @wzx
       *  @2019-04-02
       **/
      agreeClick() {
        this.$utils.Tools.loadShow();
        this.$api.Visit.updateByPrimaryKey({
          xh: +this.xh,
          approveState: '1',
          visKssj: this.kssj,
          visJssj: this.jssj,
        }).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            window.location.reload();
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      pushHistory() {
        var state = {
          title: "title",
          url: "#"
        };
        window.history.pushState(state, state.title, state.url);
      },
    },
    created() {
      this.xh = this.$route.query.xh || this.$route.params.state;
      this.getSysDate();
      this.getVisitorInfo(this.xh);
    },
    mounted() {
      if (this.$route.params.notification) {
        this.pushHistory();
      }
    },
    destroyed() {

    }
  }
</script>
<style type="text/scss" lang="scss">
  .visitor-detail {
    width: 100%;
    height: 100%;

    .boxs {
      width: 100%;
      height: auto;

      .weui-cells {
        padding: 0.05rem 0;

        &:before {
          border-top: none;
        }

        &:after {
          border-bottom: none;
        }

        .weui-cell {
          min-height: 0.4rem;

          .vux-cell-primary {
            color: #666;
          }
        }
      }
    }

    .visitor-info {
      /*border-bottom: 10px solid #eaeaea;*/
      .weui-cells {
        .weui-cell {
          &:before {
            border: none;
          }
        }
      }
    }

    .check-info {
      border-top: 10px solid #eaeaea;
      padding-bottom: 0.86rem;
      position: relative;
      border-bottom: none;

      .weui-cells {
        .weui-cell {
          min-height: 0.4rem;

          .vux-cell-primary {
            text-align: left;

            .vux-popup-picker-select {
              text-align: left !important;
            }
          }

          &:before, &:after {
            border: none;
          }
        }

        .vux-cell-box {
          &:before, &:after {
            border: none;
          }
        }
      }

      .place-item {
        border: 1px solid #ececec;
        padding: 0.06rem 0.2rem;
        margin: 0 0.1rem 0.15rem;
        border-radius: 0.2rem;
      }

      .place-item-selected {
        border: 1px solid #3399ff;
        background: #3399FF;
        color: #fff;
      }
    }

    .my-operate {
      width: 100%;
      height: 0.86rem;
      padding: 0.2rem 0;
      background: #fff;
      position: fixed;
      bottom: 0;
      left: 0;
      z-index: 30;
      border-top: 1px solid #e5e5e5;

      .weui-btn {
        width: 80%;
        font-size: 0.18rem;

        &.refused {
          width: 40%;
          float: left;
          margin: 0 5%;
          background: #969896;
        }

        &.agreed {
          width: 40%;
          float: left;
          margin: 0 5%;
        }
      }
    }

    .face-box {
      width: 1rem;
      height: 1.3rem;
      position: absolute;
      right: 0.1rem;
      top: 0.1rem;
      z-index: 20;

      > img {
        width: auto;
        height: auto;
        max-width: 100%;
        max-height: 100%;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
      }

      i {
        font-size: 1rem;
        position: absolute;
        right: 0;
        z-index: 30;
      }
    }
  }
</style>

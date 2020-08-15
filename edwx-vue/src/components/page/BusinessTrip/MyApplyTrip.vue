<template>
  <div class="my-apply-trip">
    <i class="iconfont icon-shenhezhong check" v-if="trip.flag == 0 || trip.flag == 1"></i>
    <i class="iconfont icon-tongguo agree" v-if="trip.flag == 2"></i>
    <i class="iconfont icon-bohui refuse" v-if="trip.flag == 3"></i>
    <i class="iconfont icon-yichexiao repeal" v-if="trip.flag == 4"></i>
    <group class="trip-boxs">
      <cell title="申请人" value-align="left" :value="trip.userName"></cell>
      <cell title="出发地" value-align="left" :value="trip.inPlace"></cell>
      <cell title="目的地" value-align="left" :value="trip.outPlace"></cell>
      <cell title="出行日期" value-align="left" :value="trip.kssj"></cell>
      <cell title="返回日期" value-align="left" :value="trip.jssj"></cell>
      <cell title="随行人员" value-align="left" :value="trip.travelPeople?trip.travelPeople:'无'"></cell>
      <cell title="预借金额" value-align="left" :value="trip.outMoney?trip.outMoney:'0'+'元'"></cell>
      <cell title="交通工具" value-align="left" :value="trip.outVehicle"></cell>
      <cell title="是否住宿" value-align="left" :value="trip.accommodation == 0?'否':'是'"></cell>
      <cell title="入住天数" value-align="left" :value="trip.accommodationDays?trip.accommodationDays:'0'+'天'"></cell>
      <cell class="purpose" title="出差目的" value-align="left" :value="trip.businessPurposes"></cell>
      <cell title="附件" value-align="left">
        <div class="img-boxs" slot="default">
          <img class="previewer-demo-img" v-for="(item, index) in imgList" :src="item.src"
               @click="show(index)"
               v-if="imgList.length>0" />
          <span v-if="imgList.length==0">无</span>
          <div v-transfer-dom>
            <previewer :list="imgList" ref="previewer" :options="options"
                       @on-index-change="logIndexChange"></previewer>
          </div>
        </div>
      </cell>
    </group>
    <div class="detail-box" v-for="(item,index) in approver" :key="index">
      <div class="detail-pic">
        <i class="iconfont icon-my"></i>
      </div>
      <div class="detail-man">
        <dt>{{item.userName}}
          <span v-if="item.type==0" style="color:#000000">发起请求</span>
          <span v-if="item.type==1" style="color:#00ff55">同意</span>
          <span v-if="item.type==2" style="color:#ff4949">拒绝</span>
          <span v-if="item.type==4" style="color:#888888">撤销</span>
          <span v-if="item.type==5" style="color:#006dff">待审批</span>
        </dt>
        <dd>{{item.czrq}}</dd>
        <p v-if="item.reason && item.type == 1">同意原因：{{item.reason}}</p>
        <p v-else-if="item.reason && item.type == 2">拒绝原因：{{item.reason}}</p>
      </div>
    </div>
    <i class="iconfont icon-bohui" v-if="trip.applyState == 0"></i>
    <i class="iconfont icon-tongguo" v-else-if="trip.applyState == 2"></i>
    <div class="my-operate">
      <x-button class="repeal" type="primary" @click.native="repealClick" v-if="isRepeal">撤销申请</x-button>
      <x-button class="refuse" type="primary" @click.native="refuseClick" v-if="isOperate"
                v-for="(item,i) in filterData" :key="'refuse'+i">拒绝
      </x-button>
      <x-button class="agree" type="primary" @click.native="agreeClick" v-if="isOperate"
                v-for="(item,j) in filterData"
                :key="'agree'+j">同意
      </x-button>
    </div>
    <div v-transfer-dom>
      <confirm v-model="showRepeal"
               title="操作提示"
               @on-cancel="onCancel"
               @on-confirm="onConfirm"
               @on-show="onShow"
               @on-hide="onHide">
        <p style="text-align:center;">确认要撤销吗？</p>
      </confirm>
    </div>
    <div v-transfer-dom>
      <confirm v-model="showOperate"
               title="操作提示"
               @on-cancel="onCancel"
               @on-confirm="onOperate"
               @on-show="onShow"
               @on-hide="onHide">
        <x-textarea slot="default" class="reason" v-model="reason" placeholder="审批意见（最多输入200字）" :max="200"
                    :show-counter="true" @on-blur="hideReason"></x-textarea>
      </confirm>
    </div>
  </div>
</template>
<script>
  import {
    Group, Cell, Previewer, XButton, Confirm, XTextarea, TransferDomDirective as TransferDom,
  } from 'vux';

  export default {
    name: 'MyApplyTrip',
    directives: {
      TransferDom,
    },
    components: {
      Group, Cell, Previewer, XButton, Confirm, XTextarea,
    },
    data() {
      return {
        applyMan: this.$utils.Store.getItem('userLname'),
        trip: {
          purpose: '拓展市场，打开西南大区局面打开西南大区局面打开西南大区局面',
          origin: '烟台',
          destination: '武汉',
          startTime: '2018-11-22',
          endTime: '2018-12-02',
          men: '张小三,李小四,王小五,赵小六',
          credit: '2000',
          traffic: '飞机',
          stay: '是',
          stayDays: '3天',
          applyState: '1',  //0:已拒绝； 1：审批中； 2：审批通过
        },
        imgList: [],
        options: {
          getThumbBoundsFn(index) {
            let thumbnail = document.querySelectorAll('.previewer-demo-img')[index];
            let pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
            let rect = thumbnail.getBoundingClientRect();
            return {x: rect.left, y: rect.top + pageYScroll, w: rect.width};
          },
        },
        approver: [],
        showRepeal: false,        //是否显示撤销弹窗
        showOperate: false,        //是否显示审批弹窗
        xh: '',  //申请序号
        type: '',  //申请类型 0 请假；1 出差；2 外出；3 加班；4 调班；5 补出勤; 6 合同
        genre: 0,    //类型  1：申请的  2：审批的  3：抄送的
        result: 0,   //审批结果  1：同意  2：拒绝
        checkId: '', //审批ID
        reason: '',  //审批意见
      };
    },
    computed: {
      isRepeal() {   /*是否显示撤销按钮 */
        if (this.genre == 1 && (this.trip.flag == 0 || this.trip.flag == 1)) {
          return true;
        } else {
          return false;
        }
      },
      isOperate() {   /* 是否显示审批按钮*/
        if (this.genre == 2 && (this.trip.flag == 0 || this.trip.flag == 1)) {
          return true;
        } else {
          return false;
        }
      },
      filterData() {  /* 过滤审批人数组，只返回审批状态为5的当前审批人*/
        return this.approver.filter(item => {
          return item.type === 5 && this.$utils.Store.getItem('userSerial') == item.userSerial;
        });
      },
    },
    methods: {
      /**
       *  function获取出差详情接口
       *  @wzx
       *  @2019-01-05
       **/
      getTripDetail() {
        this.$utils.Tools.loadShow();
        this.$api.Trip.getTripDetail({
          xh: this.xh,
          userSerial: this.$utils.Store.getItem('userSerial'),
        }).then(response => {
          this.$utils.Tools.loadHide();
          console.log(2222, response);
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            if (+code === 605) {
              if (this.list.length === 0) {
                this.emptyShow = true;
              }
            }
          } else {
            this.trip = data.midData;
            // this.imgList = data.midData.img;
            // this.imgList = this.img;
            this.approver = data.botData;
            this.checkId = data.midData.checkId;
            this.xh = data.midData.xh;
            for (let i = 0; i < data.midData.img.length; i++) {
              this.imgList.push({src: data.midData.img[i], msrc: data.midData.img[i]});
            }
            // console.log(23232, this.trip, this.imgList)
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      logIndexChange(arg) {
        console.log(arg);
      },
      show(index) {
        this.$refs.previewer.show(index);
      },
      onCancel() {
        console.log('on cancel');
      },
      /**
       *  function删除出差申请接口
       *  @wzx
       *  @2019-01-05
       **/
      onConfirm() {
        this.$utils.Tools.loadShow();
        this.$api.Trip.deleteTrip(this.xh, this.$utils.Store.getItem('userSerial'), '').then(response => {
          this.$utils.Tools.loadHide();
          console.log(2222, response);
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            setTimeout(() => {
              window.location.reload();
              // this.$router.go(0);
            }, 1000);
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      hideReason() {
        document.body && (document.body.scrollTop = document.body.scrollTop);
      },
      onHide() {
        console.log('on hide');
      },
      onShow() {
        console.log('on show');
      },
      /**
       *  function点击撤销申请按钮
       *  @wzx
       *  @2018-12-26
       **/
      repealClick() {
        this.showRepeal = true;
      },
      /**
       *  function点击审批同意按钮
       *  @wzx
       *  @2018-12-26
       **/
      agreeClick() {
        this.result = 1;
        this.showOperate = true;
        this.reason = '';
      },
      /**
       *  function点击审批拒绝按钮
       *  @wzx
       *  @2018-12-26
       **/
      refuseClick() {
        this.result = 2;
        this.showOperate = true;
        this.reason = '';
      },
      /**
       *  function审批接口
       *  @wzx
       *  @2019-01-05
       **/
      onOperate() {
        this.$utils.Tools.loadShow();
        this.$api.Trip.approvalTrip({
          checkId: this.checkId,
          xh: this.xh,
          result: this.result,
          userSerial: this.$utils.Store.getItem('userSerial'),
          reason: this.reason,
        }).then(response => {
          this.$utils.Tools.loadHide();
          console.log(2222, response);
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.$utils.Tools.toastShow(msg);
            setTimeout(() => {
              window.location.reload();
              // this.$router.go(0);
            }, 1000);
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      pushHistory() {
        var state = {
          title: 'title',
          url: '#',
        };
        window.history.pushState(state, state.title, state.url);
      },
    },
    created() {
      let strs = new Array();
      if (this.$utils.Store.getItem('state')) {
        strs = decodeURI(this.$utils.Store.getItem('state')).split(',');
        this.xh = strs[0];
        this.genre = strs[1];
      } else {
        this.$utils.Store.setItem('state', this.$route.params.state);
        strs = decodeURI(this.$route.params.state).split(',');
        this.xh = strs[0];
        this.genre = strs[1];
      }
      // console.log(1111,this.xh,this.genre);
      this.getTripDetail();
    },
    mounted() {
      if (this.$route.params.notification) {
        this.pushHistory();
      }
    },
    destroyed() {
      this.$utils.Store.removeItem('state');
    },
  };
</script>
<style type="text/scss" lang="scss">
  .my-apply-trip {
    width: 100%;
    height: 100%;
    position: relative;

    > i {
      position: absolute;
      top: 0;
      right: 0;
      font-size: 1.2rem;
      z-index: 20;

      &.check {
        color: #3399FF;
      }

      &.agree {
        color: #00CC66;
      }

      &.refuse {
        color: #FF3333;
      }

      &.repeal {
        color: #ccc;
      }
    }

    .trip-boxs {
      width: 100%;
      height: auto;
      padding: 0.1rem 0.2rem;

      .weui-cells {
        margin: 0;

        &:before, &:after {
          border: none;
        }

        .weui-cell {
          height: auto;
          min-height: 0.4rem;
          padding: 0;

          &:before {
            border: none;
          }

          .vux-cell-bd {
            flex-basis: 0.6rem;
            font-size: 0.13rem;
            color: #A3A3A3;
            text-align: right;
            line-height: 0.4rem;
          }

          .vux-cell-primary {
            flex: 1;
            /*border-bottom: 1px solid #EFEFEF;*/
            color: #333;
            overflow: hidden;
            font-size: 0.13rem;
            padding: 0.05rem 0 0.05rem 0.3rem;
            line-height: 0.3rem;

            .img-boxs {
              width: 100%;
              height: 0.3rem;
              float: left;
              /*padding:0.05rem 0;*/
              img {
                width: 0.3rem;
                height: 0.3rem;
                float: left;
                margin-right: 0.1rem;
              }

              span {
                line-height: 0;
              }
            }
          }

          &.purpose {
            .vux-cell-primary {
              line-height: 0.2rem;
              font-size: 0.12rem;
            }
          }

          &.agree {
            .vux-cell-primary {
              color: #51DC97;
            }
          }

          &.refuse {
            .vux-cell-primary {
              color: #FF6600;
            }
          }
        }
      }
    }

    > i {
      position: absolute;
      top: 0;
      right: 0;
      font-size: 1.2rem;

      &.icon-bohui {
        color: #FF6600;
      }

      &.icon-tongguo {
        color: #51DC97;
      }
    }

    .detail-box {
      width: 100%;
      height: auto;
      min-height: 0.7rem;
      display: flex;
      flex-direction: row;
      padding: 0.15rem 0.1rem;
      border-bottom: 1px solid #D9D9D9;

      .detail-pic {
        flex-basis: 0.4rem;

        i {
          font-size: 0.4rem;
          display: block;
          color: #ccc;
        }
      }

      .detail-man {
        flex: 1;
        margin-left: 0.1rem;

        dt {
          font-size: 0.16rem;

          span {
            font-size: 0.12rem;
            margin-left: 0.1rem;
          }
        }

        dd {
          font-size: 0.12rem;
          margin-top: 0.02rem;
          color: #A3A3A3;

          span {
            color: #3399ff;
            padding: 0 5px;
          }
        }

        p {
          font-size: 0.13rem;
          line-height: 0.2rem;
        }
      }
    }

    .my-operate {
      width: 100%;
      height: 0.6rem;
      margin: 0.4rem 0 0.1rem 0;

      .weui-btn {
        font-size: 0.18rem;

        &.repeal {
          width: 80%;
        }

        &.agree {
          width: 40%;
          float: left;
          margin: 0 5%;
        }

        &.refuse {
          width: 40%;
          float: left;
          margin: 0 5%;
          background: #969896;
        }
      }
    }
  }
</style>

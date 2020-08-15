<template>
  <div class="dine-detail">
    <view-box body-padding-top="0.51rem" body-padding-bottom="0">
      <div class="dine-head">
        <flexbox :gutter="0" style="padding-top:10px;">
          <flexbox-item style="text-align:left;">
            <div class="vux-1px-t ding-head-line"></div>
          </flexbox-item>
          <flexbox-item style="text-align:right;">
            <span style="color:#3399ff;font-size:0.3rem;">{{beginDate===""?"":this.$utils.DateUtils.getMonth(beginDate)}}</span>
            <span style="color:#3399ff;margin-right:0.1rem;">月</span>
            <i class="iconfont icon-yueli" style="color:#3399FF;font-size:0.38rem;padding:0 0.05rem 0 0;float:right;"
               @click="showConfirm = true"></i>
          </flexbox-item>
        </flexbox>
      </div>
      <div class="dine-body">
        <scroll :pullup-padding-bottom="0" :pullUpLoad="pullUpLoad" @pullingUp="onPullingUp"
                :pullDownRefresh="pullDownRefresh"
                @pullingDown="onPullingDown" :empty-show="emptyShow" ref="scroll">
          <timeline>
            <timeline-item v-for="(order, k) in orders" :key="k" v-if="order.dineNums!==0">
              <div class="dine-record">
                <table>
                  <tr style="vertical-align: top;">
                    <td style="text-align: right;width: 1.1rem">
                      <p>{{$utils.DateUtils.getWeekCn(order.strRq)}}</p>
                      <p>{{$utils.DateUtils.getFullDate(order.strRq)}}</p></td>
                    <td>
                      <p style="padding-left:0.5rem;width: 1.1rem" v-for="(item, i) in order.list" :key="i">
                        {{item.mealName}}</p>
                    </td>
                    <td>
                      <p style="padding-left:0.5rem;width: 1.1rem" v-for="(item, i) in order.list" :key="i">
                        <span>{{item.dineNums}}</span>份
                      </p>
                    </td>
                  </tr>
                </table>
              </div>
            </timeline-item>
          </timeline>
        </scroll>
      </div>
    </view-box>
    <date-dialog v-model="showConfirm" :curr-date="currDate" @onConfirm="onConfirm"></date-dialog>
  </div>
</template>

<script>
  import {
    Timeline,
    TimelineItem,
    XTable,
    Flexbox,
    FlexboxItem,
    Confirm,
    Tab,
    TabItem,
    DatetimeView,
    ViewBox
  } from "vux";

  import DateDialog from "@/components/common/EdDate/Index";
  import Scroll from '@/components/common/Scroll/Scroll';

  export default {
    name: "DineDetail",
    components: {
      Timeline,
      TimelineItem,
      XTable,
      Flexbox,
      FlexboxItem,
      Confirm,
      Tab,
      TabItem,
      DatetimeView,
      DateDialog,
      Scroll,
      ViewBox
    },
    data() {
      return {
        orders: [],
        currDate: "",
        userSerial: 0,
        showConfirm: false,
        beginDate: "",
        endDate: "",
        pullDownRefresh: {
          threshold: 40, // 下拉多少开始刷新
          stop: 20 // 下拉回弹到多少停住
        },
        pullUpLoad: {
          threshold: 25
        },
        isPullDown: false, // 正在下拉刷新
        isPullUp: false, // 正在上拉加载
        pageIndex: 1,
        pageSize: 20,
        totalPage: 0,
        emptyShow: false
      };
    },
    methods: {
      // 下拉刷新
      onPullingDown: function () {
        if (this.isPullDown) return;
        this.isPullDown = true; // 下拉刷新
        this.orders = [];
        this.pageIndex = 1;
        this.getUserOrderListPage();
      },
      onPullingUp: function () {
        this.pageIndex = this.pageIndex + 1;
        if (this.pageIndex > this.totalPage) {
          this.updateScroll();
          return;
        }
        if (this.isPullUp) return;
        this.isPullUp = true;
        this.getUserOrderListPage();
      },
      // 刷新 Scroll 状态
      updateScroll: function (flag) {
        this.isPullDown = false;
        this.isPullUp = false;
        this.$refs.scroll.forceUpdate(flag);
      },
      //获取用户订餐列表
      getUserOrderListPage: function () {
        this.emptyShow = false;
        this.$api.Dine.getUserOrderListPage({
          pageIndex: this.pageIndex,
          pageSize: this.pageSize,
          search: {
            userSerial: this.userSerial,
            beginDate: this.beginDate,
            endDate: this.endDate
          }
        }).then(response => {
            this.$utils.Tools.loadHide();
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg);
              this.updateScroll(false);
            } else {
              this.orders.push(...data.records);
              this.pageIndex = data.pageIndex;
              this.totalPage = data.totalPage;
              if (this.orders.length === 0) {
                this.emptyShow = true;
              }
              this.updateScroll(false);
            }
          }).catch(err => {
            this.$utils.Tools.httpError();
          });
      },
      getSysDate: function () {
        this.$api.Sys.getSystemDate(this.$params.mode).then(response => {
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg);
            } else {
              this.currDate = data.sysDate;
              this.beginDate = this.$utils.DateUtils.getMonthStart(data.sysDate);
              this.endDate = this.$utils.DateUtils.getMonthEnd(data.sysDate);
              this.getUserOrderListPage();
            }
          }).catch(err => {
            this.$utils.Tools.httpError();
          });
      },
      onConfirm: function (beginDate, endDate) {
        this.pageIndex = 1;
        this.$utils.Tools.loadShow();
        this.orders = [];
        this.beginDate = beginDate;
        this.endDate = endDate;
        this.getUserOrderListPage();
      }
    },
    computed: {},
    created() {
      this.$utils.Tools.loadShow();
      this.userSerial = this.$utils.Store.getItem("userSerial");
      this.getSysDate();
    },
    mounted() {
    }
  };
</script>

<style type="text/scss" lang="scss">
  .dine-detail {
    width: 100%;
    height: 100%;
    font-size: 0.14rem;

    .dine-head {
      width: 100%;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 100;

      .ding-head-line {
        width: 100%;
        height: 1px;
        margin-top: 0.1rem;
        padding: 0;
        float: left;
      }
    }

    .dine-body {
      vertical-align: top;
      height: 100%;

      .dine-record {
        padding: 0 0 0.2rem 0;
      }

      .vux-timeline {
        .vux-timeline-item-tail {
          left: 1.245rem;
        }

        .vux-timeline-item-head {
          left: 1.2rem;
        }

        .vux-timeline-item-head-first {
          left: 1.2rem;
        }
      }
    }
  }
</style>

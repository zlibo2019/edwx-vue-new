<template>
  <div class="repair-list">
    <view-box body-padding-top="0.93rem" body-padding-bottom="0">
      <div class="repair-head">
        <div class="month-box vux-1px-b">
          <group class="selectDate" :gutter="0">
            <datetime v-model="currDate" format="YYYY-MM" @on-change="changeDate"></datetime>
          </group>
          <p><span>{{month}}</span>月</p>
          <p style="color: #666;">{{year}}年</p>
        </div>
        <div style="position:absolute;top:0.15rem;left:0.65rem;font-size:0.15rem;color:#999;width:100%;">
          本月待维修工作<span style="color: #FF6600;font-weight: bold;font-size:0.16rem;">{{running}}</span>项，已维修工作<span
          style="font-weight: bold;font-size:0.16rem;">{{finished}}</span>项。
        </div>
        <tab>
          <tab-item :selected="repairState==='0'" @on-item-click="onItemClick('0')">待维修</tab-item>
          <tab-item :selected="repairState==='1'" @on-item-click="onItemClick('1')">已维修</tab-item>
        </tab>
      </div>
      <scroll :pullup-padding-bottom="0" :pullUpLoad="pullUpLoad" @pullingUp="onPullingUp"
              :pullDownRefresh="pullDownRefresh"
              @pullingDown="onPullingDown" :empty-show="emptyShow" ref="scroll">
        <group :gutter="0">
          <cell v-for="(item, index) in infoList" :key="index" is-link @click.native="queryData(item.id)"
                style="padding: 0.08rem 0.1rem 0.02rem 0.1rem">
            <div slot="title" class="repair-body">
              <p><span class="w3">提报人</span>：{{item.initiatorUserName}}</p>
              <p>报修时间：{{item.startDate}}</p>
              <p>报修地点：{{item.repairAddress}}</p>
              <p class="info" style="width:3.3rem;">报修描述：{{item.initiatorRemark}}</p>
            </div>
          </cell>
        </group>
      </scroll>
    </view-box>
  </div>
</template>
<script>
  import {
    ViewBox, Tab, TabItem, XButton, Group, Cell, Datetime
  } from "vux"
  import Scroll from '@/components/common/Scroll/Scroll';

  export default {
    name: "RepairAppList",
    components: {
      ViewBox, Tab, TabItem, XButton, Group, Cell, Datetime, Scroll
    },
    data() {
      return {
        infoList: [],
        month: '',
        year: '',
        start: '',
        end: '',
        currDate: '',
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
        emptyShow: false,
        repairState: this.$utils.Store.getItem("repairApp") || '0',
        sumInfo: [],
        running: 0,
        finished: 0
      }
    },
    computed: {},
    methods: {
      queryData: function (id) {
        this.$router.push({name: 'RepairAppInfo', params: {state: id, index: this.repairState}})
      },
      changeDate: function (date) {
        this.infoList = [];
        this.month = this.$utils.DateUtils.getMonthMM(date + "-01");
        this.year = this.$utils.DateUtils.getYear(date + "-01");
        this.start = this.$utils.DateUtils.getMonthStart(date + "-01");
        this.end = this.$utils.DateUtils.getNextMonthStart(date + "-01", 1);
        this.getInfoList();
        this.getSumInfo();
      },
      onPullingDown: function () {
        if (this.isPullDown) return;
        this.isPullDown = true; // 下拉刷新
        this.infoList = [];
        this.pageIndex = 1;
        this.getInfoList();
      },
      onPullingUp: function () {
        this.pageIndex = this.pageIndex + 1;
        if (this.pageIndex > this.totalPage) {
          this.updateScroll();
          return;
        }
        if (this.isPullUp) return;
        this.isPullUp = true;
        this.getInfoList();
      },
      updateScroll: function (flag) {
        this.isPullDown = false;
        this.isPullUp = false;
        this.$refs.scroll.forceUpdate(flag);
      },
      getSysDate: function () {
        this.$api.Sys.getSystemDate(this.$params.mode).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.currDate = data.sysDate;
            this.start = this.$utils.DateUtils.getMonthStart(data.sysDate);
            this.end = this.$utils.DateUtils.getNextMonthStart(data.sysDate, 1);
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      getInfoList: function () {
        this.$utils.Tools.loadShow();
        this.emptyShow = false;
        this.$api.Repairs.selectListPageByEntity({
          pageIndex: this.pageIndex,
          pageSize: this.pageSize,
          search: {
            repairUser: this.$utils.Store.getItem("userSerial"),
            repairState: this.repairState,
            start: this.start,
            end: this.end
          }
        }).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
            this.updateScroll(false);
          } else {
            this.infoList.push(...data.records);
            this.pageIndex = data.pageIndex;
            this.totalPage = data.totalPage;
            if (this.infoList.length === 0) {
              this.emptyShow = true;
            }
            this.updateScroll(false);
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      getSumInfo: function () {
        this.running = 0;
        this.finished = 0;
        this.$api.Repairs.selectSumInfoByEntity({
          repairUser: this.$utils.Store.getItem("userSerial"),
          start: this.start,
          end: this.end
        }).then(response => {
          const {code, msg, data} = response;
          // console.log(response);
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            for (let item of data) {
              if (item.repairState === '0') {
                this.running = item.num;
              }
              if (item.repairState === '1') {
                this.finished = item.num;
              }
            }
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      recordClick: function (value) {
        this.$router.push({name: 'RepairAppInfo'})
      },
      onItemClick: function (index) {
        this.infoList = [];
        this.repairState = index;
        this.getInfoList();
      },
      submitData: function () {
        this.$router.push({name: 'RepairInfo'})
      }
    },
    created() {
      this.getSysDate();
    },
    mounted() {
    },
    destroyed() {
      this.$utils.Store.removeItem("repairApp");
    }
  }
</script>
<style type="text/scss" lang="scss">
  .repair-list {
    width: 100%;
    height: 100%;
    overflow: hidden;

    .repair-head {
      width: 100%;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 100;
    }

    .repair-body {
      p {
        height: 0.25rem;
        line-height: 0.25rem;
      }
    }

    .month-box {
      .selectDate {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        opacity: 0;
      }

      p {
        padding-top: 0.03rem;
        font-size: 0.13rem;
        text-align: center;
        color: #529DFE;
        height: 0.25rem;
        width: 0.6rem;

        span {
          font-size: 0.2rem;
        }
      }
    }
  }
</style>

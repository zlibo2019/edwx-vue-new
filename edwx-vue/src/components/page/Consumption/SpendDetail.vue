<template>
  <div class="spend-detail">
    <view-box body-padding-top="0.97rem" body-padding-bottom="0">
      <div class="spend-detail-head">
        <tab>
          <tab-item selected @on-item-click="onItemClick(0)">消费明细</tab-item>
          <tab-item @on-item-click="onItemClick(1)">充值明细</tab-item>
          <tab-item @on-item-click="onItemClick(2)">补贴明细</tab-item>
        </tab>
        <div class="spend-detail-sum">
          <i class="iconfont icon-yueli"
             style="color:#3399FF;font-size:0.38rem;margin:0rem 0.05rem 0 0;float:right;"
             @click="showConfirm = true"></i>
          <!--<p v-if="initFlag===true">全部</p>-->
          <!--<p v-else>{{beginDate}} ~ {{endDate}}</p>-->
          <p>{{beginDate}} ~ {{endDate}}</p>
          <p style="margin-top: 0.05rem">消费 ¥{{spendSum.newMoney}} 充值 ¥{{spendSum.newAdd}} 补贴 ¥{{spendSum.newSub}}</p>
        </div>
      </div>
      <scroll :pullup-padding-bottom="0" :pullUpLoad="pullUpLoad" @pullingUp="onPullingUp"
              :pullDownRefresh="pullDownRefresh"
              @pullingDown="onPullingDown" :empty-show="emptyShow" ref="scroll">
        <group class="spend-detail-list" gutter="0">
          <cell v-for="(record, i) in list" :key="i" :title="getTitle(record)" :inline-desc="record.jlSj">
            <!--{{tabIndex===0?(-record.newMoney):('+'+record.newMoney)}}-->
            <!--{{tabIndex===0?(record.newMoney>0?(-record.newMoney):('+'+-record.newMoney)):('+'+record.newMoney)}}-->
            {{tabIndex===0?(record.newMoney<0?'+'+record.newMoney.substring(1):'-'+record.newMoney):'+'+record.newMoney}}
          </cell>
        </group>
      </scroll>
    </view-box>
    <date-dialog v-model="showConfirm" :curr-date="currDate" @onConfirm="onConfirm"></date-dialog>
  </div>
</template>

<script>
  import {Flexbox, FlexboxItem, Tab, TabItem, Cell, Group, ViewBox} from 'vux';

  import DateDialog from '@/components/common/EdDate/Index';
  import Scroll from '@/components/common/Scroll/Scroll';

  export default {
    name: 'SpendDetail',
    components: {
      Flexbox,
      FlexboxItem,
      Tab,
      TabItem,
      Cell,
      Group,
      ViewBox,
      DateDialog,
      Scroll,
    },
    data() {
      return {
        list: [],
        spendSum: {newMoney: 0.00, newAdd: 0.00, newSub: 0.00},
        showConfirm: false,
        tabIndex: 0,
        beginDate: '',
        endDate: '',
        currDate: '',
        userSerial: 0,
        pullDownRefresh: {
          threshold: 40, // 下拉多少开始刷新
          stop: 20, // 下拉回弹到多少停住
        },
        pullUpLoad: {
          threshold: 25,
        },
        isPullDown: false, // 正在下拉刷新
        isPullUp: false, // 正在上拉加载
        emptyShow: false,
        initFlag: true,
        pageIndex: 1,
        pageSize: 20,
        totalPage: 0,
      };
    },
    methods: {
      getTitle: function (record) {
        if (this.tabIndex === 0) {
          return record.depName;
        } else {
          return record.addType === 0 ? '电脑端' : '手机端';
        }
      },
      // 下拉刷新
      onPullingDown: function () {
        if (this.isPullDown) return;
        this.isPullDown = true; // 下拉刷新
        this.list = [];
        this.beginDate = this.$utils.DateUtils.getMonthStart(this.beginDate);
        this.endDate = this.$utils.DateUtils.getMonthEnd(this.endDate);
        this.pageIndex = 1;
        this.getMxRecord();
        this.getXfRecord();
      },
      onPullingUp: function () {
        this.pageIndex = this.pageIndex + 1;
        if (this.pageIndex > this.totalPage) {
          this.updateScroll();
          return;
        }
        if (this.isPullUp) return;
        this.isPullUp = true;
        this.getMxRecord();
        this.getXfRecord();
      },
      // 刷新 Scroll 状态
      updateScroll: function (flag) {
        this.isPullDown = false;
        this.isPullUp = false;
        this.$refs.scroll.forceUpdate(flag);
      },
      onItemClick: function (jllx) {
        this.$utils.Tools.loadShow();
        this.list = [];
        this.tabIndex = jllx;
        this.pageIndex = 1;
        this.getMxRecord();
        this.getXfRecord();
      },
      onConfirm: function (beginDate, endDate) {
        this.initFlag = false;
        this.list = [];
        this.beginDate = beginDate;
        this.endDate = endDate;
        this.pageIndex = 1;
        this.getMxRecord();
        this.getXfRecord();
      },
      getXfRecord: function () {
        this.$api.Spend.getXfRecord({
          userSerial: this.userSerial,
          beginDate: this.beginDate,
          endDate: this.endDate,
        }).then(response => {
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.spendSum = data;
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      getMxRecord: function () {
        this.emptyShow = false;
        this.$api.Spend.getMxRecord({
          pageIndex: this.pageIndex,
          pageSize: this.pageSize,
          search: {
            userSerial: this.userSerial,
            type: this.tabIndex,
            beginDate: this.beginDate,
            endDate: this.endDate,
          },
        }).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.list.push(...data.records);
            this.pageIndex = data.pageIndex;
            this.totalPage = data.totalPage;
            if (this.list.length === 0) {
              this.emptyShow = true;
            }
            this.updateScroll();
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
            this.beginDate = this.$utils.DateUtils.getMonthStart(data.sysDate);
            this.endDate = this.$utils.DateUtils.getMonthEnd(data.sysDate);
            this.getMxRecord();
            this.getXfRecord();
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
    },
    created() {
      this.$utils.Tools.loadShow();
      this.userSerial = this.$utils.Store.getItem('userSerial');
      this.getSysDate();
    },
  };
</script>

<style type="text/scss" lang="scss">
  .spend-detail {
    position: relative;
    height: 100%;

    .spend-detail-head {
      width: 100%;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 100;
      border-bottom: 1px #ECECEC solid;

      .spend-detail-sum {
        font-size: 0.14rem;
        padding: 0.05rem 0 0.05rem 0.15rem;
        background-color: #efefef;
      }
    }

    .spend-detail-list {
      /*height: 100%;*/
      /*overflow-y: scroll;*/

      .weui-cell:before {
        left: 0;
      }
    }
  }
</style>

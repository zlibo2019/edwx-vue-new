<template>
  <div class="page-list">
    <view-box body-padding-top="0.46rem" body-padding-bottom="0">
      <div class="page-head">
        <ed-month @month-change="monthChange" :curr-date="currDate"></ed-month>
      </div>
      <scroll :pullup-padding-bottom="0" :pullUpLoad="pullUpLoad" @pullingUp="onPullingUp"
              :pullDownRefresh="pullDownRefresh"
              @pullingDown="onPullingDown" :empty-show="emptyShow" ref="scroll">
        <group :gutter="0">
          <cell :title="item" v-for="(item, index) in infoList" :key="index" is-link
                @click.native="recordClick(item.bh, item.operate)">
            <div slot="title" class="data-list">
              <p>餐别名称：{{item.mealName}}</p>
              <p>消费金额：{{item.mealMoneyCn}}</p>
              <p>消费时间：{{item.mealDate}}</p>
            </div>
            <span>{{item.mealAppraise==='0'?'未评价':'已评价'}}</span>
          </cell>
        </group>
      </scroll>
    </view-box>
  </div>
</template>
<script>
  import EdMonth from '../../common/EdMonth/Index';

  import {
    ViewBox, Tab, TabItem, XButton, Group, Cell, XInput, Datetime,
  } from 'vux';
  import Scroll from '../../common/Scroll/Scroll';

  export default {
    name: 'MealAppraiseList',
    components: {ViewBox, Tab, TabItem, XButton, Group, Cell, XInput, Scroll, Datetime, EdMonth},
    data() {
      return {
        infoList: [],
        pullDownRefresh: {
          threshold: 40, // 下拉多少开始刷新
          stop: 20, // 下拉回弹到多少停住
        },
        pullUpLoad: {
          threshold: 25,
        },
        isPullDown: false, // 正在下拉刷新
        isPullUp: false, // 正在上拉加载
        pageIndex: 1,
        pageSize: 20,
        totalPage: 0,
        emptyShow: false,
        search: '',
        currDate: '',
        startDate: '',
        endDate: '',
      };
    },
    computed: {},
    methods: {
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
      clearSearch: function () {
        this.search = '';
        this.getInfoList();
      },
      monthChange: function (startDate, endDate) {
        this.startDate = this.$utils.DateUtils.formatDate(startDate, 'YYYYMMDD');
        this.endDate = this.$utils.DateUtils.formatDate(endDate, 'YYYYMMDD');
        this.pageIndex = 1;
        this.getInfoList();
      },
      getSysDate: function () {
        this.$api.Sys.getSystemDate().then(response => {
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.currDate = data.sysDate;
            this.startDate = this.$utils.DateUtils.getMonthStart(data.sysDate, 'YYYYMMDD');
            this.endDate = this.$utils.DateUtils.getMonthEnd(data.sysDate, 'YYYYMMDD');
            this.getInfoList();
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      getInfoList: function () {
        this.$utils.Tools.loadShow();
        this.emptyShow = false;
        let params = {
          pageIndex: this.pageIndex,
          pageSize: this.pageSize,
          search: {
            startDate: this.startDate,
            endDate: this.endDate,
            userSerial: this.$utils.Store.getItem('userSerial'),
          },
        };
        this.$api.MealAppraise.selectListPageByEntity(params).then(response => {
          this.infoList = [];
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
      recordClick: function (value, operation) {
        this.$router.push({path: '/MealAppraiseForm', query: {xh: value, operation: operation}});
      },
      onItemClick: function (index) {
        this.infoList = [];
        this.getInfoList();
      },
    },
    created() {
      this.getSysDate();
    },
    mounted() {
    },
    destroyed() {
    },
  };
</script>
<style type="text/scss" lang="scss">
  .page-list {
    width: 100%;
    height: 100%;
    overflow: hidden;

    .page-head {
      width: 100%;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 100;
    }

    .data-list {
      padding: 0.05rem 0;
      font-size: 0.14rem;

      p {
        line-height: 0.25rem;
      }
    }

    .page-bottom {
      display: -webkit-box;
      display: -webkit-flex;
      display: flex;
      position: absolute;
      z-index: 500;
      bottom: 0;
      width: 100%;
      padding: 0.1rem 0;
    }
  }
</style>

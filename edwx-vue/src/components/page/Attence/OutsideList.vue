<template>
  <div class="page-list">
    <view-box body-padding-top="0.44rem" body-padding-bottom="0.62rem">
      <div class="page-head">
        <tab>
          <tab-item :selected="tabItem === '0'" @on-item-click="onItemClick('0')">未审批</tab-item>
          <tab-item :selected="tabItem === '1'" @on-item-click="onItemClick('1')">已审批</tab-item>
          <tab-item :selected="tabItem === '2'" @on-item-click="onItemClick('2')">抄送</tab-item>
        </tab>
      </div>
      <scroll :pullup-padding-bottom="0" :pullUpLoad="pullUpLoad" @pullingUp="onPullingUp"
              :pullDownRefresh="pullDownRefresh"
              @pullingDown="onPullingDown" :empty-show="emptyShow" ref="scroll">
        <group :gutter="0">
          <cell :title="item" v-for="(item, index) in infoList" :key="index" is-link
                @click.native="recordClick(item.id)">
            <div slot="title" class="data-list">
              {{item.userLname}}
            </div>
            <span>{{item.customerName}}</span>
            <span slot="inline-desc">{{item.recordTime}}</span>
          </cell>
        </group>
      </scroll>
    </view-box>
  </div>
</template>
<script>
  import {
    ViewBox, Tab, TabItem, XButton, Group, Cell,
  } from 'vux';
  import Scroll from '@/components/common/Scroll/Scroll';

  export default {
    name: 'OutsideList',
    components: {
      ViewBox, Tab, TabItem, XButton, Group, Cell, Scroll,
    },
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
        tabItem: this.$utils.Store.getItem('tabItem') || '0',
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
      getInfoList: function () {
        this.$utils.Tools.loadShow();
        this.emptyShow = false;
        let params = {
          pageIndex: this.pageIndex,
          pageSize: this.pageSize,
          search: {
            userSerial: this.$utils.Store.getItem('userSerial'),
            type: this.tabItem,
          },
        };
        this.$api.Attence.selectListPageByEntity(params).then(response => {
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
      recordClick: function (value) {
        this.$router.push({name: 'OutsideForm', query: {id: value, tabItem: this.tabItem}});
      },
      onItemClick: function (index) {
        this.tabItem = index;
        this.infoList = [];
        this.getInfoList();
      },
      submitData: function () {

      },
    },
    created() {
      this.getInfoList();
    },
    mounted() {
    },
    destroyed() {
      this.$utils.Store.removeItem('tabItem');
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
      font-size: 0.14rem;
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

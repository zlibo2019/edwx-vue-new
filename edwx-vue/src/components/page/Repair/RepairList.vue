<template>
  <div class="repair-list">
    <view-box body-padding-top="0.43rem" body-padding-bottom="0.62rem">
      <div class="repair-head">
        <tab>
          <tab-item :selected="repairState==='0'" @on-item-click="onItemClick('0')">已报修</tab-item>
          <tab-item :selected="repairState==='1'" @on-item-click="onItemClick('1')">已完成</tab-item>
        </tab>
      </div>
      <scroll :pullup-padding-bottom="0" :pullUpLoad="pullUpLoad" @pullingUp="onPullingUp"
              :pullDownRefresh="pullDownRefresh"
              @pullingDown="onPullingDown" :empty-show="emptyShow" ref="scroll">
        <group :gutter="0">
          <cell v-for="(item, index) in infoList" :key="index" is-link @click.native="queryData(item.id)"
                style="padding: 0.08rem 0.1rem 0.02rem 0.1rem">
            <div slot="title" class="repair-body">
              <p><span class="w3">维修人</span>：{{item.repairUserName}}</p>
              <p>报修时间：{{item.startDate}}</p>
              <p>报修地点：{{item.repairAddress}}</p>
              <p class="info" style="width:3.3rem;">报修描述：{{item.initiatorRemark}}</p>
            </div>
          </cell>
        </group>
      </scroll>
      <div class="repair-bottom">
        <x-button text="我要报修" type="primary" style="width: 80%;" @click.native="submitData"></x-button>
      </div>
    </view-box>
  </div>
</template>
<script>
  import {
    ViewBox, Tab, TabItem, XButton, Group, Cell
  } from "vux"
  import Scroll from '@/components/common/Scroll/Scroll';

  export default {
    name: "RepairList",
    components: {
      ViewBox, Tab, TabItem, XButton, Group, Cell, Scroll
    },
    data() {
      return {
        infoList: [],
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
        repairState: this.$utils.Store.getItem("repair") || '0'
      }
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
        if (this.isPullUp) return;
        this.isPullUp = true;
        this.pageIndex = this.pageIndex + 1;
        if (this.pageIndex > this.totalPage) {
          this.updateScroll();
          return;
        }
        this.getInfoList();
      },
      updateScroll: function (flag) {
        this.isPullDown = false;
        this.isPullUp = false;
        this.$refs.scroll.forceUpdate(flag);
      },
      getInfoList: function () {
        this.emptyShow = false;
        this.$api.Repairs.selectListPageByEntity({
          pageIndex: this.pageIndex,
          pageSize: this.pageSize,
          search: {
            initiatorUser: this.$utils.Store.getItem("userSerial"),
            repairState: this.repairState
          }
        }).then(response => {
          // console.log(response);
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
      queryData: function (id) {
        this.$router.push({name: 'RepairDetail', params: {state: id, index: this.repairState}});
      },
      onItemClick: function (index) {
        this.repairState = index;
        this.infoList = [];
        this.getInfoList();
      },
      submitData: function () {
        this.$router.push({name: 'RepairInfo'})
      }
    },
    created() {
      this.getInfoList();
    },
    mounted() {
    },
    destroyed() {
      this.$utils.Store.removeItem("repair");
    }
  }
</script>
<style type="text/scss" lang="scss">
  .repair-list {
    padding: 0.05rem 0;
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

    .repair-list {
      font-size: 0.14rem;
    }

    .repair-bottom {
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

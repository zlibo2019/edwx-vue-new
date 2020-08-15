<template>
  <div class="repair-list">
    <view-box body-padding-top="0.44rem" body-padding-bottom="0.62rem">
      <div class="repair-head">
        <tab>
          <tab-item selected @on-item-click="onItemClick(0)">已报修</tab-item>
          <tab-item @on-item-click="onItemClick(1)">已完成</tab-item>
        </tab>
      </div>
      <scroll :pullup-padding-bottom="0" :pullUpLoad="pullUpLoad" @pullingUp="onPullingUp"
              :pullDownRefresh="pullDownRefresh"
              @pullingDown="onPullingDown" :empty-show="emptyShow" ref="scroll">
        <group :gutter="0">
          <cell :title="item" v-for="(item, index) in infoList" :key="index" is-link></cell>
        </group>
      </scroll>
      <div class="repair-bottom">
        <x-button text="提交" type="primary" style="width: 80%;" @click.native="submitData"></x-button>
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
        emptyShow: false
      }
    },
    computed: {},
    methods: {
    },
    created() {
      this.getInfoList();
    },
    mounted() {
    },
    destroyed() {
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

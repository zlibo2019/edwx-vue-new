<template>
  <div class="message-list">
    <Scroll :pullup-padding-bottom="0" :pullUpLoad="pullUpLoad" @pullingUp="onPullingUp"
            :pullDownRefresh="pullDownRefresh"
            @pullingDown="onPullingDown" :empty-show="emptyShow" ref="scroll">
      <card v-for="(record, i) in messageList" :key="i" :header="{title:record.infoTitle}" :footer="{title:'查看详情'}"
            @on-click-footer="recordClick(record.xh)">
        <div slot="content" class="content">
          <p style="margin-bottom: 0.1rem">{{record.sj}}</p>
          <p @click="recordClick(record.xh)">{{record.infoContent}}</p>
        </div>
      </card>
    </Scroll>
  </div>
</template>
<script>
  import {
    Card
  } from "vux"
  import Scroll from '@/components/common/Scroll/Scroll';

  export default {
    name: "InfoList",
    components: {
      Scroll, Card
    },
    data() {
      return {
        messageList: [],
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
      /** function 下拉刷新
       **/
      onPullingDown: function () {
        if (this.isPullDown) return;
        this.isPullDown = true; // 下拉刷新
        this.messageList = [];
        this.pageIndex = 1;
        this.getMessageList();
      },

      /** function 上拉加载
       **/
      onPullingUp: function () {
        this.pageIndex = this.pageIndex + 1;
        if (this.pageIndex > this.totalPage) {
          this.updateScroll();
          return;
        }
        if (this.isPullUp) return;
        this.isPullUp = true;
        this.getMessageList();
      },
      // 刷新 Scroll 状态
      updateScroll: function (flag) {
        this.isPullDown = false;
        this.isPullUp = false;
        this.$refs.scroll.forceUpdate(flag);
      },
      getMessageList() {
        this.emptyShow = false;
        this.$api.Info.getInfoList({
          pageIndex: this.pageIndex,
          pageSize: this.pageSize,
          search: {}
        }).then(response => {
          // console.log(response);
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
            this.updateScroll(false);
          } else {
            this.messageList.push(...data.records);
            this.pageIndex = data.pageIndex;
            this.totalPage = data.totalPage;
            if (this.messageList.length === 0) {
              this.emptyShow = true;
            }
            this.updateScroll(false);
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      recordClick(value) {
        this.$router.push({name: 'InfoDetail', query: {xh: value}})
      },
    },
    created() {
      this.getMessageList();
    },
    mounted() {
    },
    destroyed() {
    }
  }
</script>
<style type="text/scss" lang="scss">
  .message-list {
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #F4F5F9;

    .weui-panel__hd {
      padding: 0.14rem 0.15rem 0.3rem !important;
      color: #000000 !important;
      font-size: 0.16rem !important;
    }

    .content {
      height: 0.6rem;
      margin: -0.25rem 0.15rem 0.05rem 0.15rem;
      padding-bottom: 0.9rem;
      font-size: 0.13rem;
      color: #7C7C7C;
      line-height: 0.2rem;
      word-break: break-all;
      overflow: hidden;
      text-overflow: ellipsis; //可以用来多行文本的情况下，用省略号“…”隐藏超出范围的文本 。
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical; //必须结合的属性 ，设置或检索伸缩盒对象的子元素的排列方式 。
    }
  }
</style>

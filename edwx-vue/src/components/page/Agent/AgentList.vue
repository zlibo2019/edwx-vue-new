<template>
  <div class="page-list">
    <view-box body-padding-top="0.55rem" :body-padding-bottom="userType === '0'?'0.62rem':0">
      <div class="page-head">
        <x-input class="search-box" placeholder="请输入设备名称、型号或区域" v-model="search" @on-click-clear-icon="clearSearch"
                 @on-enter="getInfoList">
          <i slot="right" class="iconfont icon-sousuo" @click="getInfoList"></i>
        </x-input>
      </div>
      <scroll :pullup-padding-bottom="0" :pullUpLoad="pullUpLoad" @pullingUp="onPullingUp"
              :pullDownRefresh="pullDownRefresh"
              @pullingDown="onPullingDown" :empty-show="emptyShow" ref="scroll">
        <group :gutter="0">
          <cell :title="item" v-for="(item, index) in infoList" :key="index"
                @click.native="recordClick(item.id, 'view')">
            <div slot="title" class="data-list">
              <p><span>设备名称：</span><span>{{item.companyName}}</span></p>
              <p><span>报备型号：</span><span>{{item.deviceNo}}</span></p>
              <!--<p><span>报备报价：</span><span>{{item.devicePrice}}</span></p>-->
              <!--<p><span>大区区域：</span><span>{{item.dicFmtMap.areaCn}}</span></p>-->
              <p><span>报备时间：</span><span>{{item.ltDate}}</span></p>
            </div>
            <div>
              <x-button type="primary" mini @click.stop.native="recordClick(item.id, 'update')" v-if="userType === '0'">
                修改
              </x-button>
            </div>
          </cell>
        </group>
      </scroll>
      <div class="page-bottom">
        <x-button text="开始报备" type="primary" style="width: 80%;" @click.native="submitData"
                  v-if="userType === '0'"></x-button>
      </div>
    </view-box>
  </div>
</template>
<script>
  import {
    ViewBox, XButton, Group, Cell, XInput,
  } from 'vux';
  import Scroll from '../../common/Scroll/Scroll';

  export default {
    name: 'AgentList',
    components: {ViewBox, XButton, Group, Cell, Scroll, XInput},
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
        userType: '',
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
      getInfoList: function () {
        this.$utils.Tools.loadShow();
        this.emptyShow = false;
        let params = {
          pageIndex: this.pageIndex,
          pageSize: this.pageSize,
          search: {
            userSerial: this.userType === '0' ? this.$utils.Store.getItem('userSerial') : null,
            keys: this.search,
          },
        };
        this.$api.Agent.selectListPageByEntity(params).then(response => {
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
      getUserInfo: function () {
        this.$api.User.getUserInfo(this.$utils.Store.getItem('userSerial')).then(response => {
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            if (data && data.lx === '99') {
              this.userType = '0';
            } else {
              this.userType = '1';
            }
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      recordClick: function (value, operation) {
        this.$router.push({path: '/AgentForm', query: {xh: value, operation: operation}});
      },
      submitData: function () {
        this.$router.push({path: '/AgentForm', query: {operation: 'add'}});
      },
    },
    created() {
      this.getUserInfo();
      this.getInfoList();
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

      .search-box {
        margin: 0.1rem;
        border: 1px solid #eaeaea;
        border-radius: 3px;
        padding: 0.05rem;
        box-sizing: border-box;
        font-size: 0.15rem;

        .icon-sousuo {
          font-size: 0.15rem;
          color: #999;
        }
      }
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

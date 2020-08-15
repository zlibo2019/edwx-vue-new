<template>
  <div class="recharge-record">
    <Scroll :pullup-padding-bottom="0" :pullUpLoad="pullUpLoad" @pullingUp="onPullingUp"
            :pullDownRefresh="pullDownRefresh"
            @pullingDown="onPullingDown" :empty-show="emptyShow" ref="scroll">
      <group class="spend-detail-list" gutter="0">
        <cell v-for="(record, i) in list" :key="i">
          <span slot="title">{{record.addType===0?'电脑端':'手机端'}}</span>
          <span class="detail-money" slot="after-title">+{{record.newAdd}}</span>
          <p class="detail-money" slot="inline-desc">
            <span>{{record.jlSj}}</span>
            <span>余额：{{record.saveMoney}}</span>
          </p>
        </cell>
      </group>
    </Scroll>
  </div>
</template>
<script>
  import {
    Cell, Group,
  } from "vux"
  import Scroll from '@/components/common/Scroll/Scroll';

  export default {
    name: "RechargeRecord",
    components: {
      Cell, Group, Scroll
    },
    data() {
      return {
        list: [],
        pullDownRefresh: {
          threshold: 40, // 下拉多少开始刷新
          stop: 20 // 下拉回弹到多少停住
        },
        pullUpLoad: {
          threshold: 25
        },
        isPullDown: false, // 正在下拉刷新
        isPullUp: false, // 正在上拉加载
        emptyShow: false,
        pageIndex: 1,
        pageSize: 20,
        totalPage: 0,
        initFlag: true
      }
    },
    computed: {},
    methods: {
      showDetail() {
        this.$router.push('/SpendDetail');
      },
      onPullingDown: function () {
        if (this.isPullDown) return;
        this.isPullDown = true; // 下拉刷新
        this.list = [];
        this.pageIndex = 1;
        this.getRechargeRecord();
      },
      onPullingUp: function () {
        this.pageIndex = this.pageIndex + 1;
        if (this.pageIndex > this.totalPage) {
          this.updateScroll();
          return;
        }
        if (this.isPullUp) return;
        this.isPullUp = true;
        this.getRechargeRecord();
      },
      // 刷新 Scroll 状态
      updateScroll: function (flag) {
        this.isPullDown = false;
        this.isPullUp = false;
        this.$refs.scroll.forceUpdate(flag);
      },
      getRechargeRecord() {
        this.emptyShow = false;
        this.$api.Home.getRechargeRecord({
          pageIndex: this.pageIndex,
          pageSize: this.pageSize,
          search: {
            userSerial: this.$utils.Store.getItem('userSerial')
          }
        }).then(response => {
            this.$utils.Tools.loadHide();
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg);
              this.updateScroll(false);
            } else {
              this.list.push(...data.records);
              this.pageIndex = data.pageIndex;
              this.totalPage = data.totalPage;
              if (this.list.length === 0) {
                this.emptyShow = true;
              }
              this.updateScroll(false);
            }
          }).catch(err => {
            console.log(err);
            this.$utils.Tools.httpError();
          });
      },
        /** 函数function 设定当前页面
         *  wzx
         *  2019.01.09
         **/
        pushHistory() {
            var state = {
                title: "title",
                url: ""
            };
            window.history.pushState(state, state.title, state.url);
        }
    },
    created() {
      this.getRechargeRecord();
    },
    mounted() {
        // this.pushHistory();
        // window.onpopstate = () => {
        //     this.$router.push('/Recharge');
        // }
    },
    destroyed() {

    }
  }
</script>
<style type="text/scss" lang="scss">
  .recharge-record {
    width: 100%;
    height: 100%;
    overflow-y: scroll;

    > div {
      .scroll-wrapper {
        .scroll-content {
          .scroll-slot {
            .spend-detail-list {
              overflow-y: scroll;

              .weui-cells {
                .weui-cell {
                  height: 0.6rem;

                  .vux-cell-primary {
                    > p {
                      font-size: 0.14rem;
                      line-height: 0.2rem;

                      span:last-of-type {
                        float: right;
                      }
                    }

                    .vux-label-desc {
                      p {
                        font-size: 0.12rem;

                        span:last-of-type {
                          float: right;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
</style>

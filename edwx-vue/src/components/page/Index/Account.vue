<template>
  <div class="account">
    <div class="total-box" :style="{'flex-basis':$params.mode!=='1'?'2.5rem':''}">
      <div class="my-account">
        <dl>
          <dd>账户余额（元）</dd>
          <dt>{{ acmoney }}</dt>
          <dd @click="showDetail">查看明细＞</dd>
        </dl>
        <div class="balance-box">
          <dl>
            <dt>现金余额（元）</dt>
            <dd>{{ acaddo }}</dd>
          </dl>
          <dl>
            <dt>补贴余额（元）</dt>
            <dd>{{ acsubo }}</dd>
          </dl>
        </div>
      </div>
      <x-button mini plain class="recharge" @click.native="recharge" v-if="$params.mode!=='1'">充值</x-button>
    </div>
    <div class="detail-box">
      <Scroll :pullup-padding-bottom="0" :pullUpLoad="pullUpLoad" @pullingUp="onPullingUp"
              :pullDownRefresh="pullDownRefresh"
              @pullingDown="onPullingDown" :empty-show="emptyShow" ref="scroll">
        <group class="spend-detail-list" gutter="0">
          <cell v-for="(record, i) in list" :key="i">
            <span slot="title">{{record.typeName}}</span>
            <span class="detail-money" slot="after-title">{{record.depName}}</span>
            <p class="detail-money" slot="inline-desc">
              <span>{{record.jlSj}}</span>
              <span>{{record.type===1&&record.newMoney.indexOf('-')===-1?('+'+record.newMoney):record.newMoney}}</span>
            </p>
          </cell>
        </group>
      </Scroll>
    </div>
  </div>
</template>
<script>
  import {
    XButton, Cell, Group, ViewBox,
  } from 'vux';
  import Scroll from '@/components/common/Scroll/Scroll';

  export default {
    name: 'Account',
    components: {
      XButton, Cell, Group, ViewBox, Scroll,
    },
    data() {
      return {
        acmoney: '',    //账户余额
        acaddo: '',    //现金余额
        acsubo: '',    //补贴余额
        list: [],
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
        this.getAccountInfo();
        this.getAccountRecords();
      },
      onPullingUp: function () {
        this.pageIndex = this.pageIndex + 1;
        if (this.pageIndex > this.totalPage) {
          this.updateScroll();
          return;
        }
        if (this.isPullUp) return;
        this.isPullUp = true;
        this.getAccountRecords();
      },
      // 刷新 Scroll 状态
      updateScroll: function (flag) {
        this.isPullDown = false;
        this.isPullUp = false;
        this.$refs.scroll.forceUpdate(flag);
      },
      getAccountInfo() {
        this.$utils.Tools.loadShow();
        this.$api.Home.getAccountInfo({
          userSerial: this.$utils.Store.getItem('userSerial'),
        }).then(response => {
          const {code, msg, data} = response;
          this.$utils.Tools.loadHide();
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.acmoney = data.acMoney;
            this.acaddo = data.acAddo;
            this.acsubo = data.acSubo;
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      getAccountRecords() {
        this.emptyShow = false;
        this.$api.Home.getAccountRecords({
          pageIndex: this.pageIndex,
          pageSize: this.pageSize,
          search: {
            userSerial: this.$utils.Store.getItem('userSerial'),
          },
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
          this.$utils.Tools.httpError();
        });
      },
      recharge() {
        this.$router.push('/Recharge');
      },
      /** 函数function 设定当前页面
       *  wzx
       *  2019.01.09
       **/
      pushHistory() {
        var state = {
          title: 'title',
          url: '',
        };
        window.history.pushState(state, state.title, state.url);
      },
    },
    created() {
      this.getAccountInfo();
      this.getAccountRecords();
    },
    mounted() {
      // this.pushHistory();
      // window.onpopstate = () => {
      //     this.$router.push('/');
      // }
    },
    destroyed() {

    },
  };
</script>
<style type="text/scss" lang="scss">
  .account {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    .total-box {
      padding: 0.15rem;

      .my-account {
        width: 100%;
        height: 1.6rem;
        background: -webkit-linear-gradient(left bottom, #0074ff, #0094ff, #00c5ff);
        border-radius: 6px;
        padding: 0.1rem;

        > dl {
          text-align: center;
          color: #fff;

          dd {
            font-size: 0.12rem;
            line-height: 0.2rem;
          }

          dt {
            font-size: 0.28rem;
            line-height: 0.35rem;
          }
        }

        .balance-box {
          width: 100%;
          height: 0.4rem;
          margin-top: 0.18rem;
          display: flex;
          flex-direction: row;

          > dl {
            flex: 1;
            color: #fff;
            text-align: center;

            dt {
              font-size: 0.12rem;
              line-height: 0.15rem;
            }

            dd {
              font-size: 0.2rem;
              line-height: 0.25rem;
            }

            &:first-of-type {
              border-right: 1px solid #fff;
            }
          }
        }
      }

      .recharge {
        width: 100%;
        height: 0.45rem;
        display: block;
        margin-top: 0.15rem;
        font-size: 0.18rem;
        border: 1px solid #3399ff;
        color: #3399ff;
        padding: 0
      }
    }

    .detail-box {
      flex: 1;
      overflow: hidden;

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
  }
</style>

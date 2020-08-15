<template>
  <div class="copy-to-me">
    <div class="info-list">
      <Scroll :pullup-padding-bottom="0" :pullUpLoad="pullUpLoad" @pullingUp="onPullingUp"
              :pullDownRefresh="pullDownRefresh"
              @pullingDown="onPullingDown" :empty-show="emptyShow" ref="scroll">
        <group class="spend-detail-list" gutter="0">
          <cell v-for="(record, i) in list" :key="i" @click.native="cellClick(record.xh,record.type)">
            <div class="info-box" slot="inline-desc">
              <div class="info-pic">
                <i class="iconfont icon-my"></i>
              </div>
              <div class="info-detail">
                <i class="iconfont icon-tongguo agree" v-if="record.lx == 2"></i>
                <i class="iconfont icon-bohui refuse" v-if="record.lx == 3"></i>
                <dt>
                  <span><a>{{ record.name }}</a>的申请</span>
                  <span>{{ record.qjsj }}</span>
                </dt>
                <dd>
                  <span>申请类型</span>
                  <b>{{ record.qjlx }}</b>
                </dd>
                <dd v-if="record.kssj">
                  <span>开始时间</span>
                  <b>{{ record.kssj }}</b>
                </dd>
                <dd v-if="record.jssj">
                  <span>结束时间</span>
                  <b>{{ record.jssj }}</b>
                </dd>
                <dd v-if="record.rq">
                  <span>{{record.qjlx}}时间</span>
                  <b>{{ record.rq }}</b>
                </dd>
                <dd>
                  <span>审批状态</span>
                  <a class="agree" v-if="record.lx == 2">已通过</a>
                  <a class="refuse" v-else-if="record.lx == 3">已驳回</a>
                </dd>
              </div>
            </div>
          </cell>
        </group>
      </Scroll>
    </div>
  </div>
</template>
<script>
  import {
    Tab, TabItem, Cell, Group,
  } from "vux"
  import Scroll from '@/components/common/Scroll/Scroll';

  export default {
    name: "CopyToMe",
    components: {
      Tab, TabItem, Cell, Group, Scroll
    },
    data() {
      return {
        list: [      //type--0:事假   state--0:待审批
          {
            proposer: '上岛咖啡',
            sj: '2018-06-28 09:18',
            type: 0,
            startTime: '2018-06-28 09:18',
            endTime: '2018-06-28 09:18',
            state: 0
          },
          {
            proposer: '上岛咖啡',
            sj: '2018-06-28 09:18',
            type: 0,
            changeTime: '2018-06-28',
            state: 0
          },
        ],
        list: [],
        curPage: 1,      //当前页
        totalPage: 0,    //总页数
        pageNum: 20,    //每页条数
        lx: '2,3',
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
        initFlag: true
      }
    },
    computed: {},
    methods: {
      onPullingDown: function () {
        if (this.isPullDown) return;
        this.isPullDown = true; // 下拉刷新
        this.list = [];
        this.begin = 1;
        this.beginDate = this.$utils.DateUtils.getMonthStart(this.beginDate);
        this.endDate = this.$utils.DateUtils.getMonthEnd(this.endDate);
        this.getMyCopy();
      },
      onPullingUp: function () {
        this.curPage = this.curPage + 1;
        if (this.curPage > this.totalPage) {
          this.updateScroll();
          return;
        }
        if (this.isPullUp) return;
        this.isPullUp = true;
        this.begin = this.begin + this.num;
        this.getMyCopy();
      },
      // 刷新 Scroll 状态
      updateScroll: function (flag) {
        this.isPullDown = false;
        this.isPullUp = false;
        this.$refs.scroll.forceUpdate(flag);
      },
      getMyCopy() {
        this.emptyShow = false;
        this.$utils.Tools.loadShow();
        this.$api.Application.getMyCopy({
          page_index: this.curPage,
          page_size: this.pageNum,
          search: {
            lx: this.lx,
            userSerial: this.$utils.Store.getItem('userSerial'),
          }
        }).then(response => {
            this.$utils.Tools.loadHide();
            // console.log(2222, response)
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              if (+code === 605) {
                if (this.list.length === 0) {
                  this.emptyShow = true;
                }
              }
              this.updateScroll(false);
            } else {
              // console.log(data.records);
              this.list.push(...data.records);
              this.totalPage = data.totalPage;
              // console.log(666, this.list)
              if (this.list.length === 0) {
                this.emptyShow = true;
              }
              this.updateScroll();
            }
          }).catch(err => {
            this.$utils.Tools.httpError();
          });
      },
      cellClick(xh, type) {     //type:假类   0 请假；1 出差；2 外出；3 加班；4 调班；5 补出勤; 6 合同
        let state = encodeURI(xh + ",3");
        switch (type) {           //genre：类型  1：申请的  2：审批的  3：抄送的
          case 0:
            this.$router.push({name: 'LeaveDetail', params: {state: state}});
            break;
          case 1:
            this.$router.push({name: 'MyApplyTrip', params: {state: state}});
            break;
          case 2:
            this.$router.push({name: 'GoOutDetail', params: {state: state}});
            break;
          case 3:
            this.$router.push({name: 'OverTimeDetail', params: {state: state}});
            break;
          case 4:
            this.$router.push({name: 'ChangeShiftDetail', params: {state: state}});
            break;
          case 5:
            this.$router.push({name: 'RepairAttendanceDetail', params: {state: state}});
            break;
          case 6:
            this.$router.push({name: 'ContractDetail', params: {state: state}});
            break;
        }
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
      this.getMyCopy();
    },
    mounted() {
      // this.pushHistory();
      // window.onpopstate = () => {
      //     this.$router.push('/Application')  //输入要返回的上一级路由地址
      // }
    },
    destroyed() {

    }
  }
</script>
<style type="text/scss" lang="scss">
  .copy-to-me {
    width: 100%;
    height: 100%;

    .info-list {
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
                    height: auto;

                    .vux-cell-primary {
                      > p {
                        font-size: 0.14rem;
                        line-height: 0.2rem;

                        span:last-of-type {
                          float: right;
                        }
                      }

                      .vux-label-desc {
                        .info-box {
                          width: 100%;
                          height: auto;
                          display: flex;
                          flex-direction: row;

                          .info-pic {
                            flex-basis: 0.4rem;

                            i {
                              font-size: 0.4rem;
                              color: #ccc;
                            }
                          }

                          .info-detail {
                            flex: 1;
                            margin-left: 0.1rem;
                            padding: 0.05rem 0;
                            position: relative;

                            i {
                              position: absolute;
                              top: -0.04rem;
                              right: 0;
                              font-size: 1rem;

                              &.agree {
                                color: #00CC66;
                              }

                              &.refuse {
                                color: #FF3333;
                              }
                            }

                            dt {
                              line-height: 0.35rem;
                              font-size: 0.13rem;
                              color: #888;

                              span {
                                a {
                                  color: #333;
                                  font-size: 0.16rem;
                                  margin-right: 0.1rem;
                                }

                                &:first-of-type {
                                  font-size: 0.14rem;
                                }

                                &:last-of-type {
                                  font-size: 0.12rem;
                                  float: right;
                                  color: #c8c8c8;
                                }
                              }
                            }

                            dd {
                              line-height: 0.25rem;
                              font-size: 0.13rem;

                              span {
                                color: #888;
                                margin-right: 0.1rem;
                              }

                              b {
                                font-weight: normal;
                                color: #333;
                              }

                              a.wait {
                                color: #3399FF;
                              }

                              a.agree {
                                color: #00CC66;
                              }

                              a.refuse {
                                color: #FF3333;
                              }

                              a.repeal {
                                color: #CCCCCC;
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
    }
  }
</style>

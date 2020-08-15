<template>
  <div class="invitation-list">
    <div class="list-top">
      <dt>访客记录</dt>
      <dd>
        <i class="iconfont icon-yueli"
           style="color: #3399FF; font-size: 0.38rem; margin: 0.02rem 0.05rem 0 0; float: right;"
           @click="showPlugin"></i>
      </dd>
    </div>
    <div class="list-box">
      <Scroll :pullup-padding-bottom="0" :pullUpLoad="pullUpLoad" @pullingUp="onPullingUp"
              :pullDownRefresh="pullDownRefresh"
              @pullingDown="onPullingDown" :empty-show="emptyShow" ref="scroll">
        <timeline>
          <timeline-item :class="item.state === '10'||item.state === '9'?'default':'order'"
                         v-for="(item,index) in visitList"
                         :key="index" @click.native="itemClick(item.xh)">
            <div class="timeline-left">
              <dt>{{ item.weekDay?item.weekDay:'' }}</dt>
              <dd>{{ item.visKssj?item.visKssj.substring(0,10):'' }}</dd>
            </div>
            <div class="timeline-right">
              <dd><span>来访人</span>{{ item.visLname }}</dd>
              <dd>
                <span>来访事由</span>{{ item.thingName }}
                <span>{{ item.dicFmtMap.stateCn }}</span>
              </dd>
              <dd><span>访客类型</span>{{ item.dicFmtMap.visOkCn }}</dd>
            </div>
          </timeline-item>
        </timeline>
      </Scroll>
    </div>
    <div class="my-operate">
      <x-button type="primary" @click.native="orderClick">我要邀请</x-button>
    </div>
  </div>
</template>
<script>
  import {XInput, Group, XButton, Timeline, TimelineItem} from 'vux';
  import Scroll from '@/components/common/Scroll/Scroll';

  export default {
    name: 'InvitationList',
    components: {XInput, Group, XButton, Timeline, TimelineItem, Scroll},
    data() {
      return {
        currDate: '',
        visitList: [],
        // emptyShow: '暂无访客预约',
        curPage: 1,      //当前页
        totalPage: 0,    //总页数
        pageNum: 20,    //每页条数
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
        curMonth: '',
        startDate: '',
        endDate: '',
      };
    },
    computed: {},
    methods: {
      getSysDate: function () {
        this.$api.Sys.getSystemDate(this.$params.mode).then(response => {
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg);
            } else {
              this.currDate = data.sysDate;
              this.curMonth = data.sysDate.substring(0, 7);
              this.startDate = this.$utils.DateUtils.getMonthStart(data.sysDate);
              this.endDate = this.$utils.DateUtils.getMonthEnd(data.sysDate);
              // console.log(66,this.curMonth)
              this.getVisitList(this.startDate, this.endDate, this.curPage);
            }
          }).catch(err => {
            this.$utils.Tools.httpError();
          });
      },
      onPullingDown: function () {
        if (this.isPullDown) return;
        this.isPullDown = true; // 下拉刷新
        this.visitList = [];
        this.curPage = 1;
        this.getVisitList(this.startDate, this.endDate, this.curPage);
      },
      onPullingUp: function () {
        if (this.isPullUp) return;
        this.isPullUp = true;
        this.curPage++;
        if (this.curPage > this.totalPage) {
          this.updateScroll();
          return;
        }
        this.getVisitList(this.startDate, this.endDate, this.curPage);
      },
      // 刷新 Scroll 状态
      updateScroll: function (flag) {
        this.isPullDown = false;
        this.isPullUp = false;
        this.$refs.scroll.forceUpdate(flag);
      },
      showPlugin() {
        const _this = this; // 需要注意 onCancel 和 onConfirm 的 this 指向
        this.$vux.datetime.show({
          cancelText: '取消',
          confirmText: '确定',
          format: 'YYYY-MM',
          value: this.curMonth,
          onConfirm(val) {
            _this.startDate = _this.$utils.DateUtils.getMonthStart(val);
            _this.endDate = _this.$utils.DateUtils.getMonthEnd(val);
            _this.curPage = 1;
            _this.visitList = [];
            _this.getVisitList(_this.startDate, _this.endDate, _this.curPage);
            console.log('plugin confirm', val);
          },
        });
      },
      getVisitList(sdate, edate, curPage) {
        this.emptyShow = false;
        // this.$utils.Tools.loadShow();
        this.$api.Visit.selectListPageByEntity({
          pageIndex: curPage,
          pageSize: this.pageNum,
          search: {
            startDate: sdate,
            endDate: edate,
            userSerial: this.$utils.Store.getItem('userSerial'),
          },
        }).then(response => {
          // this.$utils.Tools.loadHide();
          // console.log(2222, response)
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
            this.updateScroll(false);
          } else {
            this.visitList.push(...data.records);
            this.totalPage = data.totalPage;
            if (this.visitList.length === 0) {
              this.emptyShow = true;
            } else {
              for (let item of this.visitList) {
                this.$set(item, 'weekDay', this.$utils.DateUtils.getWeekDaysCn(item.visKssj.substring(0, 10)));
              }
            }
            this.updateScroll(false);
          }
        }).catch(err => {
            this.$utils.Tools.httpError();
          });
      },
      itemClick(xh) {
        this.$router.push({path: '/VisitorDetail', query: {xh: xh}});
      },
      orderClick() {
        this.$router.push('/CompleteVisitorInfo');
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
  .invitation-list {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    .list-top {
      flex-basis: 0.45rem;
      padding: 0 4%;
      background: #fff;
      border-bottom: 1px solid #eaeaea;

      dt {
        font-size: 0.14rem;
        line-height: 0.45rem;
        float: left;
      }

      dd {
        float: right;
      }
    }

    .list-box {
      flex: 1;
      overflow-y: scroll;

      .vux-timeline {
        flex: 1;
        overflow-y: scroll;
        padding: 0.1rem;

        ul {
          li.vux-timeline-item {
            .vux-timeline-item-head, .vux-timeline-item-head-first {
              width: 0.1rem;
              height: 0.1rem;
              left: 0.8rem;
              top: 0.1rem;
              background: #eee;

              .vux-timeline-item-checked {
                width: 0.1rem;
                height: 0.1rem;

                &:before {
                  content: "";
                }
              }

              &:after {
                display: none;
              }
            }

            .vux-timeline-item-tail {
              width: 0.02rem;
              left: 0.84rem;
              top: 0.1rem;
              background: #EEEEEE;
            }

            .vux-timeline-item-content {
              height: 0.8rem;
              padding: 0.05rem 0;
              display: flex;
              flex-direction: row;

              .timeline-left {
                flex-basis: 0.8rem;
                text-align: center;
                padding-right: 0.05rem;
                color: #333;

                dt {
                  font-size: 0.16rem;
                }

                dd {
                  font-size: 0.13rem;
                  color: #333;
                }
              }

              .timeline-right {
                flex: 1;
                margin-left: 0.2rem;

                dd {
                  height: 0.2rem;
                  font-size: 0.13rem;
                  margin-bottom: 0.05rem;
                  color: #333;

                  span {
                    margin-right: 0.1rem;
                    font-size: 0.13rem;
                    color: #999;
                    display: block;

                    &:nth-of-type(1) {
                      width: 0.6rem;
                      float: left;
                    }

                    &:nth-of-type(2) {
                      float: right;
                    }
                  }
                }
              }
            }

            &.going {
              .vux-timeline-item-head, .vux-timeline-item-head-first {
                background: #3399ff;
              }

              .vux-timeline-item-content {
                .timeline-left {
                  dt {
                    color: #333;
                  }
                }

                .timeline-right {
                  dd {
                    color: #333;
                  }
                }
              }
            }

            &.default {
              .vux-timeline-item-head, .vux-timeline-item-head-first {
                background: #EEEEEE;
              }

              .vux-timeline-item-content {
                .timeline-left {
                  dt {
                    color: #333;
                  }
                }

                .timeline-right {
                  dd {
                    color: #333;
                  }
                }
              }
            }

            &.order {
              .vux-timeline-item-head, .vux-timeline-item-head-first {
                background: #00CC66;
              }

              .vux-timeline-item-content {
                .timeline-left {
                  dt {
                    color: #333;
                  }
                }

                .timeline-right {
                  dd {
                    color: #333;
                  }
                }
              }
            }
          }
        }
      }
    }

    .my-operate {
      flex-basis: 0.86rem;
      padding: 0.2rem 0;
      background: #fff;
      border-top: 1px solid #e5e5e5;

      .weui-btn {
        width: 80%;
        height: 0.46rem;
        font-size: 0.18rem;

        &.disabled {
          background: #A2A2A2;
        }
      }
    }
  }
</style>

<template>
  <div class="my-meeting-order-bak">
    <div class="calendar-box">
      <WeekCalendar :timestamp="timestamp" :eventList="eventList" @monthClick="monthClick"
                    @dayClick="dayClick"></WeekCalendar>
    </div>
    <div class="meeting-list">
      <tab>
        <tab-item :selected="active === index" v-for="(item,index) in tabData" :key="index"
                  @on-item-click="onItemClick(index)">{{ item.title }}
        </tab-item>
      </tab>
      <empty :show="emptyShow" :tip="emptyTip" v-if="meetingList.length === 0"></empty>
      <timeline v-else>
        <timeline-item :class="item.meetState === 1?'going':(item.meetState === 0?'order':'')"
                       v-for="(item,index) in meetingList" :key="index" @click.native="itemClick(item.bh)">
          <div class="timeline-left">
            <dt>{{ item.kssj?item.kssj.substring(11,16):'' }}</dt>
            <dd>{{ item.kssj?item.kssj.substring(0,10):'' }}</dd>
          </div>
          <div class="timeline-right">
            <dd><span>会议主题</span>{{ item.lname }}</dd>
            <dd><span>会议地点</span>{{ item.roomName }}</dd>
          </div>
        </timeline-item>
      </timeline>
    </div>
  </div>
</template>
<script>
  import WeekCalendar from '@/components/common/WeekCalendar/WeekCalendar.vue';
  import {Tab, TabItem, Timeline, TimelineItem} from 'vux';
  import Empty from '@/components/common/Empty/Empty';

  export default {
    name: 'MyMeetingOrder',
    components: {
      Tab, TabItem, WeekCalendar, Timeline, TimelineItem, Empty,
    },
    data() {
      return {
        timestamp: 0,   //当前时间的时间戳
        eventList: [],       //活动/事件数组
        meetingType: this.$utils.Store.getItem('meetingType') ? this.$utils.Store.getItem('meetingType') : 0,  //0:未开始;2:已结束;不传为全部;
        tabData: [
          {
            title: '已预约',
          },
          {
            title: '已结束',
          },
        ],
        active: this.$utils.Store.getItem('curActive') ? this.$utils.Store.getItem('curActive') : 0,
        meetingList: [       //meetingState--0：已结束；1：进行中；2：已预约
        ],//meetingState--0：已结束；1：进行中；2：已预约
        curMonth: '',    //当前年月
        emptyShow: false,
        emptyTip: '暂无会议预约',
      };
    },
    computed: {},
    methods: {
      /**
       * @function获取当前日期
       *      wzx
       *   2019.01.22
       **/
      getSysDate() {
        this.$api.Sys.getSystemDate(this.$params.mode).then(response => {
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.currDate = data.sysDate.substring(0, 10);
            this.timestamp = this.$utils.DateUtils.getTimeStamp(data.sysDate) * 1000;
            this.getMyMeetingList();
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      /**
       * @function获取当前日期下的与自己有关的会议日期列表
       *      wzx
       *   2019.01.23
       **/
      getMyMeetingDateList() {
        this.$api.Meeting.getMyMeetingDateList({
          userSerial: this.$utils.Store.getItem('userSerial'),
        }).then(response => {
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.eventList = data;
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      /**
       * @function点击获取当前日期下的会议室列表
       *      wzx
       *   2019.01.29
       **/
      monthClick(val) {
        // console.log(888, val)
        this.currDate = val;
        this.getMyMeetingList();
      },
      /**
       * @function点击获取当前日期下的会议室列表
       *      wzx
       *   2019.01.29
       **/
      dayClick(val) {
        // console.log(666, val)
        this.currDate = val;
        this.getMyMeetingList();
      },
      /**
       * @function获取当前日期下的会议列表及状态
       *      wzx
       *   2019.01.29
       **/
      getMyMeetingList() {
        this.$api.Meeting.getMyMeetingList({
          cdate: this.currDate,
          type: this.meetingType,
          userSerial: this.$utils.Store.getItem('userSerial'),
        }).then(response => {
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            if (data.length > 0) {
              this.meetingList = data;
              this.emptyShow = false;
            } else {
              this.meetingList = [];
              this.emptyShow = true;
            }
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      /**
       * @function点击获取当前日期下的已预约或者已结束的会议列表
       *      wzx
       *   2019.01.29
       **/
      onItemClick(index) {
        this.active = index;
        this.$utils.Store.setItem('curActive', this.active);
        if (index === 0) {
          this.meetingType = 0;
          this.$utils.Store.setItem('meetingType', this.meetingType);
          this.getMyMeetingList();
        } else {
          this.meetingType = 2;
          this.$utils.Store.setItem('meetingType', this.meetingType);
          this.getMyMeetingList();
        }
      },
      itemClick(value) {
        let state = encodeURI(value);
        this.$router.push({name: 'MeetingDetail', params: {state: state}});
      },
    },
    created() {
      this.getSysDate();
      this.getMyMeetingDateList();
    },
    mounted() {

    },
    destroyed() {

    },
  };
</script>
<style type="text/scss" lang="scss">
  .my-meeting-order-bak {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    .calendar-box {
      flex-basis: 0.7rem;
    }

    .meeting-list {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;

      .vux-tab-wrap {
        flex-basis: 0.5rem;

        .vux-tab-container {
          height: 100% !important;

          .vux-tab {
            height: 100%;

            .vux-tab-item {
              font-size: 0.16rem;
            }
          }
        }
      }

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
              padding: 0.1rem 0;
              display: flex;
              flex-direction: row;

              .timeline-left {
                flex-basis: 0.8rem;
                text-align: center;
                padding-right: 0.05rem;
                color: #CCC;

                dt {
                  font-size: 0.2rem;
                }

                dd {
                  font-size: 0.13rem;
                  color: #CCC;
                }
              }

              .timeline-right {
                flex: 1;
                margin-left: 0.2rem;

                dd {
                  font-size: 0.15rem;
                  margin-bottom: 0.1rem;
                  color: #CCC;

                  span {
                    margin-right: 0.1rem;
                    font-size: 0.13rem;
                    color: #CCC;
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

  }
</style>

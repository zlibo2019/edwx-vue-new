<template>
  <div class="order-meeting">
    <div class="header-box">
      <div class="calendar-box">
        <WeekCalendar :timestamp="timestamp" :eventList="eventList" @monthClick="monthClick"
                      @dayClick="dayClick"></WeekCalendar>
      </div>
      <dl class="my-box" @click="myClick">
        <dt><i class="iconfont icon-my"></i></dt>
        <dd>我的</dd>
      </dl>
    </div>
    <div class="room-list">
      <Scroll :pullup-padding-bottom="0" :pullUpLoad="pullUpLoad" @pullingUp="onPullingUp"
              :pullDownRefresh="pullDownRefresh"
              @pullingDown="onPullingDown" :empty-show="emptyShow" ref="scroll">
        <div class="room-box" v-for="item in roomList" @click="roomClick(item)">
          <div class="room-pic">
            <img src="@/assets/room.png" alt="">
            <dd>我要预约</dd>
          </div>
          <div class="room-info">
            <div class="room-name">{{ item.depName }}</div>
            <div class="room-device">
              <span v-for="device in item.roomResource">
                <i class="iconfont icon-dianhua" v-if="device.resourceXh === 1"></i>
                <i class="iconfont icon-fangzuo" v-if="device.resourceXh === 2"></i>
                <i class="iconfont icon-yuanzuo" v-if="device.resourceXh === 3"></i>
                <i class="iconfont icon-chuanghu" v-if="device.resourceXh === 4"></i>
                <i class="iconfont icon-jiankong" v-if="device.resourceXh === 5"></i>
                <i class="iconfont icon-shexiangji" v-if="device.resourceXh === 6"></i>
                <i class="iconfont icon-yinxiang" v-if="device.resourceXh === 7"></i>
                <i class="iconfont icon-shipinhuiyi" v-if="device.resourceXh === 8"></i>
                <i class="iconfont icon-youxianwangluo" v-if="device.resourceXh === 9"></i>
                <i class="iconfont icon-wifi" v-if="device.resourceXh === 10"></i>
                <i class="iconfont icon-touyingyi" v-if="device.resourceXh === 11"></i>
                <i class="iconfont icon-baiban" v-if="device.resourceXh === 12"></i>
                <i class="iconfont icon-bijiben" v-if="device.resourceXh === 13"></i>
                <i class="iconfont icon-maikefeng" v-if="device.resourceXh === 14"></i>
                {{ device.resourceName }}
              </span>
            </div>
            <div class="room-time">
              <dd class="going" v-if="item.meetState ===1">
                <i class="iconfont icon-shijian"></i>
                {{ item.kssj.substring(11,16) }}—{{ item.jssj.substring(11,16) }}
              </dd>
              <dd class="order" v-else-if="item.meetState ===0">
                <i class="iconfont icon-duigou"></i>
                {{ item.kssj.substring(11,16) }}—{{ item.jssj.substring(11,16) }}
              </dd>
              <dd v-else-if="item.meetState ===2">
                <i class="iconfont icon-shalou"></i>
                空闲
              </dd>
              <dd>{{ item.meetState ===0?'已预约':(item.meetState ===1?'使用中':'无会议') }}</dd>
            </div>
          </div>
        </div>
      </Scroll>
    </div>
  </div>
</template>
<script>
  import WeekCalendar from '@/components/common/WeekCalendar/WeekCalendar.vue';

  export default {
    name: 'OrderMeeting',
    components: {
      WeekCalendar,
    },
    data() {
      return {
        timestamp: 0,   //当前时间的时间戳
        eventList: [],       //活动/事件数组
        roomList: [],
        currDate: '',    //当前日期
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
        curTime: '', //当前时间
      };
    },
    computed: {},
    methods: {
      myClick() {
        this.$router.push('/MyMeetingOrder');
      },
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
            this.curTime = data.sysDate;
            this.timestamp = this.$utils.DateUtils.getTimeStamp(data.sysDate) * 1000;
            this.getMeetingList();
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      /**
       * @function获取当前日期下的会议室列表及状态
       *      wzx
       *   2019.01.22
       **/
      getMeetingList() {
        this.$api.Meeting.getMeetingList({
          page_index: this.curPage,
          page_size: this.pageNum,
          search: {
            cdate: this.currDate,
            userSerial: this.$utils.Store.getItem('userSerial'),
          },
        }).then(response => {
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.roomList = data.records;
            this.totalPage = data.total_page;
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
      onPullingDown: function () {
        if (this.isPullDown) return;
        this.isPullDown = true; // 下拉刷新
        this.list = [];
        this.curPage = 1;
        this.getMeetingList();
      },
      onPullingUp: function () {
        if (this.isPullUp) return;
        this.isPullUp = true;
        this.curPage++;
        if (this.curPage > this.totalPage) {
          this.updateScroll();
          return;
        }
        this.getMeetingList();
      },
      // 刷新 Scroll 状态
      updateScroll: function (flag) {
        this.isPullDown = false;
        this.isPullUp = false;
        this.$refs.scroll.forceUpdate(flag);
      },
      roomClick(obj) {
        this.$utils.Store.setLocalItem('roomId', obj.depSerial);
        this.$utils.Store.setLocalItem('roomName', obj.depName);
        this.$utils.Store.setItem('devices', JSON.stringify(obj.roomResource));
        this.$router.push({
          name: 'MeetingRoomDetail',
          query: {
            roomId: this.$utils.Store.getLocalItem('roomId'),
            curTime: obj.kssj ? obj.kssj : this.curTime,
            roomName: this.$utils.Store.getLocalItem('roomName'),
            devices: this.$utils.Store.getItem('devices'),
          },
        });
      },
      /**
       * @function点击获取当前日期下的会议室列表
       *      wzx
       *   2019.01.23
       **/
      monthClick(val) {
        // console.log(888,val)
        this.currDate = val;
        this.getMeetingList();
      },
      /**
       * @function点击获取当前日期下的会议室列表
       *      wzx
       *   2019.01.23
       **/
      dayClick(val) {
        this.currDate = val;
        this.getMeetingList();
      },
    },
    created() {
      this.getSysDate();
      this.getMyMeetingDateList();
    },
    mounted() {
      this.$utils.Store.removeItem('curActive');
      this.$utils.Store.removeItem('meetingType');
    },
    destroyed() {

    },
  };
</script>
<style type="text/scss" lang="scss">
  .order-meeting {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    .header-box {
      flex-basis: 0.7rem;
      display: flex;
      flex-direction: row;

      .calendar-box {
        flex: 1;
      }

      .my-box {
        flex-basis: 0.4rem;
        text-align: center;

        dt {
          i {
            display: block;
            margin: 0.02rem auto;
            font-size: 0.26rem;
            color: #3399FF;
          }
        }

        dd {
          font-size: 0.13rem;
        }
      }
    }

    .room-list {
      flex: 1;
      margin-top: 0.05rem;
      padding: 0.05rem;
      overflow-y: scroll;

      .room-box {
        width: 100%;
        height: 1.5rem;
        padding: 0.08rem 0;
        display: flex;
        flex-direction: row;

        .room-pic {
          flex: 7;
          overflow: hidden;
          position: relative;

          img {
            width: 100%;
          }

          dd {
            width: 100%;
            height: 0.4rem;
            position: absolute;
            bottom: 0;
            left: 0;
            background: rgba(0, 0, 0, .5);
            color: #fff;
            font-size: 0.13rem;
            text-align: center;
            line-height: 0.4rem;
          }
        }

        .room-info {
          flex: 5;
          margin-left: 0.08rem;
          min-width: 0;

          .room-name {
            width: 100%;
            height: 0.3rem;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            /*line-height: 0.3rem;*/
            font-size: 0.18rem;
          }

          .room-device {
            width: 100%;
            height: 0.55rem;
            margin: 0.05rem auto;
            overflow: hidden;

            span {
              width: auto;
              padding: 0.05rem 0.1rem 0.05rem 0.25rem;
              font-size: 0.13rem;
              float: left;
              position: relative;
              color: #B2B4BD;

              i {
                position: absolute;
                top: 0.05rem;
                left: 0;
                font-size: 0.2rem;
              }
            }
          }

          .room-time {
            dd {
              font-size: 0.15rem;
              padding-left: 0.25rem;
              position: relative;
              line-height: 0.2rem;
              color: #CCC;

              i {
                position: absolute;
                top: 0;
                left: 0;
                font-size: 0.22rem;
              }

              &.going {
                color: #3399FF;
              }

              &.order {
                color: #00CC66;
              }

              &:last-of-type {
                font-size: 0.13rem;
              }
            }
          }
        }
      }
    }
  }
</style>

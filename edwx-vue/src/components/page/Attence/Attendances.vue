<template>
  <div class="attendances-detail">
    <view-box body-padding-top="2rem" body-padding-bottom="0">
      <div class="attendances-detail-head">
        <week-calendar :timestamp="this.$utils.DateUtils.getTimeStamp(startDate)*1000" :eventList="[]"
                       @dayClick="dayClick"
                       @monthClick="monthClick"></week-calendar>
        <flexbox v-if="showFlag===true" class="attendances-detail-title" :gutter="0">
          <flexbox-item style="border-right:1px #ffffff solid;">
            <p style="padding-bottom: 0.1rem;">首次打卡时间</p>
            <p>{{(todayDate.type !== '2' && todayDate.type !== '3')? todayDate.startTime||'- - -' :'- - -'}}</p>
          </flexbox-item>
          <flexbox-item>
            <p style="padding-bottom: 0.1rem;">末次打卡时间</p>
            <p>{{(todayDate.type !== '2' && todayDate.type !== '3')? todayDate.endTime||'- - -' :'- - -'}}</p>
          </flexbox-item>
        </flexbox>
        <flexbox v-else class="attendances-detail-title" :gutter="5" orient="vertical">
          <flexbox-item>
            <p>{{selectMonth}}月份考勤</p>
            <p>
              <span style="font-size: 0.3rem;">{{monthDetail.actualTotal?monthDetail.actualTotal:0}}</span>
              /
              <span style="font-size: 0.15rem;">{{monthDetail.total?monthDetail.total:0}}</span>
            </p>
          </flexbox-item>
          <flexbox-item>
            <flexbox :gutter="0">
              <flexbox-item style="border-right:1px #ffffff solid" @click.native.stop="onShowDetail(1)">
                <p>迟到（次）</p>
                <p>{{monthDetail.late?monthDetail.late:0}}</p>
              </flexbox-item>
              <flexbox-item style="border-right:1px #ffffff solid" @click.native="onShowDetail(4)">
                <p>早退（次）</p>
                <p>{{monthDetail.goout?monthDetail.goout:0}}</p>
              </flexbox-item>
              <flexbox-item style="border-right:1px #ffffff solid" @click.native.stop="onShowDetail(2)">
                <p>请假（天）</p>
                <p>{{monthDetail.leave?monthDetail.leave:0}}</p>
              </flexbox-item>
              <flexbox-item @click.native.stop="onShowDetail(3)">
                <p>旷工（天)</p>
                <p>{{monthDetail.absenteeism?monthDetail.absenteeism:0}}</p>
              </flexbox-item>
            </flexbox>
          </flexbox-item>
        </flexbox>
      </div>
      <div class="attendances-detail-list" @click="popShow">
        <scroll :pullup-padding-bottom="20" :pullUpLoad="pullUpLoad" @pullingUp="onPullingUp"
                :pullDownRefresh="pullDownRefresh"
                @pullingDown="onPullingDown" :empty-show="emptyShow" ref="scroll">
          <timeline>
            <timeline-item v-for="(item, k) in list" :key="k">
              <flexbox :gutter="0" class="attendances-record">
                <flexbox-item style="text-align:right;" :span="0.2">
                  <p>{{item.date.substr(5)}}</p>
                  <p>{{item.week}}</p>
                </flexbox-item>
                <flexbox-item @click.native="getAttenceDayRecord(item.date, item.type, $event)">
                  <p style="padding-left:0.5rem;" v-if="item.type === '1'">首次打卡时间：{{item.startTime}}</p>
                  <p style="padding-left:0.5rem;" v-if="item.type === '1'">末次打卡时间：{{item.endTime}}</p>
                  <p style="padding-left:0.5rem;" v-else-if="item.type === '2'">请假</p>
                  <p style="padding-left:0.5rem;" v-else>未打卡</p>
                </flexbox-item>
              </flexbox>
            </timeline-item>
          </timeline>
        </scroll>
      </div>

    </view-box>
    <div v-show="popFlag===true" class="pop-content" :style="popStyle" ref="pop">
      <p v-for="item in dayList">打卡时间：{{item.sj}}</p>
    </div>
  </div>
</template>

<script>
  import {Flexbox, FlexboxItem, ViewBox, Timeline, TimelineItem} from "vux";
  import WeekCalendar from '@/components/common/WeekCalendar/WeekCalendar';
  import Scroll from '@/components/common/Scroll/Scroll';

  export default {
    name: "Attendances",
    components: {
      Flexbox,
      FlexboxItem,
      ViewBox,
      Timeline,
      TimelineItem,
      WeekCalendar,
      Scroll
    },
    data() {
      return {
        list: [],
        dayList: [],
        currDate: "",
        startDate: "",
        userSerial: "",
        showFlag: true,
        todayDate: {},
        selectMonth: '',
        selectDay: '',
        monthDetail: {}, //出勤数据
        popFlag: false,
        popStyle: {
          top: '0px',
          right: '0px'
        },
        pullDownRefresh: {
          threshold: 60, // 下拉多少开始刷新
          stop: 40 // 下拉回弹到多少停住
        },
        pullUpLoad: {
          threshold: 25
        },
        isPullDown: false, // 正在下拉刷新
        isPullUp: false, // 正在上拉加载
        emptyShow: false
      };
    },
    methods: {
      // 下拉刷新
      onPullingDown: function () {
        if (this.isPullDown) return;
        this.isPullDown = true; // 下拉刷新
        this.list = [];
        let date = this.$utils.DateUtils.getFullDate(this.startDate);
        this.getAttenceRecord(date);
      },
      onPullingUp: function () {
        if (this.isPullUp) return;
        this.isPullUp = true;
        let date = this.list[this.list.length - 1].date;
        // console.log(date);
        if (date.endsWith("01")) {
          this.$refs.scroll.forceUpdate();
          return;
        }
        let selectDate = this.$utils.DateUtils.addDate(date, -1);
        this.getAttenceRecord(selectDate);
      },
      // 刷新 Scroll 状态
      updateScroll: function () {
        this.isPullDown = false;
        this.isPullUp = false;
        this.$refs.scroll.forceUpdate();
      },
      popShow: function () {
        this.popFlag = false;
      },
      dayClick: function (date) {
        this.showFlag = true;
        this.$utils.Tools.loadShow();
        this.list = [];
        this.startDate = date;
        this.getAttenceRecord(date);
        this.selectMonth = this.$utils.DateUtils.getMonth(date);
        this.selectDay = date;
      },
      monthClick: function (date) {
        this.startDate = this.$utils.DateUtils.getMonthEnd(date);
        let temp = this.$utils.DateUtils.getMonthEnd(this.currDate);
        if (this.startDate === temp) {
          this.startDate = this.currDate;
        }
        let month1 = this.$utils.DateUtils.formatDateMonth(date);
        let month2 = this.$utils.DateUtils.formatDateMonth(this.currDate);
        this.showFlag = month1 === month2;
        this.$utils.Tools.loadShow();
        this.list = [];
        this.getAttenceRecord(this.startDate);
        this.getAttenceSum(date);
        this.selectMonth = this.$utils.DateUtils.getMonth(date);
        this.selectDay = date;
      },
      changTitle: function () {
        this.showFlag = !this.showFlag;
      },
      onShowDetail: function (index) {
        this.$router.push({
          name: "AttendDetail", params: {
            index: index,
            date: this.selectDay
          }
        });
      },
      getAttenceRecord: function (date) {
        this.$api.Attence.getAttenceRecord({
          userSerial: this.userSerial,
          dates: date,
          flag: "20"
        }).then(response => {
            const {code, msg, data} = response;
            this.$utils.Tools.loadHide();
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg);
              this.updateScroll(false);
            } else {
              this.list.push(...data);
              if (this.list.length === 0) {
                this.emptyShow = true;
              } else {
                this.todayDate = this.list[0];
              }
              this.updateScroll();
            }
          }).catch(err => {
            this.$utils.Tools.httpError();
          });
      },
      getAttenceDayRecord: function (date, type, event) {
        if (+type !== 1) {
          return;
        }
        this.popFlag = false;
        this.$utils.Tools.loadShow();
        this.$api.Attence.getAttenceDayRecord({
          userSerial: this.userSerial,
          dates: date,
          flag: "1"
        }).then(response => {
            this.$utils.Tools.loadHide();
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg)
            } else {
              this.dayList = data;
              this.popFlag = true;
              setTimeout(() => {
                this.popStyle.top = event.clientY - this.$refs.pop.offsetHeight + "px";
                // this.popStyle.left = event.clientX + "px";
              }, 1);
            }
          }).catch(err => {
            this.$utils.Tools.httpError();
          });
      },
      getAttenceSum: function (date) {
        this.$api.Attence.getAttenceSum({
          userSerial: this.userSerial,
          dates: date
        }).then(response => {
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg)
            } else {
              this.monthDetail = data[0];
            }
          }).catch(err => {
            this.$utils.Tools.httpError();
          });
      },
      getSysDate: function () {
        this.$api.Sys.getSystemDate(this.$params.mode).then(response => {
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg)
            } else {
              this.currDate = data.sysDate;
              this.startDate = data.sysDate;
              this.selectMonth = this.$utils.DateUtils.getMonth(this.startDate);
              this.selectDay = this.$utils.DateUtils.getFullDate(this.startDate);
              let date = this.$utils.DateUtils.getFullDate(this.startDate);
              this.getAttenceRecord(date);
            }
          }).catch(err => {
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
      this.$utils.Tools.loadShow();
      this.userSerial = this.$utils.Store.getItem("userSerial");
    },
    mounted() {
      let date = this.$utils.Store.getItem("attendDate");
      if (date !== null) {
        this.startDate = date + " 00:00:00";
        this.selectMonth = this.$utils.DateUtils.getMonth(this.startDate);
        this.selectDay = this.$utils.DateUtils.getFullDate(this.startDate);
        this.monthClick(date);
      } else {
        this.getSysDate();
      }

      if (this.$route.params.notification) {
        this.pushHistory();
      }
      // this.pushHistory();
      // window.onpopstate = () => {
      //     this.$router.push('/');
      // }
    },
    destroyed() {
      this.$utils.Store.removeItem("attendDate");
    }
  };
</script>

<style lang="scss">
  .attendances-detail {
    position: relative;
    height: 100%;

    .attendances-detail-head {
      padding: 0 0.2rem 0.2rem 0.2rem;
      font-size: 0.14rem;
      width: 100%;
      position: absolute;
      top: 0;
      left: 0;

      .attendances-detail-title {
        padding: 0.1rem 0 0.1rem 0;
        color: #ffffff;
        background: -webkit-linear-gradient(left, #3399ff, #0074ff); /* Safari 5.1 - 6.0 */
        background: -o-linear-gradient(right, #3399ff, #0074ff); /* Opera 11.1 - 12.0 */
        background: -moz-linear-gradient(right, #3399ff, #0074ff); /* Firefox 3.6 - 15 */
        background: linear-gradient(to right, #3399ff, #0074ff); /* 标准的语法 */
        border-radius: 8px;
        height: 1.25rem;

        div {
          text-align: center;
        }
      }
    }

    .attendances-detail-list {
      font-size: 0.14rem;
      height: 100%;
      border-top: 10px #F4F5F9 solid;

      .attendances-record {
        padding: 0 0 0.3rem 0;
      }

      li:last-child .attendances-record {
        padding: 0 0 0 0;
      }
    }

    .pop-content {
      padding: 0.1rem 0.1rem;
      line-height: 0.2rem;
      font-size: 0.14rem;
      width: 1.6rem;
      max-height: 2rem;
      overflow-y: scroll;
      position: absolute;
      right:0;
      background-color: #eaeaea;
      z-index: 100000;
    }
  }
</style>

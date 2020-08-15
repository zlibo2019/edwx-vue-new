<template>
  <div class="week-calendar">
    <div class="date-box">
      <div class="month-box">
        <group class="selectDate">
          <datetime v-model="selectDat" format="YYYY-MM" @on-change="changeDate"></datetime>
        </group>
        <dt><span>{{ month }}</span>月</dt>
        <dd>{{ year }}年</dd>
        <img src="./icon/down.png" alt="">
      </div>
      <!--<transition name="Slide" enter-active-class="animated slideInDown" leave-active-class="animated slideOutUp">
          <div class="slide-box">
              <div class="month-list" v-if="showMonth">
                  <ul>
                      <li v-for="item in monthData" @click="monthClick(item.value)">{{ item.title }}</li>
                  </ul>
              </div>
          </div>
      </transition>-->
      <div class="weeks-box">
        <ol>
          <li v-for="item in weekData">{{ item.title }}</li>
        </ol>
        <v-touch v-on:swipeleft="onSwipeLeft"  v-on:swiperight="onSwipeRight" tag="div" class="day-box">
          <ul ref="container" class="week-box">
            <li>
              <dd :class="item.week === weekday?'weekday':''" v-for="item in prevWeekList" @click="dayClick(item.day)">
                <span>{{item.day.substring(8)}}</span>
                <img v-if="item.hasEvent" src="./icon/dot.png" alt="">
              </dd>
            </li>
            <li ref="libox">
              <dd :class="[item.week === weekday?'weekday':'',item.day === today?'today':'']" v-for="item in weekList"
                  @click="dayClick(item.day)">
                <span>{{item.day.substring(8)}}{{item.hasEvent}}</span>
                <img v-if="item.hasEvent" src="./icon/dot.png" alt="">
              </dd>
            </li>
            <li>
              <dd :class="item.week === weekday?'weekday':''" v-for="item in nextWeekList" @click="dayClick(item.day)">
                <span>{{item.day.substring(8)}}</span>
                <img v-if="item.hasEvent" src="./icon/dot.png" alt="">
              </dd>
            </li>
          </ul>
        </v-touch>
      </div>
    </div>
  </div>
</template>
<script>
  import {Group, Datetime} from 'vux';

  export default {
    name: 'WeekCalendar',
    components: {
      Group, Datetime,
    },
    props: {
      eventList: {
        type: Array,
        default: [],
      },
      timestamp: {  //当前时间的时间戳
        type: [String, Number],
//                default:0
      },
      currDate: {  //当前日期
        type: String,
//                default:''
      },
    },
    data() {
      return {
        monthData: [
          {
            title: '01月',
            value: '01',
          },
          {
            title: '02月',
            value: '02',
          },
          {
            title: '03月',
            value: '03',
          },
          {
            title: '04月',
            value: '04',
          },
          {
            title: '05月',
            value: '05',
          },
          {
            title: '06月',
            value: '06',
          },
          {
            title: '07月',
            value: '07',
          },
          {
            title: '08月',
            value: '08',
          },
          {
            title: '09月',
            value: '09',
          },
          {
            title: '10月',
            value: '10',
          },
          {
            title: '11月',
            value: '11',
          },
          {
            title: '12月',
            value: '12',
          },
        ],  //月份数组
        weekData: [
          {
            title: '日',
            value: '0',
          },
          {
            title: '一',
            value: '1',
          },
          {
            title: '二',
            value: '2',
          },
          {
            title: '三',
            value: '3',
          },
          {
            title: '四',
            value: '4',
          },
          {
            title: '五',
            value: '5',
          },
          {
            title: '六',
            value: '6',
          },
        ],   //周数组
        weekList: [],        //当前周数组
        prevWeekList: [],   //上一周数组
        nextWeekList: [],   //下一周数组
        index: 1,
        liW: 0,
        isToday: false,  //是否今天
        isWeekday: false,//是否周几
        today: '',      //今天
        weekday: '',   //今天周几
        month: '',     //当前几月
        year: '',      //当前年份
        showMonth: false,    //是否显示月份
        curDate: '',
        timetamp: 0,   //当前时间的时间戳
        selectDat: '', //选择的年月
      };
    },
    computed: {},
    watch: {
      /**
       * @function监听当前日期的时间戳，并获取对应信息
       *      wzx
       *   2018.12.04
       **/
      timestamp(val) {
        this.timetamp = val;
        this.year = this.$utils.DateUtils.formatTimeStamp(val).substring(0, 4);
        this.month = this.$utils.DateUtils.formatTimeStamp(val).substring(5, 7);
        this.today = this.$utils.DateUtils.formatTimeStamp(val);
        this.weekday = this.$utils.DateUtils.getWeekTimeStamp(val);
        this.getWeekList(val);
      },
    },
    methods: {
      /**
       * @function点击年或月份，显示月份下拉菜单
       *      wzx
       *   2019.01.14
       **/
      changeDate(val) {
        this.year = val.substring(0, 4);
        this.month = val.substring(5, 7);
        let nowDate = this.year + '-' + this.month + '-' + '01';
        this.timetamp = new Date(nowDate).getTime();   //获取当前天的时间戳
        this.weekday = this.$utils.DateUtils.getWeekTimeStamp(this.timetamp);   //定位当前天，增加dd的weekday样式
        this.getWeekList(this.timetamp);
        this.$emit('monthClick', nowDate);
      },
      /**
       * @function根据时间戳获取当前周日期数组、上一周日期数组、 下一周日期数组，并根据活动事件数组与周历对应
       *      wzx
       *   2018.12.04
       **/
      getWeekList(value) {
        this.weekList = [];
        this.prevWeekList = [];
        this.nextWeekList = [];
        // let timestamp=new Date(value).getTime();
        let c = new Date(value).getDay();   //必须为value的日期
        // let a = this.$utils.DateUtils.formatTimeStamp(value);    //获取当前几号
        // let b = this.$utils.DateUtils.getWeekTimeStamp(value);   //获取当前周几（中文格式）
        //获取当前周一周的时间戳，并根据一周时间戳返回一周的日期
        for (let i = 0; i < 7; i++) {
          let curWeek = value + (i - c) * 24 * 3600 * 1000;     //获取当前周几的时间戳
          let prevWeek = value + (i - c - 7) * 24 * 3600 * 1000;     //获取上一周几的时间戳
          let nextWeek = value + (i - c + 7) * 24 * 3600 * 1000;     //获取下一周几的时间戳
          this.weekList.push({
            day: this.$utils.DateUtils.formatTimeStamp(curWeek),
            week: this.$utils.DateUtils.getWeekTimeStamp(curWeek),
          });
          this.prevWeekList.push({
            day: this.$utils.DateUtils.formatTimeStamp(prevWeek),
            week: this.$utils.DateUtils.getWeekTimeStamp(prevWeek),
          });
          this.nextWeekList.push({
            day: this.$utils.DateUtils.formatTimeStamp(nextWeek),
            week: this.$utils.DateUtils.getWeekTimeStamp(nextWeek),
          });

          for (let j = 0; j < this.eventList.length; j++) {
            if (this.eventList[j] === this.weekList[i].day) {
              this.weekList[i].hasEvent = true;
            } else if (this.eventList[j] === this.prevWeekList[i].day) {
              this.prevWeekList[i].hasEvent = true;
            } else if (this.eventList[j] === this.nextWeekList[i].day) {
              this.nextWeekList[i].hasEvent = true;
            }
          }
        }
      },
      /**
       * @function点击某天
       *      wzx
       *   2018.12.04
       **/
      dayClick(value) {
//				console.log(7788,value)
        this.year = this.$utils.DateUtils.formatTimeStamp(value).substring(0, 4);
        this.month = this.$utils.DateUtils.formatTimeStamp(value).substring(5, 7);
        this.weekday = this.$utils.DateUtils.getWeekTimeStamp(value);
        this.timetamp = new Date(value).getTime(); //获取当前日期的时间戳，不是今天的时间戳
        this.$emit('dayClick', value);
      },
      /**
       * @function周历左滑功能，显示下一周数据
       *      wzx
       *   2018.12.04
       **/
      onSwipeLeft() {
        // console.log("左滑，显示下一周数据")
        this.index = 2;
        let container = this.$refs.container;
        container.style.transform = 'translateX(' + -this.index * this.liW + 'px)';
        container.style.webkitTransform = 'translateX(' + -this.index * this.liW + 'px)';
        container.style.transition = 'all 0.2s';
        container.style.webkitTransition = 'all 0.2s';  //兼容
        this.timetamp = this.timetamp + 24 * 3600 * 1000 * 7;
        this.getWeekList(this.timetamp);
        this.year = this.$utils.DateUtils.formatTimeStamp(this.timetamp).substring(0, 4);
        this.month = this.$utils.DateUtils.formatTimeStamp(this.timetamp).substring(5, 7);
        setTimeout(() => {
          this.index = 1;
          container.style.transform = 'translateX(' + -this.index * this.liW + 'px)';
          container.style.webkitTransform = 'translateX(' + -this.index * this.liW + 'px)';
          container.style.transition = 'all 0s';
          container.style.webkitTransition = 'all 0s';  //兼容
        }, 200);
      },
      /**
       * @function周历右滑功能，显示上一周数据
       *      wzx
       *   2018.12.04
       **/
      onSwipeRight() {
        // console.log("右滑，显示上一周数据")
        this.index = 0;
        let container = this.$refs.container;
        container.style.transform = 'translateX(' + this.index * this.liW + 'px)';
        container.style.webkitTransform = 'translateX(' + this.index * this.liW + 'px)';
        container.style.transition = 'all 0.2s';
        container.style.webkitTransition = 'all 0.2s';  //兼容
        this.timetamp = this.timetamp - 24 * 3600 * 1000 * 7;
        this.getWeekList(this.timetamp);
        this.year = this.$utils.DateUtils.formatTimeStamp(this.timetamp).substring(0, 4);
        this.month = this.$utils.DateUtils.formatTimeStamp(this.timetamp).substring(5, 7);
        setTimeout(() => {
          this.index = 1;
          container.style.transform = 'translateX(' + -this.index * this.liW + 'px)';
          container.style.webkitTransform = 'translateX(' + -this.index * this.liW + 'px)';
          container.style.transition = 'all 0s';
          container.style.webkitTransition = 'all 0s';  //兼容
        }, 200);
      },
    },
    mounted() {
      this.liW = $('.week-box li').width();
    },
  };
</script>
<style type="text/scss" lang="scss">
  .week-calendar {
    width: 100%;
    height: 100%;

    .date-box {
      width: 100%;
      height: 0.65rem;
      display: flex;
      flex-direction: row;
      position: relative;
      background: #fff;
      padding: 0.05rem 0;

      .month-box {
        flex-basis: 0.56rem;
        position: relative;

        .selectDate {
          width: 100%;
          height: 100%;
          position: absolute;
          top: 0;
          left: 0;
          z-index: 20;
          opacity: 0;

          .weui-cells {
            margin-top: 0 !important;
          }
        }

        dt {
          height: 0.3rem;
          font-size: 0.13rem;
          color: #529DFE;
          text-align: center;

          span {
            font-size: 0.2rem;
          }
        }

        dd {
          line-height: 0.14rem;
          height: 0.25rem;
          font-size: 0.13rem;
          text-align: center;
        }

        img {
          width: 0.08rem;
          height: 0.08rem;
          position: absolute;
          top: 0.03rem;
          right: -0.02rem;
        }
      }

      .slide-box {
        .month-list {
          width: 100%;
          height: 1.3rem;
          padding: 0.05rem 0;
          background: #fff;
          position: absolute;
          top: 0.7rem;
          left: 0;
          z-index: 100;
          border-top: 1px solid #e5e5e5;
          border-bottom: 1px solid #e5e5e5;

          ul {
            width: 100%;
            height: 100%;

            li {
              width: 25%;
              height: 0.4rem;
              float: left;
              text-align: center;
              line-height: 0.4rem;
              font-size: 0.13rem;

              &:active {
                background: #e5e5e5;
              }
            }
          }
        }
      }

      .weeks-box {
        flex: 1;
        overflow: hidden;

        ol {
          width: 100%;
          height: 0.2rem;
          display: flex;
          flex-direction: row;

          li {
            flex: 1;
            line-height: 0.2rem;
            font-size: 0.12rem;
            text-align: center;
          }
        }

        .day-box {
          width: 100%;
          height: 0.38rem;
          overflow: hidden;

          .week-box {
            width: 300%;
            height: 100%;
            -webkit-transform: translateX(-33.33%); //实现无缝（默认放第“2”张）
            transform: translateX(-33.33%);

            li {
              width: 33.33%;
              height: 100%;
              float: left;
              display: flex;
              flex-direction: row;

              dd {
                flex: 1;
                position: relative;

                span {
                  width: 0.3rem;
                  height: 0.3rem;
                  display: block;
                  margin: 0 auto;
                  line-height: 0.3rem;
                  font-size: 0.15rem;
                  text-align: center;
                  border-radius: 50%;
                  border: 1px solid #fff;
                }

                img {
                  width: 6px;
                  height: 6px;
                  display: block;
                  position: absolute;
                  bottom: 0;
                  left: 0;
                  right: 0;
                  margin: auto;
                }

                &.weekday {
                  span {
                    border: 1px solid #e5e5e5;
                  }
                }

                &.today {
                  span {
                    background: #3399FF;
                    color: #fff;
                    border: 1px solid #3399FF;
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

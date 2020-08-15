<template>
  <div class="meetingRoom-detail">
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
    <div class="info-box">
      <div class="title">{{roomName}}</div>
      <div class="device-boxs" v-if="deviceList.length>0">
        <grid :cols="4" :show-lr-borders="false" :show-vertical-dividers="false">
          <grid-item v-for="(device,index) in deviceList" :key="index" v-if="index < 7 || deviceList.length <= 8">
            <span class="grid-center">
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
              {{device.resourceName}}
            </span>
          </grid-item>
          <grid-item>
            <span class="grid-center" v-if="deviceList.length > 8">
              …
            </span>
          </grid-item>
        </grid>
      </div>
    </div>
    <div class="room-detail">
      <div class="meeting-list" v-if="!emptyShow">
        <div class="ml-left">
          <dd v-for="item in timeData">{{item}}</dd>
        </div>
        <div class="ml-right">
          <div
            :class="['order-box',item.meetState ===1?'going':(item.meetState ===0?'order':''),(item.isMy ===0 && item.meetingState ===2)?'my':'']"
            :style="'top:'+(item.curTop)+'rem'" v-for="item in meetingList">
            <div class="order-state" :style="'height:'+(item.curHeight)+'rem'"></div>
            <div class="order-detail">
              <div class="detail-box" @click="detailClick(item.bh)">
                <dt>{{ item.lname }}</dt>
                <dd>
                  <span>{{ item.kssj?(item.kssj).substring(11,16):'' }}—{{ item.jssj?(item.jssj).substring(11,16):'' }}</span>
                  <span v-if="item.meetState ===0">已预约</span>
                  <span v-else-if="item.meetState ===1">进行中</span>
                  <span v-else-if="item.meetState ===2">已结束</span>
                </dd>
              </div>
            </div>
            <div class="order-operate" v-if="item.orderState ===0 && item.meetState ===0">
              <!--orderState:是否可撤销 0:可撤销;1:不可撤销-->
              <div class="operate" @click="repealClick(item.bh)">撤销</div>
            </div>
          </div>
        </div>
      </div>
      <div class="empty-box" v-else>
        <Empty :show="emptyShow" :tip="emptyTip" v-show="emptyShow===true"></Empty>
      </div>
    </div>
    <div class="my-order" v-show="canOrder">
      <x-button type="primary" @click.native="orderClick">我要预约</x-button>
    </div>
    <div v-transfer-dom>
      <confirm v-model="showToast"
               title="操作提示"
               @on-cancel="onCancel"
               @on-confirm="onConfirm"
               @on-show="onShow"
               @on-hide="onHide">
        <p style="text-align:center;">确认要撤销吗？</p>
      </confirm>
    </div>
  </div>
</template>
<script>
  import WeekCalendar from '@/components/common/WeekCalendar/WeekCalendar.vue';
  import {Grid, GridItem, Confirm, XButton, TransferDomDirective as TransferDom} from 'vux';
  import Empty from '@/components/common/Empty/Empty';

  export default {
    name: 'MeetingRoomDetail',
    directives: {
      TransferDom,
    },
    components: {
      WeekCalendar, Confirm, XButton, Grid, GridItem, Empty,
    },
    data() {
      return {
        bh: '',  //会议室编号
        timestamp: 0,   //当前时间的时间戳
        eventList: ['2018-11-18', '2018-11-22', '2018-11-26', '2018-11-28', '2018-11-30', '2018-12-01', '2018-12-06'],       //活动/事件数组
        roomId: this.$utils.Store.getLocalItem('roomId') ? this.$utils.Store.getLocalItem('roomId') : '',    //会议室编号
        roomName: this.$utils.Store.getLocalItem('roomName') ? this.$utils.Store.getLocalItem('roomName') : '',    //会议室名称
        deviceList: [
          {
            deviceName: '投影仪',
            deviceBh: 'tyy',
          },
          {
            deviceName: '笔记本',
            deviceBh: 'bjb',
          },
          {
            deviceName: '音响',
            deviceBh: 'yx',
          },
          {
            deviceName: '麦克风',
            deviceBh: 'mkf',
          },
          {
            deviceName: '打印机',
            deviceBh: 'dyj',
          },
          {
            deviceName: '摄像头',
            deviceBh: 'sxt',
          },
          {
            deviceName: 'WiFi',
            deviceBh: 'wifi',
          },
        ],      //会议室设备数组
        timeData: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '24:00'],//时间数组
        meetingList: [   //会议室会议数组，meetingState--0：已结束；1：进行中；2：已预约  isMy--0:是我预约的;1:不是我预约的
        ],      //会议室会议数组
        showToast: false,        //是否显示弹窗
        emptyShow: false,        //是否显示空数据
        emptyTip: '本会议室当前无会议预约',
        canOrder: false,     //是否可以预约
        curTime: '', //当前时间
        ratio: 1,  //px与rem换算比率
        allLen: 0,
        allHeight: 0,
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
      getSysDate: function () {
        this.$utils.Tools.loadShow();
        this.$api.Sys.getSystemDate(this.$params.mode).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.currDate = data.sysDate.substring(0, 10);
            this.timestamp = this.$utils.DateUtils.getTimeStamp(data.sysDate) * 1000;
            this.canOrder = true;
            this.getListHeight();
            this.getRoomMeetingList(this.currDate);
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
        this.$utils.Tools.loadShow();
        this.$api.Meeting.getMyMeetingDateList({
          userSerial: this.$utils.Store.getItem('userSerial'),
        }).then(response => {
          this.$utils.Tools.loadHide();
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
       * @function获取当前日期下的会议列表
       *      wzx
       *   2019.01.22
       **/
      getRoomMeetingList(day) {
        this.$utils.Tools.loadShow();
        this.$api.Meeting.getRoomMeetingList({
          cdate: day,
          roomBh: this.roomId,
          userSerial: this.$utils.Store.getItem('userSerial'),
        }).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            if (data.length === 0) {
              this.meetingList = [];
              this.emptyShow = true;
            } else {
              this.meetingList = data;
              this.emptyShow = false;
              this.initTimeLine(data);
              let curIndex = this.meetingList.findIndex(this.fn);
              let stop = 0, curTop = 0;
              if (curIndex > 0) {
                stop = (this.meetingList[curIndex].curTop + 0.1) * this.ratio;
              } else {
                curTop = (this.$utils.DateUtils.getMinutesStamp(this.curTime.substring(11, 16))
                  - this.$utils.DateUtils.getMinutesStamp(this.timeData[0])) / this.allLen * this.allHeight;
                stop = (curTop + 0.1) * this.ratio;
              }
              setTimeout(function () {
                $('.room-detail').scrollTop(stop);
              }, 20);
            }
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      /**
       * @function获取当前会议下标
       *      wzx
       *   2019.03.13
       *   num代表当前项，numIndex代表当前项下标，nums代表该数组
       **/
      fn(num, numIndex, nums) {
        return num.kssj === this.curTime;
      },
      /**
       * @function获取当前页面比率
       *      wzx
       *   2019.03.13
       **/
      getRatio() {
        let sw = document.documentElement.clientWidth;
        if (sw > 640) {
          sw = 640;
        } else if (sw < 320) {
          sw = 320;
        }
        this.ratio = sw / 3.75;
      },
      monthClick(val) {
        // this.currDate = val;
        this.getRoomMeetingList(val);
      },
      dayClick(val) {
        // console.log(888,val)
        // this.currDate = val;
        if (val < this.currDate) {
          this.canOrder = false;
        } else {
          this.canOrder = true;
        }
        this.getListHeight();
        this.getRoomMeetingList(val);
      },
      detailClick(value) {
        let state = encodeURI(value);
        this.$router.push({name: 'MeetingDetail', params: {state: state}});
      },
      repealClick(val) {
        this.showToast = true;
        this.bh = val;
      },
      orderClick() {
        this.$router.push({
          name: 'MakeOrder',
          query: {
            roomId: this.$utils.Store.getLocalItem('roomId'),
            roomName: this.$utils.Store.getLocalItem('roomName'),
          },
        });
      },
      initTimeLine(data) {
        this.allLen = this.$utils.DateUtils.getMinutesStamp(this.timeData[this.timeData.length - 1])
          - this.$utils.DateUtils.getMinutesStamp(this.timeData[0]);   //获取时间轴总的时间差
        this.allHeight = (this.timeData.length - 1) * 0.6;   //获取时间轴总的长度
//	            console.log(2323,allLen,allHeight)
        for (let i = 0; i < data.length; i++) {
          let curHeight = this.$utils.DateUtils.getMinutesStamp(data[i].jssj.substring(11, 16))
            - this.$utils.DateUtils.getMinutesStamp(data[i].kssj.substring(11, 16));   //获取当前预约会议的时间差
          let curTop = this.$utils.DateUtils.getMinutesStamp(data[i].kssj.substring(11, 16))
            - this.$utils.DateUtils.getMinutesStamp(this.timeData[0]);          //获取当前预约会议的定位top的时间差
          let bili_height = curHeight / this.allLen * this.allHeight;
          let bili_top = curTop / this.allLen * this.allHeight;
          this.$set(this.meetingList[i], 'curHeight', bili_height);
          this.$set(this.meetingList[i], 'curTop', bili_top);
        }
        // console.log(5566,this.meetingList,)
      },
      onCancel() {
        // console.log('on cancel')
      },
      onConfirm(msg) {
        // console.log('on confirm')
        this.$api.Meeting.deleteMeetingOrder(this.bh, this.$utils.Store.getItem('userSerial'), '').then(response => {
          // console.log(2222,response)
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.getRoomMeetingList(this.currDate);
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      onHide() {
        // console.log('on hide')
      },
      onShow() {
        // console.log('on show')
      },
      getListHeight() {
        // console.log(34,this.canOrder)
        let apH = $('#app').height();
        let hbH = $('.header-box').height();
        let ibH = $('.info-box').height();
        if (this.canOrder) {
          let moH = $('.my-order').height();
          let rdH = apH - hbH - ibH - moH;
          $('.room-detail').height(rdH);
          // console.log(66,apH,hbH,ibH,moH,rdH)
        } else {
          let rdHs = apH - hbH - ibH;
          $('.room-detail').height(rdHs);
          // console.log(77,apH,hbH,ibH,rdHs)
        }
        // console.log(66,this.meetingList)
      },
    },
    created() {

    },
    mounted() {
      this.getSysDate();
      this.getMyMeetingDateList();
      this.getRatio();
      this.roomId = this.$route.query.roomId;
      this.roomName = this.$route.query.roomName;
      this.curTime = this.$route.query.curTime;
      this.deviceList = JSON.parse(this.$route.query.devices);
      this.$utils.Store.removeItem('curActive');
      this.$utils.Store.removeItem('meetingType');
    },
    destroyed() {

    },
  };
</script>
<style type="text/scss" lang="scss">
  .meetingRoom-detail {
    width: 100%;
    height: 100%;
    overflow: hidden;

    .header-box {
      height: 0.65rem;
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

    .info-box {
      width: 100%;
      height: auto;
      background: #fff;
      border-bottom: 1px solid #e5e5e5;

      .title {
        width: 100%;
        height: 0.3rem;
        font-size: 0.2rem;
        text-align: center;
      }

      .device-boxs {
        width: 100%;
        height: 0.5rem;
        padding: 0.05rem 1%;

        .weui-grids {
          &:before {
            display: none;
          }

          .weui-grid {
            height: 0.22rem;
            margin: 0;
            padding: 0;

            &:after {
              display: none;
            }

            .grid-center {
              width: 96%;
              height: 0.2rem;
              display: block;
              font-size: 0.12rem;
              background: #3399FF;
              border-radius: 0.1rem;
              color: #fff;
              text-align: left;
              padding-left: 0.05rem;

              i {
                font-size: 0.15rem;
                position: relative;

                &:before {
                  position: relative;
                  top: 0.01rem;
                }
              }
            }
          }
        }
      }
    }

    .room-detail {
      height: auto;
      padding: 0 0.05rem;
      overflow-y: scroll;

      .meeting-list {
        width: 100%;
        display: flex;
        flex-direction: row;
        /*border-top: 1px solid #e5e5e5;*/
        padding: 0.1rem 0;

        .ml-left {
          flex-basis: 0.7rem;
          border-right: 1px solid #e5e5e5;
          padding-right: 0.08rem;

          dd {
            font-size: 0.13rem;
            color: #333;
            height: 0.6rem;
            text-align: center;
          }
        }

        .ml-right {
          flex: 1;
          position: relative;

          .order-box {
            width: 100%;
            display: flex;
            flex-direction: row;
            position: absolute;
            left: -4px;

            .order-state {
              height: 100%;
              flex-basis: 0.07rem;
              background: #CCCCCC;
              border-radius: 0.07rem;
            }

            .order-detail {
              flex: 1;
              margin-left: 0.1rem;
              position: relative;

              .detail-box {
                width: 100%;
                height: 0.5rem;
                position: absolute;
                top: 0;
                bottom: 0;
                margin: auto;
                padding: 0.07rem 0.1rem;

                dt {
                  font-size: 0.13rem;
                  /*margin-bottom: 0.05rem;*/
                  color: #AFAFAF;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                }

                dd {
                  font-size: 0.12rem;
                  color: #AFAFAF;

                  span {
                    margin-right: 0.3rem;
                  }
                }
              }
            }

            .order-operate {
              flex-basis: 0.6rem;
              position: relative;

              .operate {
                width: 100%;
                height: 0.3rem;
                position: absolute;
                top: 0;
                bottom: 0;
                margin: auto;
                background: #FF6600;
                color: #fff;
                line-height: 0.3rem;
                text-align: center;
                font-size: 0.14rem;
              }
            }

            &.going {
              .order-state {
                background: #3399FF;
              }

              .order-detail {
                .detail-box {
                  dt {
                    color: #333333;
                  }
                }
              }
            }

            &.order {
              .order-state {
                background: #00CC66;
              }

              .order-detail {
                .detail-box {
                  dt {
                    color: #333333;
                  }
                }
              }
            }

            &.my {
              .order-detail {
                .detail-box {
                  background: #F5F5F5;

                  &:before {
                    width: 0;
                    height: 0;
                    content: "";
                    position: absolute;
                    left: -0.06rem;
                    top: 0;
                    bottom: 0;
                    margin: auto;
                    border-right: 0.06rem solid #F5F5F5;
                    border-top: 0.06rem solid transparent;
                    border-bottom: 0.06rem solid transparent;
                  }
                }
              }
            }
          }
        }
      }

      .empty-box {
        width: 100%;
        height: auto;
        float: left;

        .empty-wrap {
          p {
            margin-top: 0.2rem;
            font-size: 0.13rem;
          }
        }
      }
    }

    .my-order {
      width: 100%;
      height: 0.8rem;
      background: #fff;

      .weui-btn {
        width: 80%;
        height: 0.4rem;
        margin: 0.2rem auto;
        font-size: 0.18rem;
      }
    }
  }
</style>

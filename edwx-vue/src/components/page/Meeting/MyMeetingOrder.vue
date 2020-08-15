<template>
  <div class="my-meeting-order">
    <tab class="my-meeting-order-title">
      <tab-item :selected="active === index" v-for="(item,index) in tabData" :key="index"
                @on-item-click="onItemClick(index)">{{item.title}}
      </tab-item>
    </tab>
    <scroll :pullup-padding-bottom="0" :pullUpLoad="pullUpLoad" @pullingUp="onPullingUp"
            :pullDownRefresh="pullDownRefresh"
            @pullingDown="onPullingDown" :empty-show="emptyShow" ref="scroll" style="padding-top: 0.44rem">
      <group :gutter="0">
        <cell :title="item" v-for="(item, index) in meetingList" :key="index" @click.native="itemClick(item.bh)">
          <div slot="title" class="data-list">
            <p><span>会议主题：</span><span>{{item.lname}}</span></p>
            <p><span>会议地点：</span><span>{{item.roomName}}</span></p>
            <p><span>会议时间：</span><span>{{item.kssj}}</span></p>
          </div>
          <i class="iconfont icon-shenhezhong check" v-if="active === 0 && item.approveState === 1"></i>
          <i class="iconfont icon-tongguo agree" v-else-if="active === 0 && item.approveState === 2"></i>
          <i class="iconfont icon-bohui refuse" v-else-if="active === 0 && item.approveState === 3"></i>

          <i class="iconfont icon-daishenpi check" v-if="active === 1 && item.approveState === 0"></i>
          <i class="iconfont icon-yitongguo agree" v-else-if="active === 1 && item.approveState === 1"></i>
          <i class="iconfont icon-yijujue refuse" v-else-if="active === 1 && item.approveState === 2"></i>
        </cell>
      </group>
    </scroll>
  </div>
</template>
<script>
  import WeekCalendar from '@/components/common/WeekCalendar/WeekCalendar.vue';
  import Scroll from '../../common/Scroll/Scroll';
  import {Tab, TabItem, Group, Cell} from 'vux';

  export default {
    name: 'MyMeetingOrder',
    components: {
      Tab, TabItem, WeekCalendar, Group, Cell, Scroll,
    },
    data() {
      return {
        timestamp: 0,   //当前时间的时间戳
        eventList: [],       //活动/事件数组
        meetingType: this.$utils.Store.getItem('meetingType') ? this.$utils.Store.getItem('meetingType') : 0,  //0:未开始;2:已结束;不传为全部;
        tabData: [
          {
            title: '我申请的',
          },
          {
            title: '我审批的',
          },
          {
            title: '我参与的',
          },
        ],
        active: this.$utils.Store.getItem('curActive') ? +this.$utils.Store.getItem('curActive') : 0,
        meetingList: [],//meetingState--0：已结束；1：进行中；2：已预约
        curMonth: '',//当前年月
        emptyShow: false,
        emptyTip: '暂无会议预约',
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
      };
    },
    computed: {},
    methods: {
      onPullingDown: function () {
        if (this.isPullDown) return;
        this.isPullDown = true; // 下拉刷新
        this.meetingList = [];
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
            this.getInfoList();
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      getInfoList: async function () {
        this.$utils.Tools.loadShow();
        this.emptyShow = false;
        let params = {
          pageIndex: this.pageIndex,
          pageSize: this.pageSize,
          search: {
            appointment: this.$utils.Store.getItem('userSerial'),
          },
        };

        let response;
        if (this.active === 0) {
          response = await this.$api.Meeting.selectMySubmit(params);
        } else if (this.active === 1) {
          response = await this.$api.Meeting.selectMyApprove(params);
        } else {
          response = await this.$api.Meeting.selectMyCopy(params);
        }
        this.$utils.Tools.loadHide();
        const {code, msg, data} = response;
        if (+code !== this.$code.success) {
          this.$utils.Tools.toastShow(msg);
          this.updateScroll(false);
        } else {
          this.meetingList.push(...data.records);
          this.pageIndex = data.pageIndex;
          this.totalPage = data.totalPage;
          if (this.meetingList.length === 0) {
            this.emptyShow = true;
          }
          this.updateScroll(false);
        }
      },
      /**
       * @function点击获取当前日期下的已预约或者已结束的会议列表
       *      wzx
       *   2019.01.29
       **/
      onItemClick(index) {
        this.pageIndex = 1;
        this.active = index;
        this.$utils.Store.setItem('curActive', this.active);
        this.meetingList = [];
        this.getInfoList();
      },
      itemClick(value) {
        let state = encodeURI(value);
        this.$router.push({name: 'MeetingDetail', params: {state: state}});
      },
    },
    created() {
      this.$utils.Store.setItem('curActive', '0');
      this.getSysDate();
    },
    mounted() {

    },
    destroyed() {

    },
  };
</script>
<style type="text/scss" lang="scss">
  .my-meeting-order {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    .my-meeting-order-title {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 100;
      width: 100%
    }

    .data-list {
      padding: 0.05rem 0;
      font-size: 0.14rem;

      p {
        line-height: 0.25rem;
      }
    }

    i {
      position: absolute;
      top: -0.04rem;
      right: 0;
      font-size: 0.6rem;

      &.check {
        color: #3399FF;
      }

      &.agree {
        color: #00CC66;
      }

      &.refuse {
        color: #FF3333;
      }

      &.repeal {
        color: #CCCCCC;
      }
    }
  }
</style>

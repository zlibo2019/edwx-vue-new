<template>
  <div class="make-order">
    <group class="order-boxs" label-width="6.5em" label-margin-right="1em">
      <x-input title="会议主题" v-model="meetingTheme" text-align="right" placeholder="请输入会议主题"
               @on-change="getTheme"></x-input>
      <cell title="会议地点" :value="roomName" value-align="left">{{ roomName }}</cell>
      <datetime title="开始时间" v-model="kssj" format="YYYY-MM-DD HH:mm" :start-date="startDate" :min-hour=minHour
                :max-hour=23
                :minute-list="minuteList" placeholder="选择时间" @on-change="changeStartTime"></datetime>
      <datetime title="结束时间" v-model="jssj" format="YYYY-MM-DD HH:mm" :start-date="startDate" :min-hour=minHour
                :max-hour=23 :minute-list="minuteList" placeholder="选择时间" @on-change="changeEndTime"></datetime>
      <popup-picker title="入场准备时间" :data="timeList" v-model="prepareTime" :columns="1" :show-name="true"
                    @on-show="onShow" @on-hide="onHide" @on-change="prepareChange" placeholder="请选择准备时长"></popup-picker>
      <popup-picker title="退场清理时间" :data="timeList" v-model="cleanTime" :columns="1" :show-name="true" @on-show="onShow"
                    @on-hide="onHide" @on-change="cleanChange" placeholder="请选择清理时长"></popup-picker>
      <x-input class="real-box" title="会议实际时间" v-model="realTime" text-align="right" v-if="showReal" disabled></x-input>
      <!--<cell title="会议提醒" value-align="left">
          <x-switch title="开启将进行会议提醒" v-model="schedNotice" :value-map="[0,1]"></x-switch>&lt;!&ndash; @on-change="setWxNotice"&ndash;&gt;
      </cell>-->
    </group>
    <div class="select-box copy-box">
      <group>
        <cell title="参会人员" value-align="left">
          <x-switch title="抄送与会人" v-model="wxNotice" :value-map="[0,1]"></x-switch>
        </cell>
      </group>
      <div class="man-box custom">
        <dl v-for="(man,index) in customer" :key="index">
          <dt>
            <i class="iconfont icon-touxiang"></i>
            <i class="iconfont icon-close" @click="deleteCustomer(index)"></i>
          </dt>
          <dd>{{man.userName}}</dd>
        </dl>
        <x-button mini plain @click.native="chooseCopyer">+</x-button>
      </div>
    </div>
    <div class="select-box approver" v-if="approverState">
      <p><span>审批人</span></p>
      <div class="man-box">
        <dl v-for="(man,index) in approver" :key="index">
          <dt>
            <i class="iconfont icon-touxiang"></i>
            <i class="iconfont icon-close" @click="deleteApprover(index)"></i>
          </dt>
          <dd>{{man.userName}}</dd>
          <i class="iconfont icon-youjiantou"></i>
        </dl>
        <x-button mini plain @click.native="chooseApprover" v-if="approver.length<10">+</x-button>
      </div>
    </div>
    <div class="my-operate">
      <x-button :class="isDisabled?'disabled':''" type="primary" :disabled="isDisabled" @click.native="submitClick">提交
      </x-button>
    </div>
    <OrgTree v-model="showFlag" :selectType="selectType" dep-name="默认公司" dep-serial="10000" :info-checked="infoChecked"
             @onSelect="selectUsers"></OrgTree>
    <popup v-model="approverFlag">
      <popup-header
        left-text="取消"
        right-text="确定"
        title="选择审批人"
        :show-bottom-border="false"
        @on-click-left="approverFlag = false"
        @on-click-right="confirmApprover"></popup-header>
      <picker :data='approverList' v-model='approverSelect'></picker>
    </popup>
  </div>
</template>

<script>
  import {
    Group,
    Cell,
    XInput,
    PopupPicker,
    Datetime,
    XTextarea,
    XSwitch,
    XButton,
    Popup,
    Picker,
    PopupHeader,
  } from 'vux';
  import OrgTree from '@/components/common/OrgTree/OrgTree';

  export default {
    name: 'MakeOrder',
    components: {
      Group, Cell, XInput, PopupPicker, Datetime, OrgTree, XTextarea, XSwitch, XButton, Popup, Picker, PopupHeader,
    },
    beforeRouteLeave(to, from, next) {
      if (to.name !== 'OrgTree') {
        // console.log(888888)
        this.$utils.Store.removeItem('kssj');
        this.$utils.Store.removeItem('jssj');
        this.$utils.Store.removeItem('meetingTheme');
      }
      next();
    },
    data() {
      return {
        roomId: this.$utils.Store.getLocalItem('roomId') ? this.$utils.Store.getLocalItem('roomId') : '',    //会议室编号
        roomName: this.$utils.Store.getLocalItem('roomName') ? this.$utils.Store.getLocalItem('roomName') : '',    //会议室名称
        meetingTheme: this.$utils.Store.getItem('meetingTheme') ? this.$utils.Store.getItem('meetingTheme') : '',     //会议主题
        startDate: '',   //开始日期
        endDate: '',     //截止日期
        kssj: this.$utils.Store.getItem('kssj') ? this.$utils.Store.getItem('kssj') : '',   //开始时间
        jssj: this.$utils.Store.getItem('jssj') ? this.$utils.Store.getItem('jssj') : '',   //结束时间
        minuteList: ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'],  //定义分钟列表
        minHour: 0,
        approver: this.$utils.Store.getItem('oldVal') ? JSON.parse(this.$utils.Store.getItem('oldVal')) : [],    //审批人
        copyer: [],  //固定抄送人数组
        customer: [],  //自定义抄送人数组
        copyerChecked: [],  //抄送人序号
        limitNum: 5,     //最多上传图片张数
        approverString: '', //审批人序号--字符串
        customerString: '', //抄送人序号--字符串
        depSerial: this.$utils.Store.getItem('orgId'),    //企业ID
        depName: this.$utils.Store.getItem('orgName'),    //企业名称
        choose: this.$utils.Store.getItem('choose') ? this.$utils.Store.getItem('choose') : 0,   //添加人员类型   1：审批人  2：抄送人  3：同行人
        bh: '',  //会议编号
        infoChecked: [], //
        approverChecked: [], //审批人选中
        customerChecked: [], //自定义抄送人选中
        selectType: 0,   //组织架构选择类型
        showFlag: false, //是否显示组织架构弹窗
        schedNotice: 0, //是否开启日程提醒  0：不提醒   1：提醒
        wxNotice: 0, //是否发送消息给参会人员  0：不发送  1：发送
        timeList: [
          {
            name: '0分钟',
            value: '0',
          },
          {
            name: '5分钟',
            value: '5',
          },
          {
            name: '10分钟',
            value: '10',
          },
          {
            name: '15分钟',
            value: '15',
          },
          {
            name: '20分钟',
            value: '20',
          },
          {
            name: '25分钟',
            value: '25',
          },
          {
            name: '30分钟',
            value: '30',
          },
        ],  //时间分钟数组
        prepareTime: 0,  //会议准备时间
        cleanTime: 0,  //会议清理时间
        realTime: '',    //实际会议时间
        curTime: '',   //当前时间
        approverFlag: false,
        approverList: [[{name: '', value: ''}]],
        approverSelect: [],
        approverState: false,
      };
    },
    computed: {
      isDisabled() {
        return !(this.kssj !== '' && this.jssj !== '' && this.meetingTheme !== '');
      },
      infoChecked() {
        if (this.selectType === 1 && this.approverChecked.length > 0) {
          return this.approverChecked;
        } else if (this.selectType === 9999 && this.customerChecked.length > 0) {
          return this.customerChecked;
        }
      },
      showReal() {             //是否显示实际会议时间
        if (this.kssj !== '' && this.jssj !== '') {
          this.realTime = this.$utils.DateUtils.subtractMinuteTime(this.kssj, parseInt(this.prepareTime)) + '至' + this.$utils.DateUtils.addMinuteTime(this.jssj, parseInt(this.cleanTime));
          return true;
        } else {
          return false;
        }
      },
    },
    watch: {
      prepareTime() {  //监听入场准备时间发生变化后的实际会议时间
        this.realTime = this.$utils.DateUtils.subtractMinuteTime(this.kssj, parseInt(this.prepareTime)) + '至' + this.$utils.DateUtils.addMinuteTime(this.jssj, parseInt(this.cleanTime));
      },
      cleanTime() { //监听退场清理时间发生变化后的实际会议时间
        this.realTime = this.$utils.DateUtils.subtractMinuteTime(this.kssj, parseInt(this.prepareTime)) + '至' + this.$utils.DateUtils.addMinuteTime(this.jssj, parseInt(this.cleanTime));
      },
      kssj() {
        if (this.kssj.substring(0, 10) > this.startDate) {
          // alert(12)
          this.minHour = 8;
        }
      },
    },
    methods: {
      /** function 获取服务器时间---今日日期
       *   wzx
       *   2019-01-11
       **/
      getSysDate() {
        this.$utils.Tools.loadShow();
        this.$api.Sys.getSystemDate(this.$params.mode).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.startDate = data.sysDate.substring(0, 10);
            this.curTime = data.sysDate;
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      /** function 获取目的地
       *   wzx
       *   2019-01-05
       **/
      getTheme(val) {
        this.meetingTheme = val;
        this.$utils.Store.setItem('meetingTheme', val);
      },
      /** function 获取外出开始时间
       *   wzx
       *   2019-01-05
       **/
      changeStartTime(val) {
        this.kssj = val;
        this.$utils.Store.setItem('kssj', val);
      },
      /** function 获取外出结束时间
       *   wzx
       *   2019-01-05
       **/
      changeEndTime(val) {
        this.jssj = val;
        this.$utils.Store.setItem('jssj', val);
      },
      /** function 获取外出事由
       *   wzx
       *   2019-01-05
       **/
      getReason(val) {
        this.reason = val;
        this.$utils.Store.setItem('reason', val);
      },
      prepareChange(val) {
        this.prepareTime = val;
      },
      cleanChange(val) {
        this.cleanTime = val;
      },
      onChange(val) {
      },
      onShow() {
      },
      onHide(type) {
      },
      /** function 获取审批人数组
       *   wzx
       *   2018-12-26
       * */
      selectUsers(val) {
        // console.log(6868,val)
        if (this.selectType === 1) {
          if (this.$utils.Store.getItem('oldVal')) {
            if (val[0].userSerial === JSON.parse(this.$utils.Store.getItem('oldVal')).userSerial) {
              this.$utils.Tools.toastShow('相邻审批人不能为同一个人');
            } else {
              this.$utils.Store.setItem('oldVal', JSON.stringify(val[0]));
              this.approver.push(...val);
            }
          } else {
            this.$utils.Store.setItem('oldVal', JSON.stringify(val[0]));
            this.approver.push(...val);
          }
        } else {
          if (this.customer.length > 0) {
            this.customer = [];
            this.customer.push(...val);
            let hash = {};
            /*es6数组去重*/
            const newArr = this.customer.reduceRight((item, next) => {
              hash[next.userSerial] ? '' : hash[next.userSerial] = true && item.push(next);
              return item;
            }, []);
            this.customer = newArr;
            for (const b of this.customer) {
              this.customerChecked.push(b.userSerial);
            }
          } else {
            this.customer.push(...val);
            for (const b of this.customer) {
              this.customerChecked.push(b.userSerial);
            }
          }
        }
      },
      selectApprovalUser() {
        this.$utils.Tools.loadShow();
        this.$api.Approver.selectApprovalUser({
          userSerial: this.$utils.Store.getItem('userSerial'),
        }).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.approver = [];
            this.approver.push(...data);
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      /** function 删除审批人
       *   wzx
       *   2018-12-28
       * */
      deleteApprover(index) {
        this.approver.splice(index, 1);
        this.$utils.Store.setItem('oldVal', JSON.stringify(this.approver));
      },
      /** function 删除自定义抄送人
       *   wzx
       *   2019-01-04
       * */
      deleteCustomer(index) {
        this.customer.splice(index, 1);
      },
      /** function 添加审批人
       *   wzx
       *   2018-12-29
       * */
      chooseApprover() {       //copyType----1:请假2:出差 3:外出 4:加班 5:调班6:补出勤  choose---1:审批人 2：抄送人  3：同行人
        this.approverFlag = true;
        // this.infoChecked = [];
        // this.selectType = 1;
        // this.showFlag = true;
      },
      /** function 添加抄送人
       *   wzx
       *   2018-12-29
       * */
      chooseCopyer() {       //copyType----1:请假 2:出差 3:外出 4:加班 5:调班6:补出勤  choose---1:审批人 2：抄送人  3：同行人
        this.infoChecked = [];
        this.selectType = 9999;
        this.showFlag = true;
        for (const b of this.customer) {
          this.infoChecked.push(b.userSerial);
        }
      },
      /** function 提交会议预约申请
       *   wzx
       *   2019-02-13
       **/
      submitClick() {
        if (this.kssj < this.curTime) {
          this.$utils.Tools.toastShow('预约时间必须大于当前时间！');
        } else if (this.kssj >= this.jssj) {
          this.$utils.Tools.toastShow('结束时间必须大于开始时间！');
        } else {
          if (this.kssj.substring(0, 10) !== this.jssj.substring(0, 10)) {
            this.$utils.Tools.toastShow('会议不可跨天预约！');
            return;
          }
          if (this.approverState && this.approver.length === 0) {
            this.$utils.Tools.toastShow('请选择审批人！');
            return;
          }
          this.approverChecked = [];
          this.imgPath = [];
          for (const i of this.approver) {
            this.approverChecked.push(i.userSerial);
          }
          let myapprover = JSON.stringify(this.approverChecked).replace(/\[|]|"/g, '');
          this.approverString = myapprover;
          let mycopyer = JSON.stringify(this.customerChecked).replace(/\[|]|"/g, '');
          this.customerString = mycopyer;
          this.$api.Meeting.insertMeetingOrder({
            appointment: this.$utils.Store.getItem('userNo'),
            roomSerial: this.roomId,
            lname: this.meetingTheme,
            kssj: this.kssj + ':00',
            jssj: this.jssj + ':00',
            jsqdsj: parseInt(this.cleanTime),
            wxNotice: this.wxNotice,
            schedNotice: this.schedNotice,
            meetApprovalsStr: myapprover,
            meetUsersStr: mycopyer,
          }).then(response => {
            this.$utils.Tools.loadHide();
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg);
            } else {
              let state = encodeURI(data.bh);
              this.$router.replace({name: 'MeetingDetail', params: {state: state}});
            }
          }).catch(err => {
            this.$utils.Tools.httpError();
          });
        }
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
      getApproveList() {
        this.$api.Meeting.getApproveList({
          roomSerial: this.roomId,
          lx: '2',
        }).then(response => {
          this.approverList = [[]];
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            if (data && data.length > 0) {
              for (const item of data) {
                this.approverList[0].push({name: item.userLname, value: item.userSerial});
              }
            }
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      confirmApprover() {
        let temp = this.approverList[0].filter(item => {
          return +item.value === +this.approverSelect[0];
        });
        let val = [];
        for (const item of temp) {
          val.push({userName: item.name, userSerial: item.value});
        }

        if (this.$utils.Store.getItem('oldVal')) {
          let approvers = JSON.parse(this.$utils.Store.getItem('oldVal'));
          if (approvers && approvers.length > 0 && val[0].userSerial === +approvers[approvers.length - 1].userSerial) {
            this.$utils.Tools.toastShow('相邻审批人不能为同一个人');
          } else {
            this.approver.push(...val);
            this.$utils.Store.setItem('oldVal', JSON.stringify(this.approver));
          }
        } else {
          this.approver.push(...val);
          this.$utils.Store.setItem('oldVal', JSON.stringify(this.approver));
        }
        this.approverFlag = false;
      },
      selectTkqRoomInfo() {
        this.$api.Meeting.selectTkqRoomInfo(this.roomId).then(response => {
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            if (data.sp === 1) {
              this.getApproveList();
            }
            this.approverState = data.sp === 1;
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
    },
    created() {

    },
    mounted() {
      this.$utils.Store.removeItem('oldVal');
      this.getSysDate();
      this.selectTkqRoomInfo();
      // this.selectApprovalUser();
      // this.selectCopyUser();
    },
    destroyed() {
      this.$utils.Store.removeItem('oldVal');
      this.$utils.Store.removeItem('approver');
      this.$utils.Store.removeItem('copyer');
      this.$utils.Store.removeItem('customer');
    },
  };
</script>

<style type="text/scss" lang="scss">
  .make-order {
    width: 100%;
    height: 100%;
    overflow: auto;
    padding-bottom: 0.62rem;


    .order-boxs {
      .weui-cells {
        margin: 0 !important;

        .weui-cell {
          height: 0.5rem;
          padding-left: 0.3rem;
          position: relative;

          &:after {
            width: 0.2rem;
            height: 0.5rem;
            content: "*";
            position: absolute;
            top: 0.15rem;
            left: 0.15rem;
            font-size: 0.2rem;
            color: red;
            border: none;
            transform: scaleY(1);
          }

          .vux-cell-primary {
            text-align: right;

            .vux-x-switch {
              padding: 0;

              .weui-cell__bd {
                .weui-label {
                  float: right;
                  padding-right: 0.1rem;
                }
              }

              &:after {
                display: none;
              }
            }
          }

          &.reason {
            height: auto;
            min-height: 1rem;
            padding: 0.1rem 0.2rem 0.1rem 0.3rem;
            overflow-y: scroll;

            &:after {
              top: 0.1rem;
            }

            .weui-cell__bd {
              height: 0.6rem;

              textarea {
                height: 0.6rem;
                line-height: 0.2rem;
                /*font-size: 0.13rem;*/
              }
            }
          }
        }

        .vux-datetime {
          > div {
            p {
              color: #999;
            }
          }

          .vux-cell-primary {
            .vux-cell-value {
              color: #333;
            }
          }
        }

        .vux-tap-active {
          &:after {
            display: none;
          }
        }

        .real-box {
          font-size: 0.12rem;

          .weui-cell__primary {
            input {
              font-size: 0.12rem !important;
            }
          }

          &:after {
            display: none;
          }
        }
      }
    }

    .select-box {
      width: 100%;
      height: auto;
      padding: 0.1rem 0.2rem 0.02rem 0.15rem;
      border-top: 10px solid #F4F5F9;
      background: #fff;
      position: relative;

      &.approver {
        .man-box {
          padding: 0.15rem 0 0 0.05rem;

          dl {
            position: relative;

            i.icon-youjiantou {
              font-size: 0.15rem;
              position: absolute;
              top: 0.15rem;
              left: 0.4rem;
              margin: auto;
              color: #D2D5DD;
            }

            &:last-of-type {
              i.icon-youjiantou {
                display: none;
              }
            }
          }
        }
      }

      &.copy-box {
        padding: 0;

        .vux-label {
          font-size: 0.14rem;
          color: #666666;
        }

        &:before {
          content: "";
        }

        > div {
          .weui-cells {
            margin: 0 !important;

            &:after {
              border: none;
            }

            .weui-cell {
              .vux-x-switch {
                padding-right: 0;

                .weui-cell__bd {
                  .weui-label {
                    float: right;
                  }
                }
              }
            }
          }
        }

        .custom {
          padding: 0.05rem 0.2rem 0.05rem 0.2rem;
        }
      }

      > p {
        font-size: 0.12rem;
        line-height: 0.2rem;
        color: #A7A9A8;

        span {
          font-size: 0.14rem;
          margin-right: 0.1rem;
          color: #666;
        }
      }

      .man-box {
        width: 100%;
        height: auto;
        min-height: 0.6rem;
        overflow: hidden;
        padding: 0.05rem 0;

        p {
          font-size: 0.13rem;
          line-height: 0.3rem;
        }

        dl {
          width: 0.6rem;
          height: 0.65rem;
          float: left;
          text-align: center;
          margin-right: 0.05rem;
          margin-bottom: 0.06rem;

          dt {
            position: relative;

            i {
              font-size: 0.4rem;
              width: 0.4rem;
              display: block;
              color: #ccc;

              &.icon-close {
                position: absolute;
                top: -0.02rem;
                right: 0.05rem;
                font-size: 0.18rem;
                color: red;
              }
            }
          }

          dd {
            width: 0.4rem;
            height: 0.2rem;
            font-size: 0.12rem;
            line-height: 0.2rem;
            overflow: hidden;
          }
        }

        .weui-btn_mini {
          width: 0.4rem;
          height: 0.4rem;
          padding: 0;
          background: #3399ff;
          text-align: center;
          line-height: 0.4rem;
          font-size: 0.3rem;
          color: #fff;
          border-radius: 50%;
          border: none;
          float: left;
          box-shadow: 0 2px 8px 2px rgba(51, 153, 255, .3);
        }
      }
    }

    .my-operate {
      width: 100%;
      height: 0.62rem;
      padding: 0.1rem 0;
      background: #fff;
      position: fixed;
      bottom: 0;
      left: 0;
      z-index: 30;
      border-top: 1px solid #e5e5e5;

      .weui-btn {
        width: 80%;
        font-size: 0.18rem;

        &.disabled {
          background: #A2A2A2;
        }
      }
    }
  }
</style>

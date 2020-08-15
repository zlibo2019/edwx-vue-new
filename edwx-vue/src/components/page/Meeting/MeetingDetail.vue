<template>
  <div class="meeting-detail"
       :style="{paddingBottom: (meeting.appointment === userNo && curActive !== 2 && meeting.approveState === 2
         && meeting.orderState === 0 && meeting.meetState === 0)
         || (approveFlag && approveFlag.approveState === 0 && curActive !== 0 && curActive !== 2 && meeting.approveState === 1)?'0.62rem':'0'}">
    <div class="meeting-title">
      <h3>{{ meeting.lname }}</h3>
      <dl>
        <dt>
          <i class="iconfont icon-shijian"></i>
          <span>{{ meeting.kssj?meeting.kssj.substring(0, 16):'' }}</span>
        </dt>
        <dd v-if="meeting.approveState === 2">
          <span class="over" v-if="meeting.meetState === 0">未开始</span>
          <span class="going" v-else-if="meeting.meetState === 1">进行中</span>
          <span class="order" v-else-if="meeting.meetState === 2">已结束</span>
        </dd>
      </dl>
    </div>
    <div class="detail-box">
      <div class="meeting-address">
        <p>会议地点</p>
        <div class="detail">{{ meeting.roomName }}</div>
      </div>
      <div class="meeting-men">
        <p>参会签到人员</p>
        <div class="detail">
          <dl v-for="item in meeting.meetUsers">
            <dt><i class="iconfont icon-touxiang"></i></dt>
            <dd>{{ item.userLname }}</dd>
          </dl>
        </div>
      </div>
      <div class="meeting-approve" v-if="(meeting.appointment === userNo && curActive !== 2) || approveFlag">
        <i class="iconfont icon-my"></i>
        <dl>
          <dt>{{meeting.userLname}}
            <span>发起请求</span>
          </dt>
          <dd>{{meeting.sj}}</dd>
        </dl>
      </div>
      <div v-for="(item, index) in meeting.list" :key="index" class="meeting-approve"
           v-if="(meeting.appointment === userNo && curActive !== 2) || approveFlag">
        <i class="iconfont icon-my"></i>
        <dl>
          <dt>{{item.userLname}}
            <span v-if="item.spFlag === 0" class="check">待审核</span>
            <span v-else-if="item.spJg === 1" class="agree">已通过</span>
            <span v-else class="refuse">已拒绝</span>
          </dt>
          <dd>{{meeting.sj}}</dd>
          <dd v-if="item.spYj">审批意见：{{item.spYj}}</dd>
        </dl>
      </div>
    </div>

    <div class="operate-box"
         v-if="meeting.appointment === userNo && curActive !== 2 && meeting.approveState === 2
         && meeting.orderState === 0 && meeting.meetState === 0">
      <x-button type="primary" @click.native="repealClick">撤销</x-button>
      <!--orderState 0:可撤销 1：不可撤销-->
    </div>
    <div class="operate-box"
         v-if="approveFlag && approveFlag.approveState === 0 && curActive !== 0 && curActive !== 2 && meeting.approveState === 1">
      <div>
        <x-button type="primary" @click.native="approveClick(2)">拒绝</x-button>
      </div>
      <div>
        <x-button type="primary" @click.native="approveClick(1)">通过</x-button>
      </div>
    </div>
    <div v-transfer-dom>
      <confirm v-model="showRepeal"
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
  import {
    XButton, Confirm, TransferDomDirective as TransferDom,
  } from 'vux';

  export default {
    name: 'MeetingDetail',
    directives: {
      TransferDom,
    },
    components: {
      XButton, Confirm,
    },
    data() {
      return {
        meeting: {}, //
        bh: '',  //会议编号
        showRepeal: false,        //是否显示撤销弹窗
        curActive: null,
        userNo: null,
        approveFlag: null,
      };
    },
    computed: {},
    methods: {
      /**
       *  function获取会议详情接口
       *  @wzx
       *  @2018-01-29
       **/
      getMeetingDetail() {
        this.$utils.Tools.loadShow();
        this.$api.Meeting.getMeetingDetail(
          this.bh, this.$utils.Store.getItem('userSerial'),
        ).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.meeting = data;
            // let temp = this.meeting.list.filter(item => {
            //   return item.userSerial === +this.$utils.Store.getItem('userSerial');
            // });
            // if (temp && temp.length > 0) {
            //   this.operateFlag = temp[temp.length - 1].spFlag === 0;
            // }
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      isMyApprove() {
        this.$utils.Tools.loadShow();
        this.$api.Meeting.isMyApprove({
            bh: this.bh,
            appointment: this.$utils.Store.getItem('userSerial'),
          },
        ).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            if (data && data.length > 0) {
              this.approveFlag = data[0];
            }
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      /**
       *  function点击撤销申请按钮
       *  @wzx
       *  @2019-01-29
       **/
      repealClick() {
        this.showRepeal = true;
      },
      approveMeeting(spJg, spYj) {
        this.$api.Meeting.approveMeeting({
          meetBh: this.bh,
          userSerial: this.$utils.Store.getItem('userSerial'),
          spJg: spJg,
          spYj: spYj,
          spFlag: 1,
        }).then(response => {
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.$utils.Tools.toastShow(msg);
            setTimeout(() => {
              this.$router.replace('/MyMeetingOrder');
            }, 1500);
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      approveClick(val) {
        if (val === 2) {
          this.$utils.Tools.confirm((value) => {
            this.approveMeeting(val, value);
          }, null, '审批意见', true);
        } else {
          this.approveMeeting(val);
        }
      },
      /**
       *  function删除请假申请接口
       *  @wzx
       *  @2019-01-29
       **/
      onConfirm() {
        this.$api.Meeting.deleteMeetingOrder(this.bh, this.$utils.Store.getItem('userSerial'), '').then(response => {
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.$router.replace('/MyMeetingOrder');
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      pushHistory() {
        var state = {
          title: 'title',
          url: '#',
        };
        window.history.pushState(state, state.title, state.url);
      },
    },
    created() {
      if (this.$utils.Store.getItem('curActive')) {
        this.curActive = +this.$utils.Store.getItem('curActive');
      }

      this.userNo = this.$utils.Store.getItem('userNo');
      if (this.$utils.Store.getItem('state')) {
        this.bh = decodeURI(this.$utils.Store.getItem('state'));
        this.getMeetingDetail();
        this.isMyApprove();
      } else {
        this.$utils.Store.setItem('state', this.$route.params.state);
        this.bh = decodeURI(this.$route.params.state);
        this.getMeetingDetail();
        this.isMyApprove();
      }
    },
    mounted() {
      if (this.$route.params.notification) {
        this.pushHistory();
      }
    },
    destroyed() {
      this.$utils.Store.removeItem('state');
    },
  };
</script>
<style type="text/scss" lang="scss">
  .meeting-detail {
    width: 100%;
    height: 100%;
    overflow: auto;

    .meeting-title {
      width: 100%;
      padding: 0.1rem 0.1rem 0 0.1rem;

      h3 {
        text-align: center;
        font-size: 0.18rem;
        font-weight: normal;
        line-height: 0.3rem;
      }

      dl {
        width: 60%;
        height: 0.3rem;
        margin: 0 auto;

        dt {
          width: 70%;
          height: 0.3rem;
          float: left;
          font-size: 0.12rem;
          line-height: 0.3rem;
          color: #AFAFAF;

          i {
            font-size: 0.2rem;
            float: left;
            color: #AFAFAF;
            margin-right: 0.1rem;
          }

          span {
            margin-right: 0.1rem;
            float: left;
          }
        }

        dd {
          width: 30%;
          height: 0.3rem;
          float: left;
          font-size: 0.13rem;
          text-align: right;
          line-height: 0.3rem;

          span {
            &.over {
              color: #ccc;
            }

            &.going {
              color: #3399FF;
            }

            &.order {
              color: #FF6B6B;
            }
          }
        }
      }
    }

    .detail-box {
      width: 100%;
      overflow: hidden;

      .meeting-address {
        flex-basis: 0.6rem;
        border-top: 1px solid #e5e5e5;
        padding: 0.05rem 6%;

        p {
          line-height: 0.2rem;
          color: #AFAFAF;
          font-size: 0.13rem;
        }

        .detail {
          width: 100%;
          padding: 0 2%;
          line-height: 0.3rem;
          font-size: 0.15rem;
          margin-top: 0.1rem;
        }
      }

      .meeting-men {
        flex: 1;
        border-top: 1px solid #e5e5e5;
        padding: 0.05rem 6%;
        display: flex;
        flex-direction: column;

        p {
          flex-basis: 0.2rem;
          line-height: 0.2rem;
          color: #AFAFAF;
          font-size: 0.13rem;
        }

        .detail {
          width: 100%;
          flex: 1;
          padding: 0.1rem 2%;
          line-height: 0.3rem;
          font-size: 0.15rem;
          overflow-y: scroll;

          dl {
            display: inline-grid;
            float: left;
            width: 0.58rem;
            height: 0.7rem;
            text-align: center;
            margin-right: 0.05rem;
            margin-bottom: 0.05rem;

            dt {
              position: relative;

              i {
                font-size: 0.4rem;
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
              font-size: 0.12rem;
              line-height: 0.2rem;
            }
          }
        }
      }

      .meeting-approve {
        font-size: 0.16rem;
        padding: 0 0.1rem;
        border-top: 1px solid #e5e5e5;
        display: flex;
        align-items: center;
        height: 0.7rem;

        &:last-of-type {
          border-bottom: 1px solid #e5e5e5;
        }

        i {
          color: #ccc;
          font-size: 0.4rem;
          padding-right: 0.1rem;
        }

        dl {
          line-height: 0.2rem;
          color: #000000;

          dt {
            span {
              font-size: 0.12rem;
              padding-left: 0.1rem;

              &.check {
                color: #3399FF;
              }

              &.agree {
                color: #00CC66;
              }

              &.refuse {
                color: #FF3333;
              }
            }
          }

          dd {
            color: #AFAFAF;
            font-size: 0.12rem;

            &:nth-of-type(2) {
              color: #000000;
            }
          }
        }
      }
    }


    .operate-box {
      display: -webkit-box;
      display: -webkit-flex;
      display: flex;
      position: absolute;
      z-index: 500;
      bottom: 0;
      width: 100%;
      padding: 0.1rem 0;
      background-color: #ffffff;

      div {
        width: 100%;
      }

      button {
        width: 80%;
      }
    }
  }
</style>

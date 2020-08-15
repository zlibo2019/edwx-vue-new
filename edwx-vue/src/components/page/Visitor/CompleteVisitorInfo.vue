<template>
  <div class="complete-visitorinfo">
    <div class="content-box">
      <div class="boxs receiver-box">
        <p>邀请人</p>
        <group label-width="7em" label-margin-right="1em">
          <x-input title="邀请人" class="norequired" show-clear v-model="userInfo.userLname" text-align="right"
                   readonly></x-input>
          <x-input title="所属部门" class="norequired" show-clear v-model="userInfo.userDepname" text-align="right"
                   readonly></x-input>
          <x-input title="联系电话" class="norequired" show-clear v-model="userInfo.userTelephone"
                   text-align="right" readonly></x-input>
        </group>
      </div>
      <div class="boxs">
        <p>访客信息</p>
        <group label-width="7em" label-margin-right="1em">
          <x-input title="来访人" placeholder="请输入姓名" show-clear v-model="visitor" text-align="right" max="10"
                   required></x-input>
          <x-input title="联系电话" placeholder="请输入联系电话" show-clear v-model="visitorTel" text-align="right"
                   required></x-input>
          <x-input title="身份证号" placeholder="请输入身份证号" show-clear v-model="identity" text-align="right"
                   class="norequired"></x-input>
          <cell class="norequired face" title="人脸识别照片">
            <div class="upload-box">
              <UploadImage :limitNum="limitNum" :icon="icon" :imgList="imgList" @saveImages="saveImages"
                           @deleteImage="deleteImage" title="" style="padding: 0;border-top: 0"></UploadImage>
            </div>
          </cell>
          <datetime title="预约开始" v-model="kssj" format="YYYY-MM-DD HH:mm" placeholder="选择到访时间"></datetime>
          <datetime title="预约结束" v-model="jssj" format="YYYY-MM-DD HH:mm" placeholder="选择结束时间"></datetime>
          <popup-picker title="来访事由" :data="reasonList" :columns="1" v-model="reason" placeholder="请选择"
                        :show-name="true" @on-change="changeReason"></popup-picker>
          <x-textarea class="norequired" :max="1000" name="description" placeholder="备注（最多输入1000字）"
                      v-model="remark" :rows="3"></x-textarea>
        </group>
      </div>
    </div>
    <div class="my-operate">
      <x-button type="primary" @click.native="registerClick">提交信息</x-button>
    </div>
  </div>
</template>
<script>
  import UploadImage from '@/components/common/UploadImage/UploadImage';

  import {
    XInput,
    Group,
    Cell,
    XButton,
    Datetime,
    XTextarea,
    PopupPicker,
  } from 'vux';

  export default {
    name: 'CompleteVisitorInfo',
    components: {
      XInput,
      Group,
      Cell,
      XButton,
      Datetime,
      XTextarea,
      PopupPicker,
      UploadImage,
    },
    data() {
      return {
        userInfo: {},
        visitor: '', //来访人姓名
        visitorTel: '',  //来访人电话
        identity: '',  //来访人身份证号
        kssj: '', //到访时间
        jssj: '', //结束时间
        reasonList: [],
        reason: [],  //到访事由
        remark: '',  //备注
        xh: '',  //新增预约成功后返回的序号
        visUserSerial: '', //被访人序号
        startDate: '', //开始日期
        curTime: '', //当前时间
        icon: 'icon-renlian',  //icon人脸
        limitNum: 1, //上传的图片张数
        imgList: [],   //图片列表数组
      };
    },
    computed: {},
    methods: {
      getVisitDate() {
        // this.$api.Visit.getVisitDate('1').then(response => {
        //   const {code, msg, data} = response;
        //   // this.options.loading = false;
        //   console.log(response);
        //   if (+code !== this.$code.success) {
        //     this.$utils.Tools.toastShow(msg);
        //   } else {
        //     if (data === null) {
        this.kssj = this.curTime;
        // this.jssj = this.$utils.DateUtils.addDate(this.startDate, 1) + ' 00:00';
        this.jssj = this.startDate + ' 18:00';
        //     } else {
        //       this.kssj = this.startDate + ' ' + data.visKssj.substring(0, 5);
        //       this.jssj = this.startDate + ' ' + data.visJssj.substring(0, 5);
        //     }
        //   }
        // }).catch(err => {
        //   console.log(err);
        //   // this.options.loading = false;
        // });
      },
      getSysDate: function () {
        this.$utils.Tools.loadShow();
        this.$api.Sys.getSystemDate(this.$params.mode).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.startDate = data.sysDate.substring(0, 10);
            this.curTime = data.sysDate.substring(0, 16);
            this.getVisitDate();
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      changeReason(val) {
        this.reason = val;
      },
      getUserInfo: function () {
        this.$utils.Tools.loadShow();
        this.$api.User.getUserInfo(this.$utils.Store.getItem('userSerial')).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.userInfo = data;
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      /**
       *  function获取来访事由列表
       *  @wzx
       *  @2019-03-30
       **/
      getReasonList() {
        this.$utils.Tools.loadShow();
        this.$api.Visit.getReasonList({
          lx: 0,
        }).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            for (let item of data) {
              this.reasonList.push({value: JSON.stringify(item.xh), name: item.thingName});
            }
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      /**
       *  function新增访客预约信息
       *  @wzx
       *  @2019-03-30
       **/
      addVisitorOrder() {
        this.$utils.Tools.loadShow();

        let facePhoto = '';
        if (this.imgList.length > 0) {
          if (this.imgList[0].serverId) {
            facePhoto = this.imgList[0].serverId;
          } else if (this.imgList[0].src) {
            facePhoto = '-1';
          }
        }

        this.$api.Visit.addVisitorOrder({
          type: '1',
          visRegisterEntity: {
            approveState: 3,
            userSerial: this.$utils.Store.getItem('userSerial'),
            visBz: this.remark,
            visKssj: this.kssj,
            visJssj: this.jssj,
            visThing: this.reason[0],
            visLx: 1,
            visOk: 1,
          },
          visUserEntity: {
            visId: this.identity,
            facePhoto: facePhoto,
            visLname: this.visitor,
            visTelephone: this.visitorTel,
            visFlag: 3,
          },
        }).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            if (code === 610) {
              this.$utils.Tools.toastShow('访问被拒绝');
            } else {
              this.$utils.Tools.toastShow(msg);
            }
          } else {
            this.xh = data.visRegisterEntity.xh;
            this.$router.replace({
              path: '/InvitationResult', query: {
                xh: this.xh,
              },
            });
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      registerClick() {
        if (this.$utils.RegExp.checkSpechars(this.visitor) || this.$utils.RegExp.checkEmpty(this.visitor)) {
          this.$utils.Tools.toastShow('来访人姓名不能为空或包含特殊字符');
        } else if (this.$utils.RegExp.checkPhone(this.visitorTel)) {
          this.$utils.Tools.toastShow('来访人手机号格式不正确或为空');
        } else if (this.$utils.RegExp.checkEmpty(this.kssj)) {
          this.$utils.Tools.toastShow('预约开始时间不能为空');
          // } else if (this.kssj < this.curTime) {
          //   this.$utils.Tools.toastShow('预约开始时间不能小于当前时间');
        } else if (this.$utils.RegExp.checkEmpty(this.jssj)) {
          this.$utils.Tools.toastShow('预约结束时间不能为空');
        } else if (this.jssj < this.curTime) {
          this.$utils.Tools.toastShow('预约结束时间不能小于当前时间');
        } else if (this.jssj <= this.kssj) {
          this.$utils.Tools.toastShow('预约结束时间必须大于预约开始时间');
        } else if (this.reason.length === 0) {
          this.$utils.Tools.toastShow('来访事由不能为空');
        } else if (this.remark && this.$utils.RegExp.checkSpechars(this.remark)) {
          this.$utils.Tools.toastShow('备注不能包含特殊字符');
        } else {
          this.addVisitorOrder();
        }
      },
      manClick(obj, index) {
        this.selected = index;
      },
    },
    created() {
      this.getSysDate();
      this.getReasonList();
      this.getUserInfo();
    },
    mounted() {

    },
    destroyed() {

    },
  };
</script>
<style type="text/scss" lang="scss">
  .complete-visitorinfo {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    .visitor-title {
      font-size: 0.16rem;
      text-align: center;
      padding: 0.14rem 0;
    }

    .content-box {
      flex: 1;
      overflow-y: scroll;

      .boxs {
        width: 100%;
        height: auto;

        > p {
          font-size: 0.15rem;
          line-height: 0.4rem;
          padding: 0 0.1rem;
        }

        .weui-cells {
          margin: 0;

          .weui-cell {
            padding-left: 0.3rem;

            &:after {
              content: "*";
              position: absolute;
              top: 0.15rem;
              left: 0.15rem;
              font-size: 0.2rem;
              color: red;
              transform: scaleY(1);
            }
          }

          .norequired {
            &:after {
              content: "";
            }

            .weui-cell {
              &:after {
                content: "";
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

  .selected {
    .vux-cell-primary {
      color: red !important;
    }

    .weui-cell__ft {
      color: red !important;
    }
  }
</style>

<template>
  <div class="visitor-register" :class="showOperate?'overf':''">
    <div class="content-box">
      <div class="boxs visitor-box">
        <p style="font-size: 0.13rem;text-align: center;background: #BABCBE;color: red;">请填写本人身份证信息，以免影响您的访问！</p>
        <p>来访人信息</p>
        <group label-width="7em" label-margin-right="1em">
          <x-input title="来访人" placeholder="请输入姓名" show-clear v-model="visitor" text-align="right" max="10"
                   required></x-input>
          <popup-picker title="性别" :data="sexList" :columns="1" v-model="sex" placeholder="请选择"
                        :show-name="true"></popup-picker>
          <x-input title="联系电话" placeholder="请输入联系电话" show-clear v-model="visitorTel" text-align="right"
                   required></x-input>
          <x-input title="身份证号" placeholder="请输入身份证号" show-clear v-model="identity"
                   text-align="right" required></x-input>
          <x-input title="工作单位" class="norequired" placeholder="请输入工作单位" show-clear v-model="company"
                   text-align="right"></x-input>
          <cell class="norequired face" title="人脸识别照片">
            <div class="upload-box">
              <UploadImage :limitNum="limitNum" :icon="icon" :imgList="imgList" title="" style="padding: 0;border-top: 0"></UploadImage>
            </div>
          </cell>
        </group>
      </div>
      <div class="boxs receiver-box">
        <p>被访人信息</p>
        <group label-width="7em" label-margin-right="1em">
          <x-input title="被访人" placeholder="请输入姓名" show-clear v-model="receiver" text-align="right"
                   required></x-input>
          <x-input title="联系电话" class="norequired" placeholder="请输入联系电话" show-clear v-model="receiverTel"
                   text-align="right"></x-input>
        </group>
      </div>
      <div class="boxs follow-box">
        <p>随访信息</p>
        <group label-width="7em" label-margin-right="1em">
          <x-input title="随行人数" class="norequired" placeholder="请输入随行人数" show-clear v-model="followNo"
                   text-align="right" max="2"></x-input>
          <cell title="随行车辆" text-align="left" class="norequired">
            <x-input placeholder="请输入车牌号" class="norequired" show-clear v-model="carNo" text-align="right"
                     v-if="hasCar"></x-input>
            <inline-x-switch v-model="hasCar"></inline-x-switch>
          </cell>
          <datetime title="到访时间" v-model="kssj" format="YYYY-MM-DD HH:mm" placeholder="选择到访时间"></datetime>
          <datetime title="结束时间" v-model="jssj" format="YYYY-MM-DD HH:mm" placeholder="选择结束时间"></datetime>
          <popup-picker title="来访事由" :data="reasonList" :columns="1" v-model="reason" placeholder="请选择"
                        :show-name="true"></popup-picker>
          <x-textarea class="remark norequired" :max="1000" name="description" placeholder="备注（最多输入1000字）"
                      v-model="remark" @on-change="getReason"></x-textarea>
        </group>
      </div>
    </div>
    <div class="my-operate">
      <x-button type="primary" @click.native="registerConfirm">提交信息</x-button>
    </div>
    <div v-transfer-dom>
      <confirm v-model="showOperate"
               title="请选择拜访人"
               :show-cancel-button="false"
               :hide-on-blur="true"
               @on-confirm="onOperate"
               @on-show="onShow"
               @on-hide="onHide">
        <group>
          <cell :class="{'selected':selected==index}" v-for="(man,index) in manList" :key="index"
                @click.native="manClick(man,index)">
            <i slot="icon" class="iconfont icon-duigou1" style="font-size: 0.3rem;color:#3399FF;"></i>
            <dd slot="after-title" style="width:100%;height:0.25rem;display:block;">
              <span style="float:left;line-height: 0.25rem;">{{man.userLname}}</span>
              <span style="float:right;line-height: 0.25rem;">{{man.userTelephone}}</span>
            </dd>
            <dd slot="inline-desc"
                style="width:100%;height:0.25rem;display:block;line-height: 0.25rem;text-align:left;">
              {{man.userDepname}}
            </dd>
          </cell>
        </group>
      </confirm>
    </div>
  </div>
</template>
<script>
  import {
    XInput,
    Group,
    Cell,
    XButton,
    Datetime,
    InlineXSwitch,
    XTextarea,
    PopupPicker,
    Radio,
    Confirm,
    TransferDomDirective as TransferDom,
  } from 'vux';
  import UploadImage from '@/components/common/UploadImage/UploadImage';

  export default {
    name: 'VisitorRegister',
    directives: {
      TransferDom,
    },
    components: {
      XInput,
      Group,
      Cell,
      XButton,
      Datetime,
      InlineXSwitch,
      XTextarea,
      Radio,
      PopupPicker,
      Confirm,
      UploadImage,
    },
    data() {
      return {
        companyId: '',
        visitor: '',//来访人姓名
        visitorTel: '',   //来访人电话
        identity: '',  //来访人身份证号
        sexList: [
          {
            name: '男',
            value: '1',
          },
          {
            name: '女',
            value: '2',
          },
        ],//性别数组
        sex: ['1'],  //来访人性别
        company: '', //来访人工作单位
        receiver: '',  //被访人姓名
        receiverTel: '',  //被访人电话
        followNo: '',    //随访人数
        carNo: '',    //来访人车辆号码
        hasCar: false,//是否有随行车辆
        kssj: '',    //到访时间
        jssj: '',    //结束时间
        reasonList: [],
        reason: [],  //到访事由
        remark: '',  //备注
        showOperate: false,  //是否显示操作弹窗
        manList: [],
        selected: 0,  //选择的被访人，默认选择第一个
        icon: 'icon-renlian',  //icon人脸
        limitNum: 1, //上传的图片张数
        imgList: [],   //图片列表数组
        visOpenId: this.$utils.Store.getItem('visOpenId') ? this.$utils.Store.getItem('visOpenId') : '',
        startDate: '',
        userSerial: '',
        curTime: '', //当前时间
        visitType: '',
      };
    },
    computed: {},
    methods: {
      getVisitDate() {
        // this.$api.Visit.getVisitDate('1', this.companyId).then(response => {
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
        //     console.log(this.kssj, this.jssj);
        //   }
        // }).catch(err => {
        //   console.log(err);
        //   // this.options.loading = false;
        // });
      },
      getSysDate: function () {
        this.$api.Sys.getSystemDate(this.$params.mode).then(response => {
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
      /**
       *  function获取来访事由列表
       *  @wzx
       *  @2019-04-01
       **/
      getReasonList() {
        this.$utils.Tools.loadShow();
        this.$api.Visit.getReasonList({
          lx: 0,
          companyId: this.companyId,
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
      checkVisitor() {
        if (!this.$utils.RegExp.checkSpechars(this.visitor)) {
          this.$utils.Tools.toastShow('来访人姓名不能为空或有特殊字符');
        }
      },
      changeStartTime(val) {
        this.kssj = val;
      },
      getWxOpenIdByCode() {
        this.$utils.Tools.loadShow();
        this.$api.User.getWxOpenIdByCode(this.inviteCode, this.companyId).then(response => {
            this.$utils.Tools.loadHide();
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg);
              setTimeout(() => {
                WeixinJSBridge.call('closeWindow');
              }, 2000);
            } else {
              this.visOpenId = data;
              this.$utils.Store.setItem('visOpenId', data);
              this.getVisitorInfo();
            }
          }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      /**
       *  function获取访客基本信息
       *  @wzx
       *  @2019-04-01
       **/
      getVisitorInfo() {
        this.$utils.Tools.loadShow();
        this.$api.Visit.getVisitorInfo(this.visOpenId, this.companyId).then(response => {
            this.$utils.Tools.loadHide();
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg);
            } else {
              this.identity = data.visId;
              this.visitor = data.visLname;
              this.company = data.compName;
              this.sex = [data.visSex];
              this.visitorTel = data.visTelephone;
              if (data.facePhoto) {
                this.imgList.push({src: data.facePhoto, msrc: data.facePhoto});
              }
            }
          }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      move() {//输入法键盘冒起时上移输入框使其不被键盘覆盖
        setTimeout(() => {
          $('#Login').scrollTop(170);
        }, 700);
      },
      followBlur() {
        document.body && (document.body.scrollTop = document.body.scrollTop);
      },
      /**
       *  function新增访客预约信息
       *  @wzx
       *  @2019-04-01
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
          companyId: this.companyId,
          type: '1',
          visRegisterEntity: {
            approveState: 0,
            carState: this.hasCar ? '1' : '0',
            userSerial: this.userSerial,
            userLname: this.receiver,
            telePhone: this.receiverTel,
            visBz: this.remark,
            visCars: this.carNo,
            visKssj: this.kssj,
            visJssj: this.jssj,
            visNums: this.followNo,
            visThing: this.reason[0],
            visLx: 1,
            visOk: 1,
          },
          visUserEntity: {
            compName: this.company,
            facePhoto: facePhoto,
            openId: this.visOpenId,
            visId: this.identity,
            visLname: this.visitor,
            visSex: this.sex[0],
            visTelephone: this.visitorTel,
            visFlag: 3,
            cardPhoto: '-1',
          },
        }).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            if (code === 610) {
              this.$router.replace({path: '/RegisterResult', query: {state: '2'}}); //被拒绝,state必须为string类型
            } else if (code === 613) {
              this.$utils.Tools.toastShow(msg);
              this.manList = [];
              this.manList.push(...data);
              this.showOperate = true;
            } else {
              this.$utils.Tools.toastShow(msg);
            }
          } else {
            this.$router.replace({path: '/RegisterResult', query: {state: '0'}}); //等待,state必须为string类型
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      registerConfirm() {
        let that = this;
        this.$vux.confirm.show({
          title: '提示信息',
          content: '<p>请确认是否为本人身份证信息</p><p>并提交申请</p><br>',
          onConfirm: () => {
            that.registerClick();
          },
        });
      },
      /**
       *  function新增访客预约信息
       *  @wzx
       *  @2019-04-01
       **/
      registerClick() {
        // console.log(33,this.receiverTel)
        if (this.$utils.RegExp.checkSpechars(this.visitor) || this.$utils.RegExp.checkEmpty(this.visitor)) {
          this.$utils.Tools.toastShow('来访人姓名不能为空或包含特殊字符');
        } else if (this.$utils.RegExp.checkPhone(this.visitorTel)) {
          this.$utils.Tools.toastShow('来访人手机号格式不正确或为空');
        } else if (!this.$utils.RegExp.checkCardNO(this.identity) || this.$utils.RegExp.checkEmpty(this.identity)) {
          this.$utils.Tools.toastShow('身份证号码不能为空或不合法');
        } else if (this.$utils.RegExp.checkSpechars(this.company)) {
          this.$utils.Tools.toastShow('工作单位不能包含特殊字符');
        } else if (this.$utils.RegExp.checkSpechars(this.receiver) || this.$utils.RegExp.checkEmpty(this.receiver)) {
          this.$utils.Tools.toastShow('被访人姓名不能为空或包含特殊字符');
        } else if (this.receiverTel && this.$utils.RegExp.checkPhone(this.receiverTel)) {
          this.$utils.Tools.toastShow('被访人手机号格式不正确');
        } else if (this.followNo && !this.$utils.RegExp.checkNumber(this.followNo)) {
          this.$utils.Tools.toastShow('随访人数必须为1-2位的正整数');
        } else if (this.hasCar && !this.$utils.RegExp.checkCarNO(this.carNo)) {
          this.$utils.Tools.toastShow('随访车牌号不合法或为空');
        } else if (this.$utils.RegExp.checkEmpty(this.kssj)) {
          this.$utils.Tools.toastShow('到访时间不能为空');
          // } else if (this.kssj < this.curTime) {
          //   this.$utils.Tools.toastShow('预约开始时间不能小于当前时间');
        } else if (this.$utils.RegExp.checkEmpty(this.jssj)) {
          this.$utils.Tools.toastShow('结束时间不能为空');
          // } else if (this.kssj < this.curTime) {
          //   this.$utils.Tools.toastShow('预约结束时间不能小于当前时间');
        } else if (this.jssj <= this.kssj) {
          this.$utils.Tools.toastShow('结束时间必须大于到访时间');
        } else if (this.remark && this.$utils.RegExp.checkSpechars(this.remark)) {
          this.$utils.Tools.toastShow('备注不能包含特殊字符');
        } else if (this.reason.length === 0) {
          this.$utils.Tools.toastShow('请选择来访事由');
        } else if (this.imgList.length === 0 && (this.visitType === '1' || this.visitType === '2' || this.visitType === '4')) {
          this.$utils.Tools.toastShow('请录入人脸照片');
        } else {
          this.addVisitorOrder();
        }
      },
      manClick(obj, index) {
        this.selected = index;
        this.receiver = obj.userLname;
        this.receiverTel = obj.userTelephone;
        this.userSerial = obj.userSerial;
      },
      onOperate() {
        if (this.receiverTel === '') {
          this.receiverTel = this.manList[0].userTelephone;
          this.userSerial = this.manList[0].userSerial;
        }
        this.showOperate = false;
      },
      getVisitType() {
        this.$api.Visit.getVisitType().then(response => {
          const {code, msg, data} = response;
          if (+code !== 600) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.visitType = data;
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
    },
    created() {
      this.companyId = this.$route.query.companyId;
    },
    mounted() {
      if (!this.$utils.Store.getItem('visOpenId')) {
        this.inviteCode = this.$utils.Tools.getQueryString('code');
        this.getWxOpenIdByCode();
      } else {
        this.getVisitorInfo();
      }
      this.getSysDate();
      this.getReasonList();
      this.getVisitType();
    },
    destroyed() {

    },
  };
</script>
<style type="text/scss" lang="scss">
  .visitor-register {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    &.overf {
      overflow: hidden;
    }

    .visitor-title {
      font-size: 0.16rem;
      text-align: center;
      padding: 0.14rem 0;
    }

    .content-box {
      /*width: 100%;
      height: auto;
      padding-bottom: 0.8rem;*/
      flex: 1;
      overflow-y: scroll;

      .boxs {
        width: 100%;
        height: auto;
        border-bottom: 10px solid #F2F2F2;

        > p {
          font-size: 0.15rem;
          line-height: 0.4rem;
          padding: 0 0.1rem;
        }

        .weui-cells {
          margin: 0;

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
              /*text-align: right;*/
              .vux-x-switch {
                padding: 0;

                .weui-cell__bd {
                  .weui-label {
                    float: right;
                  }
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

          .face {
            height: auto;
          }

          .identity {
            &:after {
              display: none;
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
        }
      }

      .follow-box {
        border-bottom: none;

        .weui-cells {
          .weui-cell {
            .vux-cell-primary {
              p {
                text-align: left;

                label {
                  width: 5em !important;
                  padding-right: 0.1rem;
                }
              }
            }

            .weui-cell__ft {
              height: 0.5rem;

              .weui-cell {
                width: 1.3rem;
                padding: 0;
                float: left;
                margin-right: 0.2rem;
              }

              .weui-switch {
                float: left;
                margin-top: 0.1rem;
              }

              > span {
                line-height: 0.5rem;
              }

              > i {
                line-height: 0.5rem;
              }
            }

            &.remark {
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
        }
      }
    }

    .my-operate {
      /*width: 100%;
      height: 0.86rem;*/
      flex-basis: 0.86rem;
      padding: 0.2rem 0;
      background: #fff;
      /*position: fixed;
      bottom: 0;
      left: 0;
      z-index: 30;*/
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

  .popup-company {
    font-size: 0.18rem;
  }

  .v-transfer-dom {
    .vux-confirm {
      .vux-x-dialog {
        .weui-dialog {
          .weui-dialog__bd {
            > div {
              .weui-cells {
                .weui-cells_radio {
                  .weui-cell {
                    text-align: left;

                    .weui-cell__ft {
                      p {
                        line-height: 0.3rem;
                      }
                    }
                  }
                }
              }
            }
          }
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

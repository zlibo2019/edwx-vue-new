<template>
  <div class="visit-permit">
    <div class="visit-code" v-if="visitType === '3' || visitType === '4'">
      <div id="inviteBox" class="code-box">
        <h4>{{register.companyName}}</h4>
        <p>邀请人：{{register.userLname}}</p>
        <p>联系方式：{{register.telePhone}}</p>
        <qrcode class="qrcode" :value="register.qrcode" type="canvas"></qrcode>
        <p>访客二维码有效期至 {{register.visJssj}}</p>
      </div>
      <img id="inviteImg" :src="saveImgUrl" alt="" crossOrigin="anonymous">
      <p>请长按图中二维码以保存到手机</p>
      <p>请妥善保管该码，来访时出示该码</p>
    </div>
    <div class="visit-info" :style="{top:visitType === '3' || visitType === '4'? '0.2rem':'0'}">
      <group class="boxs" :gutter="0" label-width="6em">
        <cell title="来访人" :value="visitor.visLname" value-align="left"></cell>
        <cell title="身份证" :value="visitor.visId?visitor.visId.replace(/^(.{6})(?:\d+)(.{4})$/,'$1******$2'):'未填'"
              value-align="left"></cell>
        <cell title="联系电话" :value="visitor.visTelephone" value-align="left"></cell>
        <cell title="公司名称" :value="visitor.compName" value-align="left"></cell>
        <cell title="随行人数" :value="register.visNums?register.visNums:0" value-align="left"></cell>
        <cell title="随行车辆" :value="register.visCars?register.visCars:'无'" value-align="left"></cell>
        <cell title="预约开始" :value="register.visKssj" value-align="left"></cell>
        <cell title="预约结束" :value="register.visJssj" value-align="left"></cell>
        <cell title="来访事由" :value="register.thingName?register.thingName:'无'" value-align="left"></cell>
        <cell title="备注" :value="register.visBz?register.visBz:'无'" value-align="left" readonly></cell>
      </group>
      <div class="face-box" v-if="visitor.facePhoto">
        <img :src="visitor.facePhoto" alt="">
      </div>
    </div>
  </div>
</template>
<script>
  import {Cell, Group, Datetime, XButton, XTextarea, PopupPicker, Qrcode} from 'vux';

  export default {
    name: 'VisitPermit',
    components: {Cell, Group, Datetime, XButton, XTextarea, PopupPicker, Qrcode},
    data() {
      return {
        visitType: '',
        currDate: '',
        visitor: {},   //来访信息
        register: {},  //注册信息
        busFlag: ['1'],
        inviteCompany: this.$utils.Store.getItem('orgName'),  //邀请公司
        dicList: [
          {
            name: '拒绝',
            value: '0',
          }, {
            name: '允许',
            value: '1',
          },
        ],
        isOperate: true,
        value: '',
        xh: '',
        saveImgUrl: '',
      };
    },
    computed: {},
    methods: {
      getVisitType() {
        this.$api.Visit.getVisitType().then(response => {
          const {code, msg, data} = response;
          // Loading.service().close();
          //console.log(44, response)
          if (+code !== 600) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.visitType = data;
          }
        }).catch(err => {

        });
      },
      /**
       *  function获取访客基本信息
       *  @wzx
       *  @2019-04-01
       **/
      getVisitorInfo(xh) {
        this.$utils.Tools.loadShow();
        this.$api.Visit.selectByPrimaryKey(xh).then(response => {
          this.$utils.Tools.loadHide();
          // console.log(2222, response)
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.visitor = data.visUserEntity;
            this.register = data.visRegisterEntity;
            this.drawImage();
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      getSysDate: function () {
        this.$utils.Tools.loadShow();
        this.$api.Sys.getSystemDate(this.$params.mode).then(response => {
            this.$utils.Tools.loadShow();
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg);
            } else {
              this.currDate = data.sysDate;
            }
          }).catch(err => {
            this.$utils.Tools.httpError();
          });
      },
      drawImage() {
        let inviteBox = document.getElementById('inviteBox');
        let canvas = document.createElement('canvas');
        canvas.width = 560;    // 最终图片宽度280px的2倍，以px为单位
        canvas.height = 560;   // 最终图片高度350px的2倍，以px为单位
        let opts = {
          canvas: canvas,                       // 将自定义canvas作为配置项
          useCORS: true,                        // 允许图片跨域
        };
        html2canvas(inviteBox, opts).then((canvas) => {
          /* 此处的base64ImgSrc就是得到的img的base64字符串，直接在页面上显示即可 */
          let base64ImgSrc = canvas.toDataURL('image/png');
          this.saveImgUrl = base64ImgSrc;
        });
      },
    },
    created() {
      // console.log(33,this.$route.params.state)
      // this.xh = 73;
      this.xh = this.$route.query.xh || this.$route.params.state.split(',')[0];
      this.getVisitorInfo(this.xh);
      this.getVisitType();
      // this.drawImage();
    },
    mounted() {

    },
    destroyed() {

    },
  };
</script>
<style type="text/scss" lang="scss">
  .visit-permit {
    width: 100%;
    height: 100%;
    /*padding: 0.2rem 0;*/
    background: #fff;

    .visit-code {
      height: 3.6rem;
      border-bottom: 10px solid #eaeaea;
      margin-top: 0.2rem;

      #inviteBox {
        width: 2.8rem; // 最终图片宽度280px的2倍，以px为单位
        height: 2.8rem; // 最终图片高度315px的2倍，以px为单位
        position: absolute;
        z-index: -1; // 离开屏幕
        top: 0.2rem;
        left: 0;
        right: 0;
        margin: auto;
        padding: 0.1rem 0.3rem;
        border: 1px solid #eaeaea;
        box-shadow: 5px 5px 5px #eaeaea;
        border-radius: 5px;
        text-align: center;

        h4 {
          text-align: center;
          font-size: 0.14rem;
          font-weight: normal;
          margin-bottom: 0.1rem;
        }

        .qrcode {
          height: 1.6rem;
          margin-top: 0.1rem;

          > img {
            width: 1.8rem !important;
            height: 1.8rem !important;
          }
        }

        p {
          text-align: center;
          font-size: 0.12rem;
          line-height: 0.2rem;
        }

        .notice {
          color: #FF7B7B;
        }
      }

      #inviteImg {
        width: 2.8rem; // rem适配：5.6rem * 50px/rem = 280px
        height: 2.8rem; // rem适配：6.3rem * 50px/rem = 315px
        display: block;
        margin: 0 auto;
      }

      > p {
        line-height: 0.2rem;
        font-size: 0.13rem;
        text-align: center;
        margin-top: 0.1rem;
      }
    }

    .visit-info {
      width: 100%;
      height: auto;
      position: relative;

      .boxs {
        width: 100%;
        height: auto;

        .weui-cells {
          &:before {
            border-top: none;
          }

          &:after {
            border-bottom: none;
          }

          .weui-cell {
            min-height: 0.4rem;

            &:before {
              border: none;
            }

            .vux-cell-primary {
              color: #666;
            }
          }
        }
      }

      .face-box {
        width: 1rem;
        height: 1.3rem;
        position: absolute;
        right: 0.1rem;
        top: 0.1rem;

        > img {
          width: auto;
          height: auto;
          max-width: 100%;
          max-height: 100%;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          margin: auto;
        }
      }
    }
  }
</style>

<template>
  <div class="invitation-result">
    <div id="invitationResult">
      <div class="visit-code" v-if="visitType === '3' || visitType === '4' || visitType === '5'">
        <div class="code-box">
          <h4>{{register.companyName}}</h4>
          <p>邀请人：{{register.userLname}}</p>
          <p>联系方式：{{register.telePhone}}</p>
          <qrcode class="qrcode" :value="register.qrcode" type="canvas"></qrcode>
          <p>访客二维码有效期至 {{register.visJssj}}</p>
        </div>
      </div>
      <div class="invitation-title" v-else>
        访客邀请
      </div>
      <div class="visit-info" :style="{marginTop:visitType === '3' || visitType === '4' || visitType === '5'? '0.1rem':'0'}">
        <group class="boxs" :gutter="0" label-width="6em">
          <template v-if="visitType !== '3' && visitType !== '4' && visitType !== '5'">
            <cell title="公司名称" :value="register.companyName" value-align="left"></cell>
            <cell title="邀请人" :value="register.userLname" value-align="left"></cell>
            <cell title="联系方式" :value="register.telePhone" value-align="left"></cell>
          </template>
          <cell title="来访人" :value="visitor.visLname" value-align="left"></cell>
          <cell title="联系电话" :value="visitor.visTelephone" value-align="left"></cell>
          <cell title="预约开始" :value="register.visKssj" value-align="left"></cell>
          <cell title="预约结束" :value="register.visJssj" value-align="left"></cell>
          <cell title="来访事由" :value="register.thingName?register.thingName:'无'" value-align="left"></cell>
          <cell title="备注" :value="register.visBz?register.visBz:'无'" value-align="left" readonly></cell>
        </group>
      </div>
    </div>
    <img id="inviteImg" :src="saveImgUrl" alt="" crossOrigin="anonymous">
    <div class="remark">
      <p>请长按上图以保存到手机</p>
    </div>
  </div>
</template>
<script>
  import {
    Group,
    Cell,
    XButton,
    Qrcode,
  } from 'vux';

  export default {
    name: 'InvitationResult',
    components: {
      Group,
      Cell,
      XButton,
      Qrcode,
    },
    data() {
      return {
        visitType: '',
        visitor: {},   //来访信息
        register: {},  //注册信息
        xh: '',
        saveImgUrl: '',
      };
    },
    computed: {},
    methods: {
      drawImage() {
        let invitationResult = document.getElementById('invitationResult');
        let canvas = document.createElement('canvas');
        canvas.width = 560;    // 最终图片宽度280px的2倍，以px为单位
        canvas.height = 700;   // 最终图片高度350px的2倍，以px为单位
        let opts = {
          canvas: canvas,                       // 将自定义canvas作为配置项
          useCORS: true,                        // 允许图片跨域
        };
        html2canvas(invitationResult, opts).then((canvas) => {
          /* 此处的base64ImgSrc就是得到的img的base64字符串，直接在页面上显示即可 */
          let base64ImgSrc = canvas.toDataURL('image/png');
          this.saveImgUrl = base64ImgSrc;
        });
      },
      getVisitorInfo(xh) {
        this.$utils.Tools.loadShow();
        this.$api.Visit.selectByPrimaryKey(xh).then(response => {
          this.$utils.Tools.loadHide();
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
      getVisitType() {
        this.$api.Visit.getVisitType().then(response => {
          const {code, msg, data} = response;
          if (+code !== 600) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.visitType = data;
          }
        }).catch(err => {

        });
      },
    },
    created() {
      this.xh = this.$route.query.xh;
      this.getVisitorInfo(this.xh);
      this.getVisitType();
    },
    mounted() {

    },
    destroyed() {

    },
  };
</script>
<style type="text/scss" lang="scss">
  .invitation-result {
    width: 100%;
    height: 100%;
    background: #fff;
    overflow: hidden;

    #invitationResult {
      margin: 0 auto;
      width: 90%;
      border: 1px solid #eaeaea;
      border-radius: 5px;
      background-image: url('../../../assets/bk.jpg');
      background-size: 100% 100%;
      position: absolute;
      z-index: -1;

      .invitation-title {
        font-size: 0.2rem;
        width: 100%;
        text-align: center;
        height: 0.4rem;
        line-height: 0.4rem;
      }

      .visit-code {
        .code-box {
          width: 2.8rem; // 最终图片宽度280px的2倍，以px为单位
          height: 2.8rem; // 最终图片高度315px的2倍，以px为单位
          margin: auto;
          padding: 0.1rem 0.3rem;
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
            margin-bottom: 0.05rem;

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
      }

      .visit-info {
        width: 100%;
        height: auto;
        position: relative;
        padding: 0 0.2rem 0.2rem 0.2rem;

        .boxs {
          width: 100%;
          height: auto;

          .weui-cells {
            background: none;

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
      }
    }

    #inviteImg {
      width: 80%; // rem适配：5.6rem * 50px/rem = 280px
      /*height: 8.40rem; // rem适配：6.3rem * 50px/rem = 315px*/
      display: block;
      margin: 0.2rem auto 0;
    }

    .remark {
      padding-top: 0.1rem;

      p {
        text-align: center;
        font-size: 0.12rem;
        line-height: 0.24rem;
      }
    }
  }
</style>

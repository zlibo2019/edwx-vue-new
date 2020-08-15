<template>
  <div>
    <div class="invoice-div">
      <div class="invoice-title">
        <flexbox>
          <flexbox-item :span="0.36">
            <i class="iconfont icon-fapiaoguanli"
               style="font-size:0.18rem;padding:0 0.05rem 0 0;float:left;"></i>
            开票信息
          </flexbox-item>
          <flexbox-item>最新更新时间&nbsp;{{info.sj}}</flexbox-item>
        </flexbox>
      </div>
      <div class="invoice-circle">
        <flexbox>
          <flexbox-item>
            <div class="invoice-circle-left"></div>
          </flexbox-item>
          <flexbox-item :span="0.8" class="invoice-small-circle">
          </flexbox-item>
          <flexbox-item align="right">
            <div class="invoice-circle-right"></div>
          </flexbox-item>
        </flexbox>
      </div>
      <div class="invoice-content">
        <flexbox>
          <flexbox-item :span="0.21" class="invoice-label">公司名称</flexbox-item>
          <flexbox-item class="invoice-text">{{info.companyName}}</flexbox-item>
        </flexbox>
        <flexbox>
          <flexbox-item :span="0.21" class="invoice-label"><span class="w2">税</span>号</flexbox-item>
          <flexbox-item class="invoice-text">{{info.taxNum}}</flexbox-item>
        </flexbox>
        <flexbox>
          <flexbox-item :span="0.21" class="invoice-label"><span class="w2">地</span>址</flexbox-item>
          <flexbox-item class="invoice-text">{{info.address}}</flexbox-item>
        </flexbox>
        <flexbox>
          <flexbox-item :span="0.21" class="invoice-label"><span class="w2">电</span>话</flexbox-item>
          <flexbox-item class="invoice-text">{{info.phone}}</flexbox-item>
        </flexbox>
        <flexbox>
          <flexbox-item :span="0.21" class="invoice-label">开户银行</flexbox-item>
          <flexbox-item class="invoice-text">{{info.acctBank}}</flexbox-item>
        </flexbox>
        <flexbox>
          <flexbox-item :span="0.21" class="invoice-label">银行账号</flexbox-item>
          <flexbox-item class="invoice-text">{{info.acctNum}}</flexbox-item>
        </flexbox>
      </div>
    </div>
    <div class="invoice-bottom"></div>
    <div class="qr-code">
      <!--<qrcode :value="info.qrCode"></qrcode>-->
      <qrcode :value="info.spareCol1"></qrcode>
      <div style="padding-top:0.1rem">扫码获取开票信息</div>
    </div>
  </div>
</template>

<script>
  import {Flexbox, FlexboxItem, Qrcode} from "vux";

  export default {
    name: "FeedBack",
    components: {
      Flexbox,
      FlexboxItem,
      Qrcode
    },
    data() {
      return {
        info: {}
      };
    },
    methods: {
      getInvoiceInfo: function () {
        this.$api.Info.getInvoiceInfo(1).then(response => {
            this.$utils.Tools.loadHide();
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg);
            } else {
              this.info = data;
            }
          }).catch(err => {
          });
      }
    },
    computed: {},
    created() {
      this.$utils.Tools.loadShow();
      this.userSerial = this.$utils.Store.getItem("userSerial");
      this.getInvoiceInfo();
    }
  };
</script>

<style type="text/scss" lang="scss">
  .invoice-div {
    background: #3399ff;
    // background: url("@/assets/123.png") no-repeat;
    // background-size: 100%;
    color: #ffffff !important;

    img {
      padding-right: 0.13rem;
    }

    .invoice-title {
      padding-top: 0.18rem;
      padding-left: 0.16rem;
      font-size: 0.12rem;

      .vux-flexbox-item:first-child {
        font-size: 0.14rem;
      }

      * {
        vertical-align: middle;
      }
    }

    .invoice-circle {
      padding-top: 0.08rem;

      .invoice-circle-left {
        z-index: 99;
        border-radius: 0 0.99rem 0.99rem 0;
        background-color: #ffffff;
        height: 0.2rem;
        width: 0.1rem;
      }

      .invoice-circle-right {
        z-index: 99;
        border-radius: 0.99rem 0 0 0.99rem;
        background-color: #ffffff;
        height: 0.2rem;
        width: 0.1rem;
      }

      .invoice-small-circle {
        background: url("../../../assets/invoice_circle.png") repeat;
        background-size: 8px;
        height: 0.042rem;
          /*border-bottom: 4px dotted #fff;*/
          /*border-radius: 50%;*/
      }
    }

    .invoice-content {
      padding-top: 0.08rem;
      padding-left: 0.3rem;
      padding-bottom: 0.1rem;
      line-height: 0.36rem;
      text-align: left;

      .invoice-label {
        font-size: 0.12rem;
      }

      .invoice-text {
        font-size: 0.15rem;
      }
    }
  }

  .invoice-bottom {
    background: url("../../../assets/invoice_bottom.png") repeat;
    background-size: 0.1rem;
    height: 0.05rem;
  }

  .qr-code {
    text-align: center !important;
    padding-top: 0.4rem;
    color: #999999;
    font-size: 0.12rem;

    img {
      height: 2.1rem !important;
      width: 2.1rem !important;
    }
  }
</style>

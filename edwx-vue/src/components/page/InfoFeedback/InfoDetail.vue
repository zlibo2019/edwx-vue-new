<template>
  <div class="message">
    <dl>
      <dt>{{message.infoTitle}}</dt>
      <dd><span style="padding-right: 0.1rem">{{message.sj}}</span><span>{{message.userLname}}</span></dd>
    </dl>
    <div class="content">{{message.infoContent}}</div>
  </div>
</template>
<script>
  import {} from "vux"

  export default {
    name: "InfoDetail",
    components: {},
    data() {
      return {
        xh: '',
        message: {}
      }
    },
    methods: {
      getMessageDetail() {
        this.$utils.Tools.loadShow();
        this.$api.Info.getInfoDetail(this.xh).then(response => {
            this.$utils.Tools.loadHide();
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg);
            } else {
              this.message = data;
            }
          }).catch(err => {
            this.$utils.Tools.httpError();
          });
      },
    },
    created() {
      this.xh = this.$route.query.xh;
      this.getMessageDetail();
    },
    mounted() {
    },
    destroyed() {
    }
  }
</script>
<style type="text/scss" lang="scss">
  .message {
    width: 100%;
    height: 100%;
    overflow-y: scroll;

    dl {
      width: 100%;
      height: auto;
      padding: 0.15rem;
      text-align: center;

      dt {
        line-height: 0.3rem;
        font-size: 0.16rem;
        color: #4D4D4D;
      }

      dd {
        line-height: 0.2rem;
        font-size: 0.12rem;
        color: #B7B7B7;
      }
    }

    .content {
      font-size: 0.13rem;
      border-top: 1px solid #e5e5e5;
      padding: 0.15rem 0.2rem;
      word-break: break-all;
      color: #7C7C7C;
      line-height: 0.22rem;
      text-indent: 2em;
      text-align: justify;
    }
  }
</style>

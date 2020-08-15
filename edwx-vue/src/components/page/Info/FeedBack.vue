<template>
  <div class="feed-back">
    <group gutter="10">
      <x-input required show-clear title="反馈主题" placeholder="请输入反馈主题" v-model="infoTitle" text-align="right" :max="40"></x-input>
    </group>
    <group gutter="10">
      <x-textarea placeholder="欢迎大家对软件的功能和设计上的欠缺与不足做改进意见和提出想法……" :max="400" :height="200"
                  v-model="infoContent"></x-textarea>
    </group>
    <x-button text="确定" type="primary" @click.native="insertInfo"></x-button>
  </div>
</template>

<script>
  import {XInput, Group, XTextarea, XButton, Cell} from "vux";

  export default {
    name: "FeedBack",
    components: {
      XInput,
      Group,
      XTextarea,
      XButton,
      Cell
    },
    data() {
      return {
        infoTitle: "",
        infoContent: ""
      };
    },
    methods: {
      insertInfo: function () {
        if (this.infoTitle === "") {
          this.$utils.Tools.toastShow("反馈主题不能为空");
          return;
        }
        if (this.infoContent === "") {
          this.$utils.Tools.toastShow("反馈信息不能为空");
          return;
        }
        let that = this;
        this.$utils.Tools.loadShow();
        this.$api.Info.addInfoFeedback({
          infoContent: this.infoContent,
          infoTitle: this.infoTitle,
          userSerial: this.userSerial
        }).then(response => {
            this.$utils.Tools.loadHide();
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg);
            } else {
              this.$utils.Tools.toastShow(msg);
              setTimeout(() => {
                this.$utils.Tools.toastHide();
                that.$router.go(-1);
              }, 1000);
            }
          }).catch(err => {
          });
      }
    },
    computed: {},
    created() {
      this.userSerial = this.$utils.Store.getItem("userSerial");
    }
  };
</script>

<style type="text/scss" lang="scss">
  .feed-back {
    height: 100%;
    width: 100%;
    background: #F4F5F9;

    .weui-cells {
      margin-top: 0;
    }

    .weui-btn_primary {
      margin-top: 1.5rem;
      width: 80% !important;
    }
      .weui-btn{
          font-size: 0.18rem;
      }
  }
</style>

<template>
  <div v-transfer-dom style="font-size: 0.14rem">
    <popup v-model="confirm">
      <tab>
        <tab-item @on-item-click="onMonthSelect" selected>按月选择</tab-item>
        <tab-item @on-item-click="onDaysSelect">按日选择</tab-item>
      </tab>
      <div v-show="monthShow===true" style="text-align: center;">
        <span style="line-height: 0.5rem;">{{monthDate}}</span>
        <datetime-view v-model="monthDate" :format="monthFmt" ref="monthView"></datetime-view>
      </div>
      <div v-show="monthShow===false" style="text-align: center;">
        <span style="line-height: 0.5rem;" @click="onBeginSelect">{{beginDate}}</span> 至 <span
        style="line-height: 0.5rem;" @click="onEndSelect">{{endDate}}</span>
        <datetime-view v-show="firstShow==true" v-model="beginDate" :format="daysFmt" ref="beginView"></datetime-view>
        <datetime-view v-show="firstShow==false" v-model="endDate" :format="daysFmt" ref="endView"></datetime-view>
      </div>
      <flexbox style="padding: 0.1rem 0;background-color: #ffffff">
        <flexbox-item>
          <x-button text="取消" type="primary" style="width:80%;" @click.native="onCancel"></x-button>
        </flexbox-item>
        <flexbox-item>
          <x-button text="确定" type="primary" style="width:80%;" @click.native="onConfirm"></x-button>
        </flexbox-item>
      </flexbox>
    </popup>
  </div>
</template>

<script>
  import {Flexbox, FlexboxItem, Tab, TabItem, Confirm, DatetimeView, Popup, TransferDom} from "vux";
  import XButton from "vux/src/components/x-button/index";

  export default {
    name: "EdDate",
    directives: {
      TransferDom
    },
    components: {
      Flexbox,
      FlexboxItem,
      XButton,
      Tab,
      TabItem,
      Confirm,
      DatetimeView,
      Popup
    },
    props: {
      value: Boolean,
      currDate: String
    },
    data() {
      return {
        confirm: false,
        monthFmt: "YYYY-MM",
        daysFmt: "YYYY-MM-DD",
        firstShow: true,
        monthShow: true,
        monthDate: "",
        beginDate: "",
        endDate: ""
      };
    },
    methods: {
      onMonthSelect: function () {
        this.monthShow = true;
        this.$refs.monthView.render();
      },
      onDaysSelect: function () {
        this.monthShow = false;
        this.$refs.beginView.render();
      },
      onBeginSelect: function () {
        this.firstShow = true;
        this.$refs.beginView.render();
      },
      onEndSelect: function () {
        this.firstShow = false;
        this.$refs.endView.render();
      },
      onCancel: function () {
        this.confirm = false;
      },
      onConfirm: function () {
        this.confirm = false;
        let beginDate = this.beginDate;
        let endDate = this.endDate;
        if (this.monthShow) {
          beginDate = this.$utils.DateUtils.getMonthStart(this.monthDate);
          endDate = this.$utils.DateUtils.getMonthEnd(this.monthDate);
        }
        this.$emit("onConfirm", beginDate, endDate);
      }
    },
    watch: {
      currDate(val) {
        this.monthDate = this.$utils.DateUtils.formatDateMonth(val);
        this.beginDate = this.$utils.DateUtils.getMonthStart(val);
        this.endDate = this.$utils.DateUtils.getMonthEnd(val);
      },
      confirm(val) {
        this.$emit("input", val);
      },
      // value(val) {
      //   this.confirm = val;
      // }
      value: {
        handler: function (val) {
          this.confirm = val;
        },
        immediate: true
      }
    }
  };
</script>

<style scoped type="text/scss" lang="scss">
</style>

<template>
  <div class="ed-month" @click="showPopup">
    <div class="ed-month-slot"></div>
    <div class="ed-month-info">
      <p><span>{{month}}</span>月</p>
      <p>{{year}}年</p>
    </div>
    <i class="iconfont icon-yueli"></i>
  </div>
</template>

<script>
  export default {
    name: 'EdMonth',
    props: {
      currDate: String,
    },
    data() {
      return {
        dateValue: '',
        year: '',
        month: '',
      };
    },
    methods: {
      showPopup: function () {
        const _this = this; // 需要注意 onCancel 和 onConfirm 的 this 指向
        this.$vux.datetime.show({
          cancelText: '取消',
          confirmText: '确定',
          format: 'YYYY-MM',
          value: this.dateValue,
          onConfirm(val) {
            _this.dateValue = val;
            _this.year = _this.$utils.DateUtils.getYear(val);
            _this.month = _this.$utils.DateUtils.getMonth(val);
            _this.startDate = _this.$utils.DateUtils.getMonthStart(val);
            _this.endDate = _this.$utils.DateUtils.getMonthEnd(val);
            _this.$emit('month-change', _this.startDate, _this.endDate);
          },
        });
      },
    },
    watch: {
      currDate: function (val) {
        this.dateValue = val;
        this.year = this.$utils.DateUtils.getYear(val);
        this.month = this.$utils.DateUtils.getMonth(val);
      },
    },
    created() {

    },
  };
</script>

<style type="text/scss" lang="scss" scoped>
  .ed-month {
    display: flex;
    align-items: center;
    padding-top: 0.03rem;
    border-bottom: 1px #eaeaea solid;
    width: 100%;

    .ed-month-slot {
      flex: 1;
    }

    .ed-month-info {
      padding-right: 0.05rem;
      font-size: 0.13rem;
      text-align: center;

      p {
        &:first-of-type {
          color: #529DFE;
        }

        line-height: 0.18rem;

        span {
          font-size: 0.2rem;
        }
      }
    }

    i {
      padding-right: 0.05rem;
      color: #529DFE;
      font-size: 0.4rem;
    }
  }
</style>

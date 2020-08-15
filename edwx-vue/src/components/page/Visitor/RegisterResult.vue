<template>
  <div class="register-result">
    <dl v-if="checkState == 0">
      <dt>
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-dengdai"></use>
        </svg>
      </dt>
      <dd>信息已提交成功，请等待审核通知!</dd>
    </dl>
    <dl v-else>
      <dt>
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-weitongguo"></use>
        </svg>
      </dt>
      <dd>您的申请暂未通过!</dd>
    </dl>
  </div>
</template>
<script>
  import {XInput, Group, XButton, ViewBox, Datetime, XTextarea, Checker, CheckerItem} from "vux"

  export default {
    name: "RegisterResult",
    components: {XInput, Group, XButton, ViewBox, Datetime, XTextarea, Checker, CheckerItem},
    data() {
      return {
        checkState: '',
      }
    },
    computed: {},
    methods: {},
    created() {

    },
    mounted() {
      this.checkState = this.$route.query.state || this.$route.params.state.split(',')[1];
      // console.log(22,this.$route.query.state,this.$route.params.state.split(',')[1],this.checkState)
    },
    destroyed() {

    }
  }
</script>
<style type="text/scss" lang="scss">
  .register-result {
    width: 100%;
    height: 100%;
    position: relative;

    dl {
      width: 70%;
      height: 2rem;
      position: absolute;
      left: 0;
      right: 0;
      top: 0.8rem;
      margin: auto;

      dt {
        height: 1.4rem;
        text-align: center;
        margin-bottom: 0.1rem;

        svg {
          font-size: 1.4rem;
        }
      }

      dd {
        font-size: 0.13rem;
        line-height: 0.3rem;
        text-align: center;
      }
    }

  }
</style>

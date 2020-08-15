<template>
  <div class="living-page">
    <div class="living-image">
      <img :src="image" />
    </div>
    <group>
      <cell title="设备ID" :value="devSerial"></cell>
      <cell title="设备名称" :value="devName"></cell>
      <cell title="记录时间" :value="jlsj"></cell>
    </group>
  </div>
</template>
<script>
  import {Group, XButton, ViewBox, Cell} from 'vux';

  export default {
    name: 'LivingPage',
    components: {Group, XButton, ViewBox, Cell},
    data() {
      return {
        image: '',
        devSerial: '',
        devName: '',
        jlsj: '',
      };
    },
    computed: {},
    methods: {
      getMjInfo: function (xh) {
        this.$utils.Tools.loadShow();
        this.$api.Door.getMjInfo(xh).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.image = data.image;
            this.devSerial = data.devSbId;
            this.devName = data.mc;
            this.jlsj = data.jlSj;
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      getKqInfo: function (xh) {
        this.$utils.Tools.loadShow();
        this.$api.Attence.getKqInfo(xh).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.image = data.image;
            this.devSerial = data.devSbId;
            this.devName = data.mc;
            this.jlsj = data.sj;
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
    },
    created() {
      let temp = this.$route.params.state.split(',');
      if (temp[1] === '1') {
        this.getMjInfo(temp[0]);
      } else {
        this.getKqInfo(temp[0]);
      }
    },
    mounted() {
      if (this.$route.params.notification) {
        this.$utils.Tools.pushHistory();
      }
    },
    destroyed() {
    },
  };
</script>
<style type="text/scss" lang="scss">
  .living-page {
    width: 100%;
    height: 100%;

    .living-image {
      text-align: center;
      margin-top: 0.2rem;
      margin-bottom: 0.2rem;
      height: 3.5rem;

      img {
        height: 3.5rem;
      }
    }
  }
</style>

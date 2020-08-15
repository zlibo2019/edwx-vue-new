<template>
  <popup-picker :title="title" :data="list" v-model="select" :placeholder="placeholder"
                :show-name="true" :disabled="disabled"></popup-picker>
</template>
<script>
  import {PopupPicker} from 'vux';

  export default {
    name: 'EdDict',
    components: {PopupPicker},
    props: {
      value: Array,
      title: String,
      disabled: {
        type: Boolean,
        default: false,
      },
      placeholder: {
        type: String,
        default: '请选择',
      },
      dicType: {
        type: String,
        default: '',
      },
    },
    data() {
      return {
        select: [],
        list: [[{name: '', value: ''}]],
      };
    },
    created() {
    },
    mounted() {
      this.getDictInfo();
    },
    methods: {
      getDictInfo: function () {
        let params = {
          typeCode: this.dicType,
          useFlag: 1,
        };
        this.$api.Dict.getDictInfo(params).then(response => {
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            let list = [[]];
            for (let item of data) {
              list[0].push({name: item.dicName, value: item.dicCode});
            }
            this.list = list;
          }
        }).catch(err => {
          console.log(err);
        });
      },
    },
    watch: {
      select(val) {
        this.$emit('input', val || '');
      },
      value: {
        handler: function (val) {
          this.select = val === 'null' ? [] : val;
        },
        immediate: true,
      },
    },
  };
</script>

<style type="text/scss" lang="scss" scoped>
  .ed-select {
    display: inline-block;
  }
</style>

<template>
  <div class="page-form">
    <view-box body-padding-top="0" body-padding-bottom="0.62rem">
      <group :gutter="0">
        <x-input title="设备名称" :placeholder="doType==='view'?'':'请输入'" show-clear v-model="form.companyName"
                 text-align="right"
                 :disabled="doType==='view'" ref="companyName" :required="true"></x-input>
        <x-input title="报备型号" :placeholder="doType==='view'?'':'请输入'" show-clear v-model="form.deviceNo"
                 text-align="right"
                 :disabled="doType==='view'" ref="deviceNo" :required="true"></x-input>
        <x-input title="报备价格" :placeholder="doType==='view'?'':'请输入'" show-clear v-model="form.devicePrice"
                 text-align="right"
                 :disabled="doType==='view'" ref="devicePrice" :required="true"></x-input>
        <ed-dict title="大区区域" dic-type="09001" v-model="area" :disabled="doType==='view'"
                 :placeholder="doType==='view'?'':'请选择'"></ed-dict>
        <x-textarea :placeholder="doType==='view'?'':'请输入'" title="备注" v-model="form.remark" :max="200"
                    :show-counter="doType!=='view'"
                    :disabled="doType==='view'"></x-textarea>
      </group>
      <div class="page-bottom">
        <x-button :text="btnText" type="primary" style="width: 80%;" @click.native="submitData"
                  v-if="doType!=='view'"></x-button>
      </div>
    </view-box>
  </div>
</template>
<script>
  import {XInput, Group, XButton, ViewBox, XTextarea} from 'vux';
  import EdDict from '../../common/EdDict/Index';

  export default {
    name: 'AgentForm',
    components: {XInput, Group, XButton, ViewBox, XTextarea, EdDict},
    data() {
      return {
        currDate: '',
        doType: '',
        btnText: '',
        area: [],
        form: {
          companyName: '',
          deviceNo: '',
          devicePrice: '',
          area: '',
          remark: '',
          userSerial: this.$utils.Store.getItem('userSerial'),
        },
      };
    },
    computed: {},
    methods: {
      submitData: function () {
        if (!this.$refs.companyName.valid) {
          this.$utils.Tools.toastShow('请输入设备名称');
          return;
        }
        if (!this.$refs.deviceNo.valid) {
          this.$utils.Tools.toastShow('请输入型号');
          return;
        }
        if (!this.$refs.devicePrice.valid) {
          this.$utils.Tools.toastShow('请输入报价');
          return;
        }
        this.form.area = this.area[0];
        if (this.doType === 'update') {
          this.form.id = this.$route.query.xh;
          this.$api.Agent.updateByPrimaryKey(this.form).then(response => {
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg);
            } else {
              this.$utils.Tools.toastShow(msg);
              setTimeout(() => {
                this.$router.replace({path: '/AgentList'});
                this.$router.go(-1);
              }, 1500);
            }
          }).catch(err => {
            this.$utils.Tools.httpError();
          });
        } else {
          this.$api.Agent.insert(this.form).then(response => {
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg);
            } else {
              this.$router.replace({path: '/AgentList'});
              this.$router.go(-1);
              this.$utils.Tools.toastShow(msg);
            }
          }).catch(err => {
            this.$utils.Tools.httpError();
          });
        }
      },
      getRecordInfo: function () {
        this.$utils.Tools.loadShow();
        this.$api.Agent.selectByPrimaryKey(this.$route.query.xh).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.form = data;
            if (this.form.area) {
              this.area = [this.form.area];
            }
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
    },
    created() {
      this.doType = this.$route.query.operation;
      if (this.$route.query.xh) {
        this.getRecordInfo();
        this.btnText = '修改';
      } else {
        this.btnText = '提交';
      }
    },
    mounted() {
    },
    destroyed() {
    },
  };
</script>
<style type="text/scss" lang="scss">
  .page-form {
    width: 100%;
    height: 100%;

    .page-bottom {
      display: -webkit-box;
      display: -webkit-flex;
      display: flex;
      position: absolute;
      z-index: 500;
      bottom: 0;
      width: 100%;
      padding: 0.1rem 0;
    }
  }
</style>

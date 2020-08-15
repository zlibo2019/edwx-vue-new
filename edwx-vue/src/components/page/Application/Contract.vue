<template>
  <div class="contract" :class="showFlag?'overf':''">
    <group class="apply-boxs" label-width="4.5em" label-margin-right="1em">
      <x-input title="合同编号" v-model="contractNumber" text-align="right" placeholder="请输入合同编号"></x-input>
      <datetime title="合同日期" v-model="contractTime" format="YYYY-MM-DD" :start-date="startDate"
                placeholder="选择日期" @on-change="changeStartTime"></datetime>
      <popup-picker class="leave-type" title="销售区域" :data="areaList" :columns="1" v-model="area"
                    :show-name="true"></popup-picker>
      <popup-picker class="leave-type" title="产品价格" :data="priceList" :columns="1" v-model="price"
                    :show-name="true"></popup-picker>
      <popup-picker class="leave-type" title="销售金额" :data="moneyList" :columns="1" v-model="money"
                    :show-name="true" placeholder="请选择"></popup-picker>
      <x-textarea class="reason" :max="1000" name="description" placeholder="备注（最多输入1000字）"
                  v-model="applyPurpose"></x-textarea>
    </group>
    <UploadImage :limitNum="limitNum" :icon="icon" :imgList="imgList" @saveImages="saveImages"
                 @deleteImage="deleteImage" title="附件" style="padding-left: 0.2rem"></UploadImage>
    <div class="select-box approver">
      <p><span>审批人</span><a v-if="approver.length == 0">没有审批规则或审批人，请手动选择审批人！</a></p>
      <div class="man-box">
        <dl v-for="(man,index) in approver" :key="index">
          <dt>
            <i class="iconfont icon-touxiang"></i>
            <i class="iconfont icon-close" @click="deleteApprover(index)"></i>
          </dt>
          <dd>{{man.userName}}</dd>
          <i class="iconfont icon-youjiantou"></i>
        </dl>
        <x-button mini plain @click.native="chooseApprover" v-if="approver.length<10">+</x-button>
      </div>
    </div>
    <div class="select-box copy-box">
      <p><span>抄送人</span>审批通过后，通知抄送人</p>
      <div class="man-box fixed" v-if="copyer.length>0">
        <p>固定抄送人：</p>
        <dl v-for="(man,index) in copyer" :key="index">
          <dt>
            <i class="iconfont icon-touxiang"></i>
          </dt>
          <dd>{{man.userName}}</dd>
        </dl>
      </div>
      <div class="man-box custom">
        <p>自定义抄送人：</p>
        <dl v-for="(man,index) in customer" :key="index">
          <dt>
            <i class="iconfont icon-touxiang"></i>
            <i class="iconfont icon-close" @click="deleteCustomer(index)"></i>
          </dt>
          <dd>{{man.userName}}</dd>
        </dl>
        <x-button mini plain @click.native="chooseCopyer">+</x-button>
      </div>
    </div>
    <div class="my-operate">
      <x-button type="primary" @click.native="submitClick">提交</x-button>
    </div>
    <OrgTree v-model="showFlag" :selectType="selectType" dep-name="默认公司" dep-serial="10000"
             :info-checked="infoChecked" @onSelect="selectUsers"></OrgTree>
  </div>
</template>

<script>
  import {Group, Cell, XInput, Selector, PopupPicker, Datetime, XTextarea, XSwitch, XButton} from 'vux';
  import UploadImage from '@/components/common/UploadImage/UploadImage';
  import OrgTree from '@/components/common/OrgTree/OrgTree';

  export default {
    name: 'Contract',
    components: {
      Group, Cell, XInput, Selector, PopupPicker, Datetime, XTextarea, XSwitch, OrgTree, XButton, UploadImage,
    },
    data() {
      return {
        actions: this.$api.Base.dev + '/management/insertPhoto', //上传图片接口
        contractNumber: '',  //合同编号
        areaList: [
          {
            name: '南方大区',
            value: '1',
          },
          {
            name: '北方大区',
            value: '2',
          },
          {
            name: '国外大区',
            value: '3',
          },
        ],
        area: ['北方大区', '2'],
        priceList: [
          {
            name: '标准价格',
            value: '1',
          },
          {
            name: '大区特价',
            value: '2',
          },
          {
            name: '总经理特价',
            value: '3',
          },
        ],
        price: ['大区特价', '2'],
        moneyList: [
          {
            name: '<=5万',
            value: '1',
          },
          {
            name: '>=5万',
            value: '2',
          },
        ],
        money: [],
        startDate: '',   //今天日期
        contractTime: '',   //合同日期
        endTime: '',   //开始时间
        applyPurpose: '',
        approver: this.$utils.Store.getItem('oldVal') ? JSON.parse(this.$utils.Store.getItem('oldVal')) : [],    //审批人
        approverChecked: [], //审批人序号
        copyer: [   //抄送人数组
          {
            userName: '刘来馨',
            userSerial: '200003',
            flag: 0,
          },
          {
            userName: '徐庆宁',
            userSerial: '200004',
            flag: 0,
          },
        ],
        copyer: [],  //固定抄送人数组
        customer: [],  //自定义抄送人数组
        copyerChecked: [],  //抄送人序号
        inputParam: [
          {
            name: 'att_id',
            value: 0,
          }, {
            name: 'base64String',
            value: '',
          }, {
            name: 'typeId',
            value: -1,
          },
        ],
        inputParam: [
          {
            name: 'att_id',
            value: 0,
          }, {
            name: 'base64String',
            value: '',
          }, {
            name: 'typeId',
            value: -1,
          },
        ],
        imgList: [],   //图片列表数组
        limitNum: 5,     //最多上传图片张数
        depSerial: this.$utils.Store.getItem('orgId'),    //企业ID
        depName: this.$utils.Store.getItem('orgName'),    //企业名称
        imgPath: [], //图片地址
        imgIndex: 0, //图片数组下标
        choose: this.$utils.Store.getItem('choose') ? this.$utils.Store.getItem('choose') : 0,   //添加人员类型   1：审批人  2：抄送人  3：同行人
        showFlag: false, //是否显示组织架构弹窗
        selectType: 0,   //组织架构选择类型
        infoChecked: [], //
        approverChecked: [], //审批人选中
        customerChecked: [], //自定义抄送人选中
        icon: 'icon-jiahao', //icon加号
      };
    },
    computed: {
      infoChecked() {
        if (this.selectType == 1 && this.approverChecked.length > 0) {
          return this.approverChecked;
        } else if (this.selectType == 9999 && this.customerChecked.length > 0) {
          return this.customerChecked;
        }
      },
    },
    methods: {
      getSysDate: function () {
        this.$api.Sys.getSystemDate(this.$params.mode).then(response => {
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg);
            } else {
              this.startDate = data.sysDate.substring(0, 10);
//					        this.endDate = this.$utils.DateUtils.addDateTime(this.startDate,7);
            }
          }).catch(err => {
          });
      },
      changeStartTime() {

      },
      changeEndTime() {

      },
      /** function 获取审批人数组
       *   wzx
       *   2018-12-26
       * */
      selectUsers(val) {
        if (this.selectType == 1) {
          if (this.approver.length > 0) {
            let result = this.approver.some(item => {
              if (item.userSerial == val[0].userSerial) {
                return true;
              }
            });
            if (result) {
              this.$utils.Tools.toastShow('审批人不可重复');
            } else {
              this.approver.push(...val);
            }
          } else {
            this.approver.push(...val);
          }
        } else {
          if (this.customer.length > 0) {
            this.customer = [];
            this.customer.push(...val);
            let hash = {};
            /*es6数组去重*/
            const newArr = this.customer.reduceRight((item, next) => {
              hash[next.userSerial] ? '' : hash[next.userSerial] = true && item.push(next);
              return item;
            }, []);
            this.customer = newArr;
            for (const b of this.customer) {
              this.customerChecked.push(b.userSerial);
            }
          } else {
            this.customer.push(...val);
            for (const b of this.customer) {
              this.customerChecked.push(b.userSerial);
            }
          }
        }
      },
      selectApprovalUser() {
        this.$utils.Tools.loadShow();
        this.$api.Approver.selectApprovalUser({
          userSerial: this.$utils.Store.getItem('userSerial'),
        }).then(response => {
            this.$utils.Tools.loadHide();
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              // this.$utils.Tools.toastShow(msg);
            } else {
              this.approver = [];
              this.approver.push(...data);
              this.$utils.Store.setItem('oldVal', JSON.stringify(data[0]));
            }
          }).catch(err => {
            this.$utils.Tools.httpError();
          });
      },
      /** function 删除审批人
       *   wzx
       *   2018-12-28
       * */
      deleteApprover(index) {
        this.approver.splice(index, 1);
      },
      /** function 获取固定抄送人数组
       *   wzx
       *   2018-12-27
       **/
      selectCopyUser() {
        this.$api.Copyer.selectCopyUser({
          lx: 6,    //0:请假  1:出差  2:外出  3:加班  4:调班  5:补出勤 6:合同
          userSerial: this.$utils.Store.getItem('userSerial'),
        }).then(response => {
            const {code, msg, data} = response;
            // console.log(666,response)
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg);
            } else {
              this.copyer.push(...data);
            }
          }).catch(err => {
            this.$utils.Tools.httpError();
          });
      },
      /** function 删除自定义抄送人
       *   wzx
       *   2019-01-04
       * */
      deleteCustomer(index) {
        this.customer.splice(index, 1);
      },
      /** function 添加审批人
       *   wzx
       *   2018-12-29
       * */
      chooseApprover() {       //copyType----1:请假 2:出差 3:外出 4:加班 5:调班6:补出勤  choose---1:审批人 2：抄送人  3：同行人
        this.infoChecked = [];
        this.selectType = 1;
        this.showFlag = true;
      },
      /** function 添加抄送人
       *   wzx
       *   2018-12-29
       * */
      chooseCopyer() {       //copyType----1:请假 2:出差 3:外出 4:加班 5:调班6:补出勤  choose---1:审批人 2：抄送人  3：同行人
        this.infoChecked = [];
        this.selectType = 9999;
        this.showFlag = true;
        for (const b of this.customer) {
          this.infoChecked.push(b.userSerial);
        }
      },
    },
    created() {
      this.$utils.Store.removeItem('oldVal');
      this.getSysDate();
      this.selectApprovalUser();
      this.selectCopyUser();
    },
    mounted() {
      // this.pushHistory();
      // window.onpopstate = () => {
      //     this.$router.push('/Application')  //输入要返回的上一级路由地址
      // }
    },
    destroyed() {
      this.$utils.Store.removeItem('oldVal');
    },
  };
</script>

<style type="text/scss" lang="scss">
  .contract {
    width: 100%;
    height: 100%;

    &.overf {
      overflow: hidden;
    }

    .apply-boxs {
      width: 100%;
      height: auto;

      .weui-cells {
        margin: 0;

        .weui-cell {
          height: 0.5rem;
          padding-left: 0.3rem;
          position: relative;

          &:after {
            width: 0.2rem;
            height: 0.5rem;
            content: "*";
            position: absolute;
            top: 0.15rem;
            left: 0.15rem;
            font-size: 0.2rem;
            color: red;
            border: none;
            transform: scaleY(1);
          }

          .vux-cell-primary {
            text-align: right;

            .vux-x-switch {
              padding: 0;

              .weui-cell__bd {
                .weui-label {
                  float: right;
                }
              }
            }
          }

          &.reason {
            height: auto;
            min-height: 2rem;
            padding: 0.15rem 0.2rem 0.15rem 0.3rem;
            overflow-y: scroll;

            .weui-cell__bd {
              height: 1.8rem;

              textarea {
                height: 1.6rem;
                line-height: 0.2rem;
                font-size: 0.13rem;
              }
            }
          }
        }

        .vux-datetime {
          > div {
            p {
              color: #999;
            }
          }

          .vux-cell-primary {
            .vux-cell-value {
              color: #333;
            }
          }
        }
      }
    }

    .upload-boxs {
      width: 100%;
      height: 1.4rem;
      padding: 0.1rem;
      background: #fff;
      border-top: 0.1rem solid #F4F5F9;

      p {
        font-size: 0.13rem;
        line-height: 0.3rem;
        padding-left: 0.1rem;
      }

      .upload-box {
        height: 0.7rem;

        input, img {
          float: left;
        }

        .upload-warp-img-div {
          width: 20%;
        }

        .upload-dd {
          width: 20% !important;
          float: left;
        }
      }
    }

    .select-box {
      width: 100%;
      height: auto;
      padding: 0.1rem 0.2rem 0.02rem 0.3rem;
      border-top: 10px solid #F4F5F9;
      background: #fff;
      position: relative;

      &:before {
        width: 0.2rem;
        height: 0.4rem;
        content: "*";
        position: absolute;
        top: 0.1rem;
        left: 0.15rem;
        font-size: 0.2rem;
        color: red;
        border: none;
        transform: scaleY(1);
      }

      &.approver {
        > p {
          a {
            color: red;
          }
        }

        .man-box {
          dl {
            margin-right: 0.2rem;
            position: relative;

            i.icon-youjiantou {
              font-size: 0.15rem;
              position: absolute;
              top: 0.2rem;
              margin: auto;
              right: -0.2rem;
              color: #D2D5DD;
            }

            &:last-of-type {
              i.icon-youjiantou {
                display: none;
              }
            }
          }
        }
      }

      &.copy-box {
        padding-bottom: 0.9rem;

        &:before {
          content: "";
        }
      }

      > p {
        font-size: 0.12rem;
        line-height: 0.2rem;
        color: #A7A9A8;

        span {
          font-size: 0.14rem;
          margin-right: 0.1rem;
          color: #666;
        }
      }

      .man-box {
        width: 100%;
        height: auto;
        min-height: 0.6rem;
        overflow: hidden;
        padding: 0.05rem 0;

        p {
          font-size: 0.13rem;
          line-height: 0.3rem;
        }

        dl {
          width: 0.6rem;
          height: 0.65rem;
          float: left;
          text-align: center;
          margin-right: 0.05rem;
          margin-bottom: 0.06rem;

          dt {
            position: relative;

            i {
              font-size: 0.4rem;
              display: block;
              color: #ccc;

              &.icon-close {
                position: absolute;
                top: -0.02rem;
                right: 0.05rem;
                font-size: 0.18rem;
                color: red;
              }
            }
          }

          dd {
            height: 0.2rem;
            font-size: 0.12rem;
            line-height: 0.2rem;
            overflow: hidden;
          }
        }

        .weui-btn_mini {
          width: 0.4rem;
          height: 0.4rem;
          padding: 0;
          background: #3399ff;
          text-align: center;
          line-height: 0.4rem;
          font-size: 0.3rem;
          color: #fff;
          border-radius: 50%;
          border: none;
          float: left;
          box-shadow: 0 2px 8px 2px rgba(51, 153, 255, .3);
        }
      }
    }

    .my-operate {
      width: 100%;
      height: 0.86rem;
      padding: 0.2rem 0;
      background: #fff;
      position: fixed;
      bottom: 0;
      left: 0;
      z-index: 30;
      border-top: 1px solid #e5e5e5;

      .weui-btn {
        width: 80%;
        height: 0.46rem;
        font-size: 0.18rem;

        &.disabled {
          background: #A2A2A2;
        }
      }
    }
  }
</style>

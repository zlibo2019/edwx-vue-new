<template>
    <div class="loss-solution">
        <group label-width="4.5em" label-margin-right="1em" gutter="0">
            <cell class="" title="持卡人" :value="cardInfo.userLname"></cell>
            <cell class="" title="工号" :value="cardInfo.userNo"></cell>
            <cell class="" title="部门" :value="cardInfo.userDepname"></cell>
            <cell class="" title="卡号" :value="cardInfo.userCard"></cell>
            <cell class="" title="账户余额" :value="cardInfo.acMoney"></cell>
        </group>
        <div class="my-operate">
            <x-button type="primary" @click.native="lossClick" v-if="cardInfo.userLx === 1">挂失</x-button>
        </div>
        <div v-transfer-dom>
            <confirm v-model="showRepeal"
                     title="操作提示"
                     @on-cancel="onCancel"
                     @on-confirm="onConfirm"
                     @on-show="onShow"
                     @on-hide="onHide">
                <p style="text-align:center;">确认要挂失吗？</p>
            </confirm>
        </div>
    </div>
</template>
<script>
    import {
        Group, XInput, XButton, Cell, Confirm, TransferDomDirective as TransferDom
    } from "vux"

    export default {
        name: "LossSolution",
        directives: {
            TransferDom
        },
        components: {
            Group, XInput, XButton, Cell, Confirm,
        },
        data() {
            return {
                cardInfo: {},
                showRepeal:false,   //是否显示确认弹窗

            }
        },
        computed: {},
        methods: {
            lossClick() {
                this.showRepeal = true;

            },
            onConfirm() {

                this.$api.My.cardLoss({
                    userSerial: this.$utils.Store.getItem('userSerial'),
                    userCard: this.cardInfo.userCard
                }).then(response => {
                        const {code, msg, data} = response;
                        // console.log(response);
                        this.$utils.Tools.loadHide();
                        if (+code !== this.$code.success) {
                            this.$utils.Tools.toastShow(msg);
                        } else {
                            this.$utils.Tools.toastShow(msg);
                            let _that = this;
                            setTimeout(() => {
                                _that.$router.go(-1);
                            }, 2000);
                        }
                    }).catch(err => {
                        this.$utils.Tools.httpError();
                    });
            },
            onHide() {
                // console.log('on hide')
            },
            onShow() {
                // console.log('on show')
            },
        },
        created() {
            this.$api.My.getCardInfo({
                userSerial: this.$utils.Store.getItem('userSerial')
            }).then(response => {
                    const {code, msg, data} = response;
                    // console.log(response);
                    this.$utils.Tools.loadHide();
                    if (+code !== this.$code.success) {
                        this.$utils.Tools.toastShow(msg);
                    } else {
                        this.cardInfo = data;
                    }
                }).catch(err => {
                });
        },
        mounted() {

        },
        destroyed() {

        }
    }
</script>
<style type="text/scss" lang="scss">
    .loss-solution {
        width: 100%;
        height: 100%;

        > p {
            font-size: 0.13rem;
            line-height: 0.5rem;
            padding-left: 0.25rem;
            background: #F4F5F9;
        }

        .weui-cells {
            margin-top: 0;
            .weui-cell {
                height: 0.5rem;
                position: relative;
                background: #fff;

                .weui-label {
                    color: #999;
                    font-size: 0.13rem;
                }

                .vux-label {
                    color: #999;
                }

                .weui-cell__primary {
                    color: #333;
                    height: 0.5rem;

                    .weui-input {
                        height: 0.5rem;
                        line-height: 0.5rem;
                    }
                }
                &:last-of-type {
                    &:after {
                        content: " ";
                        position: absolute;
                        left: 0;
                        bottom: 0;
                        right: 0;
                        height: 1px;
                        border-bottom: 1px solid #D9D9D9;
                        color: #D9D9D9;
                        -webkit-transform-origin: 0 0;
                        transform-origin: 0 0;
                        -webkit-transform: scaleY(0.5);
                        transform: scaleY(0.5);
                    }
                }
            }
            &:after {
                border: none;
            }
        }

        .my-operate {
            width: 100%;
            height: 0.5rem;
            margin: 0.3rem 0 0.1rem 0;

            .weui-btn {
                width: 80%;
                font-size: 0.18rem;
            }
        }

    }
</style>

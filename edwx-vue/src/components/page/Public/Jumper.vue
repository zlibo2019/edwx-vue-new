<template>
    <div class="jumper">
        <div v-transfer-dom>
            <loading :show="isLoging" text=""></loading>
        </div>
        <toast v-model="isToast" type="text" :text="toast"></toast>
    </div>
</template>
<script>
    import {
	    Loading, Toast, TransferDomDirective as TransferDom
    } from "vux"
    export default {
    	name:"Jumper",
	    directives: {
		    TransferDom
	    },
	    components: {
		    Toast,
		    Loading
	    },
        data(){
    		return {
			    isLoging: false, //加载中...
			    isToast: false, //toast显示
			    toast: "" //toast内容
            }
        },
        computed:{

        },
        methods:{

        },
	    beforeCreate(){
		    //   给二维码和考勤刷新用的跳转页面
		    console.log("周转");
		    history.go(-1);

	    },
        created(){

        },
        mounted(){

        },
        destroyed(){

        }
    }
</script>
<style type="text/scss" lang="scss">
.jumper{
    width: 100%;
    height: 100%;
    position: fixed;
    left: 0;
    top: 0;
    background: #fff;
}
</style>
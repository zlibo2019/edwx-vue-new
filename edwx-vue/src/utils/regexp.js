// 创建 axios 实例
const RegExp ={
  checkEmpty:function(value){ //验证是否为空
    let reg = /^[\s\S]*.*[^\s][\s\S]*$/;
    if(!reg.test(value)){
      return true;
    }else{
      return false;
    }
  },
  checkSpechars:function (value) { //验证是否为特殊字符
    let regEn = /[`~!@#$%^&*()_+<>?:"{}\/;'[\]]/im,
      regCn = /[·！#￥（——）：；“”‘、|《》？、【】[\]]/im;
    if (regEn.test(value) || regCn.test(value)) {
      return true;
    }else{
      return false;
    }
  },
  checkChars:function (value) { //验证字符为数字或字母
    let reg = /^[A-Fa-f0-9]*$/;
    if(reg.test(value)){
      return true;
    }else{
      return false;
    }
  },
  checkPhone:function (value) {//验证手机号码
    let reg = /^[1][3,4,5,7,8][0-9]{9}$/;
    if(reg.test(value)){
      return false;
    }else{
      return true;
    }
  },
  checkCardNO:function (value) {//验证身份证号
    let reg = /(^\d{18}$)|(^\d{17}(\d|X|x)$)/i;
    // let val =  value.replace(/x$/i, "a");
    if(reg.test(value)){
      return true;
    }else{
      return false;
    }
  },
  checkCarNO:function (value) {//验证车牌号
    let xreg = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}(([0-9]{5}[DF]$)|([DF][A-HJ-NP-Z0-9][0-9]{4}$))/;//新能源车规则
    let creg = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳]{1}$/;  //普通汽车规则
    if(xreg.test(value) || creg.test(value)){
      return true;
    }else{
      return false;
    }
  },
  checkNumber:function (value) {//验证数字
    let reg = /^\d{1,2}$/;
    if(reg.test(value)){
      return true;
    }else{
      return false;
    }
  },
  checkIP:function (value) {//验证IP地址
    let reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
    if(reg.test(value)){
      return true;
    }else{
      return false;
    }
  },
  checkQQ:function (value) {//验证QQ
    let reg = /^[1-9][0-9]{4,9}$/;
    if(reg.test(value)){
      return true;
    }else{
      return false;
    }
  },
  checkEmail:function (value) {//验证邮箱
    let reg = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;
    if(reg.test(value)){
      return true;
    }else{
      return false;
    }
  },
  checkName:function (value) {//验证用户名或账号(只能是数字、字母和下划线中的至少2种，并且不能数字开头)
    let reg = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;
    if(reg.test(value)){
      return true;
    }else{
      return false;
    }
  },
};

export default RegExp

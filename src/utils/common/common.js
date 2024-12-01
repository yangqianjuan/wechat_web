import productConfig from '@/config/product/product';
import { Dialog } from 'vant';

// 一些通用的工具函数
export const getUrlParam = name => {
  const url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
  const results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  let value = results[2].replace(/\+/g, ' ');
  value = value.replace(/\//g, '');
  return decodeURIComponent(value);
};

export const dataURLtoFile = (dataurl, filename) => {
  //将base64转换为文件，dataurl为base64字符串，filename为文件名（必须带后缀名，如.jpg,.png）
  var arr = dataurl.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

export const dataURLtoBlob = dataurl => {
  var arr = dataurl.split(',');
  //注意base64的最后面中括号和引号是不转译的
  var _arr = arr[1].substring(0, arr[1].length - 2);
  var mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(_arr),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], {
    type: mime
  });
};

export const mergeObj = (objA, objB) => {
  for (let key in objA) {
    objA[key] = objA[key] || objB[key];
  }
  return objA;
};

export const toThousands = num => {
  let result = '',
    counter = 0;
  num = (num || 0).toString();
  let radix = '';
  if (num.indexOf('.') >= 0) {
    [num, radix] = num.split('.');
  }
  for (let i = num.length - 1; i >= 0; i--) {
    counter++;
    result = num.charAt(i) + result;
    if (!(counter % 3) && i != 0) {
      result = ',' + result;
    }
  }
  if (radix) {
    return `${result}.${radix}`;
  } else {
    return result;
  }
};

export const jdugeImgDirection = imgUrl => {
  return new Promise((resolve, reject) => {
    let img = new Image();
    img.src = imgUrl;
    img.onload = res => {
      let width = img.width;
      let height = img.height;
      resolve(width < height);
    };
  });
};

export function isIdCard(idCard) {
  var regIdCard = /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/;

  if (regIdCard.test(idCard)) {
    if (idCard.length == 18) {
      var idCardWi = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2); // 将前17位加权因子保存在数组里
      var idCardY = new Array(1, 0, 10, 9, 8, 7, 6, 5, 4, 3, 2); // 这是除以11后，可能产生的11位余数、验证码，也保存成数组
      var idCardWiSum = 0; // 用来保存前17位各自乖以加权因子后的总和
      for (var i = 0; i < 17; i++) {
        idCardWiSum += idCard.substring(i, i + 1) * idCardWi[i];
      }

      var idCardMod = idCardWiSum % 11; // 计算出校验码所在数组的位置
      var idCardLast = idCard.substring(17); // 得到最后一位身份证号码

      // 如果等于2，则说明校验码是10，身份证号码最后一位应该是X
      if (idCardMod == 2) {
        if (idCardLast == 'X' || idCardLast == 'x') {
          //alert("恭喜通过验证啦！");
          return true;
        } else {
          //alert("身份证号码错误！");
          return false;
        }
      } else {
        // 用计算出的验证码与最后一位身份证号码匹配，如果一致，说明通过，否则是无效的身份证号码
        if (idCardLast == idCardY[idCardMod]) {
          //alert("恭喜通过验证啦！");
          return true;
        } else {
          //alert("身份证号码错误！");
          return false;
        }
      }
    } else {
      return true;
    }
  } else {
    //alert("身份证格式不正确!");
    return false;
  }
}

export const loadJs = src => {
  return new Promise((resolve, reject) => {
    let script = document.createElement('script');
    script.type = 'text/javascript';
    script.onload = () => {
      resolve();
    };
    script.onerror = () => {
      reject();
    };
    script.src = src;
    document.getElementsByTagName('body')[0].appendChild(script);
  });
};

export const errHandle = (vue, err, defaultMsg = '', duration = 5) => {
  let errMsg = err.data.msg ? err.data.msg : defaultMsg;
  vue.$Message.error({ content: errMsg, duration });
};

/**
 * 身份证的校验
 * */

// 验证身份证的数据是否正确
export const validateIdCard = (value, rule) => {
  let _IDRe18 = /^([1-6][1-9]|50)\d{4}(18|19|20)\d{2}((0[1-9])|10|11|12)(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
  let _IDre15 = /^([1-6][1-9]|50)\d{4}\d{2}((0[1-9])|10|11|12)(([0-2][1-9])|10|20|30|31)\d{3}$/;
  const regIdNum18 = new RegExp(_IDRe18);
  const regIdNum15 = new RegExp(_IDre15);
  if (regIdNum18.test(value) || regIdNum15.test(value)) {
    return true;
  } else {
    return false;
  }
};

/**
 * 验证手机号
 * */
export const validatePhoneNo = (value, rule) => {
  const regPhone = new RegExp(/^1\d{10}$/);
  if (regPhone.test(value)) {
    return true;
  } else {
    return false;
  }
};

/**
 * 验证银行卡号
 * */
export const bankCardCheck = bankNo => {
  var lastNum = bankNo.substr(bankNo.length - 1, 1); //取出最后一位（与luhn进行比较）
  var first15Num = bankNo.substr(0, bankNo.length - 1); //前15或18位
  var newArr = new Array();
  for (var i = first15Num.length - 1; i > -1; i--) {
    //前15或18位倒序存进数组
    newArr.push(first15Num.substr(i, 1));
  }
  var arrJiShu = new Array(); //奇数位*2的积 <9
  var arrJiShu2 = new Array(); //奇数位*2的积 >9
  var arrOuShu = new Array(); //偶数位数组
  for (var j = 0; j < newArr.length; j++) {
    if ((j + 1) % 2 == 1) {
      //奇数位
      if (parseInt(newArr[j]) * 2 < 9) arrJiShu.push(parseInt(newArr[j]) * 2);
      else arrJiShu2.push(parseInt(newArr[j]) * 2);
    } //偶数位
    else arrOuShu.push(newArr[j]);
  }
  var jishu_child1 = new Array(); //奇数位*2 >9 的分割之后的数组个位数
  var jishu_child2 = new Array(); //奇数位*2 >9 的分割之后的数组十位数
  for (var h = 0; h < arrJiShu2.length; h++) {
    jishu_child1.push(parseInt(arrJiShu2[h]) % 10);
    jishu_child2.push(parseInt(arrJiShu2[h]) / 10);
  }
  var sumJiShu = 0; //奇数位*2 < 9 的数组之和
  var sumOuShu = 0; //偶数位数组之和
  var sumJiShuChild1 = 0; //奇数位*2 >9 的分割之后的数组个位数之和
  var sumJiShuChild2 = 0; //奇数位*2 >9 的分割之后的数组十位数之和
  var sumTotal = 0;
  for (var m = 0; m < arrJiShu.length; m++) {
    sumJiShu = sumJiShu + parseInt(arrJiShu[m]);
  }
  for (var n = 0; n < arrOuShu.length; n++) {
    sumOuShu = sumOuShu + parseInt(arrOuShu[n]);
  }
  for (var p = 0; p < jishu_child1.length; p++) {
    sumJiShuChild1 = sumJiShuChild1 + parseInt(jishu_child1[p]);
    sumJiShuChild2 = sumJiShuChild2 + parseInt(jishu_child2[p]);
  }
  //计算总和
  sumTotal = parseInt(sumJiShu) + parseInt(sumOuShu) + parseInt(sumJiShuChild1) + parseInt(sumJiShuChild2);
  //计算luhn值
  var k = parseInt(sumTotal) % 10 == 0 ? 10 : parseInt(sumTotal) % 10;
  var luhn = 10 - k;
  if (lastNum == luhn) {
    // $("#banknoInfo").html("luhn验证通过");
    return true;
  } else {
    // $("#banknoInfo").html("银行卡号必须符合luhn校验");
    return false;
  }
};

/**
 * 产品信息的注册
 *    数据默认注册到sessionStorage中
 */
export const infoRegister = (productId, value) => {
  if (!productId) {
    return;
  }
  let getInfo = {};
  value = value || {};
  if (sessionStorage.getItem(productConfig.dataType[productId])) {
    getInfo = JSON.parse(sessionStorage.getItem(productConfig.dataType[productId]));
  }
  let saveValue = { ...getInfo, ...value };
  sessionStorage.setItem(productConfig.dataType[productId], JSON.stringify(saveValue));
};

// 产品信息的获取
export const infoGet = productId => {
  let res = null;
  if (!productId) {
    return;
  }
  if (sessionStorage.getItem(productConfig.dataType[productId])) {
    res = sessionStorage.getItem(productConfig.dataType[productId]);
    return JSON.parse(res);
  }
  return res;
};

/**
 * 信息的脱敏
 *    银行卡、手机、身份证、姓名、邮箱
 */
export const desensitizationInfo = (account, type, beforeCallback, afterCallback) => {
  const originalAccount = account;
  let result = '';
  if (!account) return;
  if (typeof account !== 'string') account = String(account);
  typeof beforeCallback === 'function' && beforeCallback(originalAccount);

  // 银行卡
  if (type === 'bankCard') {
    // result = account.substring(0, 4) + ' **** **** ' + account.substring(account.length - 4);
    result = new Array(account.length)
      .fill('*', 0, account.length)
      .join('')
      .replace(/(\*{4})/g, '$1 ');
  }

  // 身份证
  if (type === 'idCard') {
    let pat = /(\d{4})\d*(\d{4})/;
    result = account.replace(pat, '$1***********$2');
  }

  // 姓名
  if (type === 'name') {
    if (account.length <= 3) {
      result = '*' + account.substring(1, account.length);
    } else if (account.length > 3 && account.length <= 6) {
      result = '**' + account.substring(2, account.length);
    } else if (account.length > 6) {
      result = account.substring(0, 2) + '****' + account.substring(6, account.length);
    }
  }

  // 手机号
  if (type === 'phone') {
    let pat = /(\d{3})\d*(\d{4})/;
    result = account.replace(pat, '$1****$2');
  }

  // 邮箱
  if (type === 'email') {
    if (String(account).indexOf('@') > 0) {
      let str = account.split('@');
      let _s = '';
      if (str[0].length > 3) {
        for (let i = 3; i < str[0].length; i++) {
          _s += '*';
        }
        result = str[0].substr(0, 3) + _s + '@' + str[1];
      } else {
        for (let i = 1; i < str[0].length; i++) {
          _s += '*';
        }
        result = str[0].substr(0, 1) + _s + '@' + str[1];
      }
    }
  }
  typeof afterCallback === 'function' && afterCallback(originalAccount, result);
  return result;
};

export const faceErrorMessage = (msg, isCanFace = true) => {
  return new Promise((resolve, reject) => {
    Dialog.confirm({
      message: `<div class='face-content'><div class='title'>人脸验证失败</div><div class='desc'>${msg ||
        '请确认是否重新进行人脸识别？'}</div></div>`,
      className: 'face-error-dialog',
      confirmButtonText: '重新识别',
      showConfirmButton: isCanFace,
      cancelButtonText: '关闭离开'
    })
      .then(() => {
        // on confirm
        resolve('ok');
      })
      .catch(() => {
        // on cancel
        reject('no');
      });
  });
};

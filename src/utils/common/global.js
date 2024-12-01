/**
 * 这里是全局的业务代码
 * */

import { aesUtil } from '../dataProcess/secret';
import { borrowVerifyApplyPF, getBorrowVerifyResultPF } from '@/request/interface/common';
import { preBorrowingApply } from '@/request/interface/impower/Bank';
import CryptoJS from 'crypto-js';
import Vue from 'vue';
import { COOKIE_ID } from '@/utils/common/config';
import { infoGet } from '@/utils/common/common';
import productConfig from '@/config/product/product';

let dataRegisterConfig = {
  name: { project: 'xiaomeng', env: 'beta', version: '1.0.0', product: '', key: '' },
  expire: 0,
  data: {}
};

/***
 * 存储和删除不同产品的uniokey，放在sessionStorage，
 *
 * */
export const sdUnionKey = option => {
  if (option.productId && option?.applyUnionKey && option.saveStatus) {
    sessionStorage.setItem('applyUnionKey_' + option.productId, option?.applyUnionKey);
  } else if (option.productId && option?.applyUnionKey && !option.saveStatus) {
    sessionStorage.removeItem('applyUnionKey_' + option.productId);
  }
};

/**
 * 拼接对象的values
 * */
export const togetherJoiningName = option => {
  if (!option) {
    return;
  }
  if (Object.prototype.toString.call(option) === '[object Object]') {
    let objValueArr = Object.values(option),
      needName = objValueArr.join('_');
    return needName;
  }
  return '';
};

/**
 *  数据的注册
 *      命名规范：项目名 + 当前环境 + 项目版本 + 缓存key   name:{ project: "", env: "", version:"", product:"", key:"" }
 *      设置过期时间： Date.now() + expire      expire
 *      数据： data
 * */
export const dataRegister = option => {
  option = option || dataRegisterConfig;
  let { name, expire, data } = option,
    needName = togetherJoiningName(name),
    obj = {};
  expire && (obj.time = Date.now() + expire);
  obj.expire = expire;
  obj.value = data;
  needName && localStorage.setItem(needName, aesUtil.encrypt(obj));
};

/**
 * 获取注册的数据
 * */
export const getRegisterData = option => {
  if (!option) {
    return;
  }
  option = option || dataRegisterConfig;
  let { name } = option,
    needName = togetherJoiningName(name),
    getObj = localStorage.getItem(needName),
    parseRes = JSON.parse(aesUtil.decrypt(getObj)),
    isUse = true;

  parseRes?.time && Date.now() > parseRes.time && (isUse = false);
  return isUse ? parseRes.value : {};
};

/**
 * 格式化输入的数据
 *
 * */
export const formatTrimValue = data => {
  return formatArrOrObjTrimValue(data || {});
};

export const formatArrOrObjTrimValue = val => {
  for (let i in val) {
    if (typeof val[i] === 'string' && val[i].length > 0) {
      val[i] = val[i].replace(/\s*/g, '');
      if (i.trim().length < i.length) {
        delete val[i];
      }
    } else if (isAnyObject(val[i]) || (Array.isArray(val[i]) && val[i].length > 0)) {
      if (i.trim().length < i.length) {
        delete val[i];
      }
      formatArrOrObjTrimValue(val[i]);
    }
  }
  return val;
};

/**
 * 对象鉴别
 *
 * */
export const isAnyObject = val => Object.prototype.toString.call(val) === '[object Object]';

/**
 * 用户提款之前的获取校验包含（采税、提款、授信）
 *    返回的字段：
 *        0, "拒绝" 1, "通过"  2, "补件"  3,"税务授权"  4,"存在处于借款审核中的件"
 * */
export const checkWithdrawBefore = async applyUnionKey => {
  try {
    if (applyUnionKey) {
      let checkResult = null;
      checkResult = await borrowVerifyApplyPF({ applyUnionKey: applyUnionKey });
      if (checkResult) {
        return new Promise((resolve, reject) => {
          resolve(checkResult);
        });
      }
    }
  } catch (e) {
    return new Promise((resolve, reject) => {
      reject(e);
    });
  }
};

/**
 * 用户提款之前的获取校验的结果（采税、提款、授信）
 *    返回的字段：
 *        0, "拒绝" 1, "通过"  2, "补件"  3,"税务授权"  4,"存在处于借款审核中的件" 5，"审核中"
 * */
export const checkWithdrawBeforeResult = async applyUnionKey => {
  try {
    if (applyUnionKey) {
      let checkResult = null;
      checkResult = await getBorrowVerifyResultPF({ applyUnionKey: applyUnionKey });
      if (checkResult) {
        return new Promise((resolve, reject) => {
          resolve(checkResult);
        });
      }
    }
  } catch (e) {
    return new Promise((resolve, reject) => {
      reject(e);
    });
  }
};

/**
 * 订单支用
 *    借款校验通过之后，再次调用（放款准备信息）
 *        返回的data中 needGuaranteeConfirmOrder 值为1，则页面流转到担保费页面，0 则页面正常流转到借款申请页
 * */
export const checkWithdrawPassAfterPreBorrowingApply = async applyUnionKey => {
  try {
    if (applyUnionKey) {
      if (typeof applyUnionKey !== 'string') {
        applyUnionKey = String(applyUnionKey);
      }
      if (applyUnionKey && applyUnionKey.indexOf('?isOverVerify=true') !== -1) {
        applyUnionKey = applyUnionKey.split('?')[0];
      }
      let checkResult = null;
      checkResult = await preBorrowingApply({ applyUnionKey: applyUnionKey });
      if (checkResult) {
        return new Promise((resolve, reject) => {
          resolve(checkResult);
        });
      }
    }
  } catch (e) {
    return new Promise((resolve, reject) => {
      reject(e);
    });
  }
};

/**
 *
 * 页面重定向
 * */
export const systemPageRedirect = () => {};

/**
 * 加密
 * https://account-h5-sit.csxbank.com/xmydIndex?get=xxx &chlCode=MYD
 *    get : 页面加密参数(aes解码后包含小萌openId，悟空token，流水号outSeqNum)  sit加密秘钥：2rnvWRgfG7uxLAEV
 */
function aesEncode(encrypt, channelCode) {
  var key = CryptoJS.enc.Utf8.parse(channelCode);
  var srcs = CryptoJS.enc.Utf8.parse(JSON.stringify(encrypt));
  var encrypted = CryptoJS.AES.encrypt(srcs, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
  return encrypted.toString();
}

function aesDecrypt(encrypt, channelCode) {
  channelCode = CryptoJS.enc.Utf8.parse(channelCode);
  const decipher = CryptoJS.AES.decrypt(encrypt, channelCode, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });
  const result = decipher.toString(CryptoJS.enc.Utf8);
  return JSON.parse(result);
}

export const sanXianPageRedirect = option => {
  const mydData = infoGet(productConfig.productId['myd']) || null;

  try {
    if (process.env.NODE_ENV === 'development') {
      // 测试
      if (mydData?.referrer === '170') {
        return `https://account-h5-sit.csxbank.com/xmydIndex?get=${aesEncode(option, '2rnvWRgfG7uxLAEV')}&chlCode=MYD`;
      } else if (mydData?.referrer === '130244') {
        return `https://account-h5-uat.csxbank.com/xmydIndex?get=${aesEncode(option, '2rnvWRgfG7uxLAEV')}&chlCode=MYD`;
      } else {
        return `https://account-h5-sit.csxbank.com/xmydIndex?get=${aesEncode(option, '2rnvWRgfG7uxLAEV')}&chlCode=MYD`;
      }
    }
    // return `https://account-h5-sit.csxbank.com/xmydIndex?get=${aesEncode(option, '2rnvWRgfG7uxLAEV')}&chlCode=MYD`;
    if (process.env.NODE_ENV === 'uatProduction')
      return `https://account-h5-uat.csxbank.com/xmydIndex?get=${aesEncode(option, '2rnvWRgfG7uxLAEV')}&chlCode=MYD`;
    if (process.env.NODE_ENV === 'production')
      return `https://account-h5.csxbank.com/xmydIndex?get=${aesEncode(option, 'ndDyfnZT5a1hV6yJ')}&chlCode=MYD`;
    return '';
  } catch (e) {
    return '';
  }
};

export const updateUnionKey = unionKey => {
  let time = 1000 * 60 * 60 * 24 * 7;
  sessionStorage.setItem(COOKIE_ID.applyUnionKey, unionKey);
  Vue.prototype.setCookie(COOKIE_ID.applyUnionKey, unionKey, time);
};

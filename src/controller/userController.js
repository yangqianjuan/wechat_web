import User from '../model/User';
import store from '../store/index';
import Vue from 'vue';
import { COOKIE_ID } from '../utils/common/config';
import { formateDate } from '../utils/dataProcess/dateUtil';
import CreditInfo from '@/model/CreditInfo';
import { toThousands } from '@/utils/common/common';
import { judgeXMDApplyRoute } from '@/utils/credit/jdugeNextPath';
import {
  getTokenByOpenid,
  getUserBaseInfo,
  updateUserBaseInfo,
  updateUserSaleBaseInfo,
  getUserCreditResult,
  getUserBaseeinfoStatus,
  updateUserSaleBaseInfoNew
} from '@/request/interface/impower/UserInfo';

export const getToken = authorCode => {
  let loginUser = {
    authType: 'wechatmp',
    authorCode,
    username: ''
  };
  return getTokenByOpenid(loginUser).then(res => {
    let time = 1000 * 60 * 60 * 1.5;
    let data = res?.data?.data || {};
    Vue.prototype.setCookie(COOKIE_ID.jwtToken, data.accessToken, time);
    Vue.prototype.setCookie(COOKIE_ID.refreshToken, data.refreshToken, time);
    Vue.prototype.setCookie(COOKIE_ID.userId, data.userId, time);
    // 获取用户基本信息
    return jdugeNewUserRoute();
  });
};

export const jdugeNewUserRoute = () => {
  return new Promise((resolve, reject) => {
    getUserBaseInfo()
      .then(res => {
        let user = res?.data?.data ? new User(res.data.data) : new User({});
        store.commit('setUserInfo', user);
        resolve(user);
      })
      .catch(err => {
        reject(err);
      });
  });
};

export const getTokenByPhoneNum = paulaod => {
  // 存取token 刷新token 用户id在cookie
  return getTokenByOpenid(paulaod).then(res => {
    let time = 1000 * 60 * 60 * 1.5;
    let data = res?.data?.data || {};
    Vue.prototype.setCookie(COOKIE_ID.jwtToken, data.accessToken, time);
    Vue.prototype.setCookie(COOKIE_ID.refreshToken, data.refreshToken, time);
    Vue.prototype.setCookie(COOKIE_ID.userId, data.userId, time);
    Vue.prototype.setCookie(COOKIE_ID.instNo, data.instNo, time);

    return jdugeNewUserRoute();
  });
};

export const updateUserInfo = idCard => {
  let [idValidityStart, idValidityStop] = idCard.validDate.split('-');
  idValidityStart = formateDate(idValidityStart, '.');
  if (idValidityStop === '长期') {
    let date = new Date();
    date.setFullYear(9999);
    idValidityStop = date;
  } else {
    idValidityStop = formateDate(idValidityStop, '.');
  }
  let birth = formateDate(idCard.birth, '/');
  let payload = {
    idAddress: idCard.address,
    idBirthday: birth,
    idGender: idCard.sex,
    idGhStatus: 1,
    idSignOrg: idCard.authority,
    idTxStatus: 1,
    idValidityStart,
    idValidityStop,
    idno: idCard.idNum,
    userName: idCard.name,
    productId: idCard.productId,
    referrer: idCard.referrer,
    applyUnionKey: idCard.applyUnionKey
  };
  return updateUserBaseInfo(payload);
};

export const updateUserSaleInfo = idCard => {
  let [idValidityStart, idValidityStop] = idCard.validDate.split('-');
  idValidityStart = formateDate(idValidityStart, '.');
  if (idValidityStop === '长期') {
    let date = new Date();
    date.setFullYear(9999);
    idValidityStop = date;
  } else {
    idValidityStop = formateDate(idValidityStop, '.');
  }
  let birth = formateDate(idCard.birth, '/');
  let payload = {
    idAddress: idCard.address,
    idBirthday: birth,
    idGender: idCard.sex,
    idGhStatus: 1,
    idSignOrg: idCard.authority,
    idTxStatus: 1,
    idValidityStart,
    idValidityStop,
    idno: idCard.idNum,
    userName: idCard.name,
    productId: idCard.productId,
    referrer: idCard.referrer,
    applyUnionKey: idCard.applyUnionKey
  };
  return updateUserSaleBaseInfo(payload);
};

export const updateUserSaleInfoNew = idCard => {
  let [idValidityStart, idValidityStop] = idCard.validDate.split('-');
  idValidityStart = formateDate(idValidityStart, '.');
  if (idValidityStop === '长期') {
    let date = new Date();
    date.setFullYear(9999);
    idValidityStop = date;
  } else {
    idValidityStop = formateDate(idValidityStop, '.');
  }
  let birth = formateDate(idCard.birth, '/');
  let payload = {
    idAddress: idCard.address,
    idBirthday: birth,
    idGender: idCard.sex,
    idGhStatus: 1,
    idSignOrg: idCard.authority,
    idTxStatus: 1,
    idValidityStart,
    idValidityStop,
    idno: idCard.idNum,
    userName: idCard.name,
    productId: idCard.productId,
    referrer: idCard.referrer,
    applyUnionKey: idCard.applyUnionKey
  };
  // return updateUserSaleBaseInfoNew(payload);
  return updateUserSaleBaseInfo(payload);
};

/**
 * beijing -- update idCard info
 * */
export const updateBeiJingUserInfo = idCard => {
  let [idValidityStart, idValidityStop] = idCard.validDate.split('-');
  idValidityStart = formateDate(idValidityStart, '.');
  if (idValidityStop === '长期') {
    let date = new Date();
    date.setFullYear(9999);
    date.setMonth(11);
    date.setDate(31);
    idValidityStop = date;
  } else {
    idValidityStop = formateDate(idValidityStop, '.');
  }

  let birth = formateDate(idCard.birth, '/');
  let payload = {
    idAddress: idCard.address,
    idBirthday: birth,
    idGender: idCard.sex,
    idGhStatus: 1,
    idSignOrg: idCard.authority,
    idTxStatus: 1,
    idValidityStart,
    idValidityStop,
    idno: idCard.idNum,
    userName: idCard.name,
    productId: idCard.productId,
    referrer: idCard.referrer,
    applyUnionKey: idCard.applyUnionKey,
    mobileNo: idCard.mobileNo,
    smsCode: idCard.smsCode,
    custType: 'Ind01',
    referenceNo: idCard.referenceNo
  };
  return updateUserBaseInfo(payload);
};

/**
 *  获取用户的授信记录
 * */
export const getUserCreditInfo = params => {
  return new Promise((resolve, reject) => {
    getUserCreditResult(params)
      .then(res => {
        if (res?.data?.success) {
          let result;
          Array.isArray(res?.data?.data) ? (result = res.data.data) : (result = []);
          let creditInfo = formateUserCreditInfo(result);
          resolve(creditInfo);
        } else {
          reject(res);
        }
      })
      .catch(err => {
        reject(err);
      });
  });
};

/**
 * 用户的授信记录的处理
 * */
const formateUserCreditInfo = creditInfoArr => {
  let formatedCreditInfo = {
    totalApproveCredit: 0,
    totalAvaliableCredit: 0,
    creditInfoArr: []
  };
  if (creditInfoArr.length) {
    try {
      creditInfoArr.forEach(creditInfo => {
        if (creditInfo.approveCode === '00') {
          creditInfo = new CreditInfo(creditInfo);
          if (creditInfo.amtConfirmStatus === '01') {
            formatedCreditInfo.creditInfoArr.push(creditInfo);
            formatedCreditInfo.totalApproveCredit += parseInt(creditInfo.approveCredit);
            formatedCreditInfo.totalAvaliableCredit += parseInt(creditInfo.avaliableCredit);
          }
        }
      });

      // 授信申请的额度
      formatedCreditInfo.totalApproveCredit &&
        (formatedCreditInfo.totalApproveCredit = toThousands(formatedCreditInfo.totalApproveCredit));

      // 可以申请的额度
      formatedCreditInfo.totalAvaliableCredit &&
        (formatedCreditInfo.totalAvaliableCredit = toThousands(formatedCreditInfo.totalAvaliableCredit));

      formatedCreditInfo.productId = creditInfoArr[0].agreeProduct;
    } catch (e) {
      return formatedCreditInfo;
    }
  }
  return formatedCreditInfo;
};

export const queryUserInfo = () => {
  return new Promise((resolve, reject) => {
    const token = Vue.prototype.getCookie('wecaheat_xm_token');
    const code = Vue.prototype.getUrlParam('code');
    code && !token
      ? getToken(code)
          .then(user => {
            resolve(user);
          })
          .catch(err => {
            reject(err);
          })
      : jdugeNewUserRoute()
          .then(user => {
            resolve(user);
          })
          .catch(err => {
            reject(err);
          });
  });
};

export const jdugeIsCanBindBankCard = params => {
  let isCanBind = false,
    path = '';
  return new Promise((resolve, reject) => {
    getUserBaseeinfoStatus(params)
      .then(res => {
        res?.data?.data && (path = judgeXMDApplyRoute(res.data.data));
        path === '/xm_bc_entry' && (isCanBind = true);
        resolve(isCanBind);
      })
      .catch(err => {
        reject(err);
      });
  });
};

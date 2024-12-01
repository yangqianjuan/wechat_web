import Vue from 'vue';
import { COOKIE_ID, SESSION_ID } from '@/utils/common/config';
import { getFacePPToken, getSalesFacePPToken } from '@/request/interface/txQrc/faceP';

// 调取腾讯人脸识别
export const getFacePToken = option => {
  return new Promise((resolve, reject) => {
    let baseUrl = window.location.href;
    let params = {
      redirectUrl: `${baseUrl}?isOverVerify=true`
    };
    option?.applyUnionKey && (params.applyUnionKey = option?.applyUnionKey);
    // 把当前的路径拼过来加上已验证，发给腾讯的人脸识别路径请求接口
    getFacePPToken(params)
      .then(res => {
        // let data = res?.data?.data || {};
        const data = {
          url: res?.data?.data
        };
        let time = 1000 * 60 * 60 * 24 * 7;
        if (!option || option?.tokenType === 'myd') {
          // 授信
          sessionStorage.setItem('face_type_c', 'credit');
          // Vue.prototype.setCookie(COOKIE_ID.bizToken, data.bizToken, time);
          // sessionStorage.setItem(SESSION_ID.bizUrl, data.url);
        } else if (option.type === 'open') {
          // 开户
          sessionStorage.setItem('face_type_o', 'open');
          // sessionStorage.setItem(SESSION_ID.openACBizToken, data.bizToken);
          // sessionStorage.setItem(SESSION_ID.openACBizUrl, data.url);
        } else if (option.type === 'repay') {
          // 还款
          sessionStorage.setItem('face_type_r', 'repay');
          // sessionStorage.setItem(SESSION_ID.repayBizToken, data.bizToken);
          // sessionStorage.setItem(SESSION_ID.repayBizUrl, data.url);
        } else if (option.type === 'withdraw') {
          // 提款
          sessionStorage.setItem('face_type_b', 'borrow');
          // sessionStorage.setItem(SESSION_ID.withdrawBizToken, data.bizToken);
          // sessionStorage.setItem(SESSION_ID.withdrawBizUrl, data.url);
        }

        resolve(data);
      })
      .catch(err => {
        Vue.prototype.$notify.error({ msg: err?.data?.msg });
        reject(err);
      });
  });
};

// 调取腾讯人脸识别(销售)
export const getSalesFacePToken = option => {
  return new Promise((resolve, reject) => {
    let baseUrl = window.location.href;
    let params = {
      redirectUrl: `${baseUrl}?isOverVerify=true`
    };
    // 把当前的路径拼过来加上已验证，发给腾讯的人脸识别路径请求接口
    getSalesFacePPToken(params)
      .then(res => {
        let data = res?.data?.data || {};
        let time = 1000 * 60 * 60 * 24 * 7;
        // 授信
        sessionStorage.setItem('face_type_c', 'credit');
        Vue.prototype.setCookie(COOKIE_ID.bizToken, data.bizToken, time);
        sessionStorage.setItem(SESSION_ID.bizUrl, data.url);
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
  });
};

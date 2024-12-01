import Vue from 'vue';
import { Toast } from 'vant';
import { COOKIE_ID } from '@/utils/common/config';
import { getWxAuthUrl } from '@/utils/wx/wxUtils';
import { getUnionKey } from '@/request/interface/common';
import { addPending, removePending } from '@/core/request/core/cancel-request';
import { formatTrimValue } from '@/utils/common/global';

let wx = require('weixin-js-sdk');
const axios = require('axios');

axios.interceptors.request.use(
  config => {
    // 添加请求pendingList中
    addPending(config);
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  resp => {
    // 请求成功去除pending状态
    removePending(resp);
    return resp;
  },
  error => {
    if (error?.response) {
      // 请求失败去除pending状态
      removePending(error.response);
    }

    if (error?.message?.msg === 'Interface repeat request') {
      return Promise.reject({ code: 99990, msg: error.message.msg });
    }

    let errMsg = error.toString();
    if (errMsg === 'Error: Network Error') {
      Toast({
        message: '网络错误',
        icon: 'cross'
      });
    } else if (errMsg.includes('timeout') && errMsg.includes('exceeded')) {
      Toast({
        message: '网络超时',
        icon: 'cross'
      });
    }
    return Promise.reject(error);
  }
);

export class HttpRequest {
  /**
   * api 请求的path
   * type 请求的方式
   * payload 请求的负载
   * isNeedUnionKey 是否在请求的时候，请求UnionKey
   * fileSend 请求的数据返回的是流的形式，经过处理转为blob，用于展示
   * */
  async send(api, type, payload = {}, isNeedUnionKey = false, fileSend = false) {
    let way = '',
      params;
    let unionKey = sessionStorage.getItem('union_key') || Vue.prototype.getCookie(COOKIE_ID.applyUnionKey);
    const token = Vue.prototype.getCookie(COOKIE_ID.jwtToken) || '';
    payload = formatTrimValue(payload);
    isNeedUnionKey && !unionKey && !payload.applyUnionKey && (unionKey = await unionKeyHandler());
    isNeedUnionKey && !payload.applyUnionKey && (payload.applyUnionKey = unionKey);
    return new Promise((resolve, reject) => {
      way = type;
      (type == 'get' || type == 'GET') && (way = 'get');
      (type == 'post' || type == 'POST') && (way = 'post');
      (type == 'put' || type == 'PUT') && (way = 'put');
      params = payload;
      (way == 'get' || way == 'delete') &&
        (params = {
          params: payload
        });
      let config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Access-Control-Allow-Origin': '*'
        }
      };
      fileSend && (config.responseType = 'blob');
      token && !(type == 'post' || type == 'POST') && (params.headers = config.headers);
      // interceptors(axios);
      axios[way](api, params, config)
        .then(res => {
          responseSuccessHandler(res, resolve, reject, fileSend, payload);
        })
        .catch(err => {
          responseErrorHandler(err, reject);
        });
    });
  }
}

async function unionKeyHandler() {
  try {
    const unionKey = (
      await getUnionKey({ referrer: localStorage.referrer, productId: localStorage.productId, ts: localStorage.ts })
    )?.data?.data;
    sessionStorage.setItem('union_key', unionKey);
    return unionKey;
  } catch (error) {
    console.log(error);
  }
}

// function interceptors(axios) {
//   axios.interceptors.request.use(
//     config => {
//       // 重复请求则进行取消并移除
//       cancelPending(config);
//       // 添加请求pendingList中
//       addPending(config);
//       return config;
//     },
//     error => {
//       return Promise.reject(error);
//     }
//   );
//
//   axios.interceptors.response.use(
//     resp => {
//       // 请求成功去除pending状态
//       removePending(resp);
//       return resp;
//     },
//     error => {
//       if (error?.response) {
//         // 请求失败去除pending状态
//         removePending(error.response);
//       }
//
//       if (error?.message?.msg === 'Interface repeat request') {
//         return Promise.reject({ code: 99990, msg: error.message.msg });
//       }
//
//       let errMsg = error.toString();
//       if (errMsg === 'Error: Network Error') {
//         Toast({
//           message: '网络错误',
//           icon: 'cross'
//         });
//       } else if (errMsg.includes('timeout') && errMsg.includes('exceeded')) {
//         Toast({
//           message: '网络超时',
//           icon: 'cross'
//         });
//       }
//       return Promise.reject(error);
//     }
//   );
// }

function responseSuccessHandler(response, resolve, reject, fileSend, payload) {
  const statusCode = response?.status;
  let code = response?.data?.code;
  // 文件流 docs文档 res.headers['content-disposition'] === 'attachment;fileName=fkht.docx'
  if (fileSend && statusCode === 200) {
    resolve(response.data);
  } else if (statusCode >= 200 && statusCode <= 299 && code === '00000') {
    resolve(response);
  } else if (code === '30200' && response.data.success) {
    // 贵州税局第一步登录的情况
    resolve(response);
  } else if (statusCode >= 200 && statusCode <= 299 && response.statusText === 'OK' && payload.getGuaranteeContract) {
    // 获取xm担保费签署的合同链接
    resolve(response);
  } else {
    reject(response);
  }
}

async function responseErrorHandler(response, reject) {
  if (response?.response) {
    switch (response.response?.status) {
      case 401: {
        const instNoConfig = sessionStorage.getItem('instNoConfig');
        if (instNoConfig !== 'null' && instNoConfig) {
          const parseInfo = JSON.parse(instNoConfig);
          sessionStorage.setItem(
            'middlePageFlowInfo',
            JSON.stringify({ instNo: parseInfo.instNo, appId: parseInfo.appId })
          );
        } else {
          sessionStorage.setItem(
            'middlePageFlowInfo',
            JSON.stringify({
              instNo: '1000000',
              appId: process.env.NODE_ENV === 'development' ? 'wxbb2e56137b608e04' : 'wx069c496cd7f1da5d'
            })
          );
        }

        mpRedirect();
        break;
      }
      case 403:
        Toast({
          message: '暂无权限',
          icon: 'fail'
        });
        reject({ code: 403 });
        break;
      default:
        reject(response);
        break;
    }
  } else {
    response.code === 99990 ? reject({ msg: '接口被重复调用，请勿重复调用！' }) : reject(response);
  }
}

async function mpRedirect() {
  const entryType = sessionStorage.getItem('entryType');
  if (entryType !== 'null' && entryType === 'mp') {
    if (window.__wxjs_environment === 'miniprogram') {
      wx.miniProgram.reLaunch({
        url: 'pages/index/index'
      });
    } else {
      Vue.prototype.resetCookie();
      window.location.href = (await getWxAuthUrl(window.location.href?.split('#/')[1], true)).url;
    }
  } else {
    Vue.prototype.resetCookie();
    window.location.href = (await getWxAuthUrl(window.location.href?.split('#/')[1], true)).url;
  }
}

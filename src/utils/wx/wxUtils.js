let wx = require('weixin-js-sdk');
import { APPID, authWxHost, redirectUrl, COOKIE_ID } from '@/utils/common/config';
import { getTicket } from '@/request/interface/wx/getJsTicket';
import initUploadObj from '@/controller/upload';
import Vue from 'vue';
import store from '@/store';
import commonConfig from '@/config/common/index';
import productConfig from '@/config/product/instNoConfig';
import { getInstNoConfig } from '@/request/interface/common/index';

const maxSize = 400;
export function initWxConfig(jsApiList) {
  return new Promise((resolve, reject) => {
    getWxJsTicket()
      .then(jsTicket => {
        if (jsTicket) {
          wx.config({
            debug: false,
            appId: jsTicket.appId, // 必填，公众号的唯一标识
            timestamp: jsTicket.timestamp, // 必填，生成签名的时间戳
            nonceStr: jsTicket.nonceStr, // 必填，生成签名的随机串
            signature: jsTicket.signature, // 必填，签名
            jsApiList: jsApiList // 必填，需要使用的JS接口列表
          });
          wx.ready(() => {
            resolve(true);
          });
        } else {
          reject({ data: { msg: '获取信息接口存在波动, 请刷新页面，多尝试几次上传！' } });
        }
      })
      .catch(err => {
        reject(err);
      });
  });
}
export const wxReady = success => {
  wxCheckApi.then(() => {
    success;
  });
};

export const wxCheckApi = jsApiList => {
  return new Promise((resolve, reject) => {
    wx.checkJsApi({
      jsApiList,
      success: () => {
        resolve();
      }
    });
  });
};

export const chooseWxImage = (jsApiList, isPress = false) => {
  return new Promise((resolve, reject) => {
    initWxConfig(jsApiList)
      .then(_ => {
        wx.chooseImage({
          count: 1,
          sizeType: ['original'],
          sourceType: ['album', 'camera'],
          success: function(res) {
            let localIds = res?.localIds;
            wx.getLocalImgData({
              localId: localIds[0],
              success: function(resTwo) {
                let localData = resTwo?.localData;
                if (localData.indexOf(';base64,') == -1) {
                  //兼容处理，安卓获取的图片base64码没有前缀，而苹果有,base64前缀并不固定
                  localData = 'data:image/jpeg;base64,' + localData; //加上base64前缀
                }
                if (localData.indexOf('data:image/jgp;base64,') != -1) {
                  //兼容处理，若是苹果手机，将前缀中的jgp替换成jpeg
                  localData = localData.replace('data:image/jgp;base64,', 'data:image/jpeg;base64,');
                }
                let imageSize = localData.length / 1024 / 1.3;
                let prop = parseInt(Math.sqrt(localData.length / 102400 / 1.3));
                if (isPress && prop > 1) {
                  compressedImg(localData, prop, imgUrl => {
                    resolve(imgUrl);
                  });
                } else {
                  resolve(localData);
                }
              }
            });
          },
          fail: err => {
            reject({ data: { msg: '' } });
          },
          complete: res => {
            if (res?.errMsg === 'chooseImage:cancel') {
              reject({ data: { msg: '图片上传取消！' } });
            }
          }
        });
      })
      .catch(err => {
        reject(err);
      });
  });
};

// 基础路径构建
export const baseWxUrl = (pageCallbackUrl = '', isNeedAuth = false, appId, isDefaultLogin) => {
  Vue.prototype.$toasting.show({ message: '加载中', forbidClick: true });
  let hashPart = window.location.href.split('#')[0];
  let hashPath = window.location.href.split('#')[1];
  let loginPath = isDefaultLogin;
  let path = '',
    needRedirect = false,
    redUrl = '';
  hashPart = funcUrlDel(hashPart, 'code');
  hashPart = funcUrlDel(hashPart, 'state');
  // 兼容小程序携带的token
  const mpToken = Vue.prototype.getUrlParam('mpToken');
  const mpRefreshToken = Vue.prototype.getUrlParam('mpRefreshToken');
  const userId = Vue.prototype.getUrlParam('userId');
  if (mpToken && mpRefreshToken) {
    let time = 1000 * 60 * 60 * 1.5;
    Vue.prototype.setCookie(COOKIE_ID.jwtToken, mpToken, time);
    Vue.prototype.setCookie(COOKIE_ID.refreshToken, mpRefreshToken, time);
    Vue.prototype.setCookie(COOKIE_ID.userId, userId, time);
    Vue.prototype.setCookie(COOKIE_ID.instNo, '1000000', time);
    isNeedAuth = false;
  }
  hashPart = funcUrlDel(hashPart, 'mpToken');
  hashPart = funcUrlDel(hashPart, 'mpRefreshToken');
  hashPart = funcUrlDel(hashPart, 'userId');

  // 截取销售手机
  const salePhone = Vue.prototype.getUrlParam('salePhone');
  if (salePhone) {
    sessionStorage.setItem('salePhone', salePhone);
  }
  hashPart = funcUrlDel(hashPart, 'salePhone');

  // 保存来源类型
  const entryType = Vue.prototype.getUrlParam('entryType');
  if (entryType) {
    sessionStorage.setItem('entryType', entryType);
  }
  hashPart = funcUrlDel(hashPart, 'entryType');

  paramsPathRedirect(hashPath);
  try {
    /**
     * 创建重定向的path
     * */
    path = window.location.href
      .split('#')[1]
      .split('/')[1]
      .split('?')[0];
    needRedirect = pageRedirect(path);
    needRedirect && (pageCallbackUrl = window.location.href.split('#')[1].split('/')[1]);
  } catch (e) {
    console.log(e);
  }
  if (pageCallbackUrl) {
    if (mpToken) {
      if (isNeedAuth) {
        pageCallbackUrl = `login_by_verify?page_callback_url=${encodeURIComponent(pageCallbackUrl)}`;
      }
    } else {
      !isNeedAuth
        ? (pageCallbackUrl = encodeURIComponent(pageCallbackUrl))
        : (pageCallbackUrl = `${loginPath}?page_callback_url=${encodeURIComponent(pageCallbackUrl)}`);
    }
    redUrl = `${hashPart}#/${pageCallbackUrl}`;
  } else {
    // redUrl = `${hashPart}#/${redirectUrl}`;
    redUrl = `${hashPart}#/${loginPath}`;
  }
  redUrl = encodeURIComponent(redUrl);

  const authLinkType = Vue.prototype.getUrlParam('authLinkType');
  if (authLinkType === 'open') {
    // http://dev.xiaomengjr.com/?instNo=1000000&authLinkType=open&state=#/?page_callback_url=prod_bjb?uid=233705&prid=1155
    return decodeURIComponent(redUrl);
  }
  return `${authWxHost}?appid=${appId}&redirect_uri=${redUrl}&response_type=code&scope=snsapi_userinfo#wechat_redirect`;
};

/**
 * 还原系统的真实路径
 * */
export const getWxAuthUrl = async (pageCallbackUrl = '', isNeedAuth = false) => {
  /**
   * 解析租户信息
   * */
  try {
    Vue.prototype.$toasting.show({ message: '加载中', forbidClick: true });
    const result = await parseInstNoHandler(window.location.href, productConfig);
    return { url: baseWxUrl(pageCallbackUrl, isNeedAuth, result.appId, result.loginPath) };
  } catch (error) {
    Vue.prototype.$notify.error({ msg: '跳转路径参数不全！' });
  }
};

/**
 * 页面是否需要重定向
 * */
function pageRedirect(path) {
  return commonConfig.pathRedirect.indexOf(path) !== -1 ? true : false;
}

/**
 * 页面重定向
 * */
function paramsPathRedirect(path) {
  let isRedirect = commonConfig.paramsPathRedirect.filter(item => {
    return path.indexOf(item) !== -1;
  });
  if (isRedirect) {
    let href = (href = decodeURIComponent(window.location.href));
    let params = '';
    let paramsIndex = 1;
    isRedirect[0] === commonConfig.paramsPathRedirect[1] && (paramsIndex = 2);
    href &&
      (params = href
        .split('#')[1]
        .split('/')[1]
        .split('?')[paramsIndex]);
    localStorage.pathRedirect = params;
    isRedirect[0] === commonConfig.paramsPathRedirect[1] && (localStorage.pathRedirect = params + `&${isRedirect[0]}`);
  }
}

/**
 * 路径的字段的处理(删除对应的字段)
 * */

export const funcUrlDel = (local, name) => {
  let baseUrl = '';
  if (local.indexOf('&') > -1) {
    baseUrl = local.split('?')[0] + '?';
  } else {
    baseUrl = local.split('?')[0];
  }
  let query = local.split('?')[1];
  if (query?.indexOf(name) > -1) {
    var obj = {};
    var arr = query.split('&');
    for (var i = 0; i < arr.length; i++) {
      arr[i] = arr[i].split('=');
      obj[arr[i][0]] = arr[i][1];
    }
    delete obj[name];
    var url =
      baseUrl +
      JSON.stringify(obj)
        .replace(/[\"\{\}]/g, '')
        .replace(/\:/g, '=')
        .replace(/\,/g, '&');
    return url;
  } else {
    return local;
  }
};

function compressedImg(path, prop, callback) {
  let img = new Image();
  img.src = path;
  img.onload = function() {
    let that = this;
    // 按压缩比例进行压缩
    let w = that.width / prop,
      h = that.height / prop;
    let quality = 0.9;
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    // 创建属性节点
    let anw = document.createAttribute('width');
    anw.nodeValue = w;
    let anh = document.createAttribute('height');
    anh.nodeValue = h;
    canvas.setAttributeNode(anw);
    canvas.setAttributeNode(anh);
    ctx.drawImage(that, 0, 0, w, h);
    // quality值越小，所绘制出的图像越模糊
    let imgUrl = canvas.toDataURL('image/jpeg', quality); //压缩后的图片base64码
    let cmpressedSize = imgUrl.length / 1024 / 1.3;
    if (cmpressedSize >= maxSize) {
      compressedImg(imgUrl, prop + 0.2, callback);
    } else {
      callback(imgUrl);
    }
  };
}
export const getFileName = () => {
  return `${Vue.prototype.getCookie(COOKIE_ID.userId)}_${new Date().getTime()}.jpg`;
};

export const initWx = jsApiList => {
  return new Promise((resolve, reject) => {
    getTicket().then(res => {
      let data = res?.data?.data;
      wx.config({
        debug: true,
        appId: data.appId, // 必填，公众号的唯一标识
        timestamp: data.timestamp, // 必填，生成签名的时间戳
        nonceStr: data.nonceStr, // 必填，生成签名的随机串
        signature: data.signature, // 必填，签名
        jsApiList // 必填，需要使用的JS接口列表
      });
      resolve(true);
    });
  });
};

export const setShareAppMessage = config => {
  let jsApiList = ['updateAppMessageShareData'];
  initWx(jsApiList).then(res => {
    wx.updateAppMessageShareData({
      title: config.title,
      desc: config.desc,
      link: config.link,
      imgUrl: config.imgUrl
    });
  });
};

export const uploadUtil = (that, file, folder) => {
  return new Promise((resolve, reject) => {
    initUploadObj(
      that,
      new Date().getTime(),
      file,
      'image',
      res => {
        resolve(res.pic);
      },
      folder
    );
  }).catch(err => {
    console.log(err);
  });
};

export const getWxJsTicket = async () => {
  let jsTicket = {};
  try {
    jsTicket = (await getTicket())?.data?.data;
    store.commit('setJsTicket', jsTicket);
    return Promise.resolve(jsTicket);
  } catch (err) {
    return Promise.reject(err);
  }
};

export const getNetworkType = async () => {
  return new Promise((resolve, reject) => {
    wx.getNetworkType({
      success: result => {},
      fail: error => {},
      complete: () => {}
    });
  });
};

/**
 * 解析机构号的配置
 * */
export const parseInstNoHandler = async (path, instNoObj) => {
  try {
    const parsePathResult = parsePathHandler(path);
    let loginPath = 'login_by_verify';
    let returnResult = {
      appId: process.env.NODE_ENV === 'development' ? 'wxbb2e56137b608e04' : 'wx069c496cd7f1da5d',
      loginPath
    };
    if (parsePathResult[1] !== '1000000') {
      // loginPath = 'login';
      loginPath = 'login_by_verify';
    }
    // 解析缓存
    const cacheInstNo = sessionStorage.getItem('instNoConfig');
    if (cacheInstNo && cacheInstNo !== 'null' && JSON.parse(cacheInstNo).instNo === parsePathResult[1]) {
      returnResult = {
        appId: JSON.parse(cacheInstNo).appId,
        // loginPath: JSON.parse(cacheInstNo).instNo !== '1000000' ? 'login' : 'login_by_verify'
        loginPath: JSON.parse(cacheInstNo).instNo !== '1000000' ? 'login_by_verify' : 'login_by_verify'
      };
      return returnResult;
    }
    // 没有缓存
    const instNoConfig = await getInstNoConfig({ t: instNoObj[parsePathResult[1]].trInstNo });
    if (instNoConfig?.data?.success && instNoConfig?.data?.data) {
      sessionStorage.setItem('instNoConfig', JSON.stringify(instNoConfig.data.data));
      if (instNoConfig.data.data.appId) {
        returnResult = { appId: instNoConfig.data.data.appId, loginPath };
      } else {
        returnResult = {
          appId:
            instNoObj[parsePathResult[1]].appId || process.env.NODE_ENV === 'development'
              ? 'wxbb2e56137b608e04'
              : 'wx069c496cd7f1da5d',
          loginPath
        };
      }
    } else {
      returnResult = {
        appId:
          instNoObj[parsePathResult[1]].appId || process.env.NODE_ENV === 'development'
            ? 'wxbb2e56137b608e04'
            : 'wx069c496cd7f1da5d',
        loginPath
      };
    }
    return returnResult;
  } catch (error) {
    const parsePathResult = parsePathHandler(path);
    let loginPath = 'login_by_verify';
    if (parsePathResult[1] !== '1000000') {
      // loginPath = 'login';
      loginPath = 'login_by_verify';
    }
    const appId =
      instNoObj[parsePathResult[1]].appId || process.env.NODE_ENV === 'development'
        ? 'wxbb2e56137b608e04'
        : 'wx069c496cd7f1da5d';
    return { appId, loginPath };
  }
};

function parsePathHandler(path) {
  let splitInstNoObj = ['instNo', '1000000'];
  if (path && path.indexOf('instNo=') !== -1) {
    const instNoStr = path.substring(path.indexOf('instNo='), path.indexOf('instNo=') + 14);
    const secondSplitArr = instNoStr.split('=');
    splitInstNoObj = secondSplitArr[1] ? secondSplitArr : splitInstNoObj;
  } else {
    let middlePageFlowInfo = sessionStorage.getItem('middlePageFlowInfo');
    if (middlePageFlowInfo !== 'null' && middlePageFlowInfo) {
      middlePageFlowInfo = JSON.parse(middlePageFlowInfo);
      splitInstNoObj = ['instNo', middlePageFlowInfo.instNo];
    }
  }
  return splitInstNoObj;
}

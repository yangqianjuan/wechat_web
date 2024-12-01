/*
 * @Author: hsf
 * @Date: 2023-10-09 09:51:54
 * @LastEditors: hsf
 * @LastEditTime: 2024-05-31 11:00:31
 * @Description:
 */
import { infoGet, infoRegister } from '@/utils/common/common';
import productConfig from '@/config/product/product';
import Vue from 'vue';
import { COOKIE_ID } from '@/utils/common/config';
import { getOpenUnionKeyInfoHandler } from '@/request/interface/common/index';

// http://dev.xiaomengjr.com/?state=#/login_by_verify?uid=178340466&prid=1155&entryType=0003&applyUnionKey=1215791489323008
// https://dev.xiaomengjr.com/front/?state=#/login_by_verify?uid=178340466&prid=1155&entryType=0003&applyUnionKey=1215791489323008

export const openPageHandler = async function() {
  try {
    let routeParams = this.$route.query || {};

    // 查询是否是外部进入北京银行（开放 -- 第三方: 开放平台）
    let applyUnionKey = '';
    let entryType = Vue.prototype.getUrlParam('entryType');

    const getUrlParam = function(name, url) {
      name = name.replace(/[\[\]]/g, '\\$&');
      const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
      const results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return '';
      let value = results[2].replace(/\+/g, ' ');
      value = value.replace(/\//g, '');
      return decodeURIComponent(value);
    };

    // || (entryType === '0003' && applyUnionKey)

    if (localStorage?.pathRedirect?.indexOf('entryType=0003') !== -1) {
      // entryType=0003 applyUnionKey

      if (!applyUnionKey) {
        applyUnionKey = localStorage.getItem('beijing-open-unionKey');
      }

      if (!applyUnionKey) {
        applyUnionKey = getUrlParam('applyUnionKey', localStorage.pathRedirect);
      }

      if (!applyUnionKey) {
        return;
      }

      const simulateLoginResult = await getOpenUnionKeyInfoHandler({
        applyUnionKey
      });

      let time = 1000 * 60 * 60 * 1.5;
      let data = simulateLoginResult?.data?.data || {};
      Vue.prototype.setCookie(COOKIE_ID.jwtToken, data.accessToken, time);
      Vue.prototype.setCookie(COOKIE_ID.refreshToken, data.refreshToken, time);
      Vue.prototype.setCookie(COOKIE_ID.userId, data.userId, time);
      Vue.prototype.setCookie(COOKIE_ID.instNo, data.instNo, time);

      // 信息预设
      let preSet = { phone: data.mobile };
      infoPreSet(preSet);

      // console.log('测试的数据', simulateLoginResult.data);

      if (localStorage.pathRedirect) {
        let path = '/prod_bjb?' + localStorage.pathRedirect;
        this.$router.replace(path).then(_ => {
          localStorage.removeItem('pathRedirect');
          localStorage.removeItem('beijing-open-unionKey');
        });
      } else {
        this.$router.replace({ path: '/prod_bjb', query: { ...routeParams } }).then(_ => {
          localStorage.removeItem('beijing-open-unionKey');
        });
      }
    }

    return true;
  } catch (error) {
    console.log('error', error);
  }
};

/**
 * 系统回调
 *    router-params：
 *           entryType: 0001 (客一客\直接转到产品详情页) 0002（三湘产品）0003 (北京银行)
 *           prid:    (产品id)
 *           applyUnionKey：（申请标识，回填的）
 * */
export const loginAfterOperate = function(path) {
  if (!path) {
    return;
  }
  let routeParams = this.$route.query || {};
  if (localStorage?.pathRedirect && localStorage?.pathRedirect?.indexOf('entryType=0001') !== -1) {
    path = '/prod_xmkd?' + localStorage.pathRedirect;
    this.$router.replace(path).then(_ => {
      localStorage.pathRedirect = '';
    });
  } else if (localStorage?.pathRedirect?.indexOf('entryType=0002') !== -1) {
    sanXianHandler();
    this.$router.replace({ path: path, query: { ...routeParams } }).then(_ => {
      localStorage.pathRedirect = '';
    });
  } else if (localStorage?.pathRedirect?.indexOf('entryType=0003') !== -1) {
    path = '/prod_bjb?' + localStorage.pathRedirect;
    this.$router.replace(path).then(_ => {
      localStorage.pathRedirect = '';
    });
  } else {
    if (routeParams?.entryType === '0001') {
      path = '/prod_xmkd';
    }

    let query = { ...routeParams };
    delete query.page_callback_url;

    this.$router.replace({ path: path, query }).then(res => {
      try {
        if (res.name === 'loginByVerify' || res.path.indexOf('login_by_verify') !== -1) {
          // 添加逻辑 是否到首页 检测是不是，存在这种 /login_by_verify?page_callback_url=prod_bjb%3Fuid%3D252&prid=1155 路由
          // /login_by_verify?page_callback_url=prod_bjb?uid=252&prid=1155
          if (res.fullPath.indexOf('prod_bjb')) {
            const getUrlParam = function(name, url) {
              name = name.replace(/[\[\]]/g, '\\$&');
              const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
              const results = regex.exec(url);
              if (!results) return null;
              if (!results[2]) return '';
              let value = results[2].replace(/\+/g, ' ');
              value = value.replace(/\//g, '');
              return decodeURIComponent(value);
            };

            let decodePath = decodeURIComponent(res.fullPath);
            let uid = getUrlParam('uid', decodePath);

            this.$router.replace({
              path: '/prod_bjb',
              query: {
                uid,
                prid: '1155'
              }
            });

            return;
          }

          if (res.fullPath.indexOf('page_callback_url') !== -1) {
            let retUrl = res.fullPath.split('page_callback_url=');
            this.$router.replace({ path: retUrl[1] });

            return;
          }

          this.$router.replace({ path: '/' });
          return;
        }
      } catch (error) {
        this.$router.replace({ path: '/' });
      }
    });
  }

  // 信息预设
  let preSet = { phone: this.phoneNum };
  infoPreSet(preSet);
};

/**
 * https://xxx.xiaomengjr.com/front/#/login_by_verify?uid=xxx&prid=1038&entryType=0002
 * http://dev.xiaomengjr.com/#/?uid=170&prid=1038&entryType=0002 13093300583
 * http://dev.xiaomengjr.com/#/login_by_verify?entryType=0002%3Fuid%3D170%26prid%3D1038
 * http://dev.xiaomengjr.com/#/login_by_verify?entryType=0002&uid=170&prid=1038
 * myd_local_info：{"referrer":"5000","productId":"1038","entryType":"0002"}
 * */
function sanXianHandler() {
  let saveObj = {};
  let getInfo = infoGet(productConfig.productId['myd']);
  try {
    const s1 = localStorage?.pathRedirect?.split('&');
    s1?.forEach(item => {
      if (item) {
        let s2 = item.split('=');
        if (s2[0] === 'uid') {
          saveObj.referrer = s2[1];
        } else if (s2[0] === 'prid') {
          saveObj.productId = s2[1];
        } else {
          saveObj[s2[0]] = s2[1];
        }
      }
    });
    infoRegister(productConfig.productId['myd'], { ...getInfo, ...saveObj });
  } catch (e) {
    infoRegister(productConfig.productId['myd'], { ...getInfo, ...saveObj });
  }
}

function infoPreSet() {
  localStorage.globalInfoPreSet = JSON.stringify({
    ...arguments[0]
  });
}

export const sanXianInfoRegister = sanXianHandler;

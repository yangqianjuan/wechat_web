import { getWxAuthUrl } from '@/utils/wx/wxUtils';

const tools = {
  install(Vue) {
    Vue.prototype.getCookie = function(cName) {
      if (document.cookie.length > 0) {
        let cStart = document.cookie.indexOf(cName + '=');
        if (cStart != -1) {
          cStart = cStart + cName.length + 1;
          let cEnd = document.cookie.indexOf(';', cStart);
          if (cEnd == -1) cEnd = document.cookie.length;
          return unescape(document.cookie.substring(cStart, cEnd));
        }
      }
      return '';
    };

    Vue.prototype.setCookie = function(c_name, value, expireDays) {
      let expireDate = new Date();
      expireDate.setTime(expireDate.getTime() + expireDays);
      document.cookie =
        c_name + '=' + escape(value) + (expireDays == null ? '' : ';expires=' + expireDate.toGMTString());
    };

    Vue.prototype.getUrlParam = function(name) {
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

    Vue.prototype.isWechat = function() {
      const wechatAgent = window.navigator.userAgent.toLowerCase().indexOf('micromessenger');
      return wechatAgent > -1 || typeof window.navigator.wxuserAgent !== 'undefined' ? true : false;
    };

    /**
     * 设置title
     * */
    Vue.prototype.setWechatTitle = function(title) {
      document.title = title;
      const mobile = navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(mobile)) {
        const iframe = document.createElement('iframe');
        iframe.style.visibility = 'hidden';
        // 替换成站标favicon路径或者任意存在的较小的图片即可
        // iframe.setAttribute('src', icon);
        const iframeCallback = function() {
          setTimeout(() => {
            iframe.removeEventListener('load', iframeCallback);
            document.body.removeChild(iframe);
          }, 10);
        };
        iframe.addEventListener('load', iframeCallback);
        document.body.appendChild(iframe);
      }
    };

    Vue.prototype.resetCookie = () => {
      var keys = document.cookie.match(/[^ =;]+(?=\=)/g);
      if (keys) {
        for (var i = keys.length; i--; ) document.cookie = keys[i] + '=0;expires=' + new Date(0).toUTCString();
      }
    };

    Vue.prototype.$http = (api, type, param, isNeedToken = false) => {
      let way = '';
      let params;
      const config = {
        headers: { token: '' }
      };
      return new Promise((resolve, reject) => {
        if (!type) {
          console.log('请求方式为调用');
          return;
        }
        if (!param) {
          param = {};
        }

        if (type == 'get' || type == 'GET') {
          way = 'get';
        } else if (type == 'post' || type == 'POST') {
          way = 'post';
        } else if (type == 'put' || type == 'PUT') {
          way = 'put';
        } else {
          way = type;
        }
        if (way == 'get' || way == 'delete') {
          params = {
            params: param
          };
        } else {
          params = param;
        }
      });
    };

    /**
     * 功能：
     *    1、获取需要回调，重定向的页面，
     *    2、获取token
     *    3、是否是微信端
     *    4、返回系统的路径
     * */
    Vue.prototype.autoRefreshIndex = async () => {
      let pageCallbackUrl = Vue.prototype.getUrlParam('page_callback_url');
      const token = Vue.prototype.getCookie('wecaheat_xm_token');
      let isNeedAuth = true;
      if (Vue.prototype.isWechat()) {
        return token ? false : (await getWxAuthUrl(pageCallbackUrl, isNeedAuth)).url;
      } else {
        return token ? false : `${window.location.href.split('#')[0]}#/login_by_verify`;
      }
    };
  }
};

export default tools;

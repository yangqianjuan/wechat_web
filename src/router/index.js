/*
 * @Author: hsf
 * @Date: 2023-10-26 17:58:59
 * @LastEditors: hsf
 * @LastEditTime: 2024-05-31 10:35:21
 * @Description:
 */
import Vue from 'vue';
import VueRouter from 'vue-router';
// 路由执行
const routeExe = function(options, callback) {
  if (callback && typeof callback === 'function') callback();
  Vue.use(VueRouter);
  const router = new VueRouter({
    routes: options.routes
  });
  // 路由加载之前校验
  router.beforeEach(async (to, from, next) => {
    // add beijing bank key
    if (to?.query?.entryType === '0003' && to?.query?.applyUnionKey) {
      localStorage.setItem('beijing-open-unionKey', to?.query?.applyUnionKey);
    }

    if (to.meta.title) document.title = to.meta.title;
    if (to.meta.skipAuth) {
      next();
      return;
    }
    const token = Vue.prototype.getCookie('wecaheat_xm_token');
    // token存在
    if (token && token !== undefined) {
      // 如果有page callback url  要加判断
      let pageCallbackUrl = Vue.prototype.getUrlParam('page_callback_url');
      if (localStorage.isNeedRedirect) {
        window.localStorage.removeItem('isNeedRedirect');
        next();
        return;
      }
      if (pageCallbackUrl) {
        window.localStorage.setItem('isNeedRedirect', true);
        if (pageCallbackUrl !== 'xwe_pre_credut_result') {
          next({ path: `/${pageCallbackUrl}` });
          if (localStorage.isNeedRedirect) {
            window.localStorage.removeItem('isNeedRedirect');
          }
        } else {
          next();
        }
        return;
      } else {
        // 没有页面的回调，token存在
        next();
        return;
      }
    } else {
      // 重置路由，回到登陆页，有页面的回调，回跳转到响应的页面
      let result = await Vue.prototype.autoRefreshIndex();
      if (result) window.location.href = result;
      next();
    }
  });
  router.afterEach((to, from) => {
    let bodySrcollTop = document.body.scrollTop;
    if (bodySrcollTop !== 0) {
      document.body.scrollTop = 0;
      return;
    }
    let docSrcollTop = document.documentElement.scrollTop;
    if (docSrcollTop !== 0) document.documentElement.scrollTop = 0;
  });
  return router;
};

const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location, onResolve, onReject) {
  undefined;
  if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject);
  return originalPush.call(this, location).catch(err => err);
};
const originalReplace = VueRouter.prototype.replace;
VueRouter.prototype.replace = function replace(location, onResolve, onReject) {
  if (onResolve || onReject) return originalReplace.call(this, location, onResolve, onReject);
  return originalReplace.call(this, location).catch(err => err);
};

export default {
  routeExe
};

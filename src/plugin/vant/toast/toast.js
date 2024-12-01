/*
 * @Author: hsf
 * @Date: 2023-06-08 21:46:11
 * @LastEditors: hsf
 * @LastEditTime: 2023-07-14 10:49:36
 * @Description:
 */
import Vue from 'vue';
import { Toast } from 'vant';
let toastInstance = null;

/**
 * 处理中的加载状态
 * */

Vue.prototype.$toasting = {
  show: option => {
    if (!toastInstance) {
      let options = { duration: 0, ...option };
      toastInstance = Toast.loading(options);
    }
  },
  hide: option => {
    if (toastInstance) {
      toastInstance.clear();
      toastInstance = null;
    } else {
      toastInstance = null;
    }
  },
  success: option => {
    if (toastInstance) {
      toastInstance.clear();
      toastInstance = null;
      Toast({
        ...option,
        message: option.msg,
        icon: 'success',
        duration: 1000
      });
    } else {
      Toast({
        ...option,
        message: option.msg,
        icon: 'success',
        duration: 1000
      });
    }
  },
  error: option => {
    if (toastInstance) {
      toastInstance.clear();
      toastInstance = null;
      Toast({
        ...option,
        message: option.msg,
        icon: 'cross',
        duration: 1000
      });
    } else {
      Toast({
        ...option,
        message: option.msg,
        icon: 'cross',
        duration: 1000
      });
    }
  },
  info: option => {
    if (toastInstance) {
      toastInstance.clear();
      toastInstance = null;
      Toast({
        ...option,
        message: option.msg,
        icon: 'fail',
        duration: option.duration === 0 ? 0 : 3000
      });
    } else {
      Toast({
        ...option,
        message: option.msg,
        icon: 'fail',
        duration: option.duration === 0 ? 0 : 3000
      });
    }
  }
};

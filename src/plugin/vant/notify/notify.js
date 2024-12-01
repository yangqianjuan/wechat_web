import Vue from 'vue';
import { Notify } from 'vant';

/**
 * 信息提示
 * */

Vue.prototype.$notify = {
  // 基本提示
  info: options => {
    if (options.duration !== 0 && !options.duration) {
      options.duration = 1500;
    }
    options.msg &&
      Notify({
        message: options.msg,
        color: options.color ? options.color : '#1B6FFB',
        duration: options.duration,
        background: options.background ? options.background : '#EAE9E9'
      });
  },
  //   警告
  warn: options => {
    if (options.duration !== 0 && !options.duration) {
      options.duration = 1500;
    }
    options.msg &&
      Notify({
        type: 'warning',
        message: options.msg,
        duration: options.duration
      });
  },
  //  成功
  success: options => {
    if (options.duration !== 0 && !options.duration) {
      options.duration = 1500;
    }
    options.msg &&
      Notify({
        message: options.msg,
        color: options.color ? options.color : '#21AF0B',
        duration: options.duration,
        background: options.background ? options.background : '#EAFFD9'
      });
  },
  //   错误
  error: options => {
    if (options.duration !== 0 && !options.duration) {
      options.duration = 2500;
    }
    options.msg &&
      Notify({
        message: options.msg,
        color: options.color ? options.color : '#F42D2D',
        duration: options.duration,
        background: options.background ? options.background : '#FFE1E1'
      });
  },
  // 取消提示
  clear: option => {
    Notify.clear();
  }
};

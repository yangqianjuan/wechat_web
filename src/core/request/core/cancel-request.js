import axios from 'axios';
// 存储pengding请求的容器
export const pendingList = new Map();

/**
 * 重复请求取消上次请求
 */

// 1、方法的封装
//  pengdingList: 盛放接口处于pengding（请求中）状态的容器，key是接口唯一标识，value是该接口的cancel请求的方法

//  getFetchKey: 生成接口唯一标识的方法

//  addPending：把请求加到pending容器的方法

//  removePending：把请求从pengding容器中移除的方法

//  cancelPending：取消请求并从pengding中移除的方法

// 生成各个请求标识
export const getFetchKey = config => {
  let token;
  if (config) {
    const { url, method } = config;
    token = [method, url].join('&');
  }
  return token;
};

// 添加pengding请求
export const addPending = config => {
  removePending({ config });
  const fetchKey = getFetchKey(config);
  if (fetchKey) {
    config.cancelToken =
      config.cancelToken ||
      new axios.CancelToken(cancel => {
        !pendingList.has(fetchKey) && pendingList.set(fetchKey, cancel);
      });
  }
};

// 移除pengding请求
export const removePending = config => {
  if (config?.config) {
    cancelPending(config.config);
  }
};

// 取消请求
export const cancelPending = config => {
  const fetchKey = getFetchKey(config);
  if (fetchKey && pendingList.has(fetchKey)) {
    const cancel = pendingList.get(fetchKey);
    cancel && cancel({ msg: 'Interface repeat request' });
    pendingList.delete(fetchKey);
  }
};

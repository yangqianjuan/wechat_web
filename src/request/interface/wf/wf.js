import ApiConfig from '../../path/api';
import { RequestInstance as Http } from '@/core/request/core/index';

// 微风税局授权登录页，链接获取
export const getWFLoginLink = payload => {
  const api = ApiConfig.getWFLoginLink;
  return Http.send(api, 'get', payload);
};

// 获取登录的结果
export const getWFLoginResult = payload => {
  const api = ApiConfig.getWFLoginResult;
  return Http.send(api, 'get', payload);
};

// 获取内部授信的申请（主要是微风授权的时候）状态
export const getWFApplyStatus = payload => {
  const api = ApiConfig.getWFApplyStatus;
  return Http.send(api, 'get', payload);
};

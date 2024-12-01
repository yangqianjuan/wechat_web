/*
 * @Author: hsf
 * @Date: 2023-06-08 21:46:11
 * @LastEditors: hsf
 * @LastEditTime: 2023-07-13 16:36:38
 * @Description:
 */
import ApiConfig from '../../path/api';
import { RequestInstance as Http } from '@/core/request/core/index';

export const getFsdApplyUrl = payload => {
  const api = ApiConfig.getFsdApplyUrl;
  return Http.send(api, 'put', payload);
};

export const getSaasApplyUrl = payload => {
  const api = ApiConfig.getSaasApplyUrl;
  return Http.send(api, 'put', payload);
};

export const getProtocolUrl = payload => {
  const api = ApiConfig.getProtocolUrl;
  if (payload?.searchType === 'sales') {
    return Http.send(api, 'post', payload);
  } else {
    return Http.send(api, 'post', payload, true);
  }
};

export const getProTocolTest = payload => {
  const api = ApiConfig.getProTocolTest;
  return Http.send(api, 'get', payload);
};

export const getBeijingProtocolUrl = payload => {
  const api = ApiConfig.getBeijingProtocolUrl;
  return Http.send(api, 'post', payload, true);
};

export const getBeijingLoanDetailProtocolUrl = payload => {
  const api = ApiConfig.getBeijingLoanDetailProtocolUrl;
  return Http.send(api, 'post', payload);
};

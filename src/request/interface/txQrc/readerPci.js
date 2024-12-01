/*
 * @Author: hsf
 * @Date: 2023-11-13 09:36:18
 * @LastEditors: hsf
 * @LastEditTime: 2024-11-12 13:27:43
 * @Description:
 */
import ApiConfig from '../../path/api';
import { RequestInstance as Http } from '@/core/request/core/index';

export const idCardOCR = payload => {
  const api = `${ApiConfig.idCardOCR}`;
  return Http.send(api, 'get', payload, true);
};

export const idCardOCRSJ = payload => {
  const api = `${ApiConfig.idCardOCR}`;
  return Http.send(api, 'get', payload, true);
};

export const salesIdCardOCR = payload => {
  const api = `${ApiConfig.idCardOCR}`;
  return Http.send(api, 'get', payload);
};

export const bizLicenseOCR = payload => {
  const api = `${ApiConfig.bizLicenseOCR}`;
  return Http.send(api, 'get', payload, true);
};

export const bankCardOCR = payload => {
  const api = `${ApiConfig.bankCardOCR}`;
  return Http.send(api, 'get', payload, true);
};

export const picUpload = payload => {
  const api = `${ApiConfig.picUpload}`;
  return Http.send(api, 'get', payload, true);
};

import ApiConfig from '../../path/api';
import { RequestInstance as Http } from '@/core/request/core/index';

export const getFacePPToken = payload => {
  const api = `${ApiConfig.getFacePPToken}`;
  return Http.send(api, 'get', payload, true);
};

export const getSalesFacePPToken = payload => {
  const api = `${ApiConfig.getFacePPToken}`;
  return Http.send(api, 'get', payload);
};

export const getVerification = payload => {
  const api = `${ApiConfig.getFaceVerifyResult}`;
  if (payload?.searchType === 'sales') {
    return Http.send(api, 'get', payload);
  }
  return Http.send(api, 'get', payload, true);
};

export const getFaceBjBankCheck = payload => {
  const api = `${ApiConfig.getFaceBjBankCheck}`;
  return Http.send(api, 'get', payload, true);
};

export const getFaceBjBankEffectiveCheck = payload => {
  const api = `${ApiConfig.getFaceBjBankEffectiveCheck}`;
  return Http.send(api, 'get', payload, true);
};

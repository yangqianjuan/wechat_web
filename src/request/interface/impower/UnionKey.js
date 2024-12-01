import ApiConfig from '../../path/api';
import { RequestInstance as Http } from '@/core/request/core/index';

export async function getUnionKey(payload) {
  const api = ApiConfig.getUnionKey;
  return Http.send(api, 'get', payload);
}

export async function queryChildArea(payload) {
  const api = ApiConfig.queryChildArea;
  return Http.send(api, 'get', payload);
}

import ApiConfig from '../../path/api';
import { RequestInstance as Http } from '@/core/request/core/index';

/**
 * 获取微信的getJsTicket
 */
export const getTicket = () => {
  let url = encodeURIComponent(window.location.href.split('#')[0]);
  const api = `${ApiConfig.getJsTicket}/`;
  return Http.send(api, 'get', { url });
};

import ApiConfig from '../../path/api';
import { RequestInstance as Http } from '@/core/request/core/index';

// 提现明细列表
export const listWithDrawCashInfo = payload => {
  const api = ApiConfig.listWithDrawCashInfo;
  return Http.send(api, 'post', payload);
};

// 确认提现
export const drawMoney = payload => {
  const api = ApiConfig.drawMoney;
  return Http.send(api, 'post', payload);
};

// 提现的结果状态
export const drawMoneyResult = payload => {
  const api = ApiConfig.drawMoneyResult;
  return Http.send(api, 'get', payload);
};

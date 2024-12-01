import { gfSessionId } from '@/request/interface/gf/common.js';
import { SESSION_ID } from '@/utils/common/config.js';

// 广发的会话id的请求与存取
export const getGfSessionId = (option) => {
  return new Promise((resolve, reject) => {
    let params = {
      applyUnionKey: option?.applyUnionKey || sessionStorage.getItem('union_key'),
      // 业务类型:1-授信、2-还款、3-放款、4-开户场景 5-换绑卡
      businessType: option.type
    };
    gfSessionId(params)
      .then((res) => {
        let data = res?.data?.data || '';
        option.type === 1 && sessionStorage.setItem(SESSION_ID.creditSessionId, data);
        option.type === 2 && sessionStorage.setItem(SESSION_ID.repaySessionId, data);
        option.type === 3 && sessionStorage.setItem(SESSION_ID.withdrawSessionId, data);
        option.type === 4 && sessionStorage.setItem(SESSION_ID.openSessionId, data);
        option.type === 5 && sessionStorage.setItem(SESSION_ID.changeCardSessionId, data);
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

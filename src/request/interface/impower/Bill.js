import ApiConfig from '../../path/api';
import { RequestInstance as Http } from '@/core/request/core/index';

export const queryBorrowingApplyList = payload => {
  const api = ApiConfig.queryBorrowingApplyList;
  return Http.send(api, 'get', payload);
};

export const queryBjbBorrowingApplyList = payload => {
  const api = ApiConfig.queryBjbBorrowingApplyList;
  return Http.send(api, 'get', payload);
};

export const queryBorrowingAndRepaymentPlanList = payload => {
  const api = ApiConfig.queryBorrowingAndRepaymentPlanList;
  return Http.send(api, 'get', payload);
};

export const getPersonApplyList = () => {
  const api = ApiConfig.getPersonApplyList;
  return Http.send(api, 'get');
};

export const queryBorrowingDetail = payload => {
  const api = ApiConfig.queryBorrowingDetail;
  return Http.send(api, 'get', payload);
};

export const queryCapRepayRetByLoanReceiptNo = payload => {
  const api = ApiConfig.queryCapRepayRetByLoanReceiptNo;
  return Http.send(api, 'get', payload);
};

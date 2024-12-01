import {
  queryBorrowingApplyList,
  queryBjbBorrowingApplyList,
  queryBorrowingAndRepaymentPlanList,
  queryBorrowingDetail as queryBorrowing
} from '@/request/interface/impower/Bill';
import { BorrowingApply, RepaymentPlan, loansDetail, RepaymentGFPlan } from '@/model/Bill';
import { gfQueryBorrowingApplyList, gfLendingDetail, gfRealTimeRepayPlan } from '@/request/interface/gf/common.js';

export const getBorrowingApplyList = params => {
  return new Promise((resolve, reject) => {
    queryBorrowingApplyList(params)
      .then(res => {
        let data = res?.data?.data || [];
        let BorrowingApplyList = [];
        data.forEach(borrowingApply => {
          let borrowing = new BorrowingApply(borrowingApply);
          BorrowingApplyList.push(borrowing);
        });
        resolve(BorrowingApplyList);
      })
      .catch(err => {
        reject(err);
      });
  });
};

export const getBjbBorrowingApplyList = params => {
  return new Promise((resolve, reject) => {
    queryBjbBorrowingApplyList(params)
      .then(res => {
        let data = res?.data?.data || [];
        let BorrowingApplyList = [];
        data.forEach(borrowingApply => {
          let borrowing = new BorrowingApply(borrowingApply);
          BorrowingApplyList.push(borrowing);
        });
        resolve(BorrowingApplyList);
      })
      .catch(err => {
        reject(err);
      });
  });
};

// gf的借款的列表
export const getGFBorrowingApplyList = params => {
  return new Promise((resolve, reject) => {
    gfQueryBorrowingApplyList(params)
      .then(res => {
        let data = res?.data?.data || [];
        let BorrowingApplyList = [];
        data.forEach(borrowingApply => {
          let borrowing = new BorrowingApply(borrowingApply);
          BorrowingApplyList.push(borrowing);
        });
        resolve(BorrowingApplyList);
      })
      .catch(err => {
        reject(err);
      });
  });
};

// 浦发的借款列表以及还款计划
export const getBorrowingAndRepaymentPlanList = params => {
  return new Promise((resolve, reject) => {
    queryBorrowingAndRepaymentPlanList(params)
      .then(res => {
        let repaymentPlanList = [];
        let data = res?.data?.data || [];
        let total = 0;
        let needRepayNumber = 0;
        data.forEach(repay => {
          let repayPlan = new RepaymentPlan(repay);
          repaymentPlanList.push(repayPlan);
          // 当代还状态是106.表示已结清
          if (repayPlan.repayStatus !== '106') {
            total += repayPlan.loanAmount;
            needRepayNumber += 1;
          }
        });
        total = total.toFixed(2);
        resolve({ repaymentPlanList, total, needRepayNumber });
      })
      .catch(err => {
        reject(err);
      });
  });
};

// 获取广发借款列表以及还款计划
export const getGFBorrowingAndRepaymentPlanList = (params, isNeedUnionKey = false) => {
  return new Promise((resolve, reject) => {
    gfRealTimeRepayPlan(params, isNeedUnionKey)
      .then(res => {
        let repaymentPlanList = [];
        let data = [];
        let total = 0;
        res?.data?.data && (data = [res.data.data]);
        data.forEach(repay => {
          let repayPlan = new RepaymentGFPlan(repay);
          repaymentPlanList.push(repayPlan);
          total += repayPlan.loanAmount;
        });
        total = total.toFixed(2);
        resolve({ repaymentPlanList, total });
      })
      .catch(err => {
        reject(err);
      });
  });
};

export const queryBorrowingDetail = params => {
  return new Promise((resolve, reject) => {
    queryBorrowing(params).then(res => {
      res?.data?.data && resolve(new loansDetail(res.data.data));
    });
  });
};

// 查询广发的借款详情
export const queryGFBorrowingDetail = params => {
  return new Promise((resolve, reject) => {
    gfLendingDetail(params)
      .then(res => {
        res?.data?.data && resolve(new loansDetail(res.data.data));
      })
      .catch(err => {
        reject(err);
      });
  });
};

import { saasLoanBeforeStatusQuery, sassAdvanceRepaymentTrial, saasPreRepay } from '@/request/interface/impower/Sass';

// saas借款的步骤的控制
export const jdugeSaasLoanNextPath = async (params) => {
  // 借款之前的状态查询
  return saasLoanBeforeStatusQuery(params)
    .then((res) => {
      let nextPath = nextPathHandle(res?.data?.data);
      return Promise.resolve(nextPath);
    })
    .catch((err) => {
      return Promise.reject(err);
    });
};

// 下一步，路劲跳转的处理
const nextPathHandle = (nextPathObj) => {
  /**
   * 这个控制流程是在借款之前，进行的信息的验证流程
   *
   * */

  // 默认是 saas中关村上传转账凭证
  let nextPath = '/sass_transer_voucher';
  // /sass_contract_result 预付款结果
  // /sign_sass_contract 合同
  // /sass_loans_baseinfo 借款基础信息
  // /sass_loans_result 借款结果
  if (nextPathObj.saasLoanBeforeStatus === 'UPFILE') {
    // 是否需要上传文件
    nextPath = '/sass_transer_voucher';
  } else if (nextPathObj.saasLoanBeforeStatus === 'APPLYING') {
    // 申请中，去查看结果
    nextPath = '/sass_contract_result';
  } else if (
    nextPathObj.contractStatus === 'NO_SIGN' ||
    nextPathObj.loanStatus === '-1' ||
    nextPathObj.loanStatus === '02'
  ) {
    let env = process.env.NODE_ENV;
    if (env === 'development') {
      // 开发环境只是跳转签署销售合同
      nextPath = '/sign_sass_contract';
    } else {
      // 生产环境进行人脸识别
      nextPath = '/face_pp';
    }
  } else {
    // 借款结果的查询
    nextPath = '/saas_loans_result';
  }

  return nextPath;
};

export function sassAdvanceRepayment(params) {
  let payload = {
    loanNo: params.loanNo,
    applyUnionKey: params.applyUnionKey,
    prePayType: '3',
    prePayAmtFlag: '2',
    prePayFlag: '00'
  };
  return sassAdvanceRepaymentTrial(payload);
}

export function sassPrePayApply(params) {
  return saasPreRepay(params);
}

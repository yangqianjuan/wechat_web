import {
  bindPFBankCard,
  applyEAcoount,
  eAccountVerify,
  borrowingApply,
  getBankCardList,
  getBankCardInfoByCreditNo,
  getBeijingRepayAccountInfo,
  advanceRepaymentTrial,
  prepaymen as prepay,
  queryReapyAcountInfo as getReapyAcountInfo,
  getBankCardListByProdId,
  finallyBorrowingApply
} from '@/request/interface/impower/Bank';
import { RepayBankCard, ProdBankCard } from '@/model/BankCard';
import { gfRepayCal } from '@/request/interface/gf/common.js';

export function bindPfBankCard(params) {
  let payload = {
    applyUnionKey: params.applyUnionKey,
    bankCardNo: params.debitCardNum,
    bankCardReservePhone: params.phoneNum,
    bankName: params.bankName,
    bankNo: params.bankNo,
    idNo: params.idNo,
    name: params.name,
    productId: params.productId,
    referrer: params.referrer
  };
  return bindPFBankCard(payload);
}

export const apllyEacount = params => {
  let payload = {
    applyUnionKey: params.applyUnionKey,
    bankCardNo: params.debitCardNum || params.bankCardNo,
    bankCardReservePhone: params.phoneNum || params.bankCardReservePhone,
    bankName: params.bankName,
    bankNo: params.bankNo,
    productId: params.productId
  };
  return applyEAcoount(payload);
};

export function EleAccountVerify(params) {
  let payload = {
    actOpenNo: params.actOpenNo,
    productId: params.productId,
    referrer: params.referrer,
    verifyCode: params.verifyCode,
    applyUnionKey: params.applyUnionKey
  };
  return eAccountVerify(payload);
}

/**
 * 借款的预先申请（pf）
 * */
export function gotoBorrowingApply(params) {
  let payload = {
    productId: params.productId,
    creditNo: params.creditNum,
    loanApplyAmount: params.borrowBalance,
    loanTerm: params.loansTimeLimit,
    loanPurpose: params.loansPurpose,
    paymentType: params.refundMode,
    applyUnionKey: params.applyUnionKey,
    guaranteeFee: params.guaranteeFee
  };
  return borrowingApply(payload);
}

/**
 * 借款的最终申请（pf）
 * */
export function gotoFinallyBorrowingApply(params) {
  return finallyBorrowingApply(params);
}

export function getBankList() {
  return new Promise((resolve, reject) => {
    getBankCardList()
      .then(res => {
        if (res?.data?.data) {
          let bankCardList = res.data.data;
          bankCardList.forEach((bankCard, index) => {
            let bankCardNo = bankCard.bankCardNo;
            let strLength = bankCardNo.length;
            bankCardList[index].bankDesc = `${bankCard.bankName}${bankCardNo.substr(strLength - 4, strLength)}`;
          });
          resolve(bankCardList);
        } else {
          resolve([]);
        }
      })
      .catch(err => {
        reject(err);
      });
  });
}

export function getBankListByCreditNo(params) {
  return new Promise((resolve, reject) => {
    getBankCardInfoByCreditNo(params)
      .then(res => {
        if (res?.data?.data) {
          let bankCard = res.data.data;
          let bankCardNo = bankCard.bankCardNo;
          let strLength = bankCardNo.length;
          bankCard.bankDesc = `${bankCard.bankName}${bankCardNo.substr(strLength - 4, strLength)}`;
          bankCard.name = `${bankCard.bankName}${bankCardNo.substr(strLength - 4, strLength)}`;
          resolve([bankCard]);
        } else {
          resolve([]);
        }
      })
      .catch(err => {
        reject(err);
      });
  });
}

export function getBeijingRepayAccountList(params) {
  return new Promise((resolve, reject) => {
    getBeijingRepayAccountInfo(params)
      .then(res => {
        if (res?.data?.data?.length) {
          res.data.data.forEach(item => {
            item.cardNo = item.bankCardNo;
            let bankCardNo = item.cardNo;
            let strLength = bankCardNo.length;
            item.bankDesc = `${bankCardNo.substr(0, 4)}********${bankCardNo.substr(strLength - 4, strLength)}`;
          });

          resolve(res.data.data);
        } else {
          resolve([]);
        }
      })
      .catch(err => {
        reject(err);
      });
  });
}

export function advanceRepayment(params) {
  let payload = {
    loanNo: params.loanNo,
    settleType: '2'
  };
  return advanceRepaymentTrial(payload);
}

// 广发的提前还款试金额
export function advanceGFRepayment(params) {
  let payload = {
    loanNo: params.loanNo,
    repayType: params.repayType
  };
  return gfRepayCal(payload);
}

export function prepaymen(params) {
  return prepay(params);
}

export const queryReapyAcountInfo = params => {
  return new Promise((resolve, reject) => {
    getReapyAcountInfo(params)
      .then(res => {
        if (res?.data?.data) {
          let repayBankCard = new RepayBankCard(res.data.data);
          resolve(repayBankCard);
        } else {
          resolve(res.data.data);
        }
      })
      .catch(err => {
        reject(err);
      });
  });
};

export const queryBankCardListByProdId = params => {
  return new Promise((resolve, reject) => {
    getBankCardListByProdId(params)
      .then(res => {
        if (res?.data?.data) {
          let bankCardList = [];
          let data = res.data.data;
          let inUserCard = {};
          data.forEach(bankcardItem => {
            let prodBankCard = new ProdBankCard(bankcardItem);
            !prodBankCard.isInUse ? (inUserCard = prodBankCard) : bankCardList.push(prodBankCard);
          });
          bankCardList.splice(0, 0, inUserCard);
          resolve(bankCardList);
        } else {
          resolve([]);
        }
      })
      .catch(err => {
        reject(err);
      });
  });
};

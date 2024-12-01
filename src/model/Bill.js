import { toThousands } from '@/utils/common/common';

export class BorrowingApply {
  constructor(params) {
    this.createTime = params.createTime || '';
    this.formateCreateTime = this.createTime.split(' ')[0];
    // this.instNo = params.instNo
    this.productId = params.agreeProduct;
    this.loanAmount = params.loanAmount !== 'null' ? parseInt(params.loanAmount) : '--';
    this.loanAmountShow = params.loanAmount !== 'null' ? toThousands(this.loanAmount.toFixed(2)) : '--';
    this.loanAppCode = params.loanAppCode;
    this.loansStatusDesc = loansStatusDesc[this.loanAppCode];
    this.loanNo = params.loanNo;
    this.productLogo = params.productImage;
    this.productName = params.productName;
  }
}

const SHOW_INIE_PROD = [1023, '1035'];

export class RepaymentPlan {
  constructor(params) {
    this.createTime = params.loanInfo.createTime;
    this.billDate = params.loanInfo.createTime.split(' ')[0];
    this.loanNo = params.loanInfo.loanNo;
    this.productName = params.loanInfo.productName;
    this.productLogo = params.loanInfo.productImage;
    this.loanAmount = params.loanInfo.loanAmount ? parseInt(params.loanInfo.loanAmount) : 0;
    this.productId = params.loanInfo.agreeProduct;
    this.loanBalance = params.loanInfo.loanBalance ? parseInt(params.loanInfo.loanBalance) : 0;
    this.repayStatus = params.loanInfo.repayStatus || '99';
    this.loanAmountShow = toThousands(this.loanAmount.toFixed(2));
    this.repayList = this.getRepayList(params.repayPlanInfoList);
    this.isCanPrepay = this.jdugeIsCanPrepay();
    this.detailDesc = '账单详情';
    this.isShowNormalInte = SHOW_INIE_PROD.indexOf(params.loanInfo.agreeProduct) >= 0;
  }

  getRepayList(repayPlanInfoList) {
    let repayPlanList = [];
    repayPlanInfoList.forEach(reapyItem => {
      repayPlanList.push(new Repay(reapyItem));
    });
    return repayPlanList;
  }

  jdugeIsCanPrepay() {
    let isCanPrepay = false;
    let oneDayTimeStamp = 1000 * 60 * 60 * 24;
    let timeArr = this.createTime.split(' ');
    let [year, month, day, hour, min, sec] = [...timeArr[0].split('-'), ...timeArr[1].split(':')];
    // let billCreateTimeStamp = new Date()
    let nowDate = new Date();
    let nowDay = nowDate.getDate();
    let nowMonth = nowDate.getMonth();
    let nowYear = nowDate.getFullYear();
    if (nowDay > day) {
      isCanPrepay = true;
    } else if (nowMonth > month) {
      isCanPrepay = true;
    } else if (nowYear > year) {
      isCanPrepay = true;
    }
    // billCreateTimeStamp.setFullYear(parseInt(year))
    // billCreateTimeStamp.setMonth(parseInt(month) - 1)
    // billCreateTimeStamp.setDate(parseInt(day))
    // billCreateTimeStamp.setHours(parseInt(hour))
    // billCreateTimeStamp.setMinutes(parseInt(min))
    // billCreateTimeStamp.setSeconds(parseInt(sec))
    // let timeGap = new Date().getTime() - billCreateTimeStamp.getTime()
    // isCanPrepay = timeGap > oneDayTimeStamp
    return isCanPrepay;
  }
}

// 广发的借款详情和还款列表的model
export class RepaymentGFPlan {
  constructor(params) {
    // 借款信息
    // agreeProduct	产品ID	integer(int64)
    // createTime	借款申请时间	string(date-time)
    // loanAmount	借款金额	number
    // loanAppCode	借款状态:00-放款成功,01-放款中,02-放款失败	string
    // loanBalance	借款余额	number
    // loanNo	借据单号	string
    // productImage	产品logo	string
    // productName	产品名称	string
    // repayStatus	还款状态  string
    this.createTime = params.loanInfo.createTime;
    this.billDate = params.loanInfo.createTime.split(' ')[0];
    this.loanNo = params.loanInfo.loanNo;
    this.productName = params.loanInfo.productName;
    this.productLogo = params.loanInfo.productImage;
    this.loanAmount = params.loanInfo.loanAmount ? parseInt(params.loanInfo.loanAmount) : 0;
    this.productId = params.loanInfo.agreeProduct;
    this.loanBalance = params.loanInfo.loanBalance ? parseInt(params.loanInfo.loanBalance) : 0;
    this.repayStatus = params.loanInfo.repayStatus || '99';
    this.loanAmountShow = toThousands(this.loanAmount.toFixed(2));
    // gfRepayPlanInfoList 还款计划列表
    this.isCanPrepay = this.jdugeIsCanPrepay();
    this.detailDesc = '账单详情';
    this.isShowNormalInte = SHOW_INIE_PROD.indexOf(params.loanInfo.agreeProduct) >= 0;
    this.repayList = this.getRepayList(params.repayPlanInfoList);
  }

  getRepayList(repayPlanInfoList) {
    let repayPlanList = [];
    repayPlanInfoList.forEach(reapyItem => {
      reapyItem.isShowNormalInte = this.isShowNormalInte;
      repayPlanList.push(new GFRepay(reapyItem));
    });
    return repayPlanList;
  }

  // 是否可以提前还款
  jdugeIsCanPrepay() {
    let isCanPrepay = false;
    let oneDayTimeStamp = 1000 * 60 * 60 * 24;
    let timeArr = this.createTime.split(' ');
    // console.log('ddd', timeArr);
    // let billCreateTimeStamp = new Date()
    let nowDate = new Date();
    let nowDay = nowDate.getDate();
    let nowMonth = nowDate.getMonth();
    let nowYear = nowDate.getFullYear();
    if (timeArr.length && timeArr.length === 2) {
      let [year, month, day, hour, min, sec] = [...timeArr[0].split('-'), ...timeArr[1].split(':')];
      if (nowDay > day) {
        isCanPrepay = true;
      } else if (nowMonth > month) {
        isCanPrepay = true;
      } else if (nowYear > year) {
        isCanPrepay = true;
      }
    } else if (timeArr && timeArr.length === 1) {
      let [year, month, day] = [...timeArr[0].split('-')];
      if (nowDay > day) {
        isCanPrepay = true;
      } else if (nowMonth > month) {
        isCanPrepay = true;
      } else if (nowYear > year) {
        isCanPrepay = true;
      }
    } else {
      isCanPrepay = false;
    }

    // billCreateTimeStamp.setFullYear(parseInt(year))
    // billCreateTimeStamp.setMonth(parseInt(month) - 1)
    // billCreateTimeStamp.setDate(parseInt(day))
    // billCreateTimeStamp.setHours(parseInt(hour))
    // billCreateTimeStamp.setMinutes(parseInt(min))
    // billCreateTimeStamp.setSeconds(parseInt(sec))
    // let timeGap = new Date().getTime() - billCreateTimeStamp.getTime()
    // isCanPrepay = timeGap > oneDayTimeStamp
    return isCanPrepay;
  }
}

// 还款计划的展示
export class GFRepay {
  constructor(params) {
    // "agreeProduct": 0,
    // 			"createTime": "",
    // 			"id": 0,
    // 			"intEndDate": "",
    // 			"intStartDate": "",
    // 			"loanNo": "",
    // 			"overdueDays": "",
    // 			"overdueDerateAmt": 0,
    // 			"repaidInt": 0,
    // 			"repaidPenalty": 0,
    // 			"repaidPrincipal": 0,
    // 			"repaidTotalAmt": 0,
    // 			"repayDay": "",
    // 			"repayInt": 0,
    // 			"repayPenalty": 0,
    // 			"repayPrincipal": 0,
    // 			"repayState": 0,
    // 			"repayTotalAmt": 0,
    // 			"term": 0,
    // 			"updateTime": ""

    //  planStatus loanTerm  actualRepayDate  piamt normalCorp  isShowNormalInte normalInte  overduePunishmentAmt planStatusIcon overdueRepayAmt banlance amtFine inteFine
    this.createTime = params.createTime;
    this.timeDesc = this.createTime.split(' ')[0];
    this.actualRepayDate = params.actualRepayDate;
    this.productId = params.agreeProduct;
    this.planStatus = params.planStatus;
    this.piamt = this.getPiamt(params);
    this.overdueRepayAmt = params.overdueRepayAmt ? toThousands(params.overdueRepayAmt.toFixed(2)) : '--';
    this.loanTerm = params.loanTerm;
    this.normalCorp = params.normalCorp ? toThousands(params.normalCorp.toFixed(2)) : '--';
    this.normalInte = params.normalInte ? toThousands(params.normalInte.toFixed(2)) : '--';
    this.banlance = params.banlance || '--';
    this.planStatusIcon = this.getPlanStatusIcon();
    this.overduePunishmentAmt = params.amtFine + params.inteFine;
    this.isShowNormalInte = params.isShowNormalInte;
  }

  getPiamt(params) {
    let piamt = '';
    if (this.planStatus === '2') {
      piamt = toThousands(params.overdueRepayAmt.toFixed(2));
    } else {
      piamt = toThousands(params.piamt.toFixed(2));
    }
    return piamt;
  }

  getPlanStatusIcon() {
    let imgUrl = '';
    if (this.planStatus === '2') {
      // 逾期
      imgUrl = require('@/assets/imgs/icon/ic_overdue.png');
    } else if (this.planStatus === '3') {
      imgUrl = require('@/assets/imgs/icon/ic_has_payment.png');
    }
    return imgUrl;
  }
}

export class Repay {
  constructor(params) {
    this.createTime = params.createTime;
    this.timeDesc = this.createTime.split(' ')[0];
    this.actualRepayDate = params.actualRepayDate;
    this.productId = params.agreeProduct;
    this.planStatus = params.planStatus;
    this.piamt = this.getPiamt(params);
    this.overdueRepayAmt = params.overdueRepayAmt ? toThousands(params.overdueRepayAmt.toFixed(2)) : '--';
    this.loanTerm = params.loanTerm;
    this.normalCorp = params.normalCorp ? toThousands(params.normalCorp.toFixed(2)) : '--';
    this.normalInte = params.normalInte ? toThousands(params.normalInte.toFixed(2)) : '--';
    this.banlance = params.banlance || '--';
    this.planStatusIcon = this.getPlanStatusIcon();
    this.overduePunishmentAmt = params.amtFine + params.inteFine;
    this.overdueAmt = params.overdueAmt;
    this.overdueInte = params.overdueInte;
    this.amtFine = params.amtFine;
    this.inteFine = params.inteFine;
  }

  getPiamt(params) {
    let piamt = '';
    if (this.planStatus === '2') {
      piamt = toThousands(params.overdueRepayAmt.toFixed(2));
    } else {
      piamt = toThousands(params.piamt.toFixed(2));
    }
    return piamt;
  }

  getPlanStatusIcon() {
    let imgUrl = '';
    if (this.planStatus === '2') {
      imgUrl = require('@/assets/imgs/icon/ic_overdue.png');
    } else if (this.planStatus === '3') {
      imgUrl = require('@/assets/imgs/icon/ic_has_payment.png');
    }
    return imgUrl;
  }
}

export const loansStatusDesc = {
  '00': '放款成功',
  '01': '放款中',
  '02': '放款失败',
  '03': '审批中',
  '04': '审批拒绝'
};

export class loansDetail {
  constructor(params) {
    this.id = params.createTime;
    this.createTime = params.createTime;
    this.creditNo = params.creditNo;
    this.loanAmount = params.loanAmount ? toThousands(params.loanAmount) : '--';
    this.loanTerm = params.loanTerm || '--';
    this.paymentType = params.paymentType || '--';
    this.interestRate = params.interestRate;
    this.paymentType = params.paymentType;
    this.bankCardNo = params.bankCardNo;
    this.bankName = params.bankName || '';
    this.guaranteeFee = params.guaranteeFee ? parseInt(params.guaranteeFee).toFixed(2) : '--';
    this.bankCardDesc = this.getBankCardDesc();
    this.isOverOneDay = this.jdugeIsOverOneDay();
    this.loanNo = params.loanNo;
    this.loanAppCode = params.loanAppCode;
    this.loanReceiptNo = params.loanReceiptNo;
  }

  getBankCardDesc() {
    let bankCardDesc = '';
    if (this.bankCardNo) {
      let length = this.bankCardNo.length;
      bankCardDesc = this.bankCardNo.substr(length - 4, 4);
    }
    return `${this.bankName}${bankCardDesc}`;
  }

  jdugeIsOverOneDay() {
    let isOverOneDay = false;
    let timeArr = this.createTime.split(' ');
    let [year, month, day] = [...timeArr[0].split('-')];
    let nowDate = new Date();
    let nowDay = nowDate.getDate();
    let nowMonth = nowDate.getMonth();
    let nowYear = nowDate.getFullYear();
    if (nowYear > year) {
      isOverOneDay = true;
    } else if (nowMonth > month) {
      isOverOneDay = true;
    } else if (nowDay > day) {
      isOverOneDay = true;
    }
    return isOverOneDay;
  }
}

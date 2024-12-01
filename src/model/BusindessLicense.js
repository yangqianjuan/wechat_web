/*
 * @Author: hsf
 * @Date: 2023-10-09 09:51:54
 * @LastEditors: hsf
 * @LastEditTime: 2023-10-17 17:29:17
 * @Description:
 */
import { formateDate } from '../utils/dataProcess/dateUtil';

export default class BusindessLicense {
  constructor(params) {
    this.corpName = params.name || '';
    this.type = params.type || '';
    this.registerAddr = params.address || '';
    this.corpId = params.regNum || '';
    this.registerCaptial = params.capital || '';
    this.registerDate = this.formatePeriodDate(params.setDate);
    this.runDateFrom = this.formatePeriodDate(params.period.split('至')[0]);
    this.runDateTo = this.formatePeriodDate(params.period.split('至')[1]);
    this.composingForm = params.composingForm || '';
    this.yyzzStatus = 1;
    this.isIntact = this.judgeIntact();
  }

  judgeIntact() {
    let isIntact = true;
    if (!this.corpId || !this.registerDate || !this.registerAddr || !this.type) {
      isIntact = false;
    }
    return isIntact;
  }

  formatePeriodDate(time) {
    try {
      if (time !== '长期' && time !== '永久' && time !== '不约定期限') {
        time = time
          .replace('年', '/')
          .replace('月', '/')
          .replace('日', '/');
        return formateDate(time, '/');
      } else {
        let date = new Date();
        date.setFullYear(9999);
        date.setMonth(11);
        date.setDate(31);
        return date;
      }
    } catch (err) {
      return new Date();
    }
  }
}

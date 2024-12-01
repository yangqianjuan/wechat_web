import { getProtocolUrl, getProTocolTest } from '@/request/interface/impower/Product';
import { querySaasElecContract } from '@/request/interface/impower/Sass';
export const quertProtocolUrl = (params = {}) => {
  return new Promise((resolve, reject) => {
    getProtocolUrl(params)
      .then(res => {
        if (res?.data?.data?.fileContent) {
          let data = res.data.data.fileContent;
          data = data.replace(/\n/g, '<br>');
          let textArr = data.split('<br>');
          resolve(textArr);
        }
      })
      .catch(err => {
        reject(err);
      });
  });
};

export const querySaasProtocol = params => {
  return new Promise((resolve, reject) => {
    querySaasElecContract(params)
      .then(res => {
        if (res?.data?.data?.fileContent) {
          let data = res.data.data.fileContent;
          data = data.replace(/\n/g, '<br>');
          let textArr = data.split('<br>');
          resolve(textArr);
        }
      })
      .catch(err => {
        reject(err);
      });
  });
};

export const getProtocolAfterLoan = (params = {}) => {
  return new Promise((resolve, reject) => {
    getProTocolTest(params)
      .then(res => {
        if (res?.data?.data) {
          let textArr = [];
          let data = res.data.data;
          if (params.fileType !== '07') {
            data = data.replace(/\n/g, '<br>');
            textArr = data.split('<br>');
          } else {
            textArr = data;
          }
          resolve(textArr);
        }
      })
      .catch(err => {
        reject(err);
      });
  });
};

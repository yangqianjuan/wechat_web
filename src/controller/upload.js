import CosCloud from 'cos-js-sdk-v5';
import axios from 'axios';
import ApiConfig from '@/request/path/api';
import { COOKIE_ID } from '@/utils/common/config';
import { getFileName } from '../utils/wx/wxUtils';
// 上传文件(调用相关api putObject来上传文件)
/**
 * @method uploadFile
 * @param {object} cos
 */

let Dir = 'id_card';
function uploadFile(cos, file, signInfo, callback) {
  let name = `${Dir}/${getFileName()}`;
  let pic = '';
  let Bucket = process.env.NODE_ENV === 'production' ? 'prod-xm-1256921822' : 'dev-xm-1256921822';
  cos.putObject(
    {
      Bucket,
      Region: 'ap-shanghai',
      Key: `${name}`,
      Dir: Dir,
      Body: file,
      onHashProgress: function (progressData) {
        console.log('校验中', JSON.stringify(progressData));
      },
      onProgress: function (progressData) {
        // 上传完执行操作  这里将图片的 pic 作为图片的src 抛出去，在调用的地方用res.pic获取即可
        progressData.percent === 1 && (pic = `https://${Bucket}.cos.ap-shanghai.myqcloud.com/${name}`);
      }
    },
    function (err, data) {
      if (err) {
        callback({ success: false, msg: '文件上传失败!' });
        return;
      }
      // 上传成功把数据抛出去， pic 是上文的图片的链接
      callback({ success: true, msg: '上传成功!', data: data, signInfo: signInfo, pic: pic });
    }
  );
}
// 获取文件上传密钥（最好存在后端通过ajax请求获取，安全性较高）
function getFileToken(Vue, fileInfo, cos, file, uploadStatusCallbalck) {
  // 秘钥是请求后台的接口，替换即可
  // 正式环境会自动加域名
  let url = ApiConfig.picUpload;
  let token = Vue.getCookie(COOKIE_ID.jwtToken);
  let headers = {
    Authorization: `Bearer ${token}`
  };
  // 本地
  // let url = 'https://store.ihuyue.cn/manage/store-api/get_ticket'
  if (!file) return;
  // 异步获取临时密钥
  let singleInfo = Vue.$store.state.fileToken;
  if (singleInfo) {
    axios
      .get(url, { headers })
      .then(function (res) {
        const data = JSON.parse(res?.data?.data);
        if (data) {
          //获取的临时秘钥存储在vuex中
          Vue.$store.commit('setUPDATEFILEINFO', data);
          uploadFile(cos, file, data, uploadStatusCallbalck);
        } else {
          uploadStatusCallbalck({ success: false, msg: '获取文件秘钥失败!' });
        }
      })
      .catch(function (err) {
        uploadStatusCallbalck({ success: false, msg: '获取文件秘钥接口出错!' });
      });
  } else {
    uploadFile(cos, file, singleInfo, uploadStatusCallbalck);
  }
}
/**
 * 初始化上传文件对象
 * @param {object} Vue
 * @param {string} fileName 文件名
 * @param {object} file 上传的文件流及文件类型 名称相关信息
 * @param {Array} 允许上传的文件类型
 * @param {function} uploadStatusCallbalck
 * @return {function} 返回回调函数
 */
export const initUploadObj = function (Vue, fileName, file, type, uploadStatusCallbalck, dir = 'id_card') {
  Dir = dir;
  let fileInfo = {
    file_name: fileName,
    media_type: 2,
    media_sub_type: 0,
    size_of_bytes: 122,
    file_expired_type: 'permanent'
  };
  // 上传图片大小做限制
  // if (file.size > 2048) {
  //   return
  // }
  //前端做文件类型限制
  type == 'image' && (type = ['.jpg', '.gif', '.jpeg', '.bmp', '.png']);
  type == 'excel' && (type = ['.xlsx']);
  let fileType = file.name ? file.name.substring(file.name.lastIndexOf('.')).toLowerCase() : '';
  if (!!type && type.indexOf(fileType) < 0) {
    uploadStatusCallbalck({ success: false, msg: '请上传正确的' + type + '文件格式!' });
    return;
  }
  var cos = new CosCloud({
    getAuthorization: function (options, callback) {
      let singleInfo = Vue.$store.state.fileToken;
      callback({
        TmpSecretId: singleInfo.credentials.tmpSecretId,
        TmpSecretKey: singleInfo.credentials.tmpSecretKey,
        XCosSecurityToken: singleInfo.credentials.sessionToken,
        ExpiredTime: singleInfo.expiredTime
      });
    }
  });
  fileInfo.file_name = file.name;
  //获取文件上传密钥
  getFileToken(Vue, fileInfo, cos, file, uploadStatusCallbalck);
};

export default initUploadObj;

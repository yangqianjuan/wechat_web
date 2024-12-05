<template>
  <div class="personal-content">
    <div class="personal-info">
      <van-icon name="user-circle-o" />
      <div class="user-name-content">
        <p class="user-name">{{ personalInfo.userName }}</p>
        <p class="user-mobile">{{ personalInfo.mobileNum }}</p>
      </div>
    </div>
    <div class="menu-content">
      <div v-for="menu in menuList" :key="menu.desc" class="menu-item" @click="toDetail(menu.targetPath)">
        <p class="menu-title">{{ menu.desc }}</p>
        <img class="arrow" :src="arrow" alt />
      </div>
    </div>
  </div>
</template>
<script>
import { jdugeNewUserRoute } from '@/controller/userController';

export default {
  name: 'User',
  data() {
    return {
      personalInfo: {
        avatar: require('@/assets/imgs/icon/ic_logo.png'),
        userName: '',
        mobileNum: ''
      },
      arrow: require('@/assets/imgs/icon/ic_arrow.png'),
      menuList: [
        {
          desc: '申请记录',
          targetPath: '/apply_record'
        },
        {
          desc: '账户设置',
          targetPath: '/user_setting'
        }
      ]
    };
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      jdugeNewUserRoute().then((user) => {
        this.personalInfo.userName = user?.name;
        this.personalInfo.mobileNum = user?.phoneNum;
      });
    },
    toDetail(targetPath) {
      targetPath ? this.$router.push({ path: targetPath }) : this.$notify.info({ msg: '暂未开放！' });
    }
  }
};
</script>
<style lang="scss" scoped>
.personal-content {
  min-height: 100vh;
  background: rgba(244, 246, 249, 1);
  .personal-info {
    background: #ffffff;
    display: flex;
    align-items: center;
    padding: 28px 0 28px 40px;
    .avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
    }
    .user-name-content {
      margin-left: 45px;
      .user-name {
        font-size: 35px;
        font-weight: 500;
      }
      .user-mobile {
        font-size: 26px;
        margin-top: 12px;
        font-weight: 400;
        color: rgba(127, 127, 127, 1);
      }
    }
  }
  .menu-content {
    margin-top: 20px;
    .menu-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #ffffff;
      padding: 30px 40px;
      border-bottom: 1px solid #f3f3f3;
      .menu-title {
        font-size: 28px;
        font-weight: 500;
      }
      .arrow {
        height: 30px;
        width: 30px;
      }
    }
  }
}
::v-deep(.van-icon) {
  font-size: 80px;
  margin-top: 14px;
}
</style>

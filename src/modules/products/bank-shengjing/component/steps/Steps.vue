<template>
  <div class="steps-container">
    <div class="content">
      <template v-for="(item, index) in stepsList" >
        <div class="step-group" :key="index">
          <div class="single-step">
            <div class="icon">
              <template v-if="item.txtStatus">
                <img v-if="index !== 3" class="fill-select-icon-border" :src="item.selectIcon" alt />
                <img v-if="index === 3" class="fill-select-icon-end" :src="item.selectIcon" alt />
              </template>
              <template v-if="!item.txtStatus && !item.status">
                <img class="fill-unselect-icon" :src="item.unSelectIcon" alt />
              </template>
              <template v-if="item.status && !item.txtStatus">
                <img class="fill-select-icon" :src="item.unFillSelectIcon" alt />
              </template>
            </div>
            <div class="desc" :class="[item.txtStatus ? 'active-desc' : '', index === 3 ? 'end-active-desc' : '']">
              <span>{{ item.txt }}</span>
            </div>
          </div>
          <div class="line" v-if="index !== stepsList.length - 1">
            <img :src="item.lineStatus ? item.activeLine : item.unActiveLine" alt />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
<script>
export default {
  /**
   * 节点 -- 步骤器
   * */
  name: 'Steps',
  props: {
    steps: {
      type: [String, Number, Array],
      default: () => {
        return [0];
      }
    }
  },
  watch: {
    steps: {
      handler(nVal, oVal) {
        if (nVal?.length) {
          nVal.forEach((item) => {
            if (!item) {
              this.stepsList[item].status = true;
            } else {
              this.stepsList[item - 1].lineStatus = true;
              this.stepsList[item].status = true;
              this.stepsList[item].lineStatus = false;
            }

            if (item === nVal.length - 1) {
              this.stepsList[item].txtStatus = true;
            }
          });
        }
      },
      deep: true,
      immediate: true
    }
  },
  data() {
    return {
      stepsList: [
        {
          activeLine: require('../../static/image/step/active-line.png'),
          unActiveLine: require('../../static/image/step/unactive-line.png'),
          selectIcon: require('../../static/image/step/select-one.png'),
          unSelectIcon: require('../../static/image/step/unselect-one.png'),
          unFillSelectIcon: require('../../static/image/step/no-fill-select-1.png'),
          status: false,
          lineStatus: false,
          txtStatus: false,
          txt: '信息认证'
        },
        {
          activeLine: require('../../static/image/step/active-line.png'),
          unActiveLine: require('../../static/image/step/unactive-line.png'),
          selectIcon: require('../../static/image/step/select-two.png'),
          unSelectIcon: require('../../static/image/step/unselect-two.png'),
          unFillSelectIcon: require('../../static/image/step/no-fill-select-2.png'),
          status: false,
          lineStatus: false,
          txtStatus: false,
          txt: '资料补充'
        },
        // {
        //   activeLine: require('../../static/image/step/active-line.png'),
        //   unActiveLine: require('../../static/image/step/unactive-line.png'),
        //   selectIcon: require('../../static/image/step/select-three.png'),
        //   unSelectIcon: require('../../static/image/step/unselect-three.png'),
        //   unFillSelectIcon: require('../../static/image/step/no-fill-select-3.png'),
        //   status: false,
        //   lineStatus: false,
        //   txtStatus: false,
        //   txt: '资料补充'
        // },
        {
          activeLine: require('../../static/image/step/active-line.png'),
          unActiveLine: require('../../static/image/step/unactive-line.png'),
          selectIcon: require('../../static/image/step/select-four.png'),
          unSelectIcon: require('../../static/image/step/unselect-four.png'),
          status: false,
          lineStatus: false,
          txtStatus: false,
          txt: '授信审批'
        }
      ]
    };
  },
  methods: {}
};
</script>
<style lang="scss" scoped>
.steps-container {
  width: 100%;
  height: 404px;
  background-image: url('../../static/image/common/top-bg.png');
  background-repeat: no-repeat;
  background-size: contain;
  padding-top: 50px;

  .content {
    display: flex;
    justify-content: center;
    .step-group {
      display: flex;
      .single-step {
        display: flex;
        flex-direction: column;
        align-items: center;
        .icon {
          display: flex;
          justify-content: center;
          margin-bottom: 32px;
          .fill-select-icon-border {
            width: 72px;
            height: 72px;
            margin-top: -10px;
          }

          .fill-select-icon-end {
            width: 52px;
            height: 52px;
            margin-bottom: 0;
          }

          .fill-select-icon {
            width: 52px;
            height: 52px;
          }

          .fill-unselect-icon {
            width: 52px;
            height: 52px;
          }
        }
        .desc {
          text-align: center;
          font-size: 24px;
          span {
            font-size: 24px;
            font-family: PingFangSC-Regular, PingFang SC;
            font-weight: 400;
            color: #ffffff;
            opacity: 0.7;
          }
        }
        .desc.active-desc {
          margin-top: -10px;
          span {
            font-family: PingFangSC-Medium, PingFang SC;
            font-weight: 500;
            opacity: 1;
          }
        }
        .desc.end-active-desc {
          margin-top: unset !important;
        }
      }
      .line {
        margin: 4px 7px 0;
        img {
          width: 68px;
          height: 12px;
        }
      }
    }
  }
}
</style>

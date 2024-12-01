<template>
  <div class="text-input-wrapper">
    <div class="input-wrapper">
      <div class="input-label">
        {{label}}
        <i></i>
      </div>:
      <span class="require-wrapper">{{isRequired ? '*' : ''}}</span>
      <div class="input-item-wrapper" :style="isErr ? '' : inputWrapperStyle">
        <input
          class="input-item"
          :class="isErr ? 'errInputColor' : ''"
          @blur="isEmpty"
          type="text"
          v-model="title"
          :placeholder="textPlaceholder"
        />
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'textInput',
  model: {
    prop: 'modelVal', //指向props的参数名
    event: 'change' //事件名称
  },
  props: {
    label: {
      type: String,
      default: ''
    },
    modelVal: {
      type: String,
      default: ''
    },
    textPlaceholder: {
      type: String,
      default: ''
    },
    isRequired: {
      type: Boolean,
      default: false
    },
    isErr: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      title: '',
      inputWrapperStyle: '',
      errStyle: 'color: rgb(255, 102, 102, .5)'
    };
  },
  watch: {
    //监听值变化，再赋值给modelVal
    title(value) {
      this.$emit('change', value);
    }
  },
  methods: {
    isEmpty() {
      if (!this.title) {
        this.inputWrapperStyle = 'color: rgb(255, 102, 102, .5)';
      } else {
        this.inputWrapperStyle = '';
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.text-input-wrapper {
  width: 100%;
  font-size: 26px;
  font-weight: 400;
  padding-bottom: 5px;
}
.input-wrapper {
  display: flex;
  align-items: center;
  .input-label {
    width: 120px;
    text-align: justify;
    height: 1.35rem;
    i {
      display: inline-block;
      padding-left: 100%;
    }
  }
  .input-item {
    outline: none;
    background: none;
    -webkit-appearance: none;
    border: none;
    width: 100%;
  }
}
.require-wrapper {
  text-align: center;
  color: red;
  width: 0.9375rem;
}
.input-item-wrapper {
  border-bottom: 1px solid rgba(224, 224, 224, 1) !important;
  padding-left: 1.25rem;
  padding-bottom: 3px;
  padding-top: 3px;
  padding: 0.1875rem 0 0.1875rem 1.24rem;
  border-radius: 0.1rem;
  flex: 1 1 12.5rem;
}

.errInputColor {
  color: #e00000;
}
.errInputColor::-webkit-input-placeholder {
  color: #e00000;
}
</style>

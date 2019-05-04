<template lang="html">
  <div class="picker-main">
    <p>Type</p>
    <div class="color-picker">
      <div
        v-for="(theme, index) in colors"
        :key="index"
        :class="{ selected: color === theme.value, [theme.text]: theme.text }"
        class="color"
        @click="selectColor(theme.value)"
      />
    </div>
  </div>
</template>

<script type="text/javascript">
export default {
  name: 'ColorPicker',

  props: {
    color: {
      type: String,
      require: true,
      default: '',
    },
  },

  data() {
    return {
      colors: [
        { text: 'primary', value: '#528fa2' },
        { text: 'secondary', value: '#7ebcaf' },
        { text: 'success', value: '#8ac8a3' },
        { text: 'warning', value: '#ffc85f' },
      ],
    };
  },

  methods: {
    selectColor(color) {
      this.$emit('colorPicked', color);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../style/color-picker.scss';
</style>

<template>
  <div>
    <!-- Styled -->
    <b-form-group label="上传文件:" label-cols-sm="2">
      <b-form-file
          id="file-small"
          ref="file-input"
          v-model="file1"
          placeholder="点击选择或拖动文件至此处"
          browse-text="添加"
          @input="fileInputChange"

      >

      </b-form-file>
    </b-form-group>
  </div>
</template>

<script>


export default {
  /* eslint-disable */
  name: "FileUpload",
  components: {},
  data() {
    return {
      file1: null,

    }
  },
  methods: {
    fileInputChange: function () {
      console.log(this.file1)
      //Todo:文件上传逻辑

      //将当次文件添加到队列后清除file1，以便用户选择新的文件
      //this.$refs['file-input'].reset()
    }
  }
}
</script>

<style scoped>


</style>
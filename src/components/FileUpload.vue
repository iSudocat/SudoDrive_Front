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

// var COS = require('cos-js-sdk-v5');
import SparkMD5 from "spark-md5";

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
    fileInputChange: function (file) {
      console.log(file)
      let fileReader = new FileReader()
      fileReader.readAsBinaryString(file)
      fileReader.onload = function(str) {
        let spark = new SparkMD5()
        // console.log(str.currentTarget.result)
        spark.appendBinary(str.currentTarget.result)
        console.log(spark.end())
      }
      // uploadAxios({
      //   type: uploadModel.type,
      //   path: uploadModel.path,
      //   size: uploadModel.size,
      //   md5: uploadModel.md5
      // }).then(res => {
      //   console.log(res)
      // })
      // COS.getAuthorization()
      //Todo:在鸽了 在鸽了

      //将当次文件添加到队列后清除file1，以便用户选择新的文件
      //this.$refs['file-input'].reset()
    }
  }
}
</script>

<style scoped>


</style>

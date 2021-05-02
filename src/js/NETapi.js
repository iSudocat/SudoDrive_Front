import axios from "axios";
export {uploadAxios}

let cookie = this.$cookies.get('token')

let uploadAxios = function (uploadModel) {
    return axios.post('/api/storage/file', {
            type: uploadModel.type,
            path: uploadModel.path,
            size: uploadModel.size,
            md5: uploadModel.md5
        },
        {headers: {Authorization: "Bearer " + cookie}
        })
}

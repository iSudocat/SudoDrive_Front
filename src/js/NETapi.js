import axios from "axios";
export {uploadAxios}

let uploadAxios = function (uploadModel, token) {
    return axios.post('/api/storage/file/', {
            type: uploadModel.type,
            path: uploadModel.path,
            size: uploadModel.size,
            md5: uploadModel.md5
        },
        {headers: {Authorization: "Bearer " + token, "Content-Type": "application/json"}}
        )
}

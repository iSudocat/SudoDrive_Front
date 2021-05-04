import axios from "axios";
export {uploadAxios,confirmAxios}

// 从.NET后端获取上传所需信息
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

// 向.NET后端确认上传
let confirmAxios = function (id, guid, token) {
    return axios.patch('/api/storage/file/', {
            id: id,
            guid: guid
        },
        {headers: {Authorization: "Bearer " + token, "Content-Type": "application/json"}}
    )
}

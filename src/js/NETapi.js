import axios from "axios";
export {uploadAxios,confirmAxios}

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

let confirmAxios = function (id, guid, token) {
    return axios.patch('/api/storage/file/', {
            id: id,
            guid: guid
        },
        {headers: {Authorization: "Bearer " + token, "Content-Type": "application/json"}}
    )
}

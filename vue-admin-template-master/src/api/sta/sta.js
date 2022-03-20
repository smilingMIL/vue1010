import request from '@/utils/request'

export default {

    // 生成统计数据
    createStaData(day) {
        return request({
        url: `/edusta/sta/registerCount/`+day,
        method: 'post'
        })
    },


    // 获取统计数据进行显示
    getDataSta(searchObj) {
        return request({
        url: `/edusta/sta/showData/${searchObj.type}/${searchObj.begin}/${searchObj.end}`,
        method: 'get'
        })
    },

}
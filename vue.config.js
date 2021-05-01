module.exports = {
    devServer:{
        proxy: {
            '/api': {
                target:'https://sudodrive.akakii.cn',
                changeOrigin: true, //是否跨域
                pathRewrite: {
                    '^/api': '/api' //重定向
                }
            }
        },
        disableHostCheck: true,
        port: 8080
    }
}

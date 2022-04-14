module.exports ={
    publicPath: "/backend",
    outputDir: '../src/main/resources/static/backend',
    configureWebpack: {
        performance:{
            hints:false
        }
    },
    devServer:{
        port: 3000,
        proxy: 'http://localhost:8080',
    }
}
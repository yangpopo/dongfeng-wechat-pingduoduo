module.exports = {
  publicPath: './',
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        args[0].title= '风光e家';
        args[0].environment= process.env.VUE_APP_NODE_ENV; // 环境 
        return args
      })
  }
}
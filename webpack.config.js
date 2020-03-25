const path = require('path')
const htmlWebpackPlugin = require('html-webpack-plugin')

module.exports={
    entry:"./src/main/app.js",
    output:{
        path:path.resolve(__dirname, 'build'),
        filename:'bundle.js'
    },
    plugins:[
        new htmlWebpackPlugin({
            template: path.resolve(__dirname, './index.html'),
            filename:'index.html'
        })
    ],
    module:{
        rules:[
            {test: /\.css$/, 
             use:[{
                 loader: 'style-loader',
                },
             {loader:'css-loader',
             options:{
                 modules:{localIdentName:'[name]_[local]-[hash:5]'}
                 
             }
            }]},
            // {test:  /\.css$/, use:['style-loader','css-loader?modules&localIdentName=[name]_[local]-[hash:5]']},
            //通过为css-loader添加modules参数，启用css模块化
            {test: /\.scss$/, use:['style-loader','css-loader','sass-loader']},
            {test: /\.(png|gif|bmp|jpg)$/, use:'url-loader?limit=5000'},
            {test: /\.(js|jsx)$/, use:'babel-loader', exclude:/node_modules/}
        ]
    }
}
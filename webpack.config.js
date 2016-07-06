module.exports = {
    entry: './book-viewer/app.ts',
    output: {
        filename: './dist/bundle.js'
    },
    devtool: 'source-map',

    resolve: {
        extensions: ['', '.ts', '.js', '.json', '.css', '.html','.scss']
    },
    module: { 
        loaders: [ 
           // { test: /\.tsx?$/, loader: 'ts-loader' }
            { 
                test: /\.tsx?$/, 
                loader: 'babel-loader?presets[]=es2015!ts-loader' ,
                exclude: /node_modules/
            }
        ],
    } 
}
module.exports = {
    entry: './demo/app.ts',
    output: {
        filename: './dist/bundle.js'
    },
    devtool: 'source-map',

    resolve: {
        extensions: ['', '.ts', '.js', '.json', '.css', '.html','.scss']
    },
    module: { 
        loaders: [ 
            { test: /\.tsx?$/, loader: 'ts-loader' }
        ],
    } 
}
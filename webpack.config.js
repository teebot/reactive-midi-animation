module.exports = {
    entry: './src/index.ts',
    output: {
        filename: 'out/main.js'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    module: {
        rules: [
            { test: /\.tsx?$/, loader: 'ts-loader' },
            { test: /\.css$/, use: [ 'style-loader', 'css-loader' ] },
            { test: /\.mp4$/, use: [ 'file-loader' ] }
        ]
    }
}

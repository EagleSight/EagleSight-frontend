'use strict';

module.exports = {
    devtool: 'inline-source-map',
    entry: './src/main.ts',
    output: { filename: 'dist/bundle.js' },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader'
            }
            //,{ enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
        ]
    },
    resolve: {
        extensions: [ '.ts', '.tsx', '.js' ]
    },
    externals: {
        "three": "THREE"
    },
};
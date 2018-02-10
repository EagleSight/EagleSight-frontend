'use strict';

const path = require('path');

module.exports = {
    devtool: 'inline-source-map',
    entry: './src/index.tsx',
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: path.join('static', 'js', 'app.js') 
    },
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
    devServer: {
        publicPath: '/',
        contentBase: path.join(__dirname, "dist"),
        port: 3000,
        proxy: {
            "/api": {
                target: "http://localhost:1323",
            },
            "/ws": {
                target: "http://localhost:1323",
                ws: true
            }
        }
    },
    watch: true
};
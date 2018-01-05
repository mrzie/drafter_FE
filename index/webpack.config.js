const webpack = require('webpack');
module.exports = env => ({
    entry: "./dist/index.js",
    output: {
        filename: "index.js",
        path: __dirname + "/bundle"
    },

    // Enable sourcemaps for debugging webpack's output.
    // devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js", ".json"]
    },
    module: {
        rules: [
            // { test: /\.tsx?$/, loader: "awesome-typescript-loader" },
            // { test: /\.ts?$/, loader: "awesome-typescript-loader" },
            // { test: /\.ts?$/, loader: "typescript-loader" },            
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
            {
                test: /\.js$/, exclude: /node_modules/, loader: "babel-loader", options: {
                    presets: ['env']
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    plugins: [
        // new webpack.optimize.UglifyJsPlugin()
    ]
});
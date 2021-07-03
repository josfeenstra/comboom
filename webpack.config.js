const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

// setup webpack using the ts-loader
module.exports = (env) => {
    let pack = {
        entry: "./src/index.ts",
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: "ts-loader",
                    include: [path.resolve(__dirname, "src")],
                },
                {
                    // Link to the geon-engine
                    loader: "ts-loader",
                    test: /\.ts$/,
                    // options: {
                    //     allowTsInNodeModules: true,
                    // },
                    include: [path.resolve(__dirname, "../engine")],
                },
            ],
        },
        resolve: {
            extensions: [".ts", ".js"],
        },
        output: {
            filename: "index.js",
            path: path.resolve(__dirname, "public"),
        },
        devServer: {
            filename: "index.js",
            lazy: true,
            contentBase: path.join(__dirname, "public"),

            // publicPath: "src",

            // path: path.resolve(__dirname, 'build'),

            // compress: true,
            // hot: true
        },

        optimization: {
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        keep_fnames: true,
                    },
              }),
            ],
        },
    }

    if (env.eval === "dev") {
        pack.devtool = "eval-source-map";
    }

    return pack;
}

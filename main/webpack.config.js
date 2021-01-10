// @ts-nocheck
const path = require('path');

class ConfigBase {
    constructor(mode, prefix) {
        this.mode = mode;
        if (this.isProduction()) {
            this.filename = `../${prefix}/nlpdate-main.min.js`;
        } else {
            this.filename = `../${prefix}/nlpdate-main.develop.js`;
        }
    }

    getConfig() {
        let config = {};
        this.append(config, 'entry', this.entry());
        this.append(config, 'output', this.output());
        this.append(config, 'module', this.module());
        this.append(config, 'resolve', this.resolve());
        this.append(config, 'devtool', this.devTool());
        return config;
    }

    isProduction() {
        if (this.mode == 'production') {
            return true;
        }
        return false;
    }

    append(map, key, object) {
        if (key !== undefined) {
            map[key] = object;
        }
    }

    entry() {
        return {
            'nlpdate-main': [`./src/main.ts`],
        };
    }

    output() {
        return {
            path: path.join(__dirname, '/'),
            filename: this.filename,
            library: 'NLPDate',
            libraryExport: 'default',
            libraryTarget: 'umd',
            globalObject: 'this',
        };
    }

    module() {
        return {};
    }

    resolve() {
        return {
            extensions: ['.ts', '.js'],
        };
    }

    devTool() {
        if (!this.isProduction()) {
            return 'inline-source-map';
        }
        return undefined;
    }
}

/**
 * TypeScriptでトランスパイルする
 * Webkit系でだけ動作する
 */
class TSConfig extends ConfigBase {
    constructor(mode) {
        super(mode, 'modern');
    }

    module() {
        return {
            rules: [
                {
                    test: /\.ts$/,
                    exclude: /(node_modules|bower_components)/,
                    loader: 'ts-loader',
                },
                {
                    test: /test\.(js|ts)$/,
                    exclude: /(node_modules|bower_components)/,
                    loader: 'mocha-loader',
                },
            ],
        };
    }
}

/**
 * IE11に対応するため、Babelでトランスパイルする
 */
class BabelConfig extends ConfigBase {
    constructor(mode) {
        super(mode, 'es2015');
    }

    module() {
        return {
            rules: [
                // JavaScriptをトランスパイルする
                {
                    test: /\.(js|jsx|ts)$/,
                    exclude: /(node_modules|bower_components)/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                [
                                    '@babel/preset-env',
                                    {
                                        targets: ['> 1%', 'ie 11'],
                                        useBuiltIns: 'usage',
                                        corejs: 3,
                                        modules: false,
                                        forceAllTransforms: true,
                                    },
                                ],
                            ],
                        },
                    },
                },
                // TypeScriptをJavascriptに変換する
                {
                    test: /\.ts$/,
                    exclude: /(node_modules|bower_components)/,
                    loader: 'ts-loader',
                    options: {
                        configFile: 'babel.tsconfig.json',
                    },
                },
            ],
        };
    }
}

module.exports = (env, argv) => {
    if (env !== undefined && (env.parser || 'ts') == 'babel') {
        return new BabelConfig(argv.mode).getConfig();
    }
    return new TSConfig(argv.mode).getConfig();
};

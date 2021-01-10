import { ConfigParameters } from './config';

/**
 * デフォルトの解析言語を指定する
 */
export const DefaultLanguage: string = 'jp';

/**
 * デフォルトの設定パラメータを指定する
 */
export const DefaultConfig: Map<string, ConfigParameters> = new Map(
    Object.entries({
        jp: {
            time_zone: 'Asia/Tokyo',
            language: 'jp',
            mode: 'static',
        },
    })
);

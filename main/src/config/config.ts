import { TimeZoneQueryParser, TimeZoneWrapper } from '../common/timezone_query';
import { DateUtility } from '../date/utility/date_utility';
import { DefaultConfig, DefaultLanguage } from './default_config';

type ConfigTypeMode = 'dynamic' | 'static';

export interface NameLocalize {
    jp: string[];
}
export type LocalizeAreas = keyof NameLocalize;

export interface ConfigParameters {
    time_zone?: string;
    language?: LocalizeAreas;
    epoch_time_milliseconds?: number;
    mode?: ConfigTypeMode;
}

/**
 * 設定情報を作成する
 */
export class Config {
    // タイムゾーン文字列（例：Asia/Tokyo, UTC-09:00）
    time_zone_query: string = 'UTC';
    // 解析後のタイムゾーン
    time_zone?: TimeZoneWrapper;
    // 言語
    language: LocalizeAreas = 'jp';
    // 動作モード
    mode: string = '';
    // 解析結果Dateのエポックミリ秒
    // 用途：
    // インスタンス生成時に実行結果時間を固定することで、処理にかかる時間分の遅延を反映させないため
    // また、テストのために固定時間を指定するため
    epoch_time_milliseconds: number = 0;

    constructor(args: ConfigParameters | undefined) {
        const default_config = DefaultConfig.get(DefaultLanguage) || {};
        const apply_args = args || {};

        this.setTimeZone(
            apply_args.time_zone || default_config.time_zone || 'UTC'
        );
        this.setLanguage(
            apply_args.language || default_config.language || 'jp'
        );
        this.setEpochTimeMilliseconds(
            apply_args.epoch_time_milliseconds ||
                default_config.epoch_time_milliseconds ||
                -1
        );
        this.setMode(apply_args.mode || default_config.mode || 'static');
    }

    /**
     * 設定情報からコンフィグパラメータを作成する
     */
    toJson(): ConfigParameters {
        return {
            time_zone: this.time_zone_query,
            language: this.language,
        };
    }

    /**
     * タイムゾーンを指定する（例：Asia/Tokyo, UTC, UTC-09:00）
     * @param time_zone_query
     */
    setTimeZone(time_zone_query: string) {
        this.time_zone_query = time_zone_query;
        this.time_zone = TimeZoneQueryParser(time_zone_query);
    }

    /**
     * 解析対象の言語を指定する
     * @param language （例：jp）
     */
    setLanguage(language: LocalizeAreas) {
        this.language = language;
    }

    /**
     * 動作モードを指定する
     * @param mode （static || dynamic）
     */
    setMode(mode: ConfigTypeMode) {
        this.mode = mode;
    }

    /**
     * 処理結果のDateオブジェクトの時間を指定する（未指定なら現在日時を指定する）
     * @param epoch_time_milliseconds エポックミリ秒
     */
    setEpochTimeMilliseconds(epoch_time_milliseconds: number) {
        if (epoch_time_milliseconds <= -1) {
            this.epoch_time_milliseconds = -1;
        } else {
            this.epoch_time_milliseconds = epoch_time_milliseconds;
        }
    }

    /**
     * タイムゾーンを取得する
     */
    getTimeZone(): TimeZoneWrapper {
        if (this.time_zone == undefined) {
            return new TimeZoneWrapper('UTC');
        }
        return this.time_zone;
    }

    /**
     * 言語を取得する
     */
    getLanguage() {
        return this.language;
    }

    /**
     * Dateのエポックミリ秒を取得する
     */
    getEpochTimeMilliseconds() {
        if (this.epoch_time_milliseconds <= -1) {
            return DateUtility.nowEpoch();
        } else {
            return this.epoch_time_milliseconds;
        }
    }

    /**
     * 動作モードがDynamicであればTrueを返す
     */
    isDynamic() {
        return this.mode == 'dynamic' ? true : false;
    }
}

import { ArrayExtend } from '../extend/array_extend';

/**
 * 日時の詳細情報を格納するオブジェクト
 */
class DateUnitObject {
    // キー文字列
    key: string;
    // 1単位あたりのミリ秒（例：秒であれば1000ミリ秒）
    milliseconds: number;
    // 単位
    unit: DateUnitType;
    constructor(key: string, milliseconds: number, unit: DateUnitType) {
        this.key = key;
        this.milliseconds = milliseconds;
        this.unit = unit;
    }
}

/**
 * 単位の定義
 */
export const DateUnitType = {
    UNKNOWN: 0, // 未定義
    YEAR: 1, // 年
    MONTH: 2, // 月
    DATE: 3, // 日
    HOUR: 4, // 時
    MINUTE: 5, // 分
    SECOND: 6, // 秒
    MILLISECOND: 7, // ミリ秒
    END_OF_MONTH: 8, // 月末
    END_OF_YEAR: 9, // 年末
    WEEK_NUMBER: 10, // 月の中の週番号
    YOUBI: 11, // 曜日
} as const;
export type DateUnitType = typeof DateUnitType[keyof typeof DateUnitType];

export class DateUnit {
    /**
     * 単位定義の配列
     */
    private static data = [
        // 年
        new DateUnitObject('year', -1, DateUnitType.YEAR),
        // 月
        new DateUnitObject('month', -1, DateUnitType.MONTH),
        // 日
        new DateUnitObject('date', 24 * 60 * 60 * 1000, DateUnitType.DATE),
        // 時
        new DateUnitObject('hour', 60 * 60 * 1000, DateUnitType.HOUR),
        // 分
        new DateUnitObject('minute', 60 * 1000, DateUnitType.MINUTE),
        // 秒
        new DateUnitObject('second', 1000, DateUnitType.SECOND),
        // ミリ秒
        new DateUnitObject('ms', 1, DateUnitType.MILLISECOND),
        // 月末
        new DateUnitObject('end_of_month', -1, DateUnitType.END_OF_MONTH),
        // 年末
        new DateUnitObject('end_of_year', -1, DateUnitType.END_OF_YEAR),
        // 曜日
        new DateUnitObject('day', -1, DateUnitType.YOUBI),
        // 週番号（第n週）
        new DateUnitObject(
            'week',
            7 * 24 * 60 * 60 * 1000,
            DateUnitType.WEEK_NUMBER
        ),
    ];

    /**
     * 無変換時の基準単位
     */
    private static millisecond = new DateUnitObject(
        'ms',
        1,
        DateUnitType.MILLISECOND
    );

    /**
     * 単位情報の詳細を取得する
     * @param unit 単位
     */
    static getDetail(unit: DateUnitType): DateUnitObject {
        return (
            ArrayExtend.first(this.data.filter((item) => item.unit == unit)) ||
            this.millisecond
        );
    }

    /**
     * 単位つき日時をミリ秒に変換する
     * @param value 日時の数値
     * @param unit 単位（例：日、時、分...）
     */
    static toMilliseconds(value: number, unit: DateUnitType) {
        return value * this.getDetail(unit).milliseconds;
    }
}

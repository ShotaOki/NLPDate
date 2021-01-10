import { Config, NameLocalize } from '../../config/config';
import { DateUtility } from '../utility/date_utility';
import { DateControl } from '../utility/date_control';
import { TimeZoneWrapper } from '../../common/timezone_query';
import { DateWrapper } from '../../dto/date_wrapper';
import { DateUnit, DateUnitType } from '../../common/date_unit';

/**
 * 主語パーサ（関数）の定義
 */
export type SubjectQueryParser = (
    args: number[],
    config: Config
) => DateWrapper;

/**
 * 主語パーサの定義
 */
interface SubjectQueryArgments {
    name: NameLocalize;
    parser: SubjectQueryParser;
}

/**
 * 主語パーサの格納オブジェクト
 */
export class SubjectQuery {
    // クエリ文字列
    name: NameLocalize;
    // パーサ
    parser: SubjectQueryParser;

    constructor(args: SubjectQueryArgments) {
        this.name = args.name;
        this.parser = args.parser;
    }
}

/**
 * 数字だけの主語があったときに、桁数からパーサを調べる定数
 */
const SimpleNumberDateFormatType = {
    // エポック秒
    EPOCH_TIME: 10,
    // エポックミリ秒
    EPOCH_MILLISECONDS_TIME: 13,
    // 年月日
    YEAR_MONTH_DATE: 8,
    // 年月日時分秒
    YEAR_MONTH_DATE_HOUR_MINUTE_SECOND: 14,
} as const;
type SimpleNumberDateFormatType = typeof SimpleNumberDateFormatType[keyof typeof SimpleNumberDateFormatType];

/**
 * 文字数からSimpleNumberDateFormatTypeの定数を返す
 * @param word_length 文字数
 */
const SimpleNumberDateFormatTypeFromWordLength: (
    word_length: number
) => SimpleNumberDateFormatType | undefined = (word_length) => {
    // 文字数に一致する定数を返す
    return Object.values(SimpleNumberDateFormatType).find(
        (enum_value) => enum_value == word_length
    );
};

export const SubjectQueryList = [
    new SubjectQuery({
        name: {
            jp: [
                '${0}', //
            ],
        },
        parser: function (args, config) {
            switch (
                SimpleNumberDateFormatTypeFromWordLength(
                    new String(args[0]).length
                )
            ) {
                // エポックミリ秒を日時に変換する
                case SimpleNumberDateFormatType.EPOCH_MILLISECONDS_TIME:
                    return DateUtility.dateFromEpoch(
                        args[0],
                        config.getTimeZone()
                    );
                // エポック秒を日時に変換する
                case SimpleNumberDateFormatType.EPOCH_TIME:
                    return DateUtility.dateFromEpoch(
                        DateUnit.toMilliseconds(args[0], DateUnitType.SECOND),
                        config.getTimeZone()
                    );
                // 年月日を日時に変換する
                case SimpleNumberDateFormatType.YEAR_MONTH_DATE:
                    return DateUtility.dateFromSet(config.getTimeZone(), [
                        new DateControl.Set(
                            DateUnitType.YEAR,
                            parseInt(new String(args[0]).substr(0, 4), 10)
                        ),
                        new DateControl.Set(
                            DateUnitType.MONTH,
                            parseInt(new String(args[0]).substr(4, 2), 10)
                        ),
                        new DateControl.Set(
                            DateUnitType.DATE,
                            parseInt(new String(args[0]).substr(6, 2), 10)
                        ),
                    ]);
                // 年月日時分秒を日時に変換する
                case SimpleNumberDateFormatType.YEAR_MONTH_DATE_HOUR_MINUTE_SECOND:
                    return DateUtility.dateFromSet(config.getTimeZone(), [
                        new DateControl.Set(
                            DateUnitType.YEAR,
                            parseInt(new String(args[0]).substr(0, 4), 10)
                        ),
                        new DateControl.Set(
                            DateUnitType.MONTH,
                            parseInt(new String(args[0]).substr(4, 2), 10)
                        ),
                        new DateControl.Set(
                            DateUnitType.DATE,
                            parseInt(new String(args[0]).substr(6, 2), 10)
                        ),
                        new DateControl.Set(
                            DateUnitType.HOUR,
                            parseInt(new String(args[0]).substr(8, 2), 10)
                        ),
                        new DateControl.Set(
                            DateUnitType.MINUTE,
                            parseInt(new String(args[0]).substr(10, 2), 10)
                        ),
                        new DateControl.Set(
                            DateUnitType.SECOND,
                            parseInt(new String(args[0]).substr(12, 2), 10)
                        ),
                    ]);
                // 未定義のデータは現在日時に変換する
                default:
                    return DateUtility.dateFromEpoch(
                        config.getEpochTimeMilliseconds(),
                        config.getTimeZone()
                    );
            }
        },
    }),
    new SubjectQuery({
        name: {
            jp: [
                '${0}/${1}/${2}', //
                '${0}-${1}-${2}',
            ],
        },
        parser: function (args, config) {
            return DateUtility.dateFromSet(config.getTimeZone(), [
                new DateControl.Set(DateUnitType.YEAR, args[0]),
                new DateControl.Set(DateUnitType.MONTH, args[1]),
                new DateControl.Set(DateUnitType.DATE, args[2]),
            ]);
        },
    }),
    new SubjectQuery({
        name: {
            jp: [
                '${0}/${1}', //
                '${0}-${1}',
            ],
        },
        parser: function (args, config) {
            if (args[0] >= 13) {
                // 13以上の数字から始まっていれば年であるため、年月を登録する
                return DateUtility.dateFromSet(config.getTimeZone(), [
                    new DateControl.Set(DateUnitType.YEAR, args[0]),
                    new DateControl.Set(DateUnitType.MONTH, args[1]),
                ]);
            }
            // 現在年/月/日のフォーマットで登録する
            const now = DateUtility.dateFromEpoch(
                config.getEpochTimeMilliseconds(),
                config.getTimeZone()
            );
            return DateUtility.dateFromSet(config.getTimeZone(), [
                new DateControl.Set(DateUnitType.YEAR, now.getFullYear()),
                new DateControl.Set(DateUnitType.MONTH, args[0]),
                new DateControl.Set(DateUnitType.DATE, args[1]),
            ]);
        },
    }),
    new SubjectQuery({
        name: {
            jp: [
                '${0}/${1}/${2} ${3}:${4}:${5}',
                '${0}/${1}/${2}T${3}:${4}:${5}',
                '${0}-${1}-${2} ${3}:${4}:${5}',
            ],
        },
        parser: function (args, config) {
            return DateUtility.dateFromSet(config.getTimeZone(), [
                new DateControl.Set(DateUnitType.YEAR, args[0]),
                new DateControl.Set(DateUnitType.MONTH, args[1]),
                new DateControl.Set(DateUnitType.DATE, args[2]),
                new DateControl.Set(DateUnitType.HOUR, args[3]),
                new DateControl.Set(DateUnitType.MINUTE, args[4]),
                new DateControl.Set(DateUnitType.SECOND, args[5]),
            ]);
        },
    }),

    new SubjectQuery({
        name: {
            jp: [
                '${0}/${1}/${2}T${3}:${4}:${5}+${6}:${7}',
                '${0}-${1}-${2}T${3}:${4}:${5}+${6}:${7}',
            ],
        },
        parser: function (args, config) {
            return DateUtility.dateFromSet(
                TimeZoneWrapper.fromHourMinutes('UTC+', args[6], args[7]),
                [
                    new DateControl.Set(DateUnitType.YEAR, args[0]),
                    new DateControl.Set(DateUnitType.MONTH, args[1]),
                    new DateControl.Set(DateUnitType.DATE, args[2]),
                    new DateControl.Set(DateUnitType.HOUR, args[3]),
                    new DateControl.Set(DateUnitType.MINUTE, args[4]),
                    new DateControl.Set(DateUnitType.SECOND, args[5]),
                ]
            );
        },
    }),

    new SubjectQuery({
        name: {
            jp: [
                '${0}/${1}/${2}T${3}:${4}:${5}-${6}:${7}',
                '${0}-${1}-${2}T${3}:${4}:${5}-${6}:${7}',
            ],
        },
        parser: function (args: number[], config: any) {
            return DateUtility.dateFromSet(
                TimeZoneWrapper.fromHourMinutes('UTC-', args[6], args[7]),
                [
                    new DateControl.Set(DateUnitType.YEAR, args[0]),
                    new DateControl.Set(DateUnitType.MONTH, args[1]),
                    new DateControl.Set(DateUnitType.DATE, args[2]),
                    new DateControl.Set(DateUnitType.HOUR, args[3]),
                    new DateControl.Set(DateUnitType.MINUTE, args[4]),
                    new DateControl.Set(DateUnitType.SECOND, args[5]),
                ]
            );
        },
    }),
];

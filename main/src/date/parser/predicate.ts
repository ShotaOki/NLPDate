import { DateUtility } from '../utility/date_utility';
import { DateControl } from '../utility/date_control';
import { DateWrapper } from '../../dto/date_wrapper';
import { Config, NameLocalize } from '../../config/config';
import { DateUnitType, DateUnit } from '../../common/date_unit';
import { WeekDayUnit } from '../../common/weekday_unit';
import { ArrayExtend, MapKeyValue } from '../../extend/array_extend';
import { Wareki } from '../../common/wareki';

/**
 * 述語のパーサ（関数）
 */
export type DatePredicateParser = (
    date: DateWrapper,
    args: number[],
    config: Config,
    predicate_list: Predicate[]
) => DateWrapper;

/**
 * 述語のパーサ
 */
interface PredicateArgments {
    // 述語文字列
    name: NameLocalize;
    // パーサ
    parser: DatePredicateParser;
    // 付帯情報
    extra?: MapKeyValue[];
}

/**
 * 述語の解析オブジェクト
 */
export class Predicate {
    name: NameLocalize;
    parser: DatePredicateParser;
    extra: Map<string, string>;
    constructor(args: PredicateArgments) {
        this.name = args.name;
        this.parser = args.parser;
        this.extra = ArrayExtend.toMap(args.extra);
    }
}

/**
 * getDateControlSetの日時操作のオフセット
 */
interface DateControlSetOffset {
    // ミリ秒で現在日時からのオフセットを指定する
    milliseconds?: number;
    // 年で現在日時からのオフセットを指定する
    year?: number;
    // 月で現在日時からのオフセットを指定する
    month?: number;
}

/**
 * 精度にあわせた現在日時を設定する日時操作の配列を返す
 * @param config 現在日時
 * @param offset_milliseconds 相対値のオフセット（ミリ秒）
 * @param accuracy 精度
 */
function getDateControlSet(
    config: Config,
    offset: DateControlSetOffset,
    accuracy: DateUnitType
) {
    // Configから現在日時を取得する
    let now_date = new Date(0);
    now_date.setUTCMilliseconds(
        config.getEpochTimeMilliseconds() +
            config.getTimeZone().getTime() +
            (offset.milliseconds || 0)
    );
    // 操作配列を設定する
    let date_control_map = new Map<DateUnitType, number>();
    // 設定予定の年を取得する
    let new_year = now_date.getUTCFullYear() + (offset.year || 0);
    // 設定予定の月を取得する
    let new_month = now_date.getUTCMonth() + 1 + (offset.month || 0);
    // 設定予定の日を取得する（カレンダーの定義外であれば最大日を指定する）
    let new_date = Math.min(
        now_date.getUTCDate(),
        DateUtility.maxDateInCalendar(new_year, new_month - 1)
    );
    date_control_map.set(DateUnitType.YEAR, new_year);
    date_control_map.set(DateUnitType.MONTH, new_month);
    date_control_map.set(DateUnitType.DATE, new_date);
    date_control_map.set(DateUnitType.HOUR, now_date.getUTCHours());
    date_control_map.set(DateUnitType.MINUTE, now_date.getUTCMinutes());
    date_control_map.set(DateUnitType.SECOND, now_date.getUTCSeconds());
    date_control_map.set(
        DateUnitType.MILLISECOND,
        now_date.getUTCMilliseconds()
    );

    // 配列操作をオブジェクトに格納する
    let result: any[] = [];
    date_control_map.forEach((value, date_accuracy) => {
        if (date_accuracy <= accuracy) {
            result.push(new DateControl.Set(date_accuracy, value));
        }
    });
    return result;
}

/**
 * 最後に格納したPredicateのエクストラ情報を取得する
 * @param predicate_list 処理済みのPredicateの配列
 */
function getLastPredicateExtra(
    predicate_list: Predicate[],
    index: number = 1
): Map<string, string> {
    if (predicate_list && predicate_list.length >= index) {
        return predicate_list[predicate_list.length - index].extra;
    }
    return new Map();
}

export const PredicateList = [
    new Predicate({
        name: {
            jp: [
                '${0}日前', //
            ],
        },
        parser: function (date, args, config, predicate_list) {
            return DateUtility.control(date, [
                new DateControl.Add(DateUnitType.DATE, -args[0]),
            ]);
        },
    }),
    new Predicate({
        name: {
            jp: [
                '${0}年前', //
            ],
        },
        parser: function (date, args, config, predicate_list) {
            return DateUtility.control(date, [
                new DateControl.Add(DateUnitType.YEAR, -args[0]),
            ]);
        },
    }),
    new Predicate({
        name: {
            jp: [
                '${0}週間前', //
                '${0}週前',
            ],
        },
        parser: function (date, args, config, predicate_list) {
            return DateUtility.control(date, [
                new DateControl.Add(DateUnitType.DATE, -args[0] * 7),
            ]);
        },
    }),
    new Predicate({
        name: {
            jp: [
                '${0}時間前', //
            ],
        },
        parser: function (date, args, config, predicate_list) {
            return DateUtility.control(date, [
                new DateControl.Add(DateUnitType.HOUR, -args[0]),
            ]);
        },
    }),
    new Predicate({
        name: {
            jp: [
                '${0}分前', //
            ],
        },
        parser: function (date, args, config, predicate_list) {
            return DateUtility.control(date, [
                new DateControl.Add(DateUnitType.MINUTE, -args[0]),
            ]);
        },
    }),
    new Predicate({
        name: {
            jp: [
                '${0}秒前', //
            ],
        },
        parser: function (date, args, config, predicate_list) {
            return DateUtility.control(date, [
                new DateControl.Add(DateUnitType.SECOND, -args[0]),
            ]);
        },
    }),
    new Predicate({
        name: {
            jp: [
                '${0}日後', //
            ],
        },
        parser: function (date, args, config, predicate_list) {
            return DateUtility.control(date, [
                new DateControl.Add(DateUnitType.DATE, args[0]),
            ]);
        },
    }),
    new Predicate({
        name: {
            jp: [
                '${0}月後', //
                '${0}カ月後',
                '${0}ヶ月後',
                '${0}ヵ月後',
                '${0}ケ月後',
            ],
        },
        parser: function (date, args, config, predicate_list) {
            return DateUtility.control(date, [
                new DateControl.Add(DateUnitType.MONTH, args[0]),
            ]);
        },
    }),
    new Predicate({
        name: {
            jp: [
                '${0}月前', //
                '${0}カ月前',
                '${0}ヶ月前',
                '${0}ヵ月前',
                '${0}ケ月前',
            ],
        },
        parser: function (date, args, config, predicate_list) {
            return DateUtility.control(date, [
                new DateControl.Add(DateUnitType.MONTH, -args[0]),
            ]);
        },
    }),
    new Predicate({
        name: {
            jp: [
                '${0}年後', //
            ],
        },
        parser: function (date, args, config, predicate_list) {
            return DateUtility.control(date, [
                new DateControl.Add(DateUnitType.YEAR, args[0]),
            ]);
        },
    }),
    new Predicate({
        name: {
            jp: [
                '${0}週間後', //
                '${0}週後',
            ],
        },
        parser: function (date, args, config, predicate_list) {
            return DateUtility.control(date, [
                new DateControl.Add(DateUnitType.DATE, args[0] * 7),
            ]);
        },
    }),
    new Predicate({
        name: {
            jp: [
                '${0}時間後', //
            ],
        },
        parser: function (date, args, config, predicate_list) {
            return DateUtility.control(date, [
                new DateControl.Add(DateUnitType.HOUR, args[0]),
            ]);
        },
    }),
    new Predicate({
        name: {
            jp: [
                '${0}分後', //
            ],
        },
        parser: function (date, args, config, predicate_list) {
            return DateUtility.control(date, [
                new DateControl.Add(DateUnitType.MINUTE, args[0]),
            ]);
        },
    }),
    new Predicate({
        name: {
            jp: [
                '${0}秒後', //
            ],
        },
        parser: function (date, args, config, predicate_list) {
            return DateUtility.control(date, [
                new DateControl.Add(DateUnitType.SECOND, args[0]),
            ]);
        },
    }),
    new Predicate({
        name: {
            jp: [
                '今日', //
                'きょう',
            ],
        },
        parser: function (date, args, config, predicate_list) {
            return DateUtility.control(
                date,
                getDateControlSet(
                    config,
                    {
                        milliseconds: DateUnit.toMilliseconds(
                            0,
                            DateUnitType.DATE
                        ),
                    },
                    DateUnitType.DATE
                )
            );
        },
    }),
    new Predicate({
        name: {
            jp: [
                '現在', //
                '今',
                '今頃',
                'げんざい',
                'いま',
                'いまごろ',
            ],
        },
        parser: function (date, args, config, predicate_list) {
            // 現在の時分秒とミリ秒を設定する
            return DateUtility.control(
                date,
                getDateControlSet(
                    config,
                    {
                        milliseconds: DateUnit.toMilliseconds(
                            0,
                            DateUnitType.DATE
                        ),
                    },
                    DateUnitType.MILLISECOND
                ).filter((control) => control.unit >= DateUnitType.HOUR)
            );
        },
    }),
    new Predicate({
        name: {
            jp: [
                '来年', //
            ],
        },
        parser: function (date, args, config, predicate_list) {
            return DateUtility.control(
                date,
                getDateControlSet(
                    config,
                    {
                        year: 1,
                    },
                    DateUnitType.DATE
                )
            );
        },
    }),
    new Predicate({
        name: {
            jp: [
                '再来年', //
                'さ来年',
            ],
        },
        parser: function (date, args, config, predicate_list) {
            return DateUtility.control(
                date,
                getDateControlSet(
                    config,
                    {
                        year: 2,
                    },
                    DateUnitType.DATE
                )
            );
        },
    }),
    new Predicate({
        name: {
            jp: [
                '来月', //
            ],
        },
        parser: function (date, args, config, predicate_list) {
            return DateUtility.control(
                date,
                getDateControlSet(config, { month: 1 }, DateUnitType.DATE)
            );
        },
    }),
    new Predicate({
        name: {
            jp: [
                '今月', //
            ],
        },
        parser: function (date, args, config, predicate_list) {
            return DateUtility.control(
                date,
                getDateControlSet(config, { month: 0 }, DateUnitType.DATE)
            );
        },
    }),
    new Predicate({
        name: {
            jp: [
                '今年', //
            ],
        },
        parser: function (date, args, config, predicate_list) {
            return DateUtility.control(
                date,
                getDateControlSet(config, { year: 0 }, DateUnitType.DATE)
            );
        },
    }),
    new Predicate({
        name: {
            jp: [
                '再来月', //
                'さ来月',
            ],
        },
        parser: function (date, args, config, predicate_list) {
            return DateUtility.control(
                date,
                getDateControlSet(config, { month: 2 }, DateUnitType.DATE)
            );
        },
    }),
    new Predicate({
        name: {
            jp: [
                '明日', //
                'あした',
                'あす',
            ],
        },
        parser: function (date, args, config, predicate_list) {
            return DateUtility.control(
                date,
                getDateControlSet(
                    config,
                    {
                        milliseconds: DateUnit.toMilliseconds(
                            1,
                            DateUnitType.DATE
                        ),
                    },
                    DateUnitType.DATE
                )
            );
        },
    }),
    new Predicate({
        name: {
            jp: [
                '明後日', //
                'あさって',
            ],
        },
        parser: function (date, args, config, predicate_list) {
            return DateUtility.control(
                date,
                getDateControlSet(
                    config,
                    {
                        milliseconds: DateUnit.toMilliseconds(
                            2,
                            DateUnitType.DATE
                        ),
                    },
                    DateUnitType.DATE
                )
            );
        },
    }),
    new Predicate({
        name: {
            jp: [
                'しあさって', //
            ],
        },
        parser: function (date, args, config, predicate_list) {
            return DateUtility.control(
                date,
                getDateControlSet(
                    config,
                    {
                        milliseconds: DateUnit.toMilliseconds(
                            3,
                            DateUnitType.DATE
                        ),
                    },
                    DateUnitType.DATE
                )
            );
        },
    }),
    new Predicate({
        name: {
            jp: [
                'やのあさって', //
                'やまあさって',
            ],
        },
        parser: function (date, args, config, predicate_list) {
            return DateUtility.control(
                date,
                getDateControlSet(
                    config,
                    {
                        milliseconds: DateUnit.toMilliseconds(
                            4,
                            DateUnitType.DATE
                        ),
                    },
                    DateUnitType.DATE
                )
            );
        },
    }),
    new Predicate({
        name: {
            jp: [
                '去年', //
                '昨年',
            ],
        },
        parser: function (date, args, config, predicate_list) {
            return DateUtility.control(
                date,
                getDateControlSet(config, { year: -1 }, DateUnitType.DATE)
            );
        },
    }),
    new Predicate({
        name: {
            jp: [
                '${0}昨年', //
                'おととし',
            ],
        },
        parser: function (date, args, config, predicate_list) {
            return DateUtility.control(
                date,
                getDateControlSet(config, { year: -2 }, DateUnitType.DATE)
            );
        },
    }),
    new Predicate({
        name: {
            jp: [
                '先月', //
            ],
        },
        parser: function (date, args, config, predicate_list) {
            return DateUtility.control(
                date,
                getDateControlSet(config, { month: -1 }, DateUnitType.DATE)
            );
        },
    }),
    new Predicate({
        name: {
            jp: [
                '昨日', //
            ],
        },
        parser: function (date, args, config, predicate_list) {
            return DateUtility.control(
                date,
                getDateControlSet(
                    config,
                    {
                        milliseconds: DateUnit.toMilliseconds(
                            -1,
                            DateUnitType.DATE
                        ),
                    },
                    DateUnitType.DATE
                )
            );
        },
    }),
    new Predicate({
        name: {
            jp: [
                '${0}昨日', //
                'おととい',
                'おとつい',
                'いっさくじつ',
            ],
        },
        parser: function (date, args, config, predicate_list) {
            return DateUtility.control(
                date,
                getDateControlSet(
                    config,
                    {
                        milliseconds: DateUnit.toMilliseconds(
                            -2,
                            DateUnitType.DATE
                        ),
                    },
                    DateUnitType.DATE
                )
            );
        },
    }),
    new Predicate({
        name: {
            jp: [
                '月末', //
            ],
        },
        parser: function (date, args, config, predicate_list) {
            return DateUtility.control(date, [
                new DateControl.Set(DateUnitType.END_OF_MONTH, 0),
            ]);
        },
    }),
    new Predicate({
        name: {
            jp: [
                '年末', //
            ],
        },
        parser: function (date, args, config, predicate_list) {
            return DateUtility.control(date, [
                new DateControl.Set(DateUnitType.END_OF_YEAR, 0),
            ]);
        },
    }),
    new Predicate({
        name: {
            jp: [
                '${0}年', //
            ],
        },
        parser: function (date, args, config, predicate_list) {
            let year = args[0];
            const wareki = getLastPredicateExtra(predicate_list).get('wareki');
            if (wareki) {
                let parsed_year = Wareki.toFullYear(wareki, year);
                if (parsed_year) {
                    year = parsed_year;
                }
            }
            return DateUtility.control(date, [
                new DateControl.Set(DateUnitType.YEAR, year),
            ]);
        },
    }),
    new Predicate({
        name: {
            jp: [
                '令和', //
                '令和元年',
            ],
        },
        extra: [{ key: 'wareki', value: '令和' }],
        parser: function (date, args, config, predicate_list) {
            const year = Wareki.toFullYear('令和', 1);
            return DateUtility.control(
                date,
                year ? [new DateControl.Set(DateUnitType.YEAR, year)] : []
            );
        },
    }),
    new Predicate({
        name: {
            jp: [
                '平成', //
                '平成元年',
            ],
        },
        extra: [{ key: 'wareki', value: '平成' }],
        parser: function (date, args, config, predicate_list) {
            const year = Wareki.toFullYear('平成', 1);
            return DateUtility.control(
                date,
                year ? [new DateControl.Set(DateUnitType.YEAR, year)] : []
            );
        },
    }),
    new Predicate({
        name: {
            jp: [
                '昭和', //
                '昭和元年',
            ],
        },
        extra: [{ key: 'wareki', value: '昭和' }],
        parser: function (date, args, config, predicate_list) {
            const year = Wareki.toFullYear('昭和', 1);
            return DateUtility.control(
                date,
                year ? [new DateControl.Set(DateUnitType.YEAR, year)] : []
            );
        },
    }),
    new Predicate({
        name: {
            jp: [
                '大正', //
                '大正元年',
            ],
        },
        extra: [{ key: 'wareki', value: '大正' }],
        parser: function (date, args, config, predicate_list) {
            const year = Wareki.toFullYear('大正', 1);
            return DateUtility.control(
                date,
                year ? [new DateControl.Set(DateUnitType.YEAR, year)] : []
            );
        },
    }),
    new Predicate({
        name: {
            jp: [
                '明治', //
                '明治元年',
            ],
        },
        extra: [{ key: 'wareki', value: '明治' }],
        parser: function (date, args, config, predicate_list) {
            const year = Wareki.toFullYear('明治', 1);
            return DateUtility.control(
                date,
                year ? [new DateControl.Set(DateUnitType.YEAR, year)] : []
            );
        },
    }),
    new Predicate({
        name: {
            jp: [
                '${0}月', //
            ],
        },
        parser: function (date, args, config, predicate_list) {
            return DateUtility.control(date, [
                new DateControl.Set(DateUnitType.MONTH, args[0]),
            ]);
        },
    }),
    new Predicate({
        name: {
            jp: [
                '${0}日', //
            ],
        },
        parser: function (date, args, config, predicate_list) {
            return DateUtility.control(date, [
                new DateControl.Set(DateUnitType.DATE, args[0]),
            ]);
        },
    }),
    new Predicate({
        name: {
            jp: [
                '${0}時', //
            ],
        },
        parser: function (date, args, config, predicate_list) {
            const ampm = getLastPredicateExtra(predicate_list).get('ampm');
            return DateUtility.control(date, [
                new DateControl.Set(
                    DateUnitType.HOUR,
                    args[0] + parseInt(ampm || '0')
                ),
            ]);
        },
    }),
    new Predicate({
        name: {
            jp: [
                '午前', //
                '午前中',
                'AM',
            ],
        },
        extra: [{ key: 'ampm', value: '0' }],
        parser: function (date, args, config, predicate_list) {
            return date;
        },
    }),
    new Predicate({
        name: {
            jp: [
                '午後', //
                'PM',
            ],
        },
        extra: [{ key: 'ampm', value: '12' }],
        parser: function (date, args, config, predicate_list) {
            return date;
        },
    }),
    new Predicate({
        name: {
            jp: [
                '${0}分', //
            ],
        },
        parser: function (date, args, config, predicate_list) {
            return DateUtility.control(date, [
                new DateControl.Set(DateUnitType.MINUTE, args[0]),
            ]);
        },
    }),
    new Predicate({
        name: {
            jp: [
                '${0}:${1}', //
                'AM${0}:${1}', //
            ],
        },
        parser: function (date, args, config, predicate_list) {
            return DateUtility.control(date, [
                new DateControl.Set(DateUnitType.HOUR, args[0]),
                new DateControl.Set(DateUnitType.MINUTE, args[1]),
            ]);
        },
    }),
    new Predicate({
        name: {
            jp: [
                'PM${0}:${1}', //
            ],
        },
        parser: function (date, args, config, predicate_list) {
            return DateUtility.control(date, [
                new DateControl.Set(DateUnitType.HOUR, args[0] + 12),
                new DateControl.Set(DateUnitType.MINUTE, args[1]),
            ]);
        },
    }),
    new Predicate({
        name: {
            jp: [
                '${0}秒', //
            ],
        },
        parser: function (date, args, config, predicate_list) {
            return DateUtility.control(date, [
                new DateControl.Set(DateUnitType.SECOND, args[0]),
            ]);
        },
    }),
    new Predicate({
        name: {
            jp: [
                '${0}ミリ秒', //
            ],
        },
        parser: function (date, args, config, predicate_list) {
            return DateUtility.control(date, [
                new DateControl.Set(DateUnitType.MILLISECOND, args[0]),
            ]);
        },
    }),
    new Predicate({
        name: {
            jp: [
                '${0}曜', //
                '${0}曜日', //
            ],
        },
        parser: function (date, args, config, predicate_list) {
            // 第n週を取得する
            const index_number = getLastPredicateExtra(predicate_list).get(
                'index_number'
            );
            // 曜日を設定する
            let control = [new DateControl.Set(DateUnitType.YOUBI, args[0])];
            // 曜日の詳細があればそれを設定する
            if (index_number) {
                // 前の述語の引数を取得する
                const last_argv = getLastPredicateExtra(predicate_list).get(
                    'argv'
                );
                // 2つ前の述語が「前の」「次の」であれば取得する
                const relation = getLastPredicateExtra(predicate_list, 2).get(
                    'relation'
                );
                const new_week_number = JSON.parse(last_argv || '["0"]')[0];
                // 第n週を設定する
                ArrayExtend.insert(
                    control,
                    0,
                    new DateControl.Set(
                        DateUnitType.WEEK_NUMBER,
                        new_week_number
                    )
                );
                if (relation) {
                    let relative_month_number = 0;
                    // 週の先頭の曜日を取得する
                    let origin_date = new Date(date.getTime(false));
                    origin_date.setUTCDate(1);
                    // 週と曜日から、設定する日付を取得する
                    let new_date = DateUtility.dateFromWeekNumberAndWeekDay(
                        WeekDayUnit.getWeekDay(origin_date.getUTCDay()),
                        WeekDayUnit.getWeekDay(args[0]),
                        new_week_number
                    );
                    // 今月の中に次のn曜日がある場合：　次：今月　前：前月
                    // 翌月の中に次のn曜日がある場合：　次：翌月　前：今月
                    if (date.getDate() < new_date) {
                        if (relation == 'previous') {
                            relative_month_number = -1;
                        }
                    } else {
                        if (relation == 'next') {
                            relative_month_number = 1;
                        }
                    }
                    if (relative_month_number != 0) {
                        ArrayExtend.insert(
                            control,
                            0,
                            new DateControl.Add(
                                DateUnitType.MONTH,
                                relative_month_number
                            )
                        );
                    }
                }
            } else {
                // 1つ前の述語が「前の」「次の」であれば取得する
                const relation = getLastPredicateExtra(predicate_list).get(
                    'relation'
                );
                if (relation) {
                    let relative_week_number = 0;
                    if (date.getWeekDay() < WeekDayUnit.getWeekDay(args[0])) {
                        if (relation == 'previous') {
                            relative_week_number = -1;
                        }
                    } else {
                        if (relation == 'next') {
                            relative_week_number = 1;
                        }
                    }
                    if (relative_week_number != 0) {
                        control.push(
                            new DateControl.Add(
                                DateUnitType.WEEK_NUMBER,
                                relative_week_number
                            )
                        );
                    }
                }
            }
            return DateUtility.control(date, control);
        },
    }),
    new Predicate({
        name: {
            jp: [
                '第${0}', //
            ],
        },
        extra: [{ key: 'index_number', value: 'argv' }],
        parser: function (date, args, config, predicate_list) {
            return date;
        },
    }),
    new Predicate({
        name: {
            jp: [
                '次', //
                '今度', //
            ],
        },
        extra: [{ key: 'relation', value: 'next' }],
        parser: function (date, args, config, predicate_list) {
            return date;
        },
    }),
    new Predicate({
        name: {
            jp: [
                '前', //
                '以前', //
            ],
        },
        extra: [{ key: 'relation', value: 'previous' }],
        parser: function (date, args, config, predicate_list) {
            return date;
        },
    }),
];

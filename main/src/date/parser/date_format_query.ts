import { NameLocalize } from '../../config/config';
import { ArrayExtend, MapKeyValue } from '../../extend/array_extend';

/**
 * 日時を文字列に変換するクエリのフォーマットを定義する
 */
interface DateFormatQueryInterface {
    // クエリ文字列
    name: NameLocalize;
    // 付帯情報
    extra?: MapKeyValue[];
}

/**
 * 日時を文字列に変換するパーサの格納オブジェクト
 */
export class DateFormatQuery {
    name: NameLocalize;
    extra: Map<string, string>;

    constructor(args: DateFormatQueryInterface) {
        this.name = args.name;
        this.extra = ArrayExtend.toMap(args.extra);
    }
}

export const DateFormatQueryList = [
    new DateFormatQuery({
        name: {
            jp: [
                'スラッシュ', //
                'コロン',
            ],
        },
        extra: [{ key: 'type', value: 'slash' }],
    }),

    new DateFormatQuery({
        name: {
            jp: [
                'ハイフン', //
            ],
        },
        extra: [{ key: 'type', value: 'hyphen' }],
    }),

    new DateFormatQuery({
        name: {
            jp: [
                'ISO8601', //
                'ISO',
                'アイエスオー',
            ],
        },
        extra: [{ key: 'type', value: 'iso' }],
    }),

    new DateFormatQuery({
        name: {
            jp: [
                '日本語', //
                '漢字',
            ],
        },
        extra: [{ key: 'type', value: 'japanese' }],
    }),

    new DateFormatQuery({
        name: {
            jp: [
                '和暦', //
                '令和',
                '平成',
                '昭和',
                '大正',
                '明治',
            ],
        },
        extra: [
            { key: 'format.year', value: 'w' },
            { key: 'type', value: 'japanese' },
        ],
    }),

    new DateFormatQuery({
        name: {
            jp: [
                '区切りなし', //
                '区切り文字なし',
                '数字',
                '区切らない',
            ],
        },
        extra: [{ key: 'type', value: 'none' }],
    }),

    new DateFormatQuery({
        name: {
            jp: [
                '年', //
            ],
        },
        extra: [{ key: 'unit.year', value: 'true' }],
    }),

    new DateFormatQuery({
        name: {
            jp: [
                '月', //
            ],
        },
        extra: [{ key: 'unit.month', value: 'true' }],
    }),
    new DateFormatQuery({
        name: {
            jp: [
                '日', //
            ],
        },
        extra: [{ key: 'unit.date', value: 'true' }],
    }),
    new DateFormatQuery({
        name: {
            jp: [
                '時', //
            ],
        },
        extra: [{ key: 'unit.hour', value: 'true' }],
    }),
    new DateFormatQuery({
        name: {
            jp: [
                '分', //
            ],
        },
        extra: [{ key: 'unit.minute', value: 'true' }],
    }),
    new DateFormatQuery({
        name: {
            jp: [
                '秒', //
            ],
        },
        extra: [{ key: 'unit.second', value: 'true' }],
    }),

    new DateFormatQuery({
        name: {
            jp: [
                'ミリ秒', //
            ],
        },
        extra: [{ key: 'unit.millisecond', value: 'true' }],
    }),
    new DateFormatQuery({
        name: {
            jp: [
                '曜日', //
            ],
        },
        extra: [{ key: 'unit.weekday', value: 'true' }],
    }),
    new DateFormatQuery({
        name: {
            jp: [
                'エポック', //
                'ユニックス',
                'エポック秒',
                'ユニックス時間',
                'ユニックスタイム',
            ],
        },
        extra: [{ key: 'unit.epoch', value: 'true' }],
    }),
    new DateFormatQuery({
        name: {
            jp: ['エポックミリ', 'エポックミリ秒'],
        },
        extra: [{ key: 'unit.epoch_ms', value: 'true' }],
    }),
];

/**
 * 配列から日時フォーマットを追加する
 * @param unit 日時単位（例：年、月、日）
 * @param format_text 日時単位の表示文字列（例："[西暦{year}年]"）
 * @param value 日時の値
 * @param should_write_prefix プレフィックスの表示要否
 */
function appendFormat(
    unit: string,
    format_text: string,
    value: string,
    should_write_prefix: boolean
) {
    // ユニットに該当する表示文字列を取得する
    let format: string | undefined = ArrayExtend.first(
        format_text
            .split(/\[|\]/g)
            .filter((item) => item.indexOf(`{${unit}}`) >= 0)
    );
    // 表示文字列が定義されていれば、中カッコ内のキーを置換する
    if (format && format.indexOf('{') >= 0) {
        if (!should_write_prefix) {
            // プレフィックスの表示が不要なら中カッコよりも前のテキストを削除する
            format = format.substring(format.indexOf('{'));
        }
        return format.replace(`{${unit}}`, value);
    }
    return value;
}

export class DateFormat {
    /**
     * 処理済みクエリの一覧を付帯情報のマップに変換する
     * @param query_list クエリの一覧
     */
    static getQueryMap(query_list: DateFormatQuery[]) {
        // 付帯情報を全ての処理済みクエリから取得、前から順に合成する
        let map = new Map<string, string>();
        query_list.forEach((item) => {
            item.extra.forEach((value, key) => {
                map.set(key, value);
            });
        });
        return map;
    }

    /**
     * クエリからフォーマット文字列（例：YYYY-MM-ddなど）を作成する
     * @param map 処理済みクエリのマップ
     */
    static getDateFormatFromMap(map: Map<string, string>) {
        // 区切り文字のタイプを解析する
        let format_text = '';
        switch (map.get('type') || 'japanese') {
            // ISOフォーマット
            case 'iso':
            default:
                format_text =
                    '[{year}][-{month}][-{date}][T{hour}][:{minute}][:{second}][.{millisecond}][{timezone}]';
                // ISOであれば年月日時分秒＋タイムゾーンを表示対象にする
                map.set('unit.year', 'true');
                map.set('unit.month', 'true');
                map.set('unit.date', 'true');
                map.set('unit.hour', 'true');
                map.set('unit.minute', 'true');
                map.set('unit.second', 'true');
                map.set('unit.timezone', 'true');
                break;
            // ハイフン区切り
            case 'hyphen':
                format_text =
                    '[{year}][-{month}][-{date}][ {hour}][:{minute}][:{second}][.{millisecond}][ {weekday}曜日]';
                break;
            // スラッシュ区切り
            case 'slash':
                format_text =
                    '[{year}][/{month}][/{date}][ {hour}][:{minute}][:{second}][.{millisecond}][ {weekday}曜日]';
                break;
            // 区切り文字なし
            case 'none':
                format_text =
                    '[{year}][{month}][{date}][{hour}][{minute}][{second}][{millisecond}]';
                break;
            // 日本語
            case 'japanese':
                format_text =
                    '[{year}年][{month}月][{date}日][ {hour}時][{minute}分][{second}秒][.{millisecond}ミリ秒][{weekday}曜日]';
                break;
        }
        // 日時フォーマットに変換する
        // クエリ内でフォーマット置換があればそちらを優先する（例：YYYY -> w）
        let result = '';
        let list = [
            ['year', map.get('format.year') || 'YYYY'],
            ['month', map.get('format.month') || 'MM'],
            ['date', map.get('format.date') || 'dd'],
            ['hour', map.get('format.hour') || 'HH'],
            ['minute', map.get('format.minute') || 'mm'],
            ['second', map.get('format.second') || 'ss'],
            ['millisecond', map.get('format.millisecond') || 'fff'],
            ['weekday', map.get('format.weekday') || 'EEE'],
            ['timezone', map.get('format.timezone') || 'Z'],
            ['epoch', map.get('format.epoch') || 'p'],
            ['epoch_ms', map.get('format.epoch_ms') || 'P'],
        ];
        let is_not_first = false;
        let unit_count = Array.from(map.keys()).filter((key) =>
            key.startsWith('unit.')
        ).length;
        list.forEach((unit) => {
            let unit_type: string = unit[0];
            let unit_format: string = unit[1];
            // ユニット数が1であれば0パディングをしない
            if (unit_count <= 1) unit_format = unit_format.substring(0, 1);
            // ユニットの値を戻り値に登録する
            if (map.has('unit.' + unit_type)) {
                result += appendFormat(
                    unit_type,
                    format_text,
                    unit_format,
                    is_not_first
                );
                is_not_first = true;
            }
        });
        return result;
    }
}

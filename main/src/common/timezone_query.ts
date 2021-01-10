import { TextNormalizer } from './text_normalizer';

/**
 * 許可するタイムゾーンの一覧
 */
const TIME_ZONE_TO_UTC_LIST: Map<string, string> = new Map(
    Object.entries({
        UTC: 'UTC+00:00',
        GMT: 'UTC+00:00',
        'Etc/GMT+11': 'UTC-11:00',
        'Pacific/Honolulu': 'UTC-10:00',
        'America/Anchorage': 'UTC-09:00',
        'America/Santa_Isabel': 'UTC-08:00',
        'America/Los_Angeles': 'UTC-08:00',
        'America/Chihuahua': 'UTC-07:00',
        'America/Phoenix': 'UTC-07:00',
        'America/Denver': 'UTC-07:00',
        'America/Guatemala': 'UTC-06:00',
        'America/Chicago': 'UTC-06:00',
        'America/Regina': 'UTC-06:00',
        'America/Mexico_City': 'UTC-06:00',
        'America/Bogota': 'UTC-05:00',
        'America/Indiana/Indianapolis': 'UTC-05:00',
        'America/New_York': 'UTC-05:00',
        'America/Caracas': 'UTC-04:30',
        'America/Halifax': 'UTC-04:00',
        'America/Asuncion': 'UTC-04:00',
        'America/La_Paz': 'UTC-04:00',
        'America/Cuiaba': 'UTC-04:00',
        'America/Santiago': 'UTC-04:00',
        'America/St_Johns': 'UTC-03:30',
        'America/Sao_Paulo': 'UTC-03:00',
        'America/Godthab': 'UTC-03:00',
        'America/Cayenne': 'UTC-03:00',
        'America/Argentina/Buenos_Aires': 'UTC-03:00',
        'America/Montevideo': 'UTC-03:00',
        'Etc/GMT+2': 'UTC-02:00',
        'Atlantic/Cape_Verde': 'UTC-01:00',
        'Atlantic/Azores': 'UTC-01:00',
        'Africa/Casablanca': 'UTC+00:00',
        'Atlantic/Reykjavik': 'UTC+00:00',
        'Europe/London': 'UTC+00:00',
        'Etc/GMT': 'UTC+00:00',
        'Europe/Berlin': 'UTC+01:00',
        'Europe/Paris': 'UTC+01:00',
        'Africa/Lagos': 'UTC+01:00',
        'Europe/Budapest': 'UTC+01:00',
        'Europe/Warsaw': 'UTC+01:00',
        'Africa/Windhoek': 'UTC+01:00',
        'Europe/Istanbul': 'UTC+02:00',
        'Europe/Kiev': 'UTC+02:00',
        'Africa/Cairo': 'UTC+02:00',
        'Asia/Damascus': 'UTC+02:00',
        'Asia/Amman': 'UTC+02:00',
        'Africa/Johannesburg': 'UTC+02:00',
        'Asia/Jerusalem': 'UTC+02:00',
        'Asia/Beirut': 'UTC+02:00',
        'Asia/Baghdad': 'UTC+03:00',
        'Europe/Minsk': 'UTC+03:00',
        'Asia/Riyadh': 'UTC+03:00',
        'Africa/Nairobi': 'UTC+03:00',
        'Asia/Tehran': 'UTC+03:30',
        'Europe/Moscow': 'UTC+04:00',
        'Asia/Tbilisi': 'UTC+04:00',
        'Asia/Yerevan': 'UTC+04:00',
        'Asia/Dubai': 'UTC+04:00',
        'Asia/Baku': 'UTC+04:00',
        'Indian/Mauritius': 'UTC+04:00',
        'Asia/Kabul': 'UTC+04:30',
        'Asia/Tashkent': 'UTC+05:00',
        'Asia/Karachi': 'UTC+05:00',
        'Asia/Colombo': 'UTC+05:30',
        'Asia/Kolkata': 'UTC+05:30',
        'Asia/Kathmandu': 'UTC+05:45',
        'Asia/Almaty': 'UTC+06:00',
        'Asia/Dhaka': 'UTC+06:00',
        'Asia/Yekaterinburg': 'UTC+06:00',
        'Asia/Yangon': 'UTC+06:30',
        'Asia/Bangkok': 'UTC+07:00',
        'Asia/Novosibirsk': 'UTC+07:00',
        'Asia/Krasnoyarsk': 'UTC+08:00',
        'Asia/Ulaanbaatar': 'UTC+08:00',
        'Asia/Shanghai': 'UTC+08:00',
        'Australia/Perth': 'UTC+08:00',
        'Asia/Singapore': 'UTC+08:00',
        'Asia/Taipei': 'UTC+08:00',
        'Asia/Irkutsk': 'UTC+09:00',
        'Asia/Seoul': 'UTC+09:00',
        'Asia/Tokyo': 'UTC+09:00',
        'Australia/Darwin': 'UTC+09:30',
        'Australia/Adelaide': 'UTC+09:30',
        'Australia/Hobart': 'UTC+10:00',
        'Asia/Yakutsk': 'UTC+10:00',
        'Australia/Brisbane': 'UTC+10:00',
        'Pacific/Port_Moresby': 'UTC+10:00',
        'Australia/Sydney': 'UTC+10:00',
        'Asia/Vladivostok': 'UTC+11:00',
        'Pacific/Guadalcanal': 'UTC+11:00',
        'Etc/GMT-12': 'UTC+12:00',
        'Pacific/Fiji': 'UTC+12:00',
        'Asia/Magadan': 'UTC+12:00',
        'Pacific/Auckland': 'UTC+12:00',
        'Pacific/Tongatapu': 'UTC+13:00',
        'Pacific/Apia': 'UTC+13:00',
    })
);

interface TimeZoneResultInterface {
    stringValue: string;
    ms: number;
}

type TimeZoneParser = (args: number[]) => TimeZoneResultInterface;

interface TimeZoneParserInterface {
    name: string[];
    parser: TimeZoneParser;
}

class TimeZoneQuery {
    name: string[];
    parser: TimeZoneParser;

    constructor(args: TimeZoneParserInterface) {
        this.name = args.name;
        this.parser = args.parser;
    }
}

/**
 * タイムゾーンの時分をDate.getTime向けのミリ秒に変換する
 * @param hours 時間
 * @param minutes 分
 */
const toMilliseconds = (hours: number, minutes: number): number => {
    return (hours * 60 * 60 + minutes * 60) * 1000;
};

/**
 * タイムゾーンの時分を文字列に変換する
 * @param hours 時間
 * @param minutes 分
 * @param is_east グリニッジよりも東であればTrue, そうでなければFalseにする
 */
const toStringValue = (
    hours: number,
    minutes: number,
    is_east: boolean
): string => {
    let hours_str = ('00' + hours).slice(-2);
    let minutes_str = ('00' + minutes).slice(-2);
    let mark = is_east ? '+' : '-';
    return `${mark}${hours_str}:${minutes_str}`;
};

const TimeZoneQueryList = [
    new TimeZoneQuery({
        name: [
            'UTC+${0}:${1}', //
            '+${0}:${1}', //
        ],
        parser: function (args: number[]) {
            return {
                stringValue: toStringValue(args[0], args[1], true),
                ms: toMilliseconds(args[0], args[1]),
            };
        },
    }),
    new TimeZoneQuery({
        name: [
            'UTC-${0}:${1}', //
            '-${0}:${1}', //
        ],
        parser: function (args: number[]) {
            return {
                stringValue: toStringValue(args[0], args[1], false),
                ms: -toMilliseconds(args[0], args[1]),
            };
        },
    }),
];

export class TimeZoneWrapper {
    time_zone_milliseconds: number = 0;
    time_zone_string: string = 'Z';
    time_zone_original: string;
    time_zone_template: string = '';
    time_zone_parameter: number[] = [];

    constructor(time_zone: string) {
        this.time_zone_original = time_zone;

        // TIMEZONE_TO_UTC_LISTで定義されていればその定義されたタイムゾーンを取得する
        // 未定義なら入力パラメータをそのまま適用する
        const normalized = new TextNormalizer({
            original: TIME_ZONE_TO_UTC_LIST.get(time_zone) || time_zone,
        });
        // 完全一致するタイムゾーンが定義されていれば、そこからデータを取得する
        const item = TimeZoneQueryList.find(
            (item) => item.name.indexOf(normalized.getTemplateText()) >= 0
        );
        if (item) {
            let result = item.parser(normalized.getTemplateParameters());
            this.time_zone_milliseconds = result.ms;
            this.time_zone_string = result.stringValue;
            this.time_zone_template = normalized.getTemplateText();
            this.time_zone_parameter = normalized.getTemplateParameters();
        }
    }

    /**
     * ミリ秒形式でタイムゾーン情報を取得する
     */
    getTime() {
        return this.time_zone_milliseconds;
    }

    /**
     * 文字列形式でタイムゾーン情報を取得する
     */
    getTimeZoneString() {
        return this.time_zone_string;
    }

    /**
     * 時間、分からタイムゾーンを取得する
     * @param prefix プレフィックス
     * @param hour 時間
     * @param minute 分
     */
    static fromHourMinutes(prefix: string, hour: number, minute: number) {
        return new TimeZoneWrapper(
            prefix + ('00' + hour).slice(-2) + ':' + ('00' + minute).slice(-2)
        );
    }
}

export function TimeZoneQueryParser(query: string): TimeZoneWrapper {
    return new TimeZoneWrapper(query);
}

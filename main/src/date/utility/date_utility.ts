import { DateWrapper } from '../../dto/date_wrapper';
import { TimeZoneWrapper } from '../../common/timezone_query';
import { ControlInterface } from './date_control';
import { DateUnitType } from '../../common/date_unit';
import { WeekDayUnit, WeekDayType } from '../../common/weekday_unit';
import { Config } from '../../config/config';
import { Wareki } from '../../common/wareki';
import { IntegerMath } from '../../extend/integer_math';

export class DateUtility {
    /**
     * 現在のエポック秒を取得する
     */
    static nowEpoch() {
        return new Date().getTime();
    }
    /**
     * DateControlSetのリストから日時を作成する
     * @param time_zone タイムゾーン
     * @param control_objects 操作オブジェクトのリスト
     */
    static dateFromSet(
        time_zone: TimeZoneWrapper,
        control_objects: ControlInterface[]
    ): DateWrapper {
        let epoch_time_milliseconds = 0;
        let time_offset = time_zone.getTime();
        control_objects.forEach((control) => {
            // エポック秒をDateControlSetで更新する
            epoch_time_milliseconds = control.apply(
                epoch_time_milliseconds,
                time_offset
            );
        });
        // エポック秒から日時を作成する
        return DateUtility.dateFromEpoch(epoch_time_milliseconds, time_zone);
    }
    /**
     * エポック秒から日時を作成する
     * @param epoch_time_milliseconds エポックミリ秒
     * @param time_zone タイムゾーン
     */
    static dateFromEpoch(
        epoch_time_milliseconds: number,
        time_zone: TimeZoneWrapper
    ): DateWrapper {
        return new DateWrapper(
            epoch_time_milliseconds,
            time_zone.getTime(),
            DateUnitType.UNKNOWN
        );
    }
    /**
     * カレンダーの月の最終日を取得する
     * @param year 年
     * @param month 月
     */
    static maxDateInCalendar(year: number, month: number) {
        let date = new Date(0);
        // 引数の年を設定する
        date.setUTCFullYear(year);
        // 翌月を設定する
        date.setUTCMonth(month + 1);
        // 設定したDateの前日を指定する
        date.setUTCDate(0);
        // カレンダーの最終日を返す
        return date.getUTCDate();
    }
    /**
     * 週番号と曜日から日を取得する
     * @param month_origin_week_day 週の初めの曜日
     * @param week_day 曜日
     * @param week_number 週番号
     */
    static dateFromWeekNumberAndWeekDay(
        month_origin_week_day: WeekDayType,
        week_day: WeekDayType,
        week_number: number
    ) {
        // 週を反映する
        let request = 0;
        let week_count = week_number;
        // 最終週の残りを計算する（第一週＝最終週だったときのため、最初に計算する）
        if (week_count >= 1) {
            request += week_day;
            week_count--;
        }
        // 第一週の残りを計算する（週の最後から引く）
        if (week_count >= 1) {
            request +=
                WeekDayType.Sat - WeekDayUnit.getWeekDay(month_origin_week_day);
            week_count--;
        }
        // 指定した週の日付を反映する、先頭と最終週以外は7をかけて反映する
        return request + week_count * 7;
    }
    /**
     * DateControlSetのオブジェクトで日時を操作する
     * @param date 操作対象の日時
     * @param control_objects 操作オブジェクトの配列
     */
    static control(
        date: DateWrapper,
        control_objects: ControlInterface[]
    ): DateWrapper {
        // エポック秒とタイムゾーンを引数から取得する
        let epoch_time_milliseconds = date.getTime(false);
        let time_offset = date.getTimeOffset();
        // 引数から表示精度を取得する
        let accuracy = date.getAccuracy();
        control_objects.forEach((control) => {
            epoch_time_milliseconds = control.apply(
                epoch_time_milliseconds,
                time_offset
            );
            // 表示精度を更新する
            accuracy = control.updateAccuracy(accuracy);
        });
        return new DateWrapper(epoch_time_milliseconds, time_offset, accuracy);
    }
    /**
     * 日時を文字列に変換する
     * @param date 日時
     * @param format フォーマット（例：YYYY-MM-dd）
     * @param config 設定
     */
    static format(date: DateWrapper, format: string, config: Config) {
        let result = '';
        // 文字列から1文字取得する
        const getChar = function (str: string, index: number) {
            return index < str.length ? str[index] : null;
        };
        // フォーマットの連続文字数（例：YYYY -> 4）
        let same_char_length = 0;
        for (let i = 0; i < format.length; i++) {
            const char = getChar(format, i);
            const next_char = getChar(format, i + 1);
            if (next_char && char == next_char) {
                // 同じ文字が連続するのなら文字数を取得する
                same_char_length++;
            } else {
                switch (char) {
                    case 'Y':
                        // 年
                        result += date.getFullYearString(same_char_length + 1);
                        break;
                    case 'w':
                        // 和暦の年
                        result += Wareki.parse(date);
                        break;
                    case 'M':
                        // 月
                        result += date.getMonthString(same_char_length + 1);
                        break;
                    case 'd':
                        // 日
                        result += date.getDateString(same_char_length + 1);
                        break;
                    case 'H':
                        // 時間
                        result += date.getHoursString(same_char_length + 1);
                        break;
                    case 'm':
                        // 分
                        result += date.getMinutesString(same_char_length + 1);
                        break;
                    case 's':
                        // 秒
                        result += date.getSecondsString(same_char_length + 1);
                        break;
                    case 'f':
                        // ミリ秒
                        result += date.getMillisecondsString(
                            same_char_length + 1
                        );
                        break;
                    case 'E':
                        // 曜日
                        result += WeekDayUnit.toWeekDayString(
                            config.getLanguage(),
                            date.getWeekDay()
                        );
                        break;
                    case 'Z':
                        // タイムゾーン
                        result += date.getTimeZoneString();
                        break;
                    case 'p':
                        // エポック秒
                        result += `${IntegerMath.divide(
                            date.getTime(true),
                            1000
                        )}`;
                        break;
                    case 'P':
                        // エポックミリ秒
                        result += `${date.getTime(true)}`;
                        break;
                    default:
                        // 解析対象以外の文字列
                        result += char;
                        break;
                }
                same_char_length = 0;
            }
        }
        return result;
    }
}

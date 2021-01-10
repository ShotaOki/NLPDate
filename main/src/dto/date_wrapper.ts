import { DateUnitType, DateUnit } from '../common/date_unit';
import { IntegerMath } from '../extend/integer_math';
import { WeekDayUnit, WeekDayType } from '../common/weekday_unit';

/**
 * 日時のラッパ
 */
export class DateWrapper {
    private epoch_time_milliseconds: number;
    private time_offset: number;
    private local_date: Date;
    private accuracy: DateUnitType;

    constructor(
        epoch_time_milliseconds: number,
        time_offset: number,
        accuracy: DateUnitType
    ) {
        this.epoch_time_milliseconds = epoch_time_milliseconds;
        this.time_offset = time_offset;
        this.accuracy = accuracy;
        this.local_date = this.parseDateObject(
            this.epoch_time_milliseconds,
            time_offset
        );
    }

    /**
     * Dateオブジェクトをエポック秒とタイムゾーンから作成する
     * @param epoch_time_milliseconds エポックミリ秒
     * @param time_offset タイムゾーン
     */
    private parseDateObject(
        epoch_time_milliseconds: number,
        time_offset: number
    ) {
        let base_date = new Date(0);
        base_date.setUTCMilliseconds(epoch_time_milliseconds + time_offset);
        return base_date;
    }

    /**
     * Dateオブジェクトを年月日から作成する
     * @param year 年（0 -> 2999）
     * @param month 月（0 -> 11）
     * @param date 日（1 -> 31）
     */
    private parseDateObjectWithDate(year: number, month: number, date: number) {
        let base_date = new Date(0);
        base_date.setUTCFullYear(year);
        base_date.setUTCMonth(month);
        base_date.setUTCDate(date);
        return base_date.getTime();
    }

    /**
     * ゼロ埋めしたフォーマット文字列を返す
     * @param length 長さ
     * @param value 数値
     */
    private zeroPaddingString(length: number, value: number) {
        let result = '';
        let value_string = new String(value);
        for (let i = 0; i < length; i++) {
            result += '0';
        }
        return (result + value).slice(-Math.max(value_string.length, length));
    }

    /**
     * 表示精度を取得する
     */
    public getAccuracy() {
        return this.accuracy;
    }

    /**
     * リクエストの単位よりも表示精度が大きい（リクエストされた単位に対して表示許可がある）のならtrueを返す
     * @param request リクエスト単位
     */
    private isEnoughAccuracy(request: DateUnitType): boolean {
        switch (this.accuracy) {
            case DateUnitType.UNKNOWN:
            default:
                return true;
            case DateUnitType.YEAR:
            case DateUnitType.MONTH:
            case DateUnitType.DATE:
            case DateUnitType.HOUR:
            case DateUnitType.MINUTE:
            case DateUnitType.SECOND:
            case DateUnitType.MILLISECOND:
                return this.accuracy >= request ? true : false;
        }
    }

    /**
     * 年を返す
     */
    getFullYear() {
        if (this.isEnoughAccuracy(DateUnitType.YEAR)) {
            return this.local_date.getUTCFullYear();
        } else {
            return 1900;
        }
    }

    /**
     * 年を文字列で返す
     * @param length ゼロ埋め文字数
     */
    getFullYearString(length: number) {
        return this.zeroPaddingString(length, this.getFullYear());
    }

    /**
     * 経過月を返す
     */
    getFullMonth() {
        return this.getFullYear() * 12 + this.getMonth();
    }

    /**
     * 月を返す
     */
    getMonth() {
        if (this.isEnoughAccuracy(DateUnitType.MONTH)) {
            return this.local_date.getUTCMonth() + 1;
        } else {
            return 1;
        }
    }

    /**
     * 月を文字列で返す
     * @param length ゼロ埋め文字数
     */
    getMonthString(length: number) {
        return this.zeroPaddingString(length, this.getMonth());
    }

    /**
     * 日を返す
     */
    getDate() {
        if (this.isEnoughAccuracy(DateUnitType.DATE)) {
            return this.local_date.getUTCDate();
        } else {
            return 1;
        }
    }

    /**
     * 日を文字列で返す
     * @param length ゼロ埋め文字数
     */
    getDateString(length: number) {
        return this.zeroPaddingString(length, this.getDate());
    }

    /**
     * 時間を返す
     */
    getHours() {
        if (this.isEnoughAccuracy(DateUnitType.HOUR)) {
            return this.local_date.getUTCHours();
        } else {
            return 0;
        }
    }

    /**
     * 時間を文字列で返す
     * @param length ゼロ埋め文字数
     */
    getHoursString(length: number) {
        return this.zeroPaddingString(length, this.getHours());
    }

    /**
     * 分を返す
     */
    getMinutes() {
        if (this.isEnoughAccuracy(DateUnitType.MINUTE)) {
            return this.local_date.getUTCMinutes();
        } else {
            return 0;
        }
    }

    /**
     * 分を文字列で返す
     * @param length ゼロ埋め文字数
     */
    getMinutesString(length: number) {
        return this.zeroPaddingString(length, this.getMinutes());
    }

    /**
     * 秒を返す
     */
    getSeconds() {
        if (this.isEnoughAccuracy(DateUnitType.SECOND)) {
            return this.local_date.getUTCSeconds();
        } else {
            return 0;
        }
    }

    /**
     * 秒を文字列で返す
     * @param length ゼロ埋め文字数
     */
    getSecondsString(length: number) {
        return this.zeroPaddingString(length, this.getSeconds());
    }

    /**
     * ミリ秒を返す
     */
    getMilliseconds() {
        if (this.isEnoughAccuracy(DateUnitType.MILLISECOND)) {
            return this.local_date.getUTCMilliseconds();
        } else {
            return 0;
        }
    }

    /**
     * ミリ秒を文字列で返す
     * @param length ゼロ埋め文字数
     */
    getMillisecondsString(length: number) {
        return this.zeroPaddingString(length, this.getMilliseconds());
    }

    /**
     * 曜日を返す
     */
    getWeekDay(): WeekDayType {
        return WeekDayUnit.getWeekDay(this.local_date.getUTCDay());
    }

    /**
     * エポックミリ秒を返す
     * @param is_affect_accuracy trueであれば表示精度を反映する
     */
    getTime(is_affect_accuracy: boolean) {
        if (is_affect_accuracy) {
            switch (this.accuracy) {
                case DateUnitType.SECOND:
                case DateUnitType.MINUTE:
                case DateUnitType.HOUR:
                    return IntegerMath.excludeRemain(
                        this.epoch_time_milliseconds,
                        DateUnit.getDetail(this.accuracy).milliseconds
                    );
                case DateUnitType.DATE:
                case DateUnitType.MONTH:
                case DateUnitType.YEAR:
                    return this.parseDateObjectWithDate(
                        this.getFullYear(),
                        this.getMonth(),
                        this.getDate()
                    );
                default:
                    return this.epoch_time_milliseconds;
            }
        } else {
            return this.epoch_time_milliseconds;
        }
    }

    /**
     * 日時（Date型）を返す
     */
    getLocalDate() {
        return new Date(this.getTime(true));
    }

    /**
     * 週番号を返す
     */
    getWeekNumber() {
        return IntegerMath.divide(this.local_date.getUTCDate(), 7) + 1;
    }

    /**
     * タイムゾーンを返す
     */
    getTimeZone() {
        let minute_offset = IntegerMath.divide(this.time_offset, 60 * 1000);
        return {
            prefix: this.time_offset < 0 ? '-' : '+',
            hour: IntegerMath.divide(minute_offset, 60),
            minute: minute_offset % 60,
        };
    }

    /**
     * タイムゾーンを文字列で返す
     */
    getTimeZoneString() {
        let time_zone = this.getTimeZone();
        return (
            time_zone.prefix +
            this.zeroPaddingString(2, Math.abs(time_zone.hour)) +
            ':' +
            this.zeroPaddingString(2, Math.abs(time_zone.minute))
        );
    }

    /**
     * タイムゾーンのオフセット時間を返す
     */
    getTimeOffset() {
        return this.time_offset;
    }
}

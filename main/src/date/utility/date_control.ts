import { DateUnit, DateUnitType } from '../../common/date_unit';
import { WeekDayUnit } from '../../common/weekday_unit';
import { DateUtility } from './date_utility';

/**
 * 日時操作のインターフェース
 */
export interface ControlInterface {
    /**
     * 日時を更新、更新したエポックミリ秒を返す
     * @param epoch_time_milliseconds エポックミリ秒
     * @param time_offset タイムゾーン
     */
    apply(epoch_time_milliseconds: number, time_offset: number): number;

    /**
     * 表示精度を更新する
     * @param current_accuracy 更新前の精度
     */
    updateAccuracy(current_accuracy: DateUnitType): DateUnitType;
}

/**
 * 日時操作の基底クラス
 */
class Control {
    unit: DateUnitType;
    value: number;

    constructor(unit: DateUnitType, value: number) {
        this.unit = unit;
        this.value = value;
    }

    /**
     * エポック秒にオフセットを加えて日時に変換する
     * @param epoch_time_milliseconds エポックミリ秒
     * @param time_offset オフセット
     * @param callback 日時を引数で受け渡す
     */
    protected controlDate(
        epoch_time_milliseconds: number,
        time_offset: number,
        callback: (date: Date) => Date
    ) {
        // エポックミリ秒をDateに変換する
        let date = new Date(0);
        date.setUTCMilliseconds(epoch_time_milliseconds + time_offset);
        // コールバックを実行する
        date = callback(date);
        // UTCのエポックミリ秒を返す
        return date.getTime() - time_offset;
    }
}

/**
 * 相対時間の操作をする
 */
export class Add extends Control implements ControlInterface {
    /**
     * 日時を更新、更新したエポックミリ秒を返す
     * @param epoch_time_milliseconds エポックミリ秒
     * @param time_offset タイムゾーン
     */
    apply(epoch_time_milliseconds: number, time_offset: number): number {
        // ミリ秒に変換できる単位であればミリ秒のオフセットを加算する
        if (DateUnit.getDetail(this.unit).milliseconds >= 1) {
            return (
                epoch_time_milliseconds +
                DateUnit.toMilliseconds(this.value, this.unit)
            );
        }
        // 年、月はミリ秒にできないため、Dateに加算する
        return this.controlDate(
            epoch_time_milliseconds,
            time_offset,
            (date) => {
                switch (this.unit) {
                    case DateUnitType.MONTH:
                        date.setUTCMonth(date.getUTCMonth() + this.value);
                        break;
                    case DateUnitType.YEAR:
                        date.setUTCFullYear(date.getUTCFullYear() + this.value);
                        break;
                }
                return date;
            }
        );
    }

    /**
     * 表示精度を更新する
     * @param current_accuracy 更新前の精度
     */
    updateAccuracy(current_accuracy: DateUnitType) {
        return current_accuracy;
    }
}

/**
 * 絶対時間の操作をする
 */
export class Set extends Control implements ControlInterface {
    /**
     * 日時を更新、更新したエポックミリ秒を返す
     * @param epoch_time_milliseconds エポックミリ秒
     * @param time_offset タイムゾーン
     */
    apply(epoch_time_milliseconds: number, time_offset: number): number {
        return this.controlDate(
            epoch_time_milliseconds,
            time_offset,
            (date) => {
                switch (this.unit) {
                    case DateUnitType.MONTH:
                        // 月を設定する
                        // 設定した月に現在の日がなければ：日を月の最終日にずらす
                        {
                            let current_year = date.getUTCFullYear();
                            let new_month = this.value - 1;
                            // 設定する日（カレンダーの範囲外であれば月の最終日を設定する）
                            let month_date_max = DateUtility.maxDateInCalendar(
                                current_year,
                                new_month
                            );
                            if (month_date_max < date.getUTCDate()) {
                                date.setUTCDate(month_date_max);
                            }
                            date.setUTCMonth(new_month);
                        }
                        break;
                    case DateUnitType.YEAR:
                        // 年を設定する
                        // 設定した年に現在の日がなければ：日を月の最終日にずらす
                        {
                            let new_year = this.value;
                            let current_month = date.getUTCMonth();
                            // 設定する日（カレンダーの範囲外であれば月の最終日を設定する）
                            let month_date_max = DateUtility.maxDateInCalendar(
                                new_year,
                                current_month
                            );
                            if (month_date_max < date.getUTCDate()) {
                                date.setUTCDate(month_date_max);
                            }
                            date.setUTCFullYear(this.value);
                        }
                        break;
                    case DateUnitType.DATE:
                        // 日を設定する
                        date.setUTCDate(this.value);
                        break;
                    case DateUnitType.HOUR:
                        // 時を設定する
                        date.setUTCHours(this.value);
                        break;
                    case DateUnitType.MINUTE:
                        // 分を設定する
                        date.setUTCMinutes(this.value);
                        break;
                    case DateUnitType.SECOND:
                        // 秒を設定する
                        date.setUTCSeconds(this.value);
                        break;
                    case DateUnitType.MILLISECOND:
                        // ミリ秒を設定する
                        date.setUTCMilliseconds(this.value);
                        break;
                    case DateUnitType.END_OF_MONTH:
                        // 月末を設定する
                        date.setUTCDate(
                            DateUtility.maxDateInCalendar(
                                date.getUTCFullYear(),
                                date.getUTCMonth()
                            )
                        );
                        break;
                    case DateUnitType.END_OF_YEAR:
                        // 年末を設定する
                        date.setUTCMonth(11);
                        date.setUTCDate(31);
                        break;
                    case DateUnitType.WEEK_NUMBER: {
                        // 週の先頭の曜日を取得する
                        let origin_date = new Date(date.getTime());
                        origin_date.setUTCDate(1);
                        // 週を反映する
                        date.setUTCDate(
                            DateUtility.dateFromWeekNumberAndWeekDay(
                                WeekDayUnit.getWeekDay(origin_date.getUTCDay()),
                                WeekDayUnit.getWeekDay(date.getUTCDay()),
                                this.value
                            )
                        );
                        break;
                    }
                    case DateUnitType.YOUBI:
                        // 曜日を設定する
                        date.setUTCDate(
                            date.getUTCDate() +
                                WeekDayUnit.getWeekDayDelta(
                                    date.getUTCDay(),
                                    this.value
                                )
                        );
                        break;
                }
                return date;
            }
        );
    }

    /**
     * 表示精度を更新する
     * @param current_accuracy 更新前の精度
     */
    updateAccuracy(current_accuracy: DateUnitType): DateUnitType {
        let required: DateUnitType = DateUnitType.UNKNOWN;
        switch (this.unit) {
            case DateUnitType.YEAR:
            case DateUnitType.MONTH:
            case DateUnitType.DATE:
            case DateUnitType.HOUR:
            case DateUnitType.MINUTE:
            case DateUnitType.SECOND:
            case DateUnitType.MILLISECOND:
                // 操作オブジェクトに設定された精度を指定する
                required = this.unit;
                break;
            case DateUnitType.WEEK_NUMBER:
            case DateUnitType.YOUBI:
            case DateUnitType.END_OF_MONTH:
            case DateUnitType.END_OF_YEAR:
                // 週番号、曜日、月末、年末は「日」を精度にする
                required = DateUnitType.DATE;
                break;
            default:
                // 優先度が割り振られていないものは引数をそのまま返す
                return current_accuracy;
        }
        // より優先度の高いものを返す
        return current_accuracy > required ? current_accuracy : required;
    }
}

export const DateControl = {
    Add: Add,
    Set: Set,
};

import { NameLocalize, LocalizeAreas } from '../config/config';

/**
 * 曜日のタイプ
 */
export const WeekDayType = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
} as const;
export type WeekDayType = typeof WeekDayType[keyof typeof WeekDayType];

interface DayListInterface {
    name: NameLocalize;
}

/**
 * 曜日の文字列
 */
const DayList: DayListInterface = {
    name: {
        jp: ['日', '月', '火', '水', '木', '金', '土'],
    },
};

/**
 * 曜日を管理するクラス
 */
export class WeekDayUnit {
    /**
     * 数字を曜日（0 ～ 6）に変換する
     * @param day 曜日（負～正の整数）
     */
    static getWeekDay(day: number) {
        while (day < 0) day += 7;
        switch (day % 7) {
            case WeekDayType.Sun:
            default:
                return WeekDayType.Sun;
            case WeekDayType.Mon:
                return WeekDayType.Mon;
            case WeekDayType.Tue:
                return WeekDayType.Tue;
            case WeekDayType.Wed:
                return WeekDayType.Wed;
            case WeekDayType.Thu:
                return WeekDayType.Thu;
            case WeekDayType.Fri:
                return WeekDayType.Fri;
            case WeekDayType.Sat:
                return WeekDayType.Sat;
        }
    }
    /**
     * from曜日からto曜日に変換するのに必要な日数を取得する
     * @param from 変換前の曜日
     * @param to 変換する曜日
     */
    static getWeekDayDelta(from: number, to: number) {
        return this.getWeekDay(to - from);
    }
    /**
     * 曜日を文字列に変換する
     * @param locale 言語
     * @param weekday 曜日
     */
    static toWeekDayString(locale: LocalizeAreas, weekday: WeekDayType) {
        return DayList.name[locale][weekday];
    }
}

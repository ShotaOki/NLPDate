import { DateWrapper } from '../dto/date_wrapper';

interface WarekiDateInterface {
    display: string;
    year: number;
    month: number;
    date: number;
}

class WarekiDate {
    // 表示する年号文字列
    display: string;
    // 年（西暦）
    year: number;
    // 月（1-12）
    month: number;
    // 日（1-31）
    date: number;

    constructor(info: WarekiDateInterface) {
        this.display = info.display;
        this.year = info.year;
        this.month = info.month;
        this.date = info.date;
    }

    /**
     * 年月日を年＋経過日数の数値に変換する
     * 例：1999/2/20 -> 1999_051
     */
    toFixedDate() {
        return WarekiDate.fixedDate(this.year, this.month, this.date);
    }

    /**
     * 西暦の年を和暦の年に変換する
     * @param year 西暦の年
     */
    getYearTo(year: number) {
        // 年号の文字列に和暦の年度を足す
        // 年度は1から始まるため1を足す
        return this.display + (year - this.year + 1);
    }

    /**
     * 年月日を年＋経過日数の数値に変換する
     * 例：1999/2/20 -> 1999_051
     */
    static fixedDate(year: number, month: number, date: number) {
        let result = year * 1000;
        result += month * 31;
        result += date;
        return result;
    }
}

/**
 * 和暦の一覧
 */
const era: WarekiDateInterface[] = [
    { display: '令和', year: 2019, month: 5, date: 1 },
    { display: '平成', year: 1989, month: 1, date: 8 },
    { display: '昭和', year: 1926, month: 12, date: 25 },
    { display: '大正', year: 1912, month: 7, date: 30 },
    { display: '明治', year: 1868, month: 1, date: 25 },
];

/**
 * 和暦の管理クラス
 */
export class Wareki {
    /**
     * 年月日を和暦に変換する
     * @param date 年月日
     */
    static parse(date: DateWrapper) {
        // 年月日を数値に変換する
        const today = WarekiDate.fixedDate(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        );
        let result: string | undefined = undefined;
        era.map((item) => new WarekiDate(item)).forEach((item) => {
            // 新しい年号から順に検索、パースできる最初の年号でパースする
            if (result === undefined && item.toFixedDate() <= today) {
                result = item.getYearTo(date.getFullYear());
            }
        });
        return result || `西暦${date.getFullYear()}`;
    }

    static toFullYear(wareki: string, year: number) {
        let result: number | undefined = undefined;
        era.map((item) => new WarekiDate(item))
            .filter((item) => item.display == wareki)
            .forEach((item) => {
                result = item.year + year - 1;
            });
        return result;
    }
}

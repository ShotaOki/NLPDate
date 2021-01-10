export class IntegerMath {
    /**
     * 数値を除算、整数で結果を返却する
     * @param value 数値
     * @param divide_by 数値を除算する数
     */
    static divide(value: number, divide_by: number) {
        if (value == 0 || divide_by == 0) return 0;
        const result = Math.floor(value / divide_by);
        return parseInt(`${result}`);
    }

    /**
     * 数値の除算結果から、余剰を引いた数を返す（A - (A mod N)）
     * @param value 数値
     * @param round_by 数値を除算する数
     */
    static excludeRemain(value: number, round_by: number) {
        return this.divide(value, round_by) * round_by;
    }
}

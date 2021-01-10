/**
 * キーと値（配列をMapに変換する）
 */
export interface MapKeyValue {
    // キー
    key: string;
    // 値
    value: string;
}

export class ArrayExtend {
    /**
     * 配列の任意の場所にレコードを挿入する
     * @param array 配列
     * @param index 挿入するインデックス
     * @param object 挿入するオブジェクト
     */
    static insert<T>(array: T[], index: number, object: T) {
        return array.splice(index, 0, object);
    }

    /**
     * 先頭オブジェクトを取得する
     * @param array 配列
     */
    static first<T>(array: T[]) {
        if (array == null || array == undefined || array.length == 0)
            return undefined;
        return array[0];
    }

    /**
     * キー値の配列をMapに変換する
     * @param array キー値の配列
     */
    static toMap(array: MapKeyValue[] | undefined) {
        let result = new Map();
        if (array) {
            // 指定された引数をマップに格納する
            array.forEach((item) => {
                result.set(item.key, item.value);
            });
        }
        return result;
    }
}

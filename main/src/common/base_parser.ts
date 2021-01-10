import { SubjectQuery } from '../date/parser/subject';
import { Predicate } from '../date/parser/predicate';
import { LocalizeAreas } from '../config/config';
import { DateFormatQuery } from '../date/parser/date_format_query';

const levenshtein = require('js-levenshtein');

/**
 * パーサの基底クラス
 */
export class BaseParser {
    constructor() {}

    /**
     * クエリの中で、もっともそれらしいパーサーを取得する
     * 判定にはレーベンシュタイン距離を利用する
     *
     * @param list クエリの一覧
     * @param locale 判定言語
     * @param query クエリ文字列
     * @param whenExistCallback 存在した場合の処理
     */
    protected findTargetWithLevenshtein<
        T extends SubjectQuery | Predicate | DateFormatQuery
    >(
        list: T[],
        locale: LocalizeAreas,
        query: string,
        whenExistCallback: (target: T) => any
    ) {
        let min_distance = Number.MAX_SAFE_INTEGER;
        let target = null;
        // 全てのクエリとの距離を比較、最もそれらしいクエリを取得する
        list.forEach((data: T) => {
            // 「明日」と「あした」のような表記ゆれを配列で検証する
            data.name[locale].forEach((name: string) => {
                let distance = levenshtein(name, query);
                if (distance < min_distance) {
                    // レーベンシュタイン距離の最も小さいものを選ぶ
                    target = data;
                    min_distance = distance;
                }
            });
        });
        // クエリ文字数の50%よりもレーベンシュタイン距離が小さくなる（＝置換が50%未満でよい）のなら、
        // 有効なデータとして処理する
        if (
            target &&
            min_distance < Math.max(Math.ceil(query.length * 0.5), 1)
        ) {
            // 結果が存在したのであればコールバックを呼び出す
            return whenExistCallback(target);
        }
        return undefined;
    }
}

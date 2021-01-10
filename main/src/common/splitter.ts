import { Predicate } from '../date/parser/predicate';
import { SubjectQuery } from '../date/parser/subject';
import { DateFormatQuery } from '../date/parser/date_format_query';

const CONTAINS_HIRAGANA = /[ぁ-ん、。　]/mu;
const REPLACE_HIRAGANA = /[ぁ-ん、。　]/g;

/**
 * 文字列をトークンの配列に切断するクラス
 *
 * 処理の流れ：
 * 1.入力 「あさっては2月15日の土曜日です」
 * 2. 「あさって」はクエリになるため、"${R:1}" : "あさって" に置換する
 * 　　　 ${R:1}は2月15日の土曜日です
 * 3. 連続するひらがなを特殊文字に置き換える
 * 　　　 ${R:1} @ 2月15日 @ 土曜日
 * 4.結果 特殊文字で配列に置き換えた後、${R:1}で置換していた文字列を戻す
 *       ["あさって", "2月15日", "土曜日"]
 */
export class Splitter {
    // 対象の文字列
    text: string;
    // エスケープ後の文字列
    escaped_text: string;
    // 置換ハッシュ
    replacement_hash: Map<string, string>;
    // 置換ハッシュの連番
    replacement_index: number;

    /**
     * コンストラクタ
     * @param text 切断対象の文字列
     */
    constructor(text: string) {
        this.text = text;
        this.escaped_text = text;
        this.replacement_hash = new Map();
        this.replacement_index = 1;
    }

    /**
     * 述語クエリを検索、必要なひらがなを切断対象から除外する
     *
     * @param dataArray クエリ一覧
     * @param accessor 使用言語からクエリ一覧の文字列を返却するアクセサ
     */
    withEscapeArray<T extends Predicate | SubjectQuery | DateFormatQuery>(
        dataArray: T[],
        accessor: (item: T) => string[]
    ) {
        let current_text: string = this.escaped_text;
        dataArray
            .map(accessor)
            .flat()
            .filter((item: string) => {
                // クエリにひらがなが含まれていれば置換対象とする
                return CONTAINS_HIRAGANA.test(item);
            })
            .sort((a: string, b: string) => {
                // 長い文字列から順に完全一致を検索するため、文字列長順にソートする
                return b.length - a.length;
            })
            .forEach((item: string) => {
                // ひらがなのあるクエリに一致する文字列を、
                // ひらがな→${R:n}形式のハッシュに置き換える
                if (current_text.includes(item)) {
                    const hash_key = '${R:' + this.replacement_index + '}';
                    this.replacement_hash.set(hash_key, item);
                    this.replacement_index++;
                    current_text = current_text.replace(item, hash_key);
                }
            });
        this.escaped_text = current_text;
        return this;
    }

    /**
     * ひらがなを全て特殊文字（@）に置き換えたあと、
     * 特殊文字でテキストを切断する
     */
    split() {
        let target = this.escaped_text.replace(REPLACE_HIRAGANA, '@');
        this.replacement_hash.forEach((value, key) => {
            target = target.replace(key, value);
        });
        return target.split('@').filter((item) => item.length >= 1);
    }
}

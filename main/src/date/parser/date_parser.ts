import { SubjectQueryList } from './subject';
import {
    DateFormatQueryList,
    DateFormatQuery,
    DateFormat,
} from './date_format_query';
import { DateUtility } from '../utility/date_utility';
import { TextNormalizer } from '../../common/text_normalizer';
import { PredicateList, Predicate } from './predicate';
import { DateWrapper } from '../../dto/date_wrapper';
import { Config } from '../../config/config';
import { BaseParser } from '../../common/base_parser';
import { PreEscape } from '../../common/pre_escape';
import { Splitter } from '../../common/splitter';
import { ArrayExtend } from '../../extend/array_extend';

interface PredicateResult {
    date: DateWrapper;
    predicate: Predicate | null;
}

/**
 * 日時のパーサ
 */
export class DateParser extends BaseParser {
    query: string[];
    config: Config;
    static_epoch_time_millisecond: number;
    static_result: DateWrapper | undefined;
    constructor(query: string[], config: Config) {
        super();
        this.query = query;
        this.config = config;
        this.static_epoch_time_millisecond = this.config.getEpochTimeMilliseconds();
        this.static_result = this.parseQuery(
            this.static_epoch_time_millisecond,
            query
        );
    }

    /**
     * 主語をパース、日時に変換する
     * @param data_query 主語のクエリ
     */
    private subject(data_query: string): DateWrapper | undefined {
        // クエリを正規化、テンプレートに変換する
        let normalized_result = new TextNormalizer({
            normalized_text: data_query,
        });
        // もっともそれらしいパーサを取得、基準日時を取得する
        return this.findTargetWithLevenshtein(
            SubjectQueryList, // 主語の変換パーサを検索する
            this.config.getLanguage(),
            normalized_result.getTemplateText(),
            (target) => {
                return target.parser(
                    normalized_result.getTemplateParameters(),
                    this.config
                );
            }
        );
    }

    /**
     * クエリデータの先頭に主語がなければTrueを返す
     * 主語：エポック秒などの、基準になる日時
     * @param data_query クエリデータの先頭
     */
    private isImplicitDate(data_query: string) {
        // 空文字（未指定）であればTrueを返す
        if (data_query.length == 0) {
            return true;
        }
        for (let i = 0; i < data_query.length; i++) {
            // UTF-8でASCII以外の文字を含むならTrueを返す
            if ((data_query.codePointAt(i) || 0) > 127) {
                return true;
            }
        }
        // 全ての文字がASCIIならばFalseを返す
        return false;
    }

    /**
     * 日時の述語（例：4時間後、午後、年末など）を解析する
     * @param add_query クエリ文字列
     * @param date 変換対象日時
     * @param predicate_list 処理済みの述語リスト
     */
    private predicate(
        add_query: string,
        date: DateWrapper,
        predicate_list: Predicate[]
    ): PredicateResult {
        let normalized_result = new TextNormalizer({
            normalized_text: add_query,
        });
        let predicate: Predicate | null = null;
        this.findTargetWithLevenshtein(
            PredicateList,
            this.config.getLanguage(),
            normalized_result.getTemplateText(),
            (item: Predicate) => {
                // もっともそれらしいパーサに処理をさせる
                date = item.parser(
                    date,
                    normalized_result.getTemplateParameters(),
                    this.config,
                    predicate_list
                );
                // 処理済みの述語を配列に格納する
                // 引数はJSON形式でextraに設定する
                predicate = item;
                predicate.extra.set(
                    'argv',
                    JSON.stringify(normalized_result.getTemplateParameters())
                );
                return date;
            }
        );
        return {
            date: date,
            predicate: predicate,
        };
    }

    /**
     * クエリ文字列をパース、日時に変換する
     * @param epoch_time_milliseconds 基準日時を表すミリ秒
     * @param query_list クエリ文字列
     */
    private parseQuery(
        epoch_time_milliseconds: number,
        query_list: string[]
    ): DateWrapper | undefined {
        let start = 0;
        let date = undefined;
        // 主語をクエリから切り出す
        const subject_query = ArrayExtend.first(query_list) || '';
        // 最初のクエリが省略された主語（述語、または指定なし）であれば現在日時を返す
        if (this.isImplicitDate(subject_query)) {
            // 主語は現在日時になる
            date = DateUtility.dateFromEpoch(
                epoch_time_milliseconds,
                this.config.getTimeZone()
            );
        } else {
            // 最初のクエリが主語であればパース、エポック秒やISOフォーマットの日時を変換する
            // 主語はクエリで指定した日時になる
            start = 1;
            date = this.subject(subject_query);
        }
        if (date && query_list != null) {
            // 述語（主語以外のもの）を解析する
            let predicate_list: Predicate[] = [];
            for (let i = start; i < query_list.length; i++) {
                if (query_list[i].length >= 1) {
                    // 述語をクエリから切り出す
                    const predicate_query = query_list[i];
                    // もっともそれらしい述語パーサを順に取得する
                    const parsed = this.predicate(
                        predicate_query,
                        date,
                        predicate_list
                    );
                    // それらしい述語パーサがあるのなら、主語を更新する
                    // 例：主語->1月10日　述語->1日後　変換結果->1月11日
                    if (parsed.predicate) {
                        date = parsed.date;
                        predicate_list.push(parsed.predicate);
                    }
                }
            }
        }
        return date;
    }

    /**
     * DateWrapperオブジェクトに変換する
     */
    private getDateWrapper() {
        if (this.config.isDynamic()) {
            return this.parseQuery(DateUtility.nowEpoch(), this.query);
        } else {
            return this.static_result;
        }
    }

    /**
     * 日時（Date型のオブジェクト）に変換する
     */
    public asDate(): Date | undefined {
        return this.getDateWrapper()?.getLocalDate();
    }

    /**
     * 文字列に変換する
     * @param format_query 文字列のフォーマット
     */
    public asString(format_query: string | undefined): string | undefined {
        let date = this.getDateWrapper();
        if (date === undefined) return undefined;
        if (
            format_query &&
            format_query.startsWith('[') &&
            format_query.endsWith(']')
        ) {
            // []で括られていれば、そのまま解釈する
            return DateUtility.format(
                date as DateWrapper,
                format_query.substring(1, format_query.length - 1),
                this.config
            );
        }
        // 含まれていなければ、日本語を解析する
        // ミリ秒、年月日時分秒は単一のユニットに切り分ける
        const target_text = [
            '日本語',
            'エポック秒',
            'エポックミリ秒',
            'ユニックス時間',
            'ミリ秒',
            '曜日',
            '年',
            '月',
            '日',
            '時',
            '分',
            '秒',
        ];
        let date_text = '';
        const format_query_text =
            target_text.reduce((accumulator, current) => {
                // 年月日時分秒のように、区切りなく指定することがある
                // そのため、長いものから順に日時指定の文字列を避けていく
                if (accumulator.indexOf(current) >= 0) {
                    date_text += `@${current}`;
                }
                // 見つかったものは空文字に置き換えて一時的に退避させる
                return accumulator.replace(current, '');
            }, format_query || 'ISO8601') + date_text;
        // それらしいパーサを取得する
        let query_list: DateFormatQuery[] = [];
        new Splitter(PreEscape(format_query_text))
            .withEscapeArray(DateFormatQueryList, (item: DateFormatQuery) => {
                return item.name[this.config.getLanguage()];
            })
            .split()
            .filter((item: string) => item.length >= 1)
            .forEach((item: string) =>
                this.findTargetWithLevenshtein(
                    DateFormatQueryList,
                    this.config.getLanguage(),
                    item,
                    // パーサは処理済みクエリに配列で格納する
                    (target) => query_list.push(target)
                )
            );
        // フォーマットの処理関数は一つだけ（DateWrapper -> stringで再帰処理できない）になるため、
        // 変換関数はパーサの外に一つだけを定義しておく
        const query_map = DateFormat.getQueryMap(query_list);
        return DateUtility.format(
            date as DateWrapper,
            DateFormat.getDateFormatFromMap(query_map),
            this.config
        );
    }

    /**
     * 数値として取得する
     * @param format_query フォーマットのクエリ
     */
    public asNumber(format_query: string): number {
        try {
            // asStringの解析結果を数値にパースする
            return parseInt(
                this.asString('数字の' + format_query) || 'ERROR',
                10
            );
        } catch (e) {
            // パースできないのならエポックミリ秒を返す
            return this.getDateWrapper()?.getTime(true) || 0;
        }
    }
}

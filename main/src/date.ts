import { DateParser } from './date/parser/date_parser';
import { Config, ConfigParameters } from './config/config';
import { Splitter } from './common/splitter';
import { PreEscape } from './common/pre_escape';
import { SubjectQueryList, SubjectQuery } from './date/parser/subject';
import { PredicateList, Predicate } from './date/parser/predicate';

/**
 * 入力をクエリ配列に変換する
 * @param query クエリ
 * @param config オプション
 */
function getQueryList(
    query: string | number | string[],
    config: Config
): string[] {
    // 入力が文字列であればパーサを使って形態素に分解する
    if (typeof query === 'string') {
        return new Splitter(PreEscape(query))
            .withEscapeArray(SubjectQueryList, (item: SubjectQuery) => {
                return item.name[config.getLanguage()];
            })
            .withEscapeArray(PredicateList, (item: Predicate) => {
                return item.name[config.getLanguage()];
            })
            .split();
    }
    // 入力が形態素の配列であればそのまま利用する
    if (Array.isArray(query)) {
        return query.map((item: string) => PreEscape(item));
    }
    // 入力が数値であれば文字列に変換して利用する
    return [`${query}`];
}

/**
 * エントリポイント
 *
 * @param query クエリ文字列
 * @param config_parameters オプションの設定値
 */
export default function NLPDateFactory(
    query: string | number | string[],
    config_parameters: ConfigParameters | undefined
): DateParser {
    let config = new Config(config_parameters);
    return new DateParser(getQueryList(query, config), config);
}

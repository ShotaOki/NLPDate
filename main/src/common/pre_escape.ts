import { TextNormalizer } from './text_normalizer';

/**
 * 例外処理が必要な文字列について、処理を適用する
 */
class PreEscapeClass {
    // 置換後の文字列
    private replaced_text: string;
    // 処理完了後のテンプレート文字列
    private template_text: string;

    constructor(text: string) {
        const normalized_text = new TextNormalizer({
            original: text,
        });
        this.replaced_text = normalized_text.getNormalizedText();
        this.template_text = normalized_text.getTemplateText();
    }

    /**
     * 省略表記を展開する
     */
    withExpandToken() {
        const replace_keys = [
            ['（月）', '月曜日'],
            ['（火）', '火曜日'],
            ['（水）', '水曜日'],
            ['（木）', '木曜日'],
            ['（金）', '金曜日'],
            ['（土）', '土曜日'],
            ['（日）', '日曜日'],
        ];
        replace_keys.forEach((item) => {
            this.replaced_text = this.replaced_text.replace(
                item[0],
                '@' + item[1] + '@'
            );
        });
        return this;
    }

    /**
     * 空白を削除する
     */
    withEraseWhiteSpace() {
        let text = '';
        let character = this.replaced_text[0];
        for (let index = 0; index < this.replaced_text.length; index++) {
            character = this.replaced_text[index];
            if (character == ' ') {
                let before = this.replaced_text.charCodeAt(index - 1);
                let after = this.replaced_text.charCodeAt(index + 1);
                before = before == NaN ? 0 : before;
                after = after == NaN ? 0 : after;
                if (before > 127 || after > 127) {
                    character = '@';
                }
            }
            text += character;
        }
        this.replaced_text = text;

        return this;
    }

    /**
     * 改行、タブは削除する
     */
    withEraseWord() {
        this.replaced_text = this.replaced_text.replace(
            /[\r\n\t（）「」]/g,
            '@'
        );
        return this;
    }

    /**
     * 例外になる文字列（1か月）のような文字列を、「1カ月」のひらがなのない形に置換する
     * 数字は${0}の形式に置換されるため。また、1か月のまま処理すると「か」がセパレータとして扱われるため
     */
    withUnnormalyHiragana() {
        if (this.template_text.includes('}か年')) {
            this.replaced_text = this.replaced_text.replace(/か年/g, 'ヵ年');
        }
        if (this.template_text.includes('}か月')) {
            this.replaced_text = this.replaced_text.replace(/か月/g, 'ヵ月');
        }
        return this;
    }

    /**
     * 数値文字列の前に区切り文字を入れる
     */
    withNumberValueToSeparated() {
        this.replaced_text = this.replaced_text.replace(
            /\d+/g,
            (match, index, all_text) => {
                // 記号の後ろに続いている数値（例：10:00のようなテキスト）
                // テキストの最初の数値（例：エポック秒）はそのまま返却する
                if (index == 0 || all_text.charCodeAt(index - 1) <= 127) {
                    return match;
                }
                switch (all_text[index - 1]) {
                    // 第nは数値として扱わず、そのまま返却する
                    case '第':
                        return match;
                    default:
                        return '@' + match;
                }
            }
        );
        return this;
    }

    /**
     * 処理結果を取得する
     */
    getResult(): string {
        return this.replaced_text;
    }
}

/**
 * 例外処理が必要な文字列について、処理を適用する
 * @param text 処理対象の文字列
 */
export function PreEscape(text: string): string {
    return new PreEscapeClass(text)
        .withExpandToken()
        .withEraseWhiteSpace()
        .withEraseWord()
        .withUnnormalyHiragana()
        .withNumberValueToSeparated()
        .getResult();
}

type TextCharacter = string;

interface NormalizeCharactersInterface {
    target: string;
    replace_to: string;
}

/**
 * 正規化文字列のリスト
 * 正規化対象文字に一致したのであれば、replace_toで指定した正規化文字に変換する
 */
const NORMALIZE_TEXT_LIST: NormalizeCharactersInterface[] = [
    {
        // 全角数字を半角数字に置換する
        target: '０１２３４５６７８９',
        replace_to: '0123456789',
    },
    {
        // 全角漢数字を半角数字に置換する
        target: '零一二三四五六七八九',
        replace_to: '0123456789',
    },
    {
        // 全角アルファベットを半角アルファベットに置換する
        target: 'ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ',
        replace_to: 'abcdefghijklmnopqrstuvwxyz',
    },
    {
        // 全角アルファベットを半角アルファベットに置換する
        target: 'ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ',
        replace_to: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    },
];

interface ConditoinalReplaceCharacterInterface {
    condition: (next: TextCharacter) => boolean;
    list: Map<string, number>;
}

/**
 * トークンの変換ルール
 * 次に続く文字が指定の文字であれば、ルールに沿ってテキストを変換する
 */
const CONDITIONAL_REPLACE_CHARACTER_LIST: ConditoinalReplaceCharacterInterface[] = [
    {
        // 曜日を判定、曜日文字列であれば曜日を数値に変換する
        // 変換前：火曜
        // 変換後：2曜
        condition: (next: TextCharacter) => {
            return next == '曜' ? true : false;
        },
        list: new Map(
            Object.entries({
                日: 0,
                月: 1,
                火: 2,
                水: 3,
                木: 4,
                金: 5,
                土: 6,
            })
        ),
    },
];

const _isDecimal = RegExp(/^[0-9]+$/);
const isDecimal = (text: string) => _isDecimal.test(text);

/**
 * 解析テンプレートに変換する
 */
class TemplateParser {
    // オリジナルのテンプレート文字列
    template: string;
    // テンプレート置換部分のパラメータ
    parameters: number[];
    // 変数：一時的に取得したテンプレート文字列
    private parameter_temporary: string;
    // 変数：最後に処理したテンプレート番号
    private parameter_index: number;

    constructor() {
        this.template = '';
        this.parameters = [];
        this.parameter_temporary = '';
        this.parameter_index = 0;
    }

    /**
     * 処理対象文字列を追加する
     * @param character 処理対象のキャラクタ
     */
    addDecimalCharacter(character: TextCharacter): void {
        this.parameter_temporary += character;
    }

    /**
     * テンプレートに処理対象を追加する
     * @param character 処理対象のキャラクタ
     */
    addCharacter(character: TextCharacter): void {
        this.template += character;
    }

    /**
     * 処理対象を処理、数値文字列であれば数値に変換する
     */
    flush(): void {
        if (this.parameter_temporary.length >= 1) {
            this.template += '${' + this.parameter_index + '}';
            this.parameters.push(parseInt(this.parameter_temporary, 10));
            this.parameter_temporary = '';
            this.parameter_index++;
        }
    }

    /**
     * テンプレートテキストを取得する
     */
    getTemplateText(): string {
        return this.template;
    }

    /**
     * 処理結果パラメータを取得する
     */
    getParameters(): number[] {
        return this.parameters;
    }
}

interface TextNormalizerResult {
    normalized_text: string;
    template: string;
    parameters: number[];
}

interface TextNormalizerRequest {
    original?: string;
    normalized_text?: string;
}

/**
 * テキストを正規化、パラメータを置換する
 */
export class TextNormalizer {
    result: TextNormalizerResult;

    constructor(request: TextNormalizerRequest) {
        // 正規化テキストが引数であればそれをパースする
        // 非正規化テキストが引数であれば正規化してからパースする
        this.result = this.parse(
            request.normalized_text || this.normalize(request.original || '')
        );
    }

    /**
     * テキストの中の一文字を指定、ルールに沿って正規化する
     * @param text 解析対象のテキスト
     * @param index 解析対象の位置
     */
    private normalizeCharacter(text: string, index: number): string {
        const character: TextCharacter = text[index];
        if (index + 1 < text.length) {
            // 次に続く文字を検証、ルールに一致するものがあれば、置換して返却する
            const replace_character = CONDITIONAL_REPLACE_CHARACTER_LIST.filter(
                (item: ConditoinalReplaceCharacterInterface) => {
                    return (
                        item.condition(text[index + 1]) &&
                        item.list.has(character)
                    );
                }
            ).map((item: ConditoinalReplaceCharacterInterface) => {
                // 第3金曜日のようなテキストで前方のテキストを巻き込まないよう、
                // 特殊文字を入れて「第3@5曜日」に変換する
                return `@${item.list.get(character)}`;
            });
            if (replace_character && replace_character.length >= 1) {
                return replace_character[0];
            }
        }
        return (
            // 置換対象文字列を検索、もし対象文字列があれば置換後の文字列を返却する
            // 対象になければ入力をそのまま返却する
            NORMALIZE_TEXT_LIST.map((text_list) => {
                const index = text_list.target.indexOf(character);
                if (index >= 0) {
                    return text_list.replace_to[index];
                }
                return undefined;
            }).find((replace) => replace) || character
        );
    }

    /**
     * テキストを正規化する
     * @param text テキスト
     */
    normalize(text: string): string {
        let result = '';
        for (let i = 0; i < text.length; i++) {
            result += this.normalizeCharacter(text, i);
        }
        return result;
    }

    /**
     * 正規化したテキストを配列に変換する
     * @param normalized_text 正規化したテキスト
     */
    parse(normalized_text: string): TextNormalizerResult {
        let template = new TemplateParser();
        for (let i = 0; i < normalized_text.length; i++) {
            const character: TextCharacter = normalized_text[i];
            if (character == '@') {
                // 特殊文字であれば強制的にフラッシュをかける
                template.flush();
            } else if (isDecimal(character)) {
                // 数値として処理可能であれば数値として処理結果に追加する
                template.addDecimalCharacter(character);
            } else {
                // 数値でないのなら、それまでに処理した数値テキストを解釈させる
                template.flush();
                // 処理結果にテキストを追加する
                template.addCharacter(character);
            }
        }
        // それまでに処理した数値テキストを解釈する
        template.flush();
        return {
            normalized_text: normalized_text,
            template: template.getTemplateText(),
            parameters: template.getParameters(),
        };
    }

    /**
     * テンプレートのテキストを取得する
     */
    getTemplateText() {
        return this.result.template;
    }

    /**
     * テンプレートの置換部分のパラメータを取得する
     */
    getTemplateParameters() {
        return this.result.parameters;
    }

    /**
     * 正規化したテキスト
     */
    getNormalizedText() {
        return this.result.normalized_text;
    }
}

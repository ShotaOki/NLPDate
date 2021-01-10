import {
    TEST_CONTEXT,
    DATA_TEST_TEXT_LIST,
    FROMAT_TEST_TEXT_LIST,
    TestParameter,
} from './test_text';

var assert = require('assert');
var NLPDate = require('../src/main').default;

describe('NLPDate', () => {
    // データ変換試験を実施する
    DATA_TEST_TEXT_LIST.forEach((item: TestParameter) => {
        it(item.text + ' -> ' + item.expects, () => {
            let text = NLPDate(item.text, TEST_CONTEXT).asString();
            assert.equal(item.expects, text);
        });
    });
    // フォーマット変換試験を実施する
    FROMAT_TEST_TEXT_LIST.forEach((item: TestParameter) => {
        it('現在:format:' + item.text + ' -> ' + item.expects, () => {
            let text = NLPDate('現在', TEST_CONTEXT).asString(item.text);
            assert.equal(item.expects, text);
        });
    });
});

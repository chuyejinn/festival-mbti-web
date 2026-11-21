const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const staticDir = path.resolve(__dirname, '../../main/resources/static');

function loadScript(name, globals = {}) {
    const context = vm.createContext({ window: {}, ...globals });
    vm.runInContext(fs.readFileSync(path.join(staticDir, 'js', name), 'utf8'), context);
    return context;
}

test('getMbti selects the higher score in each of the four dimensions', () => {
    const { getMbti } = loadScript('question.js');
    assert.equal(getMbti({ I: 3, N: 2, F: 4, P: 2 }), 'INFP');
    assert.equal(getMbti({ E: 4, S: 3, T: 2, J: 5, I: 1, N: 1, F: 1, P: 1 }), 'ESTJ');
});

test('ties and missing scores keep the existing ESTJ preference', () => {
    const { getMbti } = loadScript('question.js');
    assert.equal(getMbti({}), 'ESTJ');
    assert.equal(getMbti({ E: 2, I: 2, S: 1, N: 1, T: 3, F: 3, J: 4, P: 4 }), 'ESTJ');
});

test('eight answers advance the quiz, save the result and navigate to the result page', () => {
    const elements = { 'question-title': {}, 'question-text': {} };
    const buttons = Array.from({ length: 4 }, () => ({}));
    const storage = new Map();
    const window = { location: { href: '/question' } };
    loadScript('question.js', {
        window,
        document: {
            getElementById: id => elements[id],
            querySelectorAll: () => buttons
        },
        localStorage: { setItem: (key, value) => storage.set(key, value) }
    });

    window.onload();
    for (let i = 1; i <= 8; i++) {
        assert.equal(elements['question-title'].innerText, `Q${i}`);
        assert.equal(window.location.href, '/question');
        assert.equal(storage.has('mbtiResult'), false);
        buttons[0].onclick();
    }
    assert.equal(storage.get('mbtiResult'), 'ESTJ');
    assert.equal(window.location.href, '/result');
});

test('all 16 MBTI types have result images and valid match data', () => {
    const context = loadScript('result.js');
    const results = vm.runInContext('mbtiResults', context);
    const matches = vm.runInContext('mbtiMatches', context);
    const reasons = vm.runInContext('matchReasons', context);
    assert.equal(Object.keys(results).length, 16);
    for (const first of 'EI') for (const second of 'SN') {
        for (const third of 'TF') for (const fourth of 'JP') {
            const type = first + second + third + fourth;
            assert.ok(results[type].title);
            assert.ok(results[type].description);
            assert.ok(fs.existsSync(path.join(staticDir, results[type].img)));
            assert.equal(matches[type].length, 2);
            for (const match of matches[type]) {
                assert.ok(results[match]);
                assert.ok(reasons[match]);
            }
        }
    }
});

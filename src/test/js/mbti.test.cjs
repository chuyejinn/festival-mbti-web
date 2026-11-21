const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const staticDir = path.resolve(__dirname, '../../main/resources/static');

function loadScripts(names, globals = {}) {
    const context = vm.createContext({ window: {}, ...globals });
    for (const name of names) {
        vm.runInContext(fs.readFileSync(path.join(staticDir, 'js', name), 'utf8'), context, { filename: name });
    }
    return context;
}

function loadPageScripts(page, globals = {}) {
    const template = fs.readFileSync(path.join(staticDir, '../templates', `${page}.html`), 'utf8');
    const names = [...template.matchAll(/<script src="\/js\/([^"/]+)"><\/script>/g)].map(match => match[1]);
    assert.equal(new Set(names).size, names.length, 'each script should load once');
    return loadScripts(names, globals);
}

test('getMbti selects the higher score in each of the four dimensions', () => {
    const { getMbti } = loadScripts(['mbti-scoring.js']);
    assert.equal(getMbti({ I: 3, N: 2, F: 4, P: 2 }), 'INFP');
    assert.equal(getMbti({ E: 4, S: 3, T: 2, J: 5, I: 1, N: 1, F: 1, P: 1 }), 'ESTJ');
});

test('ties and missing scores keep the existing ESTJ preference', () => {
    const { getMbti } = loadScripts(['mbti-scoring.js']);
    assert.equal(getMbti({}), 'ESTJ');
    assert.equal(getMbti({ E: 2, I: 2, S: 1, N: 1, T: 3, F: 3, J: 4, P: 4 }), 'ESTJ');
});

test('scoring counts each answer letter without changing the previous score', () => {
    const { addAnswerScore } = loadScripts(['mbti-scoring.js']);
    const initial = { E: 1 };
    const next = addAnswerScore(initial, 'EJ');
    assert.deepEqual(initial, { E: 1 });
    assert.deepEqual({ ...next }, { E: 2, J: 1 });
    assert.deepEqual({ ...addAnswerScore(next, 'I') }, { E: 2, J: 1, I: 1 });
});

test('scoring can return each of the 16 MBTI types', () => {
    const { getMbti } = loadScripts(['mbti-scoring.js']);
    for (const a of 'EI') for (const b of 'SN') for (const c of 'TF') for (const d of 'JP') {
        const type = a + b + c + d;
        assert.equal(getMbti(Object.fromEntries([...type].map(letter => [letter, 1]))), type);
    }
});

test('eight answers advance the quiz, save the result and navigate to the result page', () => {
    const elements = { 'question-title': {}, 'question-text': {} };
    const buttons = Array.from({ length: 4 }, () => ({}));
    const storage = new Map();
    const window = { location: { href: '/question' } };
    loadPageScripts('question', {
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
    // An extra click after the last answer must not recalculate or throw.
    assert.doesNotThrow(() => buttons[0].onclick());
    assert.equal(storage.get('mbtiResult'), 'ESTJ');
});

test('all 16 MBTI types have result images and valid match data', () => {
    const context = loadScripts(['result-data.js']);
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

test('result page renders the stored MBTI and its two recommended matches', () => {
    const cards = [];
    const elements = {
        'result-type': {}, 'result-desc': {}, 'result-img': {},
        'match-cards': { appendChild: card => cards.push(card) }
    };
    const context = loadPageScripts('result', {
        document: { getElementById: id => elements[id], createElement: () => ({}) },
        localStorage: { getItem: key => key === 'mbtiResult' ? 'INFP' : null }
    });
    context.window.onload();
    assert.match(elements['result-type'].innerText, /^INFP – /);
    assert.ok(elements['result-desc'].innerText);
    assert.equal(elements['result-img'].src, '/images/infp.png');
    assert.equal(cards.length, 2);
    assert.match(cards[0].innerHTML, /ENFJ/);
    assert.match(cards[1].innerHTML, /INFJ/);
});

test('missing or unrecognized result shows the existing fallback message', () => {
    for (const value of [null, 'UNKNOWN', 'constructor']) {
        const element = {};
        const context = loadPageScripts('result', {
            document: { getElementById: () => element },
            localStorage: { getItem: () => value }
        });
        assert.doesNotThrow(() => context.window.onload());
        assert.equal(element.innerText, '결과를 찾을 수 없습니다.');
    }
});

const mbtiPairs = [['E', 'I'], ['S', 'N'], ['T', 'F'], ['J', 'P']];

function addAnswerScore(score, type) {
    const nextScore = { ...score };
    for (const letter of type) {
        nextScore[letter] = (nextScore[letter] || 0) + 1;
    }
    return nextScore;
}

function getMbti(score) {
    return mbtiPairs.map(([a, b]) => (score[a] || 0) >= (score[b] || 0) ? a : b).join('');
}

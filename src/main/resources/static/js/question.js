let current = 0;
let scores = {};

function renderQuestion() {
    const q = questions[current];
    document.getElementById('question-title').innerText = `Q${current + 1}`;
    document.getElementById('question-text').innerText = q.question;

    const opts = document.querySelectorAll('.options button');
    Object.entries(q.answers).forEach(([key, answer], i) => {
        opts[i].innerText = `${key}. ${answer.text}`;
        opts[i].onclick = () => selectAnswer(key);
    });
}

function selectAnswer(key) {
    if (current >= questions.length) return;
    const type = questions[current].answers[key].type;
    scores = addAnswerScore(scores, type);

    current++;
    if (current < questions.length) {
        renderQuestion();
    } else {
        const resultType = getMbti(scores);
        localStorage.setItem('mbtiResult', resultType);
        window.location.href = '/result';
    }
}

window.onload = renderQuestion;

function showResult() {
    const mbti = localStorage.getItem('mbtiResult');
    if (!Object.prototype.hasOwnProperty.call(mbtiResults, mbti)) {
        document.getElementById('result-type').innerText = '결과를 찾을 수 없습니다.';
        return;
    }

    const result = mbtiResults[mbti];
    document.getElementById('result-type').innerText = `${mbti} – ${result.title}`;
    document.getElementById('result-desc').innerText = result.description;
    document.getElementById('result-img').src = result.img;

    const matchContainer = document.getElementById('match-cards');
    matchContainer.innerHTML = '';
    (mbtiMatches[mbti] || []).forEach(matchType => {
        const match = mbtiResults[matchType];
        const reason = matchReasons[matchType] || "";
        const card = document.createElement('div');
        card.className = 'match-card';
        card.innerHTML = `
            <img src="${match.img}" class="match-img" alt="${matchType}" />
            <p><strong>${matchType} – ${match.title}</strong></p>
            <p class="match-reason">${reason}</p>
        `;
        matchContainer.appendChild(card);
    });
}

window.onload = showResult;

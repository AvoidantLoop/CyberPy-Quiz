document.addEventListener('DOMContentLoaded', () => {
    // STATE VARIABLES
    let username = '';
    let questions = [];
    let currentQuestionIndex = 0;
    let userAnswers = {};

    // DOM ELEMENTS
    const landingView = document.getElementById('landing-view');
    const quizView = document.getElementById('quiz-view');
    const resultsView = document.getElementById('results-view');

    const usernameInput = document.getElementById('username');
    const nameError = document.getElementById('name-error');
    const startBtn = document.getElementById('start-btn');

    const displayName = document.getElementById('display-name');
    const currentQIndexEl = document.getElementById('current-q-index');
    const totalQuestionsEl = document.getElementById('total-questions');
    const progressBar = document.getElementById('progress-bar');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const nextBtn = document.getElementById('next-btn');
    const nextBtnText = document.getElementById('next-btn-text');
    const nextBtnIcon = document.getElementById('next-btn-icon');

    const scorePercentEl = document.getElementById('result-score-percent');
    const scoreRawEl = document.getElementById('result-score-raw');
    const gaugeProgress = document.getElementById('gauge-progress');
    const feedbackHeadline = document.getElementById('feedback-headline');
    const feedbackMessage = document.getElementById('feedback-message');
    const summaryCandidate = document.getElementById('summary-candidate');
    const summaryAccuracy = document.getElementById('summary-accuracy');
    const reviewList = document.getElementById('review-list');
    const restartBtn = document.getElementById('restart-btn');

    // API URL HELPERS
    const API_BASE = '/api';

    // 1. LANDING PAGE LOGIC
    startBtn.addEventListener('click', handleStartQuiz);
    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleStartQuiz();
        }
    });

    // Remove error highlights on input modification
    usernameInput.addEventListener('input', () => {
        nameError.style.display = 'none';
        usernameInput.style.borderColor = '';
    });

    async function handleStartQuiz() {
        const trimmedName = usernameInput.value.trim();
        if (!trimmedName) {
            nameError.style.display = 'inline-flex';
            usernameInput.style.borderColor = 'var(--error)';
            usernameInput.focus();
            return;
        }

        username = trimmedName;
        displayName.textContent = username;
        
        // Show indicator on button
        startBtn.classList.add('disabled-btn');
        startBtn.disabled = true;
        startBtn.querySelector('span').textContent = 'Loading Quiz...';
        
        try {
            await fetchQuestions();
            transitionView(landingView, quizView);
            renderQuestion();
        } catch (error) {
            console.error('Failed to initialize quiz:', error);
            alert('Unable to load quiz questions. Please make sure the Flask backend is running.');
            startBtn.classList.remove('disabled-btn');
            startBtn.disabled = false;
            startBtn.querySelector('span').textContent = 'Begin Challenge';
        }
    }

    // 2. FETCH QUESTIONS FROM BACKEND
    async function fetchQuestions() {
        const response = await fetch(`${API_BASE}/questions`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        questions = await response.json();
        totalQuestionsEl.textContent = questions.length;
    }

    // 3. RENDER CURRENT QUESTION
    function renderQuestion() {
        if (questions.length === 0) return;

        const currentQ = questions[currentQuestionIndex];
        
        // Update stats header
        currentQIndexEl.textContent = currentQuestionIndex + 1;
        const progressPercentage = ((currentQuestionIndex) / questions.length) * 100;
        progressBar.style.width = `${progressPercentage}%`;

        // Render question text
        questionText.textContent = currentQ.question;

        // Render option choice buttons
        optionsContainer.innerHTML = '';
        
        const optionBadges = ['A', 'B', 'C', 'D'];
        currentQ.options.forEach((optionText, idx) => {
            const card = document.createElement('div');
            card.className = 'option-card';
            
            // Check if this option was already chosen in this question state (e.g. going back)
            if (userAnswers[currentQ.id] === idx) {
                card.classList.add('selected');
            }

            card.innerHTML = `
                <div class="option-badge">${optionBadges[idx]}</div>
                <div class="option-text">${escapeHTML(optionText)}</div>
            `;

            // Click listener
            card.addEventListener('click', () => {
                selectOption(idx, card);
            });

            optionsContainer.appendChild(card);
        });

        // Set up next/submit button
        if (userAnswers[currentQ.id] !== undefined) {
            enableNextButton();
        } else {
            disableNextButton();
        }

        // Handle text label of button on last question
        if (currentQuestionIndex === questions.length - 1) {
            nextBtnText.textContent = 'Submit Quiz';
            nextBtnIcon.className = 'fa-solid fa-paper-plane btn-icon';
        } else {
            nextBtnText.textContent = 'Next Question';
            nextBtnIcon.className = 'fa-solid fa-chevron-right btn-icon';
        }
    }

    function selectOption(index, cardElement) {
        const currentQ = questions[currentQuestionIndex];
        userAnswers[currentQ.id] = index;

        // Remove active class from all options, add to selected
        const cards = optionsContainer.querySelectorAll('.option-card');
        cards.forEach(c => c.classList.remove('selected'));
        cardElement.classList.add('selected');

        enableNextButton();
    }

    function enableNextButton() {
        nextBtn.classList.remove('disabled-btn');
        nextBtn.disabled = false;
    }

    function disableNextButton() {
        nextBtn.classList.add('disabled-btn');
        nextBtn.disabled = true;
    }

    // 4. NAVIGATION HANDLER
    nextBtn.addEventListener('click', async () => {
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            renderQuestion();
        } else {
            // Last question: Submit answers to backend
            disableNextButton();
            nextBtnText.textContent = 'Evaluating Answers...';
            nextBtnIcon.className = 'fa-solid fa-circle-notch fa-spin btn-icon';

            try {
                const response = await fetch(`${API_BASE}/submit`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ answers: userAnswers })
                });

                if (!response.ok) {
                    throw new Error('Submission failed');
                }

                const result = await response.json();
                
                // Final progress bar fills to 100%
                progressBar.style.width = '100%';

                setTimeout(() => {
                    transitionView(quizView, resultsView);
                    displayResults(result);
                }, 500);

            } catch (error) {
                console.error('Error submitting quiz answers:', error);
                alert('An error occurred during submission. Please try again.');
                enableNextButton();
                nextBtnText.textContent = 'Submit Quiz';
                nextBtnIcon.className = 'fa-solid fa-paper-plane btn-icon';
            }
        }
    });

    // 5. RENDER DETAILED RESULTS
    function displayResults(result) {
        const total = questions.length;
        const score = result.score;
        const correctAnswers = result.correct_answers;
        const accuracy = Math.round((score / total) * 100);

        // Core Summary UI
        scorePercentEl.textContent = `${accuracy}%`;
        scoreRawEl.textContent = `${score} / ${total} Correct`;
        summaryCandidate.textContent = username;
        summaryAccuracy.textContent = `${accuracy}%`;

        // Smooth radial progress bar animation
        const circumference = 2 * Math.PI * 54; // r=54 -> 339.292
        gaugeProgress.style.strokeDasharray = circumference;
        
        // Timeout to allow DOM transitions to complete for beautiful CSS transitions
        setTimeout(() => {
            const offset = circumference - (accuracy / 100) * circumference;
            gaugeProgress.style.strokeDashoffset = offset;
        }, 150);

        // Feedback Text Compilation
        if (score === 10) {
            feedbackHeadline.textContent = "🏆 Master Python Developer!";
            feedbackMessage.textContent = "Absolutely flawless execution! You answered all questions perfectly. You've earned the title of a true Python champion!";
        } else if (score >= 7) {
            feedbackHeadline.textContent = "🌟 High Python Proficiency!";
            feedbackMessage.textContent = `Excellent job, ${username}! You clearly understand python variables, collections, functions, and loops very well. Keep it up!`;
        } else if (score >= 4) {
            feedbackHeadline.textContent = "📈 Solid Foundation!";
            feedbackMessage.textContent = "Good effort! You answered most questions correctly, but there are a few details worth reviewing. You're very close to mastery!";
        } else {
            feedbackHeadline.textContent = "📚 Keep Learning Python!";
            feedbackMessage.textContent = "A great learning opportunity! Python is highly approachable. Review the question cards below to learn the correct options and try again!";
        }

        // Detailed reviews
        reviewList.innerHTML = '';
        const optionLetter = ['A', 'B', 'C', 'D'];

        questions.forEach((q, idx) => {
            const userAnsIdx = userAnswers[q.id];
            const correctAnsIdx = correctAnswers[q.id];
            const isCorrect = userAnsIdx === correctAnsIdx;

            const userAnsText = userAnsIdx !== undefined ? q.options[userAnsIdx] : 'None (Skipped)';
            const correctAnsText = q.options[correctAnsIdx];

            const reviewCard = document.createElement('div');
            reviewCard.className = `review-card ${isCorrect ? 'correct-answer' : 'incorrect-answer'}`;

            reviewCard.innerHTML = `
                <div class="review-card-header">
                    <div class="review-q-text">${idx + 1}. ${escapeHTML(q.question)}</div>
                    <span class="status-badge">
                        ${isCorrect 
                            ? '<i class="fa-solid fa-circle-check"></i> Correct' 
                            : '<i class="fa-solid fa-circle-xmark"></i> Incorrect'}
                    </span>
                </div>
                <div class="answers-comparison">
                    <div class="ans-row user-ans">
                        <span class="label-tag">Your Answer</span>
                        <span class="answer-val">${escapeHTML(userAnsText)}</span>
                    </div>
                    ${!isCorrect ? `
                    <div class="ans-row correct-ans">
                        <span class="label-tag">Correct Option</span>
                        <span class="answer-val">${escapeHTML(correctAnsText)}</span>
                    </div>
                    ` : ''}
                </div>
            `;
            reviewList.appendChild(reviewCard);
        });
    }

    // 6. RETAKE QUIZ (RESETS STATE)
    restartBtn.addEventListener('click', () => {
        currentQuestionIndex = 0;
        userAnswers = {};
        
        // Reset landing loader styles
        startBtn.classList.remove('disabled-btn');
        startBtn.disabled = false;
        startBtn.querySelector('span').textContent = 'Begin Challenge';
        
        // Prefill name in input for convenience
        usernameInput.value = username;

        // Reset gauge offset
        const circumference = 2 * Math.PI * 54;
        gaugeProgress.style.strokeDashoffset = circumference;

        transitionView(resultsView, landingView);
    });

    // 7. HELPER FUNCTIONS
    function transitionView(oldView, newView) {
        oldView.classList.remove('active');
        // Small delay to ensure display:none registers before showing the next animated entry
        setTimeout(() => {
            newView.classList.add('active');
        }, 150);
    }

    function escapeHTML(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
});

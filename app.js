/**
 * Illustrious 18 Trainer - Main Application Logic
 * A practice tool for mastering the 18 most important card counting deviations
 */

class IllustriousTrainer {
    constructor() {
        this.score = 0;
        this.streak = 0;
        this.bestStreak = 0;
        this.totalQuestions = 0;
        this.correctAnswers = 0;
        this.currentQuestion = null;
        this.questionHistory = [];
        this.weakSpots = new Map();
        this.showExplanations = true;
        this.quickFeedbackTimeout = null;

        // Deviation type toggles (all on by default)
        this.enabledTypes = {
            hardTotals: true,
            doubles: true,
            pairs: true,
            insurance: true
        };

        // Custom mode settings
        this.customMode = false;
        this.customDeviationId = 2; // Default to 16 vs 10
        this.customTcFrom = -4;
        this.customTcTo = 4;

        // Theme (dark by default)
        this.darkMode = true;

        this.init();
    }

    init() {
        this.loadStats();
        this.setupEventListeners();
        this.populateCustomDeviationDropdown();
        this.applyTheme();
        this.updateCustomModePanel();
        this.generateQuestion();
        this.updateUI();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchView(e.target.dataset.view));
        });

        // Answer buttons
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleAnswer(action);
            });
        });

        // Next button
        document.getElementById('next-btn').addEventListener('click', () => {
            this.hideFeedback();
            this.generateQuestion();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.renderChart(e.target.dataset.filter);
            });
        });

        // Reset stats
        document.getElementById('reset-stats').addEventListener('click', () => {
            if (confirm('Reset all statistics?')) {
                this.resetStats();
            }
        });

        // Settings toggles
        const explanationsToggle = document.getElementById('show-explanations');
        if (explanationsToggle) {
            explanationsToggle.addEventListener('change', (e) => {
                this.showExplanations = e.target.checked;
                this.saveStats();
            });
        }

        // Deviation type toggles
        const hardTotalsToggle = document.getElementById('enable-hard-totals');
        if (hardTotalsToggle) {
            hardTotalsToggle.addEventListener('change', (e) => {
                this.enabledTypes.hardTotals = e.target.checked;
                this.saveStats();
            });
        }

        const doublesToggle = document.getElementById('enable-doubles');
        if (doublesToggle) {
            doublesToggle.addEventListener('change', (e) => {
                this.enabledTypes.doubles = e.target.checked;
                this.saveStats();
            });
        }

        const pairsToggle = document.getElementById('enable-pairs');
        if (pairsToggle) {
            pairsToggle.addEventListener('change', (e) => {
                this.enabledTypes.pairs = e.target.checked;
                this.saveStats();
            });
        }

        const insuranceToggle = document.getElementById('enable-insurance');
        if (insuranceToggle) {
            insuranceToggle.addEventListener('change', (e) => {
                this.enabledTypes.insurance = e.target.checked;
                this.saveStats();
            });
        }

        // Custom mode toggle
        const customModeToggle = document.getElementById('custom-mode');
        if (customModeToggle) {
            customModeToggle.addEventListener('change', (e) => {
                this.customMode = e.target.checked;
                this.updateCustomModePanel();
                this.saveStats();
                if (this.customMode) {
                    this.generateQuestion();
                }
            });
        }

        // Custom deviation dropdown
        const customDeviationSelect = document.getElementById('custom-deviation');
        if (customDeviationSelect) {
            customDeviationSelect.addEventListener('change', (e) => {
                this.customDeviationId = parseInt(e.target.value);
                this.saveStats();
                if (this.customMode) {
                    this.generateQuestion();
                }
            });
        }

        // Custom true count range inputs
        const tcFromInput = document.getElementById('custom-tc-from');
        if (tcFromInput) {
            tcFromInput.addEventListener('change', (e) => {
                this.customTcFrom = parseInt(e.target.value) || -4;
                this.saveStats();
            });
        }

        const tcToInput = document.getElementById('custom-tc-to');
        if (tcToInput) {
            tcToInput.addEventListener('change', (e) => {
                this.customTcTo = parseInt(e.target.value) || 4;
                this.saveStats();
            });
        }

        // Dark mode toggle
        const darkModeToggle = document.getElementById('dark-mode');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('change', (e) => {
                this.darkMode = e.target.checked;
                this.applyTheme();
                this.saveStats();
            });
        }
    }

    getDeviationType(deviation) {
        if (deviation.playerHand === 'Any') return 'insurance';
        if (deviation.playerHand.includes(',')) return 'pairs';
        if (deviation.deviation === 'Double') return 'doubles';
        return 'hardTotals';
    }

    getEnabledDeviations() {
        return ILLUSTRIOUS_18.filter(d => {
            const type = this.getDeviationType(d);
            return this.enabledTypes[type];
        });
    }

    switchView(view) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

        document.getElementById(`${view}-view`).classList.add('active');
        document.querySelector(`[data-view="${view}"]`).classList.add('active');

        // Hide any visible feedback when switching views
        this.hideFeedback();
        const quickFeedback = document.getElementById('quick-feedback');
        const quickIcon = document.getElementById('quick-feedback-icon');
        if (quickFeedback) {
            quickFeedback.classList.add('hidden');
        }
        if (quickIcon) {
            quickIcon.classList.remove('animate');
        }
        // Clear any pending quick feedback timeout
        if (this.quickFeedbackTimeout) {
            clearTimeout(this.quickFeedbackTimeout);
            this.quickFeedbackTimeout = null;
        }

        if (view === 'study') {
            this.renderChart('all');
        } else if (view === 'stats') {
            this.renderStats();
        } else if (view === 'settings') {
            this.renderSettings();
        }
    }

    updateCustomModePanel() {
        const panel = document.getElementById('custom-mode-panel');
        if (panel) {
            if (this.customMode) {
                panel.classList.remove('hidden');
            } else {
                panel.classList.add('hidden');
            }
        }
    }

    populateCustomDeviationDropdown() {
        const select = document.getElementById('custom-deviation');
        if (!select) return;

        select.innerHTML = '';
        ILLUSTRIOUS_18.forEach(d => {
            const option = document.createElement('option');
            option.value = d.id;
            option.textContent = d.name;
            if (d.id === this.customDeviationId) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    }

    generateQuestion() {
        let deviation;
        let trueCount;

        if (this.customMode) {
            // Use the selected deviation
            deviation = ILLUSTRIOUS_18.find(d => d.id === this.customDeviationId);
            if (!deviation) deviation = ILLUSTRIOUS_18[0];

            // Generate true count within the custom range
            const from = Math.min(this.customTcFrom, this.customTcTo);
            const to = Math.max(this.customTcFrom, this.customTcTo);
            const range = to - from + 1;
            trueCount = Math.floor(Math.random() * range) + from;
        } else {
            // Get deviations filtered by enabled types
            const enabledDeviations = this.getEnabledDeviations();
            
            if (enabledDeviations.length === 0) {
                // Fallback if no types enabled
                deviation = ILLUSTRIOUS_18[0];
            } else {
                // Pick a random deviation from enabled types
                deviation = enabledDeviations[Math.floor(Math.random() * enabledDeviations.length)];
            }
            
            // Reduce insurance frequency to ~2% (insurance is 1/18 = 5.5%, so only accept it 36% of the time)
            if (deviation.id === 1 && Math.random() > 0.36) {
                // Pick a non-insurance deviation instead
                const nonInsuranceDeviations = enabledDeviations.filter(d => d.id !== 1);
                if (nonInsuranceDeviations.length > 0) {
                    deviation = nonInsuranceDeviations[Math.floor(Math.random() * nonInsuranceDeviations.length)];
                }
            }
            
            // Generate true count - include edge cases 40% of the time
            const isEdgeCase = Math.random() < 0.4;
            
            if (isEdgeCase) {
                // Generate true count near the index (-2 to +2)
                const offset = Math.floor(Math.random() * 5) - 2;
                trueCount = deviation.index + offset;
            } else {
                // Random true count between -5 and +8
                trueCount = Math.floor(Math.random() * 14) - 5;
            }
        }
        
        // Determine correct answer
        // For "below" deviations (negative index), deviate when count is AT OR BELOW index
        // For standard deviations, deviate when count is AT OR ABOVE index
        const isBelowDeviation = deviation.indexDirection === "below";
        const shouldDeviate = isBelowDeviation 
            ? trueCount <= deviation.index 
            : trueCount >= deviation.index;
        const correctAnswer = shouldDeviate ? deviation.deviation : deviation.basicStrategy;

        this.currentQuestion = {
            deviation,
            trueCount,
            correctAnswer,
            shouldDeviate,
            isEdgeCase: EDGE_CASES.isEdgeCase(trueCount, deviation.index)
        };

        this.renderQuestion();
    }

    renderQuestion() {
        const q = this.currentQuestion;
        
        // Update true count badge
        document.getElementById('true-count').textContent = q.trueCount >= 0 ? `+${q.trueCount}` : q.trueCount;
        
        // Update dealer card
        const dealerCard = document.getElementById('dealer-card');
        dealerCard.querySelector('.card-value').textContent = q.deviation.dealerUpcard;
        dealerCard.querySelector('.card-suit').textContent = this.getSuitForCard(q.deviation.dealerUpcard);
        
        // Update player hand
        const playerCardsContainer = document.getElementById('player-cards');
        playerCardsContainer.innerHTML = '';
        
        if (q.deviation.playerHand.includes(',')) {
            // Split hand (two cards)
            const cards = q.deviation.playerHand.split(',');
            cards.forEach(card => {
                const cardEl = document.createElement('div');
                cardEl.className = 'card';
                cardEl.innerHTML = `<span class="card-value">${card.trim()}</span>`;
                playerCardsContainer.appendChild(cardEl);
            });
        } else {
            // Single total
            const cardEl = document.createElement('div');
            cardEl.className = 'card';
            cardEl.innerHTML = `<span class="card-value">${q.deviation.playerHand}</span>`;
            playerCardsContainer.appendChild(cardEl);
        }
        
        // Update scenario type
        const scenarioTag = document.getElementById('scenario-type');
        if (q.deviation.playerHand.includes(',')) {
            scenarioTag.textContent = 'Pair';
        } else if (q.deviation.playerHand.includes('A')) {
            scenarioTag.textContent = 'Soft Hand';
        } else if (q.deviation.playerHand === 'Any') {
            scenarioTag.textContent = 'Insurance';
        } else {
            scenarioTag.textContent = 'Hard Total';
        }

        // Show/hide buttons based on scenario type
        const isInsurance = q.deviation.playerHand === 'Any' && q.deviation.dealerUpcard === 'A';
        const answerButtons = document.querySelector('.answer-buttons');
        
        if (isInsurance) {
            answerButtons.classList.add('insurance-mode');
        } else {
            answerButtons.classList.remove('insurance-mode');
        }
        
        document.querySelectorAll('.action-btn').forEach(btn => {
            const action = btn.dataset.action;
            if (isInsurance) {
                // Insurance scenario: only show Insurance/No Insurance
                btn.style.display = (action === 'Insurance' || action === 'No Insurance') ? 'flex' : 'none';
            } else {
                // Regular hand: show Hit/Stand/Double/Split, hide Insurance options
                btn.style.display = (action === 'Insurance' || action === 'No Insurance') ? 'none' : 'flex';
            }
            btn.disabled = false;
            btn.style.opacity = '1';
        });
    }

    getSuitForCard(value) {
        const suits = ['♠', '♥', '♦', '♣'];
        // Red suits for hearts/diamonds to show color
        return suits[Math.floor(Math.random() * suits.length)];
    }

    handleAnswer(answer) {
        if (!this.currentQuestion) return;

        const q = this.currentQuestion;
        // Normalize answer for comparison (handle "Insurance" vs "Take Insurance")
        const normalizedAnswer = answer === "Take Insurance" ? "Insurance" : answer;
        const normalizedCorrect = q.correctAnswer === "Take Insurance" ? "Insurance" : q.correctAnswer;
        const isCorrect = normalizedAnswer === normalizedCorrect;

        // Update stats
        this.totalQuestions++;
        if (isCorrect) {
            this.correctAnswers++;
            this.streak++;
            if (this.streak > this.bestStreak) {
                this.bestStreak = this.streak;
            }
            this.score += 10 + Math.min(this.streak * 2, 20);
        } else {
            this.streak = 0;
            this.score = Math.max(0, this.score - 5);
            this.trackWeakSpot(q.deviation);
        }

        // Record history
        this.questionHistory.push({
            deviation: q.deviation,
            trueCount: q.trueCount,
            userAnswer: answer,
            correct: isCorrect,
            timestamp: Date.now()
        });

        this.updateUI();
        
        if (this.showExplanations) {
            this.showFeedback(isCorrect, answer);
        } else {
            this.showQuickFeedback(isCorrect);
            setTimeout(() => {
                this.generateQuestion();
            }, 600);
        }
        
        this.saveStats();
    }

    trackWeakSpot(deviation) {
        const key = deviation.id;
        const current = this.weakSpots.get(key) || { correct: 0, total: 0, deviation };
        current.total++;
        this.weakSpots.set(key, current);
    }

    showFeedback(isCorrect, userAnswer) {
        const q = this.currentQuestion;
        const modal = document.getElementById('feedback-modal');
        const content = modal.querySelector('.feedback-content');
        
        // Set feedback styling
        content.className = 'feedback-content ' + (isCorrect ? 'correct' : 'incorrect');
        
        // Set icon and title
        document.getElementById('feedback-icon').textContent = isCorrect ? '✅' : '❌';
        document.getElementById('feedback-title').textContent = isCorrect ? 'Correct!' : 'Not quite...';
        
        // Set details
        document.getElementById('feedback-basic').innerHTML = 
            `Basic Strategy: <strong>${q.deviation.basicStrategy}</strong>`;
        // Format index display: for "below" deviations show as "0-" meaning "0 or lower"
        let indexDisplay;
        if (q.deviation.indexDirection === "below") {
            indexDisplay = q.deviation.index <= 0 ? `${q.deviation.index}-` : `${q.deviation.index}-`;
        } else {
            indexDisplay = q.deviation.index >= 0 ? `+${q.deviation.index}` : `${q.deviation.index}`;
        }
        document.getElementById('feedback-deviation').innerHTML = 
            `Deviation: <strong>${q.deviation.deviation} at ${indexDisplay}</strong>`;
        document.getElementById('feedback-explanation').textContent = q.deviation.explanation;
        
        // Handle edge case info
        const edgeCaseInfo = document.getElementById('edge-case-info');
        if (q.isEdgeCase) {
            edgeCaseInfo.style.display = 'block';
            document.getElementById('edge-explanation').textContent = 
                EDGE_CASES.getEdgeCaseExplanation(q.trueCount, q.deviation.index, q.deviation.deviation, q.deviation.basicStrategy);
        } else {
            edgeCaseInfo.style.display = 'none';
        }
        
        // Show modal
        modal.classList.remove('hidden');
    }

    hideFeedback() {
        document.getElementById('feedback-modal').classList.add('hidden');
    }

    showQuickFeedback(isCorrect) {
        const feedbackEl = document.getElementById('quick-feedback');
        const iconEl = document.getElementById('quick-feedback-icon');

        // Clear any existing timeout
        if (this.quickFeedbackTimeout) {
            clearTimeout(this.quickFeedbackTimeout);
        }

        iconEl.textContent = isCorrect ? '✅' : '❌';
        feedbackEl.classList.remove('hidden');
        iconEl.classList.add('animate');

        this.quickFeedbackTimeout = setTimeout(() => {
            feedbackEl.classList.add('hidden');
            iconEl.classList.remove('animate');
        }, 500);
    }

    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('streak').textContent = this.streak;
        document.getElementById('total-questions').textContent = this.totalQuestions;
        
        const accuracy = this.totalQuestions > 0 
            ? Math.round((this.correctAnswers / this.totalQuestions) * 100) 
            : 0;
        document.getElementById('accuracy').textContent = `${accuracy}%`;
        
        // Show/hide fire emoji
        const fireEmoji = document.getElementById('streak-fire');
        if (this.streak >= 5) {
            fireEmoji.classList.add('show');
        } else {
            fireEmoji.classList.remove('show');
        }
    }

    renderChart(filter) {
        const tbody = document.getElementById('chart-body');
        tbody.innerHTML = '';

        let deviations = ILLUSTRIOUS_18;
        
        if (filter !== 'all') {
            deviations = deviations.filter(d => {
                if (filter === 'hard') return !d.playerHand.includes('A') && !d.playerHand.includes(',') && d.deviation !== 'Double';
                if (filter === 'doubles') return d.deviation === 'Double';
                if (filter === 'pairs') return d.playerHand.includes(',');
                if (filter === 'insurance') return d.playerHand === 'Any';
                return true;
            });
        }

        deviations.forEach(d => {
            const row = document.createElement('tr');
            // Format index: for "below" deviations show as "0-" meaning "0 or lower"
            const indexDisplay = d.indexDirection === "below" 
                ? `${d.index}-` 
                : (d.index >= 0 ? '+' + d.index : d.index);
            row.innerHTML = `
                <td><strong>${d.name}</strong></td>
                <td>${d.playerHand}</td>
                <td>${d.dealerUpcard}</td>
                <td>${d.basicStrategy}</td>
                <td>${d.deviation}</td>
                <td class="index-cell">${indexDisplay}</td>
            `;
            tbody.appendChild(row);
        });
    }

    renderStats() {
        document.getElementById('stats-total').textContent = this.totalQuestions;
        document.getElementById('stats-correct').textContent = this.correctAnswers;
        document.getElementById('stats-best-streak').textContent = this.bestStreak;
        
        const accuracy = this.totalQuestions > 0 
            ? Math.round((this.correctAnswers / this.totalQuestions) * 100) 
            : 0;
        document.getElementById('stats-accuracy').textContent = `${accuracy}%`;

        // Render weak spots
        const weakSpotsList = document.getElementById('weak-spots-list');
        
        if (this.weakSpots.size === 0) {
            weakSpotsList.innerHTML = '<p class="empty-state">Play some rounds to see your weak spots!</p>';
            return;
        }

        // Sort by lowest accuracy
        const sortedSpots = Array.from(this.weakSpots.entries())
            .sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total))
            .slice(0, 5);

        weakSpotsList.innerHTML = sortedSpots.map(([id, data]) => {
            const accuracy = Math.round((data.correct / data.total) * 100);
            return `
                <div class="weak-spot-item">
                    <span class="weak-spot-name">${data.deviation.name}</span>
                    <span class="weak-spot-accuracy">${accuracy}% accuracy</span>
                </div>
            `;
        }).join('');
    }

    applyTheme() {
        if (this.darkMode) {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
        }
    }

    saveStats() {
        const data = {
            score: this.score,
            streak: this.streak,
            bestStreak: this.bestStreak,
            totalQuestions: this.totalQuestions,
            correctAnswers: this.correctAnswers,
            questionHistory: this.questionHistory.slice(-100), // Keep last 100
            weakSpots: Array.from(this.weakSpots.entries()),
            showExplanations: this.showExplanations,
            enabledTypes: this.enabledTypes,
            customMode: this.customMode,
            customDeviationId: this.customDeviationId,
            customTcFrom: this.customTcFrom,
            customTcTo: this.customTcTo,
            darkMode: this.darkMode
        };
        localStorage.setItem('i18-trainer-stats', JSON.stringify(data));
    }

    loadStats() {
        const data = localStorage.getItem('i18-trainer-stats');
        if (data) {
            const parsed = JSON.parse(data);
            this.score = parsed.score || 0;
            this.streak = parsed.streak || 0;
            this.bestStreak = parsed.bestStreak || 0;
            this.totalQuestions = parsed.totalQuestions || 0;
            this.correctAnswers = parsed.correctAnswers || 0;
            this.questionHistory = parsed.questionHistory || [];
            this.weakSpots = new Map(parsed.weakSpots || []);
            this.showExplanations = parsed.showExplanations !== undefined ? parsed.showExplanations : true;
            this.enabledTypes = parsed.enabledTypes || { hardTotals: true, doubles: true, pairs: true, insurance: true };
            this.customMode = parsed.customMode || false;
            this.customDeviationId = parsed.customDeviationId || 2;
            this.customTcFrom = parsed.customTcFrom !== undefined ? parsed.customTcFrom : -4;
            this.customTcTo = parsed.customTcTo !== undefined ? parsed.customTcTo : 4;
            this.darkMode = parsed.darkMode !== undefined ? parsed.darkMode : true;
            
            // Update toggles to match loaded settings
            const explanationsToggle = document.getElementById('show-explanations');
            if (explanationsToggle) {
                explanationsToggle.checked = this.showExplanations;
            }

            const hardTotalsToggle = document.getElementById('enable-hard-totals');
            if (hardTotalsToggle) {
                hardTotalsToggle.checked = this.enabledTypes.hardTotals;
            }

            const doublesToggle = document.getElementById('enable-doubles');
            if (doublesToggle) {
                doublesToggle.checked = this.enabledTypes.doubles;
            }

            const pairsToggle = document.getElementById('enable-pairs');
            if (pairsToggle) {
                pairsToggle.checked = this.enabledTypes.pairs;
            }

            const insuranceToggle = document.getElementById('enable-insurance');
            if (insuranceToggle) {
                insuranceToggle.checked = this.enabledTypes.insurance;
            }

            const customModeToggle = document.getElementById('custom-mode');
            if (customModeToggle) {
                customModeToggle.checked = this.customMode;
            }

            const darkModeToggle = document.getElementById('dark-mode');
            if (darkModeToggle) {
                darkModeToggle.checked = this.darkMode;
            }

            // Update custom mode inputs
            const tcFromInput = document.getElementById('custom-tc-from');
            if (tcFromInput) {
                tcFromInput.value = this.customTcFrom;
            }

            const tcToInput = document.getElementById('custom-tc-to');
            if (tcToInput) {
                tcToInput.value = this.customTcTo;
            }
        }
    }

    resetStats() {
        this.score = 0;
        this.streak = 0;
        this.bestStreak = 0;
        this.totalQuestions = 0;
        this.correctAnswers = 0;
        this.questionHistory = [];
        this.weakSpots = new Map();
        
        localStorage.removeItem('i18-trainer-stats');
        this.updateUI();
        this.renderStats();
    }

    renderSettings() {
        // Ensure all toggles reflect current state
        const explanationsToggle = document.getElementById('show-explanations');
        if (explanationsToggle) {
            explanationsToggle.checked = this.showExplanations;
        }

        const hardTotalsToggle = document.getElementById('enable-hard-totals');
        if (hardTotalsToggle) {
            hardTotalsToggle.checked = this.enabledTypes.hardTotals;
        }

        const doublesToggle = document.getElementById('enable-doubles');
        if (doublesToggle) {
            doublesToggle.checked = this.enabledTypes.doubles;
        }

        const pairsToggle = document.getElementById('enable-pairs');
        if (pairsToggle) {
            pairsToggle.checked = this.enabledTypes.pairs;
        }

        const insuranceToggle = document.getElementById('enable-insurance');
        if (insuranceToggle) {
            insuranceToggle.checked = this.enabledTypes.insurance;
        }

        const customModeToggle = document.getElementById('custom-mode');
        if (customModeToggle) {
            customModeToggle.checked = this.customMode;
        }

        const darkModeToggle = document.getElementById('dark-mode');
        if (darkModeToggle) {
            darkModeToggle.checked = this.darkMode;
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.trainer = new IllustriousTrainer();
});

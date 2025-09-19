class LifeOSApp {
    constructor() {
        this.currentTab = 'dashboard';
        this.charts = {};
        this.data = {
            health: [],
            productivity: [],
            mood: [],
            habits: []
        };
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadAllData();
        this.updateDashboard();
        this.setupCharts();
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Form submissions
        document.getElementById('health-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitHealthEntry();
        });

        document.getElementById('productivity-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitProductivityEntry();
        });

        document.getElementById('mood-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitMoodEntry();
        });

        document.getElementById('habits-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitHabitEntry();
        });
    }

    switchTab(tabName) {
        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        this.currentTab = tabName;

        // Load data for the specific tab
        if (tabName !== 'dashboard') {
            this.loadTabData(tabName);
        }
    }

    async loadAllData() {
        const types = ['health', 'productivity', 'mood', 'habits'];
        
        for (const type of types) {
            try {
                const response = await fetch(`/api/${type}`);
                this.data[type] = await response.json();
            } catch (error) {
                console.error(`Failed to load ${type} data:`, error);
                this.data[type] = [];
            }
        }
    }

    async loadTabData(type) {
        try {
            const response = await fetch(`/api/${type}`);
            this.data[type] = await response.json();
            this.renderEntries(type, this.data[type]);
        } catch (error) {
            console.error(`Failed to load ${type} data:`, error);
        }
    }

    async submitHealthEntry() {
        const formData = {
            score: parseInt(document.getElementById('health-score').value),
            sleepHours: parseFloat(document.getElementById('sleep-hours').value) || 0,
            exerciseMinutes: parseInt(document.getElementById('exercise-minutes').value) || 0,
            waterIntake: parseInt(document.getElementById('water-intake').value) || 0
        };

        await this.submitEntry('health', formData);
        document.getElementById('health-form').reset();
    }

    async submitProductivityEntry() {
        const formData = {
            score: parseInt(document.getElementById('productivity-score').value),
            focusHours: parseFloat(document.getElementById('focus-hours').value) || 0,
            tasksCompleted: parseInt(document.getElementById('tasks-completed').value) || 0,
            distractions: parseInt(document.getElementById('distractions').value) || 0
        };

        await this.submitEntry('productivity', formData);
        document.getElementById('productivity-form').reset();
    }

    async submitMoodEntry() {
        const formData = {
            score: parseInt(document.getElementById('mood-score').value),
            energyLevel: parseInt(document.getElementById('energy-level').value) || 0,
            stressLevel: parseInt(document.getElementById('stress-level').value) || 0,
            notes: document.getElementById('mood-notes').value.trim()
        };

        await this.submitEntry('mood', formData);
        document.getElementById('mood-form').reset();
    }

    async submitHabitEntry() {
        const formData = {
            name: document.getElementById('habit-name').value.trim(),
            completed: document.getElementById('habit-completed').checked,
            streak: parseInt(document.getElementById('habit-streak').value) || 0,
            notes: document.getElementById('habit-notes').value.trim()
        };

        await this.submitEntry('habits', formData);
        document.getElementById('habits-form').reset();
    }

    async submitEntry(type, data) {
        try {
            const response = await fetch(`/api/${type}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                this.showSuccessMessage(`${type} entry added successfully!`);
                await this.loadTabData(type);
                await this.loadAllData();
                this.updateDashboard();
                this.updateCharts();
            } else {
                throw new Error('Failed to save entry');
            }
        } catch (error) {
            console.error(`Failed to submit ${type} entry:`, error);
            alert(`Failed to save ${type} entry. Please try again.`);
        }
    }

    async deleteEntry(type, id) {
        if (!confirm('Are you sure you want to delete this entry?')) {
            return;
        }

        try {
            const response = await fetch(`/api/${type}/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await this.loadTabData(type);
                await this.loadAllData();
                this.updateDashboard();
                this.updateCharts();
            } else {
                throw new Error('Failed to delete entry');
            }
        } catch (error) {
            console.error(`Failed to delete ${type} entry:`, error);
            alert(`Failed to delete entry. Please try again.`);
        }
    }

    renderEntries(type, entries) {
        const container = document.getElementById(`${type}-entries`);
        
        if (!entries.length) {
            container.innerHTML = '<div class="empty-state">No entries yet. Add your first entry above!</div>';
            return;
        }

        const entriesHtml = entries
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10) // Show last 10 entries
            .map(entry => this.createEntryHtml(type, entry))
            .join('');

        container.innerHTML = entriesHtml;
    }

    createEntryHtml(type, entry) {
        const date = new Date(entry.timestamp).toLocaleDateString();
        const time = new Date(entry.timestamp).toLocaleTimeString();
        
        let content = '';
        
        switch (type) {
            case 'health':
                content = `
                    <div class="entry-data">Score: ${entry.score}/10</div>
                    <div class="entry-data">Sleep: ${entry.sleepHours}h | Exercise: ${entry.exerciseMinutes}min | Water: ${entry.waterIntake} glasses</div>
                `;
                break;
            case 'productivity':
                content = `
                    <div class="entry-data">Score: ${entry.score}/10</div>
                    <div class="entry-data">Focus: ${entry.focusHours}h | Tasks: ${entry.tasksCompleted} | Distractions: ${entry.distractions}</div>
                `;
                break;
            case 'mood':
                content = `
                    <div class="entry-data">Mood: ${entry.score}/10 | Energy: ${entry.energyLevel}/10 | Stress: ${entry.stressLevel}/10</div>
                    ${entry.notes ? `<div class="entry-notes">"${entry.notes}"</div>` : ''}
                `;
                break;
            case 'habits':
                content = `
                    <div class="entry-data">${entry.name} - ${entry.completed ? '✅ Completed' : '❌ Not Completed'}</div>
                    <div class="entry-data">Streak: ${entry.streak} days</div>
                    ${entry.notes ? `<div class="entry-notes">"${entry.notes}"</div>` : ''}
                `;
                break;
        }

        return `
            <div class="entry-item">
                <div class="entry-content">
                    <div class="entry-meta">${date} at ${time}</div>
                    ${content}
                </div>
                <button class="delete-btn" onclick="app.deleteEntry('${type}', ${entry.id})">Delete</button>
            </div>
        `;
    }

    updateDashboard() {
        // Calculate averages and trends
        const healthAvg = this.calculateAverage(this.data.health, 'score');
        const productivityAvg = this.calculateAverage(this.data.productivity, 'score');
        const moodAvg = this.calculateAverage(this.data.mood, 'score');
        const habitsCompletion = this.calculateHabitsCompletion();

        document.getElementById('health-avg').textContent = healthAvg;
        document.getElementById('productivity-avg').textContent = productivityAvg;
        document.getElementById('mood-avg').textContent = moodAvg;
        document.getElementById('habits-completion').textContent = habitsCompletion;

        // Update trends (simplified - just showing if above/below average)
        document.getElementById('health-trend').textContent = this.getTrend(this.data.health, 'score');
        document.getElementById('productivity-trend').textContent = this.getTrend(this.data.productivity, 'score');
        document.getElementById('mood-trend').textContent = this.getTrend(this.data.mood, 'score');
        document.getElementById('habits-trend').textContent = this.getHabitsTrend();
    }

    calculateAverage(data, field) {
        if (!data.length) return '-';
        const sum = data.reduce((acc, item) => acc + (item[field] || 0), 0);
        return (sum / data.length).toFixed(1);
    }

    calculateHabitsCompletion() {
        if (!this.data.habits.length) return '-';
        const completed = this.data.habits.filter(habit => habit.completed).length;
        return `${((completed / this.data.habits.length) * 100).toFixed(0)}%`;
    }

    getTrend(data, field) {
        if (data.length < 2) return 'No trend';
        
        const recent = data.slice(-3);
        const older = data.slice(-6, -3);
        
        const recentAvg = recent.reduce((acc, item) => acc + (item[field] || 0), 0) / recent.length;
        const olderAvg = older.length ? older.reduce((acc, item) => acc + (item[field] || 0), 0) / older.length : recentAvg;
        
        if (recentAvg > olderAvg) return '📈 Trending up';
        if (recentAvg < olderAvg) return '📉 Trending down';
        return '➡️ Stable';
    }

    getHabitsTrend() {
        if (this.data.habits.length < 2) return 'No trend';
        
        const recentCompleted = this.data.habits.slice(-3).filter(h => h.completed).length;
        const olderCompleted = this.data.habits.slice(-6, -3).filter(h => h.completed).length;
        
        if (recentCompleted > olderCompleted) return '📈 Improving';
        if (recentCompleted < olderCompleted) return '📉 Declining';
        return '➡️ Stable';
    }

    setupCharts() {
        this.createWeeklyChart();
        this.createMonthlyChart();
    }

    updateCharts() {
        if (this.charts.weekly) {
            this.charts.weekly.destroy();
        }
        if (this.charts.monthly) {
            this.charts.monthly.destroy();
        }
        this.setupCharts();
    }

    createWeeklyChart() {
        const ctx = document.getElementById('weeklyChart').getContext('2d');
        
        const last7Days = this.getLast7DaysData();
        
        this.charts.weekly = new Chart(ctx, {
            type: 'line',
            data: {
                labels: last7Days.labels,
                datasets: [
                    {
                        label: 'Health',
                        data: last7Days.health,
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Productivity',
                        data: last7Days.productivity,
                        borderColor: '#764ba2',
                        backgroundColor: 'rgba(118, 75, 162, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Mood',
                        data: last7Days.mood,
                        borderColor: '#38a169',
                        backgroundColor: 'rgba(56, 161, 105, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    }
                }
            }
        });
    }

    createMonthlyChart() {
        const ctx = document.getElementById('monthlyChart').getContext('2d');
        
        const monthlyData = this.getMonthlyAverages();
        
        this.charts.monthly = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Health', 'Productivity', 'Mood', 'Habits'],
                datasets: [{
                    label: 'Monthly Average',
                    data: [
                        monthlyData.health,
                        monthlyData.productivity,
                        monthlyData.mood,
                        monthlyData.habits
                    ],
                    backgroundColor: [
                        'rgba(102, 126, 234, 0.7)',
                        'rgba(118, 75, 162, 0.7)',
                        'rgba(56, 161, 105, 0.7)',
                        'rgba(245, 101, 101, 0.7)'
                    ],
                    borderColor: [
                        '#667eea',
                        '#764ba2',
                        '#38a169',
                        '#f56565'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    getLast7DaysData() {
        const labels = [];
        const health = [];
        const productivity = [];
        const mood = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            labels.push(date.toLocaleDateString('en', { weekday: 'short' }));
            
            // Find entries for this date
            const dayHealth = this.data.health.filter(entry => 
                entry.timestamp.startsWith(dateStr)
            );
            const dayProductivity = this.data.productivity.filter(entry => 
                entry.timestamp.startsWith(dateStr)
            );
            const dayMood = this.data.mood.filter(entry => 
                entry.timestamp.startsWith(dateStr)
            );

            health.push(dayHealth.length ? 
                dayHealth.reduce((acc, entry) => acc + entry.score, 0) / dayHealth.length : null
            );
            productivity.push(dayProductivity.length ? 
                dayProductivity.reduce((acc, entry) => acc + entry.score, 0) / dayProductivity.length : null
            );
            mood.push(dayMood.length ? 
                dayMood.reduce((acc, entry) => acc + entry.score, 0) / dayMood.length : null
            );
        }

        return { labels, health, productivity, mood };
    }

    getMonthlyAverages() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentHealth = this.data.health.filter(entry => 
            new Date(entry.timestamp) > thirtyDaysAgo
        );
        const recentProductivity = this.data.productivity.filter(entry => 
            new Date(entry.timestamp) > thirtyDaysAgo
        );
        const recentMood = this.data.mood.filter(entry => 
            new Date(entry.timestamp) > thirtyDaysAgo
        );
        const recentHabits = this.data.habits.filter(entry => 
            new Date(entry.timestamp) > thirtyDaysAgo
        );

        return {
            health: recentHealth.length ? 
                recentHealth.reduce((acc, entry) => acc + entry.score, 0) / recentHealth.length : 0,
            productivity: recentProductivity.length ? 
                recentProductivity.reduce((acc, entry) => acc + entry.score, 0) / recentProductivity.length : 0,
            mood: recentMood.length ? 
                recentMood.reduce((acc, entry) => acc + entry.score, 0) / recentMood.length : 0,
            habits: recentHabits.length ? 
                (recentHabits.filter(h => h.completed).length / recentHabits.length) * 10 : 0
        };
    }

    showSuccessMessage(message) {
        // Create success message element
        const messageEl = document.createElement('div');
        messageEl.className = 'success-message';
        messageEl.textContent = message;
        
        // Insert at top of main content
        const mainContent = document.querySelector('.main-content');
        mainContent.insertBefore(messageEl, mainContent.firstChild);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new LifeOSApp();
});
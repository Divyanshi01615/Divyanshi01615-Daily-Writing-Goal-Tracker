class Dashboard {
    constructor() {
        this.initializeState();
        this.initializeElements();
        this.initializeEventListeners();
        this.loadData();
        this.updateUI();
    }

    initializeState() {
        this.state = {
            wordCount: 0,
            wordGoal: 1000,
            streak: 0,
            lastWritingDay: null,
            streakDays: new Set(),
            notes: '',
            activeSection: 'overview'
        };
    }

    initializeElements() {
        // Progress elements
        this.wordCountElement = document.getElementById('wordCount');
        this.wordGoalElement = document.getElementById('wordGoal');
        this.wordInputElement = document.getElementById('wordInput');
        this.progressRing = document.querySelector('.progress-ring-circle');
        
        // Streak elements
        this.streakCountElement = document.getElementById('streakCount');
        this.streakDaysContainer = document.querySelector('.streak-days');
        
        // Notes elements
        this.quickNotesElement = document.getElementById('quickNotes');
        
        // Navigation
        this.navButtons = document.querySelectorAll('.nav-btn');
        this.sections = document.querySelectorAll('.dashboard-section');

        // Initialize progress ring
        const circle = this.progressRing;
        const radius = circle.r.baseVal.value;
        this.circumference = radius * 2 * Math.PI;
        circle.style.strokeDasharray = `${this.circumference} ${this.circumference}`;
        circle.style.strokeDashoffset = this.circumference;
    }

    initializeEventListeners() {
        // Word count input
        document.getElementById('addWords').addEventListener('click', () => this.addWords());
        this.wordInputElement.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addWords();
        });

        // Notes
        document.getElementById('saveNotes').addEventListener('click', () => this.saveNotes());

        // Navigation
        this.navButtons.forEach(btn => {
            btn.addEventListener('click', () => this.switchSection(btn.dataset.section));
        });

        // Auto-save notes while typing
        let timeout;
        this.quickNotesElement.addEventListener('input', () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => this.saveNotes(), 1000);
        });
    }

    addWords() {
        const input = this.wordInputElement;
        const words = parseInt(input.value);
        
        if (isNaN(words) || words < 0) return;

        this.state.wordCount += words;
        this.updateStreak();
        this.saveData();
        this.updateUI();
        input.value = '';
    }

    updateStreak() {
        const today = new Date().toDateString();
        
        if (this.state.lastWritingDay !== today) {
            this.state.lastWritingDay = today;
            this.state.streakDays.add(today);
            
            // Check if streak is continuous
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (this.state.streakDays.has(yesterday.toDateString())) {
                this.state.streak++;
            } else {
                this.state.streak = 1;
            }
        }
    }

    saveNotes() {
        this.state.notes = this.quickNotesElement.value;
        this.saveData();
    }

    switchSection(section) {
        this.state.activeSection = section;
        
        this.navButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.section === section);
        });
        
        this.sections.forEach(sec => {
            sec.classList.toggle('active', sec.id === section);
        });
    }

    setProgress(percent) {
        const offset = this.circumference - (percent / 100 * this.circumference);
        this.progressRing.style.strokeDashoffset = offset;
    }

    renderStreakCalendar() {
        this.streakDaysContainer.innerHTML = '';
        
        // Create last 28 days
        for (let i = 27; i >= 0; i--) {
            const day = new Date();
            day.setDate(day.getDate() - i);
            const dayString = day.toDateString();
            
            const dayElement = document.createElement('div');
            dayElement.className = 'streak-day';
            if (this.state.streakDays.has(dayString)) {
                dayElement.classList.add('active');
            }
            
            this.streakDaysContainer.appendChild(dayElement);
        }
    }

    updateUI() {
        // Update word count display
        this.wordCountElement.textContent = this.state.wordCount;
        this.wordGoalElement.textContent = this.state.wordGoal;
        
        // Update progress ring
        const progress = (this.state.wordCount / this.state.wordGoal) * 100;
        this.setProgress(Math.min(progress, 100));
        
        // Update streak
        this.streakCountElement.textContent = this.state.streak;
        this.renderStreakCalendar();
        
        // Update notes
        this.quickNotesElement.value = this.state.notes;
    }

    saveData() {
        const data = {
            wordCount: this.state.wordCount,
            wordGoal: this.state.wordGoal,
            streak: this.state.streak,
            lastWritingDay: this.state.lastWritingDay,
            streakDays: Array.from(this.state.streakDays),
            notes: this.state.notes
        };
        localStorage.setItem('dashboardData', JSON.stringify(data));
    }

    loadData() {
        const saved = localStorage.getItem('dashboardData');
        if (saved) {
            const data = JSON.parse(saved);
            this.state.wordCount = data.wordCount || 0;
            this.state.wordGoal = data.wordGoal || 1000;
            this.state.streak = data.streak || 0;
            this.state.lastWritingDay = data.lastWritingDay || null;
            this.state.streakDays = new Set(data.streakDays || []);
            this.state.notes = data.notes || '';
        }
    }
}

// Initialize dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new Dashboard();
});
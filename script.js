class Calendar {
    constructor() {
        this.currentDate = new Date();
        this.events = JSON.parse(localStorage.getItem('calendarEvents')) || {};
        this.selectedDate = null;
        
        this.initElements();
        this.initEventListeners();
        this.render();
    }

    initElements() {
        this.monthDisplay = document.getElementById('monthDisplay');
        this.calendar = document.getElementById('calendar');
        this.eventModal = document.getElementById('eventModal');
        this.eventForm = document.getElementById('eventForm');
        this.eventTitle = document.getElementById('eventTitle');
        this.eventType = document.getElementById('eventType');
    }

    initEventListeners() {
        document.getElementById('prevMonth').addEventListener('click', () => this.navigateMonth(-1));
        document.getElementById('nextMonth').addEventListener('click', () => this.navigateMonth(1));
        document.getElementById('cancelButton').addEventListener('click', () => this.closeModal());
        this.eventForm.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    navigateMonth(delta) {
        this.currentDate.setMonth(this.currentDate.getMonth() + delta);
        this.render();
    }

    formatDate(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    openModal(date) {
        this.selectedDate = date;
        this.eventModal.classList.add('show');
        this.eventTitle.value = '';
        this.eventType.value = 'writing';
        this.eventTitle.focus();
    }

    closeModal() {
        this.eventModal.classList.remove('show');
        this.selectedDate = null;
    }

    handleSubmit(e) {
        e.preventDefault();
        
        if (!this.selectedDate) return;

        const dateKey = this.formatDate(this.selectedDate);
        if (!this.events[dateKey]) {
            this.events[dateKey] = [];
        }

        const newEvent = {
            id: Date.now().toString(),
            title: this.eventTitle.value,
            type: this.eventType.value
        };

        this.events[dateKey].push(newEvent);
        localStorage.setItem('calendarEvents', JSON.stringify(this.events));
        
        this.closeModal();
        this.render();
    }

    deleteEvent(dateKey, eventId) {
        this.events[dateKey] = this.events[dateKey].filter(event => event.id !== eventId);
        if (this.events[dateKey].length === 0) {
            delete this.events[dateKey];
        }
        localStorage.setItem('calendarEvents', JSON.stringify(this.events));
        this.render();
    }

    render() {
        // Update month display
        const monthYear = this.currentDate.toLocaleString('default', { 
            month: 'long', 
            year: 'numeric' 
        });
        this.monthDisplay.textContent = monthYear;

        // Clear calendar
        this.calendar.innerHTML = '';

        const firstDay = new Date(
            this.currentDate.getFullYear(),
            this.currentDate.getMonth(),
            1
        ).getDay();

        const daysInMonth = new Date(
            this.currentDate.getFullYear(),
            this.currentDate.getMonth() + 1,
            0
        ).getDate();

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'day empty';
            this.calendar.appendChild(emptyDay);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'day';

            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = day;
            dayElement.appendChild(dayNumber);

            const date = new Date(
                this.currentDate.getFullYear(),
                this.currentDate.getMonth(),
                day
            );
            const dateKey = this.formatDate(date);

            // Add events for this day
            if (this.events[dateKey]) {
                this.events[dateKey].forEach(event => {
                    const eventElement = document.createElement('div');
                    eventElement.className = `event ${event.type}`;
                    
                    const eventText = document.createElement('span');
                    eventText.textContent = event.title;
                    eventElement.appendChild(eventText);

                    const deleteButton = document.createElement('button');
                    deleteButton.className = 'delete-button';
                    deleteButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`;
                    deleteButton.onclick = (e) => {
                        e.stopPropagation();
                        this.deleteEvent(dateKey, event.id);
                    };
                    eventElement.appendChild(deleteButton);

                    dayElement.appendChild(eventElement);
                });
            }

            dayElement.addEventListener('click', () => this.openModal(date));
            this.calendar.appendChild(dayElement);
        }
    }
}

// Initialize calendar when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Calendar();
});
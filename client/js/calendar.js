document.addEventListener("DOMContentLoaded", function () {
    const monthElement = document.querySelector(".month");
    const monthNameElement = document.querySelector(".month-name");
    const yearElement = document.querySelector(".year");
    const daysContainer = document.querySelector(".days");
    const prevBtn = document.getElementById("prev-month");
    const nextBtn = document.getElementById("next-month");

    const months = [
        "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
        "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
    ];

    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();

    function getReminders() {
        return fetch('http://127.0.0.1:8000/api/schedules')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("API Response:", data);
                if (Array.isArray(data)) {
                    return data.map(reminder => reminder.date);
                }
                return [];
            })
            .catch(error => {
                console.error('Error fetching reminders:', error);
                return [];
            });
    }

    function updateCalendar(reminderDates) {
        daysContainer.innerHTML = "";

        // Ensure reminderDates is an array
        if (!Array.isArray(reminderDates)) {
            reminderDates = [];
        }

        let firstDay = new Date(currentYear, currentMonth, 1).getDay();
        let lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();
        let prevLastDate = new Date(currentYear, currentMonth, 0).getDate();

        monthElement.textContent = (currentMonth + 1).toString().padStart(2, "0");
        monthNameElement.textContent = months[currentMonth];
        yearElement.textContent = currentYear;

        let dayIndex = firstDay === 0 ? 6 : firstDay - 1;

        for (let i = dayIndex; i > 0; i--) {
            let span = document.createElement("span");
            span.textContent = prevLastDate - i + 1;
            span.classList.add("prev-month");
            daysContainer.appendChild(span);
        }

        for (let i = 1; i <= lastDate; i++) {
            let span = document.createElement("span");
            span.textContent = i;

            const dateString = `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-${i.toString().padStart(2, "0")}`;
            span.setAttribute("data-date", dateString);

            if (reminderDates && reminderDates.includes(dateString)) {
                span.classList.add("reminder");
            }

            if (currentYear === currentDate.getFullYear() && currentMonth === currentDate.getMonth() && i === currentDate.getDate()) {
                span.classList.add("today");
            }

            daysContainer.appendChild(span);
        }

        let remainingDays = 42 - (dayIndex + lastDate);
        for (let i = 1; i <= remainingDays; i++) {
            let span = document.createElement("span");
            span.textContent = i;
            span.classList.add("next-month");
            daysContainer.appendChild(span);
        }
    }

    prevBtn.addEventListener("click", function () {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        getReminders().then(reminderDates => updateCalendar(reminderDates));
    });

    nextBtn.addEventListener("click", function () {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        getReminders().then(reminderDates => updateCalendar(reminderDates));
    });

    getReminders().then(reminderDates => updateCalendar(reminderDates));
});

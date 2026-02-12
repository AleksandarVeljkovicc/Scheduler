document.addEventListener("DOMContentLoaded", function () {
    const scheduleContainer = document.getElementById("schedule");
    const addButton = document.getElementById("add-button"); 

    function getTodayDate() {
        const today = new Date();
        return today.toISOString().split("T")[0]; 
    }

    function addReminderToHTML(reminder) {
        const wrapperDiv = document.createElement("div");
        wrapperDiv.classList.add("wrapper");
        wrapperDiv.setAttribute("data-id", reminder.id); 

        const removeButton = document.createElement("button");
        removeButton.classList.add("button-remove");
        removeButton.textContent = "-";

        const reminderDiv = document.createElement("div");
        reminderDiv.classList.add("schedule");

        const divTop = document.createElement("div");
        divTop.classList.add("div-top");

        const h2 = document.createElement("h2");
        h2.textContent = reminder.subject;

        const pDate = document.createElement("p");
        pDate.textContent = reminder.date;

        const hr = document.createElement("hr");

        const pMessage = document.createElement("p");
        pMessage.textContent = reminder.message;

        divTop.appendChild(h2);
        divTop.appendChild(pDate);
        reminderDiv.appendChild(divTop);
        reminderDiv.appendChild(hr);
        reminderDiv.appendChild(pMessage);

        wrapperDiv.appendChild(removeButton);
        wrapperDiv.appendChild(reminderDiv);

        if (addButton && scheduleContainer.contains(addButton)) {
            scheduleContainer.insertBefore(wrapperDiv, addButton);
        } else {
            scheduleContainer.appendChild(wrapperDiv);
        }

        removeButton.addEventListener("click", function () {
            const id = wrapperDiv.getAttribute("data-id"); 
            showScheduleRemovedPopup(); 
            document.getElementById("ok-button").addEventListener("click", function() {
                deleteReminder(id, wrapperDiv); 
            });
        });

        checkAndAddReminderText(pDate, reminderDiv);
    }

    function fetchReminders() {
        fetch("http://127.0.0.1:8000/api/schedules")
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                scheduleContainer.innerHTML = ""; 
                if (Array.isArray(data)) {
                    data.forEach(reminder => {
                        addReminderToHTML(reminder);
                    });
                }

                if (addButton) {
                    scheduleContainer.appendChild(addButton);
                }
            })
            .catch(error => {
                console.error("Error fetching reminders:", error);
                scheduleContainer.innerHTML = "";
                if (addButton) {
                    scheduleContainer.appendChild(addButton);
                }
            });
    }

    function checkAndAddReminderText(pDate, reminderDiv) {
        const todayDate = getTodayDate();

        if (pDate.textContent === todayDate) {
            const obligationText = document.createElement("span");
            obligationText.textContent = "Today's obligation"; 
            obligationText.classList.add("reminder-text");

            obligationText.style.color = "red"; 
            obligationText.style.fontWeight = "bold"; 

            reminderDiv.appendChild(obligationText);
        }
    }

    fetchReminders();

    function deleteReminder(id, wrapperDiv) {
        fetch(`http://127.0.0.1:8000/api/schedules/${id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        })
        .then(response => response.json())
        .then(() => {
            location.reload();
        })
        .catch(error => console.error("Error deleting reminder:", error));
    }

    function showScheduleRemovedPopup() {
        const overlay = document.getElementById("popup-overlay");
        const popup = document.getElementById("popup-schedule-removed");

        overlay.style.display = "block";
        popup.style.display = "block";

        document.getElementById("ok-button").addEventListener("click", function() {
            overlay.style.display = "none";
            popup.style.display = "none";
        });
    }
});

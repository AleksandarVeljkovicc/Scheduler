document.addEventListener("DOMContentLoaded", function () {
    const overlay = document.getElementById("edit-overlay");
    const popupForm = document.getElementById("edit-popup-form");
    const cancelButton = document.getElementById("edit-cancel");
    const saveButton = document.getElementById("edit-schedule"); 

    const popupOverlaySaved = document.getElementById("popup-overlay-saved");
    const popupOverlaySavedContainer = document.getElementById("popup-overlay-saved-container");
    const okButtonSaved = document.getElementById("ok-button-saved");

    document.getElementById("schedule").addEventListener("click", function (event) {
        
        const clickedElement = event.target.closest(".schedule");

        if (clickedElement) {
            const scheduleWrapper = clickedElement.closest('.wrapper');
            const scheduleId = scheduleWrapper ? scheduleWrapper.getAttribute('data-id') : null;

            if (!scheduleId) {
                console.error("Schedule ID not found");
                return;
            }

            const dateElement = clickedElement.querySelector(".div-top p");
            const messageElement = clickedElement.querySelector(":scope > p"); 

            document.getElementById("edit-subject").value = clickedElement.querySelector("h2").textContent;
            document.getElementById("edit-date").value = dateElement ? dateElement.textContent : "";
            document.getElementById("edit-message").value = messageElement ? messageElement.textContent : "";

            popupForm.style.display = "block";
            overlay.style.display = "block";

            saveButton.removeEventListener("click", saveHandler); 
            saveButton.addEventListener("click", saveHandler);

            function saveHandler() {
                const subject = document.getElementById("edit-subject").value;
                const date = document.getElementById("edit-date").value;
                const message = document.getElementById("edit-message").value;

                let errors = [];

                const subjectError = validateInput(subject);
                if (subjectError) {
                    errors.push({ field: 'edit-subject', message: subjectError });
                }

                const messageError = validateInput(message);
                if (messageError) {
                    errors.push({ field: 'edit-message', message: messageError });
                }

                if (!date) {
                    errors.push({ field: 'edit-date', message: "Please select a valid date" });
                }

                if (errors.length > 0) {
                    showErrors(errors);
                    return;
                }

                const data = {
                    subject: subject,
                    date: date,
                    message: message
                };

                fetch(`http://127.0.0.1:8000/api/schedule/edit/${scheduleId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                })
                .then(response => response.json())
                .then(result => {
                    popupForm.style.display = "none";
                    overlay.style.display = "none";

                    popupOverlaySavedContainer.style.display = "block";
                    popupOverlaySaved.style.display = "block"; 
                })
                .catch(error => {
                    console.error("JSON error:", error);
                });
            }

            function validateInput(value) {
                const forbiddenChars = /[<>']/;  
                if (forbiddenChars.test(value)) {
                    return "Field contains forbidden characters: <, >, '";
                }
                if (value.length < 3) {
                    return "Field must have at least 3 characters";
                }
                return null; 
            }

            function showErrors(errors) {
                const errorElements = document.querySelectorAll(".error-message");
                errorElements.forEach(el => el.remove());
                const inputElements = document.querySelectorAll(".error");
                inputElements.forEach(el => el.classList.remove("error"));

            errors.forEach(error => {
                const field = document.getElementById(error.field);
                const errorMessage = document.createElement("p");
                errorMessage.classList.add("error-message");
                errorMessage.textContent = error.message;
                field.classList.add("error");

                field.parentElement.appendChild(errorMessage);
            });
            }
        }
    });

    cancelButton.addEventListener("click", function () {
        popupForm.style.display = "none";
        overlay.style.display = "none";
    });

    overlay.addEventListener("click", function () {
        popupForm.style.display = "none";
        overlay.style.display = "none";
    });

    okButtonSaved.addEventListener("click", function () {
        popupOverlaySaved.style.display = "none"; 
        popupOverlaySavedContainer.style.display = "none"; 
        location.reload(); 
    });
});

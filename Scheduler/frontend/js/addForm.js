document.addEventListener("DOMContentLoaded", function () {
    const addButton = document.getElementById("add-button");
    const popupForm = document.getElementById("popup-form");
    const cancelButton = document.getElementById("cancel");
    const addScheduleButton = document.getElementById("add-schedule");
    const overlay = document.createElement("div");

    overlay.id = "overlay";
    document.body.appendChild(overlay);

    const popupOverlaySaved = document.getElementById("popup-overlay-saved");
    const popupOverlaySavedContainer = document.getElementById("popup-overlay-saved-container");
    const okButtonSaved = document.getElementById("ok-button-saved");

    function openModal() {
        popupForm.style.display = "block";
        overlay.style.display = "block";
        document.body.classList.add("modal-open");
    }

    function closeModal() {
        popupForm.style.display = "none";
        overlay.style.display = "none";
        document.body.classList.remove("modal-open");
    }

    function openPopupSaved() {
        popupOverlaySaved.style.display = "block"; 
        popupOverlaySavedContainer.style.display = "block"; 
    }

    function closePopupSaved() {
        popupOverlaySaved.style.display = "none"; 
        popupOverlaySavedContainer.style.display = "none"; 
        location.reload(); 
    }

    addButton.addEventListener("click", openModal);
    cancelButton.addEventListener("click", closeModal);
    overlay.addEventListener("click", closeModal);

    addScheduleButton.addEventListener("click", function () {
        const subject = document.getElementById("subject").value;
        const message = document.getElementById("message").value;
        const date = document.getElementById("date").value;

        let errors = [];

        const subjectError = validateInput(subject);
        if (subjectError) {
            errors.push({ field: 'subject', message: subjectError });
        }

        const messageError = validateInput(message);
        if (messageError) {
            errors.push({ field: 'message', message: messageError });
        }

        if (!date) {
            errors.push({ field: 'date', message: "Please select a valid date" });
        }

        if (errors.length > 0) {
            showErrors(errors);
            return;
        }

        const reminderData = {
            subject: subject,
            message: message,
            date: date
        };

        fetch('http://127.0.0.1:8000/api/schedule/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reminderData)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            closeModal(); 

            document.getElementById("subject").value = "";
            document.getElementById("message").value = "";
            document.getElementById("date").value = "";

            openPopupSaved();
        })
        .catch(error => console.error('Error:', error));
    });

    okButtonSaved.addEventListener("click", closePopupSaved);

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
});

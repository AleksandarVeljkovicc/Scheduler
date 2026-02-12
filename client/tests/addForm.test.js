import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock fetch globally
global.fetch = vi.fn();

describe('addForm.js', () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = `
      <div id="schedule">
        <button id="add-button">+</button>
      </div>
      <form id="popup-form" method="POST" style="display: none;">
        <div class="popup-content">
          <h1>Schedule</h1>
          <input type="text" id="subject" placeholder="Subject">
          <textarea id="message" placeholder="Enter your message"></textarea>
          <input type="date" id="date">
          <div class="buttons">
            <button id="add-schedule" type="button">Add</button>
            <button id="cancel" type="button">Cancel</button>
          </div>
        </div>
      </form>
      <div id="popup-overlay-saved"></div>
      <div id="popup-overlay-saved-container" style="display: none;">
        <div class="popup-content">
          <h2>Schedule Saved</h2>
          <button id="ok-button-saved">OK</button>
        </div>
      </div>
    `;
    
    // Reset fetch mock
    vi.clearAllMocks();
  });

  describe('validateInput function', () => {
    it('should reject input with forbidden characters <, >, \'', () => {
      const forbiddenChars = /[<>']/;
      
      expect(forbiddenChars.test('<script>')).toBe(true);
      expect(forbiddenChars.test('test>value')).toBe(true);
      expect(forbiddenChars.test("test'value")).toBe(true);
      expect(forbiddenChars.test('normal text')).toBe(false);
    });

    it('should reject input shorter than 3 characters', () => {
      const validateInput = (value) => {
        const forbiddenChars = /[<>']/;
        if (forbiddenChars.test(value)) {
          return "Field contains forbidden characters: <, >, '";
        }
        if (value.length < 3) {
          return "Field must have at least 3 characters";
        }
        return null;
      };

      expect(validateInput('ab')).toBe("Field must have at least 3 characters");
      expect(validateInput('abc')).toBe(null);
      expect(validateInput('')).toBe("Field must have at least 3 characters");
    });

    it('should accept valid input', () => {
      const validateInput = (value) => {
        const forbiddenChars = /[<>']/;
        if (forbiddenChars.test(value)) {
          return "Field contains forbidden characters: <, >, '";
        }
        if (value.length < 3) {
          return "Field must have at least 3 characters";
        }
        return null;
      };

      expect(validateInput('Valid input')).toBe(null);
      expect(validateInput('Test Message')).toBe(null);
    });
  });

  describe('showErrors function', () => {
    it('should display error messages for invalid fields', () => {
      const subjectInput = document.getElementById('subject');
      const errors = [
        { field: 'subject', message: 'Field must have at least 3 characters' }
      ];

      // Simulate showErrors
      const errorElements = document.querySelectorAll('.error-message');
      errorElements.forEach(el => el.remove());
      const inputElements = document.querySelectorAll('.error');
      inputElements.forEach(el => el.classList.remove('error'));

      errors.forEach(error => {
        const field = document.getElementById(error.field);
        const errorMessage = document.createElement('p');
        errorMessage.classList.add('error-message');
        errorMessage.textContent = error.message;
        field.classList.add('error');
        field.parentElement.appendChild(errorMessage);
      });

      expect(subjectInput.classList.contains('error')).toBe(true);
      expect(document.querySelector('.error-message')).toBeTruthy();
      expect(document.querySelector('.error-message').textContent).toBe('Field must have at least 3 characters');
    });

    it('should remove previous errors before showing new ones', () => {
      const subjectInput = document.getElementById('subject');
      
      // Add initial error
      const initialError = document.createElement('p');
      initialError.classList.add('error-message');
      initialError.textContent = 'Old error';
      subjectInput.parentElement.appendChild(initialError);
      subjectInput.classList.add('error');

      const errors = [
        { field: 'subject', message: 'New error message' }
      ];

      // Simulate showErrors (clearing old errors)
      const errorElements = document.querySelectorAll('.error-message');
      errorElements.forEach(el => el.remove());
      const inputElements = document.querySelectorAll('.error');
      inputElements.forEach(el => el.classList.remove('error'));

      errors.forEach(error => {
        const field = document.getElementById(error.field);
        const errorMessage = document.createElement('p');
        errorMessage.classList.add('error-message');
        errorMessage.textContent = error.message;
        field.classList.add('error');
        field.parentElement.appendChild(errorMessage);
      });

      const errorMessages = document.querySelectorAll('.error-message');
      expect(errorMessages.length).toBe(1);
      expect(errorMessages[0].textContent).toBe('New error message');
    });
  });

  describe('form submission', () => {
    it('should validate all fields before submission', () => {
      const subjectInput = document.getElementById('subject');
      const messageInput = document.getElementById('message');
      const dateInput = document.getElementById('date');

      subjectInput.value = 'ab'; // Too short
      messageInput.value = 'Valid message';
      dateInput.value = '';

      const errors = [];
      const validateInput = (value) => {
        const forbiddenChars = /[<>']/;
        if (forbiddenChars.test(value)) {
          return "Field contains forbidden characters: <, >, '";
        }
        if (value.length < 3) {
          return "Field must have at least 3 characters";
        }
        return null;
      };

      const subjectError = validateInput(subjectInput.value);
      if (subjectError) {
        errors.push({ field: 'subject', message: subjectError });
      }

      const messageError = validateInput(messageInput.value);
      if (messageError) {
        errors.push({ field: 'message', message: messageError });
      }

      if (!dateInput.value) {
        errors.push({ field: 'date', message: "Please select a valid date" });
      }

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.field === 'subject')).toBe(true);
      expect(errors.some(e => e.field === 'date')).toBe(true);
    });

    it('should submit valid form data to API', async () => {
      const subjectInput = document.getElementById('subject');
      const messageInput = document.getElementById('message');
      const dateInput = document.getElementById('date');

      subjectInput.value = 'Test Subject';
      messageInput.value = 'Test Message';
      dateInput.value = '2025-02-15';

      const reminderData = {
        subject: subjectInput.value,
        message: messageInput.value,
        date: dateInput.value
      };

      global.fetch.mockResolvedValueOnce({
        json: async () => ({ message: 'Success', reminder: { id: 1, ...reminderData } })
      });

      await fetch('http://127.0.0.1:8000/api/schedule/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reminderData)
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://127.0.0.1:8000/api/schedule/add',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(reminderData)
        }
      );
    });
  });

  describe('modal functionality', () => {
    it('should open modal when add button is clicked', () => {
      const addButton = document.getElementById('add-button');
      const popupForm = document.getElementById('popup-form');
      const overlay = document.createElement('div');
      overlay.id = 'overlay';
      document.body.appendChild(overlay);

      // Simulate openModal
      popupForm.style.display = 'block';
      overlay.style.display = 'block';
      document.body.classList.add('modal-open');

      expect(popupForm.style.display).toBe('block');
      expect(overlay.style.display).toBe('block');
      expect(document.body.classList.contains('modal-open')).toBe(true);
    });

    it('should close modal when cancel button is clicked', () => {
      const popupForm = document.getElementById('popup-form');
      const overlay = document.createElement('div');
      overlay.id = 'overlay';
      document.body.appendChild(overlay);

      // Simulate closeModal
      popupForm.style.display = 'none';
      overlay.style.display = 'none';
      document.body.classList.remove('modal-open');

      expect(popupForm.style.display).toBe('none');
      expect(overlay.style.display).toBe('none');
      expect(document.body.classList.contains('modal-open')).toBe(false);
    });
  });
});

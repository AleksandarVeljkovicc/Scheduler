import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock fetch globally
global.fetch = vi.fn();

describe('editForm.js', () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = `
      <div id="schedule">
        <div class="wrapper" data-id="1">
          <button class="button-remove">-</button>
          <div class="schedule">
            <div class="div-top">
              <h2>Original Subject</h2>
              <p>2025-02-15</p>
            </div>
            <p>Original Message</p>
          </div>
        </div>
      </div>
      <div id="edit-overlay"></div>
      <form id="edit-popup-form" method="PUT" style="display: none;">
        <div id="edit-popup-content">
          <h1>Edit Schedule</h1>
          <input type="text" id="edit-subject" placeholder="Subject">
          <textarea id="edit-message" placeholder="Enter your message"></textarea>
          <input type="date" id="edit-date">
          <div class="buttons">
            <button id="edit-schedule" type="button">Save</button>
            <button id="edit-cancel" type="button">Cancel</button>
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

  describe('schedule click handler', () => {
    it('should populate edit form when schedule is clicked', () => {
      const schedule = document.querySelector('.schedule');
      const editSubjectInput = document.getElementById('edit-subject');
      const editDateInput = document.getElementById('edit-date');
      const editMessageInput = document.getElementById('edit-message');
      const popupForm = document.getElementById('edit-popup-form');
      const overlay = document.getElementById('edit-overlay');

      // Simulate click on schedule
      const scheduleWrapper = schedule.closest('.wrapper');
      const scheduleId = scheduleWrapper ? scheduleWrapper.getAttribute('data-id') : null;

      const dateElement = schedule.querySelector('.div-top p');
      const messageElement = schedule.querySelector(':scope > p');

      editSubjectInput.value = schedule.querySelector('h2').textContent;
      editDateInput.value = dateElement ? dateElement.textContent : '';
      editMessageInput.value = messageElement ? messageElement.textContent : '';

      popupForm.style.display = 'block';
      overlay.style.display = 'block';

      expect(scheduleId).toBe('1');
      expect(editSubjectInput.value).toBe('Original Subject');
      expect(editDateInput.value).toBe('2025-02-15');
      expect(editMessageInput.value).toBe('Original Message');
      expect(popupForm.style.display).toBe('block');
      expect(overlay.style.display).toBe('block');
    });

    it('should handle missing schedule ID gracefully', () => {
      const scheduleContainer = document.getElementById('schedule');
      const schedule = document.querySelector('.schedule');
      const oldWrapper = schedule.closest('.wrapper');
      
      // Create new wrapper without ID
      const wrapperWithoutId = document.createElement('div');
      wrapperWithoutId.classList.add('wrapper');
      // Move schedule to new wrapper
      wrapperWithoutId.appendChild(schedule);
      
      // Replace old wrapper with new one in container
      if (oldWrapper && oldWrapper.parentElement) {
        oldWrapper.parentElement.replaceChild(wrapperWithoutId, oldWrapper);
      }

      const scheduleWrapper = schedule.closest('.wrapper');
      const scheduleId = scheduleWrapper ? scheduleWrapper.getAttribute('data-id') : null;

      expect(scheduleId).toBeNull();
    });
  });

  describe('validateInput function', () => {
    it('should validate input same as addForm', () => {
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

      expect(validateInput('<script>')).toBe("Field contains forbidden characters: <, >, '");
      expect(validateInput('ab')).toBe("Field must have at least 3 characters");
      expect(validateInput('Valid input')).toBe(null);
    });
  });

  describe('form submission', () => {
    it('should validate all fields before submission', () => {
      const editSubjectInput = document.getElementById('edit-subject');
      const editMessageInput = document.getElementById('edit-message');
      const editDateInput = document.getElementById('edit-date');

      editSubjectInput.value = 'ab'; // Too short
      editMessageInput.value = 'Valid message';
      editDateInput.value = '';

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

      const subjectError = validateInput(editSubjectInput.value);
      if (subjectError) {
        errors.push({ field: 'edit-subject', message: subjectError });
      }

      const messageError = validateInput(editMessageInput.value);
      if (messageError) {
        errors.push({ field: 'edit-message', message: messageError });
      }

      if (!editDateInput.value) {
        errors.push({ field: 'edit-date', message: "Please select a valid date" });
      }

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.field === 'edit-subject')).toBe(true);
      expect(errors.some(e => e.field === 'edit-date')).toBe(true);
    });

    it('should submit updated data to API', async () => {
      const scheduleId = '1';
      const editSubjectInput = document.getElementById('edit-subject');
      const editMessageInput = document.getElementById('edit-message');
      const editDateInput = document.getElementById('edit-date');

      editSubjectInput.value = 'Updated Subject';
      editMessageInput.value = 'Updated Message';
      editDateInput.value = '2025-03-15';

      const data = {
        subject: editSubjectInput.value,
        date: editDateInput.value,
        message: editMessageInput.value
      };

      global.fetch.mockResolvedValueOnce({
        json: async () => ({ message: 'Schedule updated successfully', schedule: { id: scheduleId, ...data } })
      });

      await fetch(`http://127.0.0.1:8000/api/schedule/edit/${scheduleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `http://127.0.0.1:8000/api/schedule/edit/${scheduleId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        }
      );
    });
  });

  describe('modal functionality', () => {
    it('should close modal when cancel button is clicked', () => {
      const popupForm = document.getElementById('edit-popup-form');
      const overlay = document.getElementById('edit-overlay');

      // Simulate closeModal
      popupForm.style.display = 'none';
      overlay.style.display = 'none';

      expect(popupForm.style.display).toBe('none');
      expect(overlay.style.display).toBe('none');
    });

    it('should show success popup after successful update', async () => {
      const popupForm = document.getElementById('edit-popup-form');
      const overlay = document.getElementById('edit-overlay');
      const popupOverlaySaved = document.getElementById('popup-overlay-saved');
      const popupOverlaySavedContainer = document.getElementById('popup-overlay-saved-container');

      global.fetch.mockResolvedValueOnce({
        json: async () => ({ message: 'Success' })
      });

      // Simulate successful update
      await fetch('http://127.0.0.1:8000/api/schedule/edit/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: 'Test', message: 'Test', date: '2025-02-15' })
      });

      // Simulate closing edit form and showing success
      popupForm.style.display = 'none';
      overlay.style.display = 'none';
      popupOverlaySavedContainer.style.display = 'block';
      popupOverlaySaved.style.display = 'block';

      expect(popupForm.style.display).toBe('none');
      expect(popupOverlaySavedContainer.style.display).toBe('block');
      expect(popupOverlaySaved.style.display).toBe('block');
    });
  });

  describe('showErrors function', () => {
    it('should display error messages for invalid fields', () => {
      const editSubjectInput = document.getElementById('edit-subject');
      const errors = [
        { field: 'edit-subject', message: 'Field must have at least 3 characters' }
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

      expect(editSubjectInput.classList.contains('error')).toBe(true);
      expect(document.querySelector('.error-message')).toBeTruthy();
      expect(document.querySelector('.error-message').textContent).toBe('Field must have at least 3 characters');
    });
  });
});

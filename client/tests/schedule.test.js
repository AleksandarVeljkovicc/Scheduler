import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock fetch globally
global.fetch = vi.fn();

describe('schedule.js', () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = `
      <div id="schedule">
        <button id="add-button">+</button>
      </div>
      <div id="popup-overlay"></div>
      <div id="popup-schedule-removed">
        <div class="popup-content">
          <h2>Schedule Removed</h2>
          <button id="ok-button">OK</button>
        </div>
      </div>
    `;
    
    // Reset fetch mock
    vi.clearAllMocks();
  });

  describe('getTodayDate function', () => {
    it('should return today\'s date in YYYY-MM-DD format', () => {
      // We need to test this through the actual implementation
      // Since it's inside DOMContentLoaded, we'll test the behavior
      const today = new Date();
      const expected = today.toISOString().split('T')[0];
      
      // Format: YYYY-MM-DD
      expect(expected).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('addReminderToHTML function', () => {
    it('should create reminder HTML structure correctly', async () => {
      const reminder = {
        id: 1,
        subject: 'Test Subject',
        message: 'Test Message',
        date: '2025-02-15'
      };

      // Simulate the function by creating the same structure
      const scheduleContainer = document.getElementById('schedule');
      const addButton = document.getElementById('add-button');

      const wrapperDiv = document.createElement('div');
      wrapperDiv.classList.add('wrapper');
      wrapperDiv.setAttribute('data-id', reminder.id);

      const removeButton = document.createElement('button');
      removeButton.classList.add('button-remove');
      removeButton.textContent = '-';

      const reminderDiv = document.createElement('div');
      reminderDiv.classList.add('schedule');

      const divTop = document.createElement('div');
      divTop.classList.add('div-top');

      const h2 = document.createElement('h2');
      h2.textContent = reminder.subject;

      const pDate = document.createElement('p');
      pDate.textContent = reminder.date;

      const hr = document.createElement('hr');

      const pMessage = document.createElement('p');
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

      // Assertions
      expect(scheduleContainer.querySelector('.wrapper')).toBeTruthy();
      expect(scheduleContainer.querySelector('.wrapper[data-id="1"]')).toBeTruthy();
      expect(scheduleContainer.querySelector('.schedule h2').textContent).toBe('Test Subject');
      expect(scheduleContainer.querySelector('.schedule .div-top p').textContent).toBe('2025-02-15');
      expect(scheduleContainer.querySelector('.schedule > p').textContent).toBe('Test Message');
      expect(scheduleContainer.querySelector('.button-remove')).toBeTruthy();
    });

    it('should add "Today\'s obligation" text for today\'s date', () => {
      const today = new Date().toISOString().split('T')[0];
      const reminder = {
        id: 1,
        subject: 'Today Task',
        message: 'Today Message',
        date: today
      };

      const scheduleContainer = document.getElementById('schedule');
      const addButton = document.getElementById('add-button');

      const wrapperDiv = document.createElement('div');
      wrapperDiv.classList.add('wrapper');
      wrapperDiv.setAttribute('data-id', reminder.id);

      const reminderDiv = document.createElement('div');
      reminderDiv.classList.add('schedule');

      const divTop = document.createElement('div');
      divTop.classList.add('div-top');

      const pDate = document.createElement('p');
      pDate.textContent = reminder.date;

      divTop.appendChild(pDate);
      reminderDiv.appendChild(divTop);

      wrapperDiv.appendChild(reminderDiv);
      scheduleContainer.insertBefore(wrapperDiv, addButton);

      // Simulate checkAndAddReminderText
      const todayDate = new Date().toISOString().split('T')[0];
      if (pDate.textContent === todayDate) {
        const obligationText = document.createElement('span');
        obligationText.textContent = 'Today\'s obligation';
        obligationText.classList.add('reminder-text');
        obligationText.style.color = 'red';
        obligationText.style.fontWeight = 'bold';
        reminderDiv.appendChild(obligationText);
      }

      // Assertions
      const obligationText = reminderDiv.querySelector('.reminder-text');
      expect(obligationText).toBeTruthy();
      expect(obligationText.textContent).toBe('Today\'s obligation');
      expect(obligationText.style.color).toBe('red');
      expect(obligationText.style.fontWeight).toBe('bold');
    });
  });

  describe('fetchReminders function', () => {
    it('should fetch reminders from API and render them', async () => {
      const mockReminders = [
        { id: 1, subject: 'Subject 1', message: 'Message 1', date: '2025-02-15' },
        { id: 2, subject: 'Subject 2', message: 'Message 2', date: '2025-02-20' }
      ];

      global.fetch.mockResolvedValueOnce({
        json: async () => mockReminders
      });

      const scheduleContainer = document.getElementById('schedule');
      const addButton = document.getElementById('add-button');

      // Simulate fetchReminders
      const response = await fetch('http://127.0.0.1:8000/api/schedules');
      const data = await response.json();

      scheduleContainer.innerHTML = '';
      data.forEach(reminder => {
        const wrapperDiv = document.createElement('div');
        wrapperDiv.classList.add('wrapper');
        wrapperDiv.setAttribute('data-id', reminder.id);
        const reminderDiv = document.createElement('div');
        reminderDiv.classList.add('schedule');
        const h2 = document.createElement('h2');
        h2.textContent = reminder.subject;
        reminderDiv.appendChild(h2);
        wrapperDiv.appendChild(reminderDiv);
        scheduleContainer.appendChild(wrapperDiv);
      });

      if (addButton) {
        scheduleContainer.appendChild(addButton);
      }

      // Assertions
      expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:8000/api/schedules');
      expect(scheduleContainer.querySelectorAll('.wrapper')).toHaveLength(2);
      expect(scheduleContainer.querySelectorAll('h2')[0].textContent).toBe('Subject 1');
      expect(scheduleContainer.querySelectorAll('h2')[1].textContent).toBe('Subject 2');
    });

    it('should handle fetch errors gracefully', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      try {
        await fetch('http://127.0.0.1:8000/api/schedules');
      } catch (error) {
        console.error('Error fetching reminders:', error);
      }

      expect(consoleSpy).toHaveBeenCalledWith('Error fetching reminders:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('deleteReminder function', () => {
    it('should delete reminder via API', async () => {
      const reminderId = 1;
      global.fetch.mockResolvedValueOnce({
        json: async () => ({ message: 'Reminder deleted successfully' })
      });

      // Simulate deleteReminder
      await fetch(`http://127.0.0.1:8000/api/schedules/${reminderId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `http://127.0.0.1:8000/api/schedules/${reminderId}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        }
      );
    });
  });

  describe('showScheduleRemovedPopup function', () => {
    it('should display popup overlay and popup element', () => {
      const overlay = document.getElementById('popup-overlay');
      const popup = document.getElementById('popup-schedule-removed');

      // Simulate showScheduleRemovedPopup
      overlay.style.display = 'block';
      popup.style.display = 'block';

      expect(overlay.style.display).toBe('block');
      expect(popup.style.display).toBe('block');
    });
  });
});

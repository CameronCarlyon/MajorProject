import { addManagedEventListener, runManagedCleanups } from './shared.js';

export class CustomSelectManager {
  constructor() {
    this.selects = [];
    this.documentListenerBound = false;
    this.cleanups = [];
    this.initializeCustomSelects();
  }

  addManagedListener(target, type, handler, options) {
    addManagedEventListener(target, type, handler, options, this.cleanups);
  }

  destroy() {
    runManagedCleanups(this.cleanups);
    this.selects.forEach((select) => {
      delete select.dataset.selectInitialized;
    });
  }

  getOptionsContainer(select) {
    return select.querySelector('.airport-autocomplete-dropdown');
  }

  getOptions(select) {
    return Array.from(select.querySelectorAll('.airport-autocomplete-item'));
  }

  isOptionTarget(target) {
    return Boolean(target.closest('.airport-autocomplete-item'));
  }

  setDropdownOpen(select, isOpen) {
    const optionsContainer = this.getOptionsContainer(select);
    if (optionsContainer) {
      optionsContainer.classList.toggle('open', isOpen);
    }
  }

  clearSelectError(select) {
    if (!select.classList.contains('input-error')) return;
    select.classList.remove('input-error');
    select.setAttribute('aria-invalid', 'false');
  }

  initializeCustomSelects() {
    this.selects = Array.from(document.querySelectorAll('.custom-select')).filter((select) => select.id !== 'date-picker');

    this.selects.forEach((select, index) => {
      if (select.dataset.selectInitialized === 'true') {
        return;
      }

      const trigger = select.querySelector('.custom-select-trigger');
      const optionsContainer = this.getOptionsContainer(select);
      const options = this.getOptions(select);

      if (!trigger || !optionsContainer || !options.length) {
        return;
      }

      const listboxId = optionsContainer.id || `${select.id || `custom-select-${index}`}-listbox`;
      optionsContainer.id = listboxId;
      optionsContainer.setAttribute('role', 'listbox');
      select.setAttribute('aria-controls', listboxId);
      select.setAttribute('aria-expanded', 'false');

      options.forEach((option, optionIndex) => {
        option.id = option.id || `${listboxId}-option-${optionIndex}`;
        option.setAttribute('aria-selected', 'false');
        option.dataset.index = String(optionIndex);

        this.addManagedListener(option, 'click', (event) => {
          event.stopPropagation();
          this.selectOption(select, option);
        });
      });

      this.addManagedListener(select, 'click', (event) => {
        if (this.isOptionTarget(event.target)) {
          return;
        }

        event.stopPropagation();
        this.clearSelectError(select);
        this.toggleSelect(select);
      });

      this.addManagedListener(select, 'keydown', (event) => {
        this.handleSelectKeydown(event, select);
      });

      const selectedIndex = this.getSelectedIndex(select);
      if (selectedIndex >= 0) {
        this.selectOption(select, options[selectedIndex], false);
      } else {
        this.setActiveOption(select, 0);
      }

      select.dataset.selectInitialized = 'true';
    });

    if (!this.documentListenerBound) {
      this.addManagedListener(document, 'click', (e) => {
        if (!e.target.closest('.custom-select')) {
          this.selects.forEach((select) => {
            this.closeSelect(select);
          });
        }
      });
      this.documentListenerBound = true;
    }
  }

  getSelectedIndex(select) {
    const selectedValue = select.getAttribute('data-value');
    return this.getOptions(select).findIndex((option) => option.getAttribute('data-value') === selectedValue);
  }

  getActiveIndex(select) {
    const activeIndex = Number.parseInt(select.dataset.activeIndex || '', 10);
    if (Number.isInteger(activeIndex)) {
      return activeIndex;
    }

    const selectedIndex = this.getSelectedIndex(select);
    return selectedIndex >= 0 ? selectedIndex : 0;
  }

  setActiveOption(select, index) {
    const options = this.getOptions(select);
    if (!options.length) {
      return;
    }

    const wrappedIndex = ((index % options.length) + options.length) % options.length;
    select.dataset.activeIndex = String(wrappedIndex);

    options.forEach((option, optionIndex) => {
      const isActive = optionIndex === wrappedIndex;
      option.classList.toggle('is-active', isActive);
      if (isActive) {
        select.setAttribute('aria-activedescendant', option.id);
        option.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  syncSelectedOption(select, selectedOption) {
    this.getOptions(select).forEach((option) => {
      option.setAttribute('aria-selected', String(option === selectedOption));
    });
  }

  openSelect(select) {
    this.selects.forEach((other) => {
      if (other !== select) {
        this.closeSelect(other);
      }
    });

    select.classList.add('open');
    this.setDropdownOpen(select, true);
    select.setAttribute('aria-expanded', 'true');
    this.setActiveOption(select, this.getActiveIndex(select));
  }

  closeSelect(select) {
    select.classList.remove('open');
    this.setDropdownOpen(select, false);
    select.setAttribute('aria-expanded', 'false');
    select.removeAttribute('aria-activedescendant');
    this.getOptions(select).forEach((option) => {
      option.classList.remove('is-active');
    });
  }

  toggleSelect(select) {
    if (select.classList.contains('open')) {
      this.closeSelect(select);
      return;
    }

    this.openSelect(select);
  }

  selectOption(select, option, restoreFocus = true) {
    const trigger = select.querySelector('.custom-select-trigger');
    if (!trigger || !option) {
      return;
    }

    const value = option.getAttribute('data-value') || '';
    const text = option.getAttribute('data-label') || option.textContent.replace(/\s+/g, ' ').trim();
    const options = this.getOptions(select);

    trigger.textContent = text;
    select.setAttribute('data-value', value);
    select.classList.toggle('has-value', value !== '');
    select.setAttribute('aria-invalid', 'false');

    this.syncSelectedOption(select, option);
    this.setActiveOption(select, options.indexOf(option));
    this.clearSelectError(select);
    this.closeSelect(select);
    select.dispatchEvent(new Event('change', { bubbles: true }));

    if (restoreFocus) {
      select.focus();
    }
  }

  handleSelectKeydown(event, select) {
    const options = this.getOptions(select);
    if (!options.length) {
      return;
    }

    const isOpen = select.classList.contains('open');
    const activeIndex = this.getActiveIndex(select);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          this.openSelect(select);
          return;
        }
        this.setActiveOption(select, activeIndex + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          this.openSelect(select);
          return;
        }
        this.setActiveOption(select, activeIndex - 1);
        break;
      case 'Home':
        event.preventDefault();
        if (!isOpen) {
          this.openSelect(select);
        }
        this.setActiveOption(select, 0);
        break;
      case 'End':
        event.preventDefault();
        if (!isOpen) {
          this.openSelect(select);
        }
        this.setActiveOption(select, options.length - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!isOpen) {
          this.openSelect(select);
          return;
        }
        this.selectOption(select, options[activeIndex]);
        break;
      case 'Escape':
        if (isOpen) {
          event.preventDefault();
          this.closeSelect(select);
        }
        break;
      case 'Tab':
        this.closeSelect(select);
        break;
      default:
        break;
    }
  }
}

export class DatePickerManager {
  constructor() {
    this.cleanups = [];
    this.currentDate = new Date();
    this.selectedDate = null;
    this.rangeStart = null;
    this.rangeEnd = null;
    this.isReturnJourney = false;
    this.suppressNextClick = false;
    this.datePicker = document.getElementById('date-picker');
    if (this.datePicker) {
      this.init();
    }
  }

  addManagedListener(target, type, handler, options) {
    addManagedEventListener(target, type, handler, options, this.cleanups);
  }

  destroy() {
    runManagedCleanups(this.cleanups);
  }

  clearDatePickerError() {
    if (!this.datePicker.classList.contains('input-error')) {
      return;
    }

    this.datePicker.classList.remove('input-error');
    this.datePicker.setAttribute('aria-invalid', 'false');
  }

  openCalendar({ focusTarget = false } = {}) {
    this.clearDatePickerError();
    document.querySelectorAll('.custom-select.open').forEach((other) => {
      if (other !== this.datePicker) {
        other.classList.remove('open');
        other.setAttribute('aria-expanded', 'false');
      }
    });

    this.datePicker.classList.add('open');
    this.datePicker.setAttribute('aria-expanded', 'true');
    this.pendingDateFocus = focusTarget;
    this.renderCalendar();
  }

  closeCalendar({ returnFocus = false } = {}) {
    this.datePicker.classList.remove('open');
    this.datePicker.setAttribute('aria-expanded', 'false');

    if (returnFocus) {
      this.datePicker.focus();
    }
  }

  focusSelectableDate() {
    const preferredDay = this.datePicker.querySelector(
      '.date-day.selected, .date-day.range-start, .date-day.range-end, .date-day.today:not(:disabled), .date-day:not(:disabled)'
    );

    if (preferredDay) {
      preferredDay.focus();
      return true;
    }

    return false;
  }

  handleDayKeydown(event, dayElement) {
    const navigationKeys = {
      ArrowRight: 1,
      ArrowLeft: -1,
      ArrowDown: 7,
      ArrowUp: -7
    };

    if (!navigationKeys[event.key] && event.key !== 'Home' && event.key !== 'End') {
      return;
    }

    const focusableDays = Array.from(this.datePicker.querySelectorAll('.date-day:not(:disabled)'));
    const currentIndex = focusableDays.indexOf(dayElement);
    if (currentIndex === -1) {
      return;
    }

    event.preventDefault();

    let nextIndex = currentIndex;
    if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = focusableDays.length - 1;
    } else {
      nextIndex = Math.min(
        Math.max(currentIndex + navigationKeys[event.key], 0),
        focusableDays.length - 1
      );
    }

    focusableDays[nextIndex]?.focus();
  }

  init() {
    this.dropdown = this.datePicker.querySelector('.date-picker-dropdown');
    if (this.dropdown) {
      this.dropdown.id = this.dropdown.id || 'date-picker-dropdown';
      this.dropdown.setAttribute('role', 'dialog');
      this.dropdown.setAttribute('aria-modal', 'false');
      this.dropdown.setAttribute('aria-label', 'Choose travel dates');
      this.datePicker.setAttribute('aria-controls', this.dropdown.id);
    }

    const journeyOptions = document.querySelectorAll('input[name="journey-type"]');
    if (journeyOptions.length) {
      const selectedOption = document.querySelector('input[name="journey-type"]:checked');
      this.isReturnJourney = selectedOption ? selectedOption.value === 'return' : false;
      journeyOptions.forEach((option) => {
        this.addManagedListener(option, 'change', (e) => {
          this.isReturnJourney = e.target.value === 'return';
          this.selectedDate = null;
          this.rangeStart = null;
          this.rangeEnd = null;
          this.renderCalendar();
          this.updateTrigger();
        });
      });
    }
    this.updateTrigger();

    this.addManagedListener(this.datePicker, 'click', (e) => {
      if (this.suppressNextClick) {
        this.suppressNextClick = false;
        e.preventDefault();
        return;
      }

      if (!e.target.closest('.date-picker-dropdown')) {
        e.stopPropagation();
        if (this.datePicker.classList.contains('open')) {
          this.closeCalendar();
        } else {
          this.openCalendar();
        }
      }
    });

    this.addManagedListener(this.datePicker, 'keydown', (event) => {
      if (event.target !== this.datePicker) {
        return;
      }

      switch (event.key) {
        case 'ArrowDown':
        case 'Enter':
        case ' ':
          event.preventDefault();
          event.stopPropagation();
          this.suppressNextClick = event.key === 'Enter' || event.key === ' ';
          this.openCalendar({ focusTarget: true });
          break;
        case 'Escape':
          if (this.datePicker.classList.contains('open')) {
            event.preventDefault();
            this.closeCalendar({ returnFocus: true });
          }
          break;
        case 'Tab':
          if (this.datePicker.classList.contains('open')) {
            this.closeCalendar();
          }
          break;
        default:
          break;
      }
    });

    this.addManagedListener(this.datePicker, 'keyup', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.stopPropagation();
      }
    });

    if (this.dropdown) {
      this.addManagedListener(this.dropdown, 'keydown', (event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          this.closeCalendar({ returnFocus: true });
        }
      });
    }

    this.addManagedListener(document, 'click', (e) => {
      if (!this.datePicker.contains(e.target)) {
        this.closeCalendar();
      }
    });
  }

  renderCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    const calendarContainer = this.datePicker.querySelector('.date-picker-calendar');
    calendarContainer.innerHTML = '';

    const monthsWrapper = document.createElement('div');
    monthsWrapper.className = 'date-picker-months-wrapper';

    const headerRow = document.createElement('div');
    headerRow.className = 'date-picker-header';
    headerRow.style.justifyContent = 'space-between';
    headerRow.style.alignItems = 'center';
    headerRow.style.marginBottom = 'var(--spacing-md)';
    headerRow.style.padding = '0 var(--spacing-sm)';

    const previousMonthButton = document.createElement('button');
    previousMonthButton.type = 'button';
    previousMonthButton.className = 'date-nav-btn';
    previousMonthButton.id = 'prev-month';
    previousMonthButton.setAttribute('aria-label', 'Show previous month');
    previousMonthButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 19l-7-7 7-7"/></svg>';
    previousMonthButton.addEventListener('click', (event) => {
      event.stopPropagation();
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      this.renderCalendar();
    });

    const headerSpan = document.createElement('span');
    headerSpan.style.flex = '1 1 0';
    headerSpan.style.textAlign = 'center';
    headerSpan.textContent = `${monthNames[month]} ${year}`;

    const nextMonthButton = document.createElement('button');
    nextMonthButton.type = 'button';
    nextMonthButton.className = 'date-nav-btn';
    nextMonthButton.id = 'next-month';
    nextMonthButton.setAttribute('aria-label', 'Show next month');
    nextMonthButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>';
    nextMonthButton.addEventListener('click', (event) => {
      event.stopPropagation();
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      this.renderCalendar();
    });

    headerRow.appendChild(previousMonthButton);
    headerRow.appendChild(headerSpan);
    headerRow.appendChild(nextMonthButton);
    calendarContainer.appendChild(headerRow);

    const renderMonth = (y, m) => {
      const monthDiv = document.createElement('div');
      monthDiv.className = 'date-picker-month';
      const weekdays = document.createElement('div');
      weekdays.className = 'date-picker-weekdays';
      ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].forEach((d) => {
        const wd = document.createElement('div');
        wd.textContent = d;
        weekdays.appendChild(wd);
      });
      monthDiv.appendChild(weekdays);

      const daysGrid = document.createElement('div');
      daysGrid.className = 'date-picker-days';
      const firstDay = new Date(y, m, 1).getDay();
      const daysInMonth = new Date(y, m + 1, 0).getDate();
      const daysInPrevMonth = new Date(y, m, 0).getDate();

      for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dayEl = this.createDayElement(day, true, y, m - 1);
        daysGrid.appendChild(dayEl);
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const dateObj = new Date(y, m, day);
        dateObj.setHours(0, 0, 0, 0);
        const dayEl = this.createDayElement(day, false, y, m, dateObj);
        daysGrid.appendChild(dayEl);
      }
      monthDiv.appendChild(daysGrid);
      monthsWrapper.appendChild(monthDiv);
    };

    renderMonth(year, month);
    calendarContainer.appendChild(monthsWrapper);

    if (this.pendingDateFocus) {
      this.pendingDateFocus = false;
      const didFocus = this.focusSelectableDate();
      if (!didFocus) {
        window.requestAnimationFrame(() => {
          this.focusSelectableDate();
        });
      }
    }
  }

  createDayElement(day, isOtherMonth, year, month, dateObjOverride) {
    const dayEl = document.createElement('button');
    dayEl.type = 'button';
    dayEl.className = 'date-day';
    dayEl.textContent = day;
    if (isOtherMonth) {
      dayEl.classList.add('other-month');
    }

    let dateObj = dateObjOverride || new Date(year, month, day);
    dateObj.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let isSelectedDay = false;
    const ariaLabelStates = [];

    if (dateObj < today) {
      dayEl.classList.add('unselectable');
      dayEl.disabled = true;
      dayEl.setAttribute('aria-disabled', 'true');
      ariaLabelStates.push('Unavailable');
    }
    if (dateObj.getTime() === today.getTime()) {
      dayEl.classList.add('today');
      dayEl.setAttribute('aria-current', 'date');
      ariaLabelStates.push('Today');
    }

    if (this.isReturnJourney && this.rangeStart && this.rangeEnd) {
      const t = dateObj.getTime();
      const start = this.rangeStart.getTime();
      const end = this.rangeEnd.getTime();
      if (t === start) {
        dayEl.classList.add('range-start');
        isSelectedDay = true;
        ariaLabelStates.push('Departure date');
      }
      if (t === end) {
        dayEl.classList.add('range-end');
        isSelectedDay = true;
        ariaLabelStates.push('Return date');
      }
      if (t > start && t < end) {
        dayEl.classList.add('range');
        ariaLabelStates.push('Within selected range');
      }
    } else if (!this.isReturnJourney && this.selectedDate) {
      if (dateObj.getTime() === this.selectedDate.getTime()) {
        dayEl.classList.add('selected');
        isSelectedDay = true;
        ariaLabelStates.push('Selected');
      }
    } else if (this.isReturnJourney && this.rangeStart && !this.rangeEnd) {
      if (dateObj.getTime() === this.rangeStart.getTime()) {
        dayEl.classList.add('range-start');
        isSelectedDay = true;
        ariaLabelStates.push('Departure date');
      }
    }

    if (isOtherMonth) {
      ariaLabelStates.push('Outside current month');
    }

    dayEl.setAttribute(
      'aria-label',
      `${dateObj.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })}${ariaLabelStates.length ? `. ${ariaLabelStates.join('. ')}` : ''}`
    );
    dayEl.setAttribute('aria-pressed', String(isSelectedDay));

    dayEl.addEventListener('click', (e) => {
      if (dateObj < today) return;
      e.stopPropagation();
      this.handleDateClick(year, month, day);
    });

    dayEl.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.handleDateClick(year, month, day);
        if (!this.isReturnJourney || this.rangeEnd) {
          this.closeCalendar({ returnFocus: true });
        }
        return;
      }

      this.handleDayKeydown(event, dayEl);
    });

    return dayEl;
  }

  handleDateClick(year, month, day) {
    const clickedDate = new Date(year, month, day);
    clickedDate.setHours(0, 0, 0, 0);
    let shouldCloseCalendar = false;

    if (this.isReturnJourney) {
      if (!this.rangeStart || (this.rangeStart && this.rangeEnd)) {
        this.rangeStart = clickedDate;
        this.rangeEnd = null;
      } else if (!this.rangeEnd) {
        if (clickedDate.getTime() === this.rangeStart.getTime()) {
          this.renderCalendar();
          return;
        }

        if (clickedDate < this.rangeStart) {
          this.rangeEnd = this.rangeStart;
          this.rangeStart = clickedDate;
        } else {
          this.rangeEnd = clickedDate;
        }
        shouldCloseCalendar = true;
      }
      this.updateTrigger();
    } else {
      this.selectedDate = clickedDate;
      this.updateTrigger();
      shouldCloseCalendar = true;
    }
    this.renderCalendar();
    this.datePicker.dispatchEvent(new Event('change', { bubbles: true }));

    if (shouldCloseCalendar) {
      this.closeCalendar({ returnFocus: true });
    }
  }

  getOrdinalSuffix(day) {
    const mod10 = day % 10;
    const mod100 = day % 100;

    if (mod10 === 1 && mod100 !== 11) return 'st';
    if (mod10 === 2 && mod100 !== 12) return 'nd';
    if (mod10 === 3 && mod100 !== 13) return 'rd';
    return 'th';
  }

  formatDisplayDate(date) {
    if (!date) {
      return '';
    }

    const day = date.getDate();
    const month = date.toLocaleString('en-GB', { month: 'long' });
    const year = date.getFullYear();

    return `${day}${this.getOrdinalSuffix(day)} ${month} ${year}`;
  }

  renderTriggerColumns(columns) {
    const trigger = this.datePicker.querySelector('.custom-select-trigger');
    trigger.textContent = '';

    const layout = document.createElement('span');
    layout.className = `date-picker-trigger-layout${columns.length === 1 ? ' is-single' : ''}`;

    columns.forEach(({ label, value, isPlaceholder = false }) => {
      const column = document.createElement('span');
      column.className = 'date-picker-trigger-column';

      const labelElement = document.createElement('span');
      labelElement.className = 'date-picker-trigger-label';
      labelElement.textContent = label;

      const valueElement = document.createElement('span');
      valueElement.className = `date-picker-trigger-value${isPlaceholder ? ' is-placeholder' : ''}`;
      valueElement.textContent = value;

      column.appendChild(labelElement);
      column.appendChild(valueElement);
      layout.appendChild(column);
    });

    trigger.appendChild(layout);
  }

  updateTrigger() {
    if (this.isReturnJourney) {
      if (this.rangeStart && this.rangeEnd) {
        this.renderTriggerColumns([
          { label: 'Departing', value: this.formatDisplayDate(this.rangeStart) },
          { label: 'Returning', value: this.formatDisplayDate(this.rangeEnd) }
        ]);
        this.datePicker.classList.add('has-value');
        this.datePicker.setAttribute('data-value', `${this.rangeStart.toISOString()}|${this.rangeEnd.toISOString()}`);
      } else if (this.rangeStart) {
        this.renderTriggerColumns([
          { label: 'Departing', value: this.formatDisplayDate(this.rangeStart) },
          { label: 'Returning', value: 'Select date', isPlaceholder: true }
        ]);
        this.datePicker.classList.add('has-value');
        this.datePicker.setAttribute('data-value', '');
      } else {
        this.renderTriggerColumns([
          { label: 'Departing and Returning', value: 'Select dates', isPlaceholder: true }
        ]);
        this.datePicker.classList.remove('has-value');
        this.datePicker.setAttribute('data-value', '');
      }
    } else {
      if (this.selectedDate) {
        this.renderTriggerColumns([
          { label: 'Departing', value: this.formatDisplayDate(this.selectedDate) }
        ]);
        this.datePicker.classList.add('has-value');
        this.datePicker.setAttribute('data-value', this.selectedDate.toISOString());
      } else {
        this.renderTriggerColumns([
          { label: 'Departing', value: 'Select date', isPlaceholder: true }
        ]);
        this.datePicker.classList.remove('has-value');
        this.datePicker.setAttribute('data-value', '');
      }
    }
  }
}
/**
 * Form Validation System
 * Industry-standard form validation with accessibility support
 */
class FormValidator {
  constructor(tabProgressManager) {
    this.tabProgressManager = tabProgressManager;
    this.initializeForms();
  }

  initializeForms() {
    this.setupFlightSearchForm();
    this.setupPassengerForm();
    this.setupSeatingForm();
  }

  /**
   * Show error message on input field
   */
  showError(input, errorElement, message) {
    input.classList.add('input-error');
    input.setAttribute('aria-invalid', 'true');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.add('visible');
    }
  }

  /**
   * Clear error message from input field
   */
  clearError(input, errorElement) {
    input.classList.remove('input-error');
    input.setAttribute('aria-invalid', 'false');
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.classList.remove('visible');
    }
  }

  /**
   * Validate required field
   */
  validateRequired(input, errorElement, fieldName) {
    const value = input.value.trim();
    if (!value) {
      this.showError(input, errorElement, `${fieldName} is required`);
      return false;
    }
    this.clearError(input, errorElement);
    return true;
  }

  /**
   * Validate input against pattern attribute
   */
  validatePattern(input, errorElement, fieldName) {
    const pattern = input.getAttribute('pattern');
    if (pattern && input.value.trim()) {
      const regex = new RegExp(pattern);
      if (!regex.test(input.value.trim())) {
        this.showError(input, errorElement, `Please enter a valid ${fieldName.toLowerCase()}`);
        return false;
      }
    }
    this.clearError(input, errorElement);
    return true;
  }

  /**
   * Validate minimum length
   */
  validateMinLength(input, errorElement, fieldName) {
    const minLength = parseInt(input.getAttribute('minlength'));
    if (minLength && input.value.trim().length < minLength) {
      this.showError(input, errorElement, `${fieldName} must be at least ${minLength} characters`);
      return false;
    }
    return true;
  }

  /**
   * Validate custom select dropdown
   */
  validateCustomSelect(selectElement, errorElement, fieldName) {
    const value = selectElement.getAttribute('data-value');
    if (!value || value === '') {
      selectElement.classList.add('input-error');
      if (errorElement) {
        errorElement.textContent = `Please select a ${fieldName.toLowerCase()}`;
        errorElement.classList.add('visible');
      }
      return false;
    }
    selectElement.classList.remove('input-error');
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.classList.remove('visible');
    }
    return true;
  }

  /**
   * Setup flight search form validation
   */
  setupFlightSearchForm() {
    const form = document.getElementById('flight-search-form');
    if (!form) {
      console.warn('Flight search form not found');
      return;
    }

    const fromInput = document.getElementById('airport-from-input');
    const toInput = document.getElementById('airport-to-input');
    const datePicker = document.getElementById('date-picker');
    
    const fromError = document.getElementById('airport-from-error');
    const toError = document.getElementById('airport-to-error');
    const dateError = document.getElementById('date-picker-error');

    // Verify all elements exist
    if (!fromInput || !toInput || !datePicker) {
      console.warn('Flight form inputs not found');
      return;
    }

    // Handle form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      console.log('Flight form submitted'); // Debug logging
      
      let isValid = true;

      // Validate departure airport
      if (!fromInput.value.trim()) {
        this.showError(fromInput, fromError, 'Departure airport is required');
        isValid = false;
      } else {
        this.clearError(fromInput, fromError);
      }
      
      // Validate destination airport
      if (!toInput.value.trim()) {
        this.showError(toInput, toError, 'Destination airport is required');
        isValid = false;
      } else {
        this.clearError(toInput, toError);
      }

      // Validate date selection
      const dateValue = datePicker.getAttribute('data-value');
      if (!dateValue || dateValue === '') {
        this.showError(datePicker, dateError, 'Travel date is required');
        isValid = false;
      } else {
        this.clearError(datePicker, dateError);
      }

      // Check airports are different
      if (fromInput.value.trim() && toInput.value.trim() && 
          fromInput.value.trim().toLowerCase() === toInput.value.trim().toLowerCase()) {
        this.showError(toInput, toError, 'Destination must be different from departure');
        isValid = false;
      }

      if (isValid) {
        console.log('Flight form validation passed');
        // Store flight data for summary
        this.updateFlightSummary(fromInput.value, toInput.value);
        // Mark flights tab as complete and unlock passengers
        if (this.tabProgressManager) {
          this.tabProgressManager.completeTab('flights');
        }
        // Hide banner on successful validation
        const banner = form.querySelector('.mandatory-fields-banner');
        if (banner) {
          banner.classList.remove('visible');
        }
        openTab(e, 'passengers');
      } else {
        console.log('Flight form validation failed');
        // Show banner on validation failure
        const banner = form.querySelector('.mandatory-fields-banner');
        if (banner) {
          banner.classList.add('visible');
        }
      }
    });

    // Real-time validation on blur
    this.setupRealTimeValidation(fromInput, fromError, 'Departure airport');
    this.setupRealTimeValidation(toInput, toError, 'Destination airport');
  }

  /**
   * Setup passenger form validation
   */
  setupPassengerForm() {
    const form = document.getElementById('passenger-form');
    if (!form) return;

    const titleSelect = document.getElementById('passenger-title-input');
    const fnameInput = document.getElementById('passenger-fname-input');
    const lnameInput = document.getElementById('passenger-lname-input');

    const titleError = document.getElementById('passenger-title-error');
    const fnameError = document.getElementById('passenger-fname-error');
    const lnameError = document.getElementById('passenger-lname-error');

    // Handle form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      let isValid = true;

      // Validate title
      if (!this.validateCustomSelect(titleSelect, titleError, 'Title')) {
        isValid = false;
      }

      // Validate first name
      if (!this.validateRequired(fnameInput, fnameError, 'First name')) {
        isValid = false;
      } else if (!this.validateMinLength(fnameInput, fnameError, 'First name')) {
        isValid = false;
      } else if (!this.validatePattern(fnameInput, fnameError, 'First name')) {
        isValid = false;
      }

      // Validate last name
      if (!this.validateRequired(lnameInput, lnameError, 'Last name')) {
        isValid = false;
      } else if (!this.validateMinLength(lnameInput, lnameError, 'Last name')) {
        isValid = false;
      } else if (!this.validatePattern(lnameInput, lnameError, 'Last name')) {
        isValid = false;
      }

      if (isValid) {
        // Update summary with passenger data
        this.updatePassengerSummary(titleSelect, fnameInput.value, lnameInput.value);
        // Mark passengers tab as complete and unlock seating
        if (this.tabProgressManager) {
          this.tabProgressManager.completeTab('passengers');
        }
        // Hide banner on successful validation
        const banner = form.querySelector('.mandatory-fields-banner');
        if (banner) {
          banner.classList.remove('visible');
        }
        openTab(e, 'seating');
      } else {
        // Show banner on validation failure
        const banner = form.querySelector('.mandatory-fields-banner');
        if (banner) {
          banner.classList.add('visible');
        }
      }
    });

    // Real-time validation on blur
    this.setupRealTimeValidation(fnameInput, fnameError, 'First name', true);
    this.setupRealTimeValidation(lnameInput, lnameError, 'Last name', true);
  }

  /**
   * Setup seating form validation (seat selection)
   */
  setupSeatingForm() {
    const selectButton = document.getElementById('select-seat-btn');
    if (!selectButton) return;

    selectButton.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Check if a valid seat is selected
      const activeSeat = document.querySelector('.seat.active:not(.unavailable):not(.taken)');
      if (activeSeat) {
        // Mark seating tab as complete and unlock summary
        if (this.tabProgressManager) {
          this.tabProgressManager.completeTab('seating');
        }
        openTab(e, 'summary');
      }
    });
  }

  /**
   * Setup real-time validation for an input field
   */
  setupRealTimeValidation(input, errorElement, fieldName, validatePatternOnBlur = false) {
    if (!input) return;

    // Clear error immediately on focus
    input.addEventListener('focus', () => {
      if (input.classList.contains('input-error')) {
        this.clearError(input, errorElement);
      }
    });

    // Clear error as user types if field now has content
    input.addEventListener('input', () => {
      if (input.value.trim()) {
        // Field has content - clear any error immediately
        if (input.classList.contains('input-error')) {
          this.clearError(input, errorElement);
        }
      }
    });

    // On blur, only clear errors if valid - don't show new errors (that's for form submit)
    input.addEventListener('blur', () => {
      const value = input.value.trim();
      if (value) {
        // Field has content - clear any error
        this.clearError(input, errorElement);
      }
      // Don't show errors on blur - only on form submit
    });
  }

  /**
   * Update flight summary section
   */
  updateFlightSummary(from, to) {
    const originEl = document.querySelector('#origin-airport + .summary-value');
    const destEl = document.querySelector('#destination-details + .summary-value');
    
    if (originEl) originEl.textContent = from;
    if (destEl) destEl.textContent = to;
  }

  /**
   * Update passenger summary section
   */
  updatePassengerSummary(titleSelect, firstName, lastName) {
    const titleEl = document.getElementById('passenger-title');
    const fnameEl = document.getElementById('passenger-fname');
    const lnameEl = document.getElementById('passenger-lname');
    
    if (titleSelect && titleEl) {
      const titleText = titleSelect.querySelector('.custom-select-trigger').textContent;
      titleEl.textContent = titleText !== 'Title' ? titleText : '—';
    }
    if (fnameEl) fnameEl.textContent = firstName.trim();
    if (lnameEl) lnameEl.textContent = lastName.trim();
  }
}

/**
 * Modal Management System
 */
class ModalManager {
  constructor() {
    this.initializeModals();
  }

  initializeModals() {
    try {
      this.disclaimerModal = document.querySelector("#disclaimer-modal");
      this.featureUnavailableModal = document.querySelector("#feature-unavailable-modal");
      this.seatUnavailableModal = document.querySelector("#seat-unavailable-modal");
      this.closeModalBtn = document.querySelector("#close-modal");
      this.closeSeatModalBtn = document.querySelector("#close-modal-seat");
      this.openDisclaimerBtn = document.querySelector("#open-modal");
      this.featureUnavailableElements = document.querySelectorAll(".feature-unavailable");

      this.bindEvents();
    } catch (error) {
      console.warn("Modal elements not found on this page:", error.message);
    }
  }

  bindEvents() {
    if (this.openDisclaimerBtn && this.disclaimerModal) {
      this.openDisclaimerBtn.addEventListener("click", (event) => {
        event.preventDefault();
        this.disclaimerModal.showModal();
      });
    }

    if (this.featureUnavailableElements.length > 0 && this.featureUnavailableModal) {
      this.featureUnavailableElements.forEach((element) => {
        element.addEventListener("click", (event) => {
          event.preventDefault();
          this.featureUnavailableModal.showModal();
        });
      });
    }

    if (this.closeModalBtn && this.featureUnavailableModal) {
      this.closeModalBtn.addEventListener("click", (event) => {
        event.preventDefault();
        this.featureUnavailableModal.close();
      });
    }

    if (this.closeSeatModalBtn && this.seatUnavailableModal) {
      this.closeSeatModalBtn.addEventListener("click", (event) => {
        event.preventDefault();
        this.seatUnavailableModal.close();
      });
    }

    // Close modal on backdrop click
    [this.disclaimerModal, this.featureUnavailableModal, this.seatUnavailableModal]
      .filter(Boolean)
      .forEach(modal => {
        modal.addEventListener("click", (event) => {
          if (event.target === modal) {
            modal.close();
          }
        });
      });

    // Close modals on Escape key
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        if (this.featureUnavailableModal?.open) {
          this.featureUnavailableModal.close();
        }
        if (this.seatUnavailableModal?.open) {
          this.seatUnavailableModal.close();
        }
      }
    });
  }
}

/**
 * Navigation and Tab Management
 */
class TabManager {
  constructor(tabProgressManager) {
    this.tabProgressManager = tabProgressManager;
    this.initializeTabs();
  }

  initializeTabs() {
    // Bind click events to tab buttons using data-tab attribute
    const tabButtons = document.querySelectorAll('.tabOption[data-tab]');
    tabButtons.forEach(button => {
      button.addEventListener('click', (evt) => {
        const tabName = button.getAttribute('data-tab');
        this.openTab(evt, tabName);
      });
    });

    // Auto-click default tab if it exists
    const defaultTab = document.getElementById("defaultTab");
    if (defaultTab) {
      const tabName = defaultTab.getAttribute('data-tab');
      if (tabName) {
        this.openTab({ currentTarget: defaultTab }, tabName);
      }
      defaultTab.classList.add("active");
    }
  }

  openTab(evt, tabName) {
    try {
      // Check if the tab is locked
      const tabButton = document.querySelector(`.tabOption[data-tab="${tabName}"]`);
      if (tabButton && tabButton.classList.contains('locked')) {
        // Don't allow navigation to locked tabs
        return;
      }

      // Hide all tab contents
      const tabContents = document.getElementsByClassName("tabContent");
      Array.from(tabContents).forEach(content => {
        content.style.display = "none";
      });

      // Remove active class from all tab options
      const tabOptions = document.getElementsByClassName("tabOption");
      Array.from(tabOptions).forEach(option => {
        option.classList.remove("active");
      });

      // Show selected tab
      const selectedTab = document.getElementById(tabName);
      if (selectedTab) {
        selectedTab.style.display = "block";
        
        // Find and activate the corresponding tab button
        const targetButton = document.querySelector(`.tabOption[data-tab="${tabName}"]`);
        if (targetButton) {
          targetButton.classList.add("active");
        }
        
        this.scrollToTop();
      }
    } catch (error) {
      console.error("Error switching tabs:", error);
    }
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
}

/**
 * Tab Progress Management System
 * Manages the locking/unlocking of tabs based on form completion
 */
class TabProgressManager {
  constructor() {
    // Define tab order and their dependencies
    this.tabOrder = ['flights', 'passengers', 'seating', 'summary'];
    this.completedTabs = new Set();
  }

  /**
   * Mark a tab as completed and unlock the next tab
   */
  completeTab(tabName) {
    this.completedTabs.add(tabName);
    
    // Add completed class to tab button
    const tabButton = document.querySelector(`.tabOption[data-tab="${tabName}"]`);
    if (tabButton) {
      tabButton.classList.add('completed');
    }
    
    // Find the next tab in order
    const currentIndex = this.tabOrder.indexOf(tabName);
    if (currentIndex !== -1 && currentIndex < this.tabOrder.length - 1) {
      const nextTab = this.tabOrder[currentIndex + 1];
      this.unlockTab(nextTab);
    }
  }

  /**
   * Unlock a specific tab
   */
  unlockTab(tabName) {
    const tabButton = document.querySelector(`.tabOption[data-tab="${tabName}"]`);
    if (tabButton) {
      tabButton.classList.remove('locked');
    }
  }

  /**
   * Lock a specific tab
   */
  lockTab(tabName) {
    const tabButton = document.querySelector(`.tabOption[data-tab="${tabName}"]`);
    if (tabButton && tabName !== 'flights') { // Never lock the first tab
      tabButton.classList.add('locked');
    }
  }

  /**
   * Check if a tab is unlocked
   */
  isTabUnlocked(tabName) {
    const tabButton = document.querySelector(`.tabOption[data-tab="${tabName}"]`);
    return tabButton && !tabButton.classList.contains('locked');
  }

  /**
   * Check if a tab is completed
   */
  isTabCompleted(tabName) {
    return this.completedTabs.has(tabName);
  }

  /**
   * Reset progress (e.g., if user goes back and changes data)
   */
  resetFromTab(tabName) {
    const tabIndex = this.tabOrder.indexOf(tabName);
    if (tabIndex !== -1) {
      // Remove completion status and lock all tabs after this one
      for (let i = tabIndex + 1; i < this.tabOrder.length; i++) {
        const tab = this.tabOrder[i];
        this.completedTabs.delete(tab);
        this.lockTab(tab);
        // Remove completed class
        const tabButton = document.querySelector(`.tabOption[data-tab="${tab}"]`);
        if (tabButton) {
          tabButton.classList.remove('completed');
        }
      }
    }
  }
}

// Make openTab globally available for onclick handlers
let tabManager;

function openTab(evt, tabName) {
  if (tabManager) {
    tabManager.openTab(evt, tabName);
  }
}
/**
 * Passenger Management System
 */
class PassengerManager {
  constructor() {
    this.initializePassengerSystem();
  }

  initializePassengerSystem() {
    const addPassengerIcon = document.getElementById("add-icon");
    const passengerSectionContainer = document.getElementById("passenger-info-container");

    if (!addPassengerIcon || !passengerSectionContainer) {
      return; // Elements not found on this page
    }

    addPassengerIcon.addEventListener("click", () => {
      this.addNewPassenger(passengerSectionContainer);
    });
  }

  addNewPassenger(container) {
    try {
      console.log("Adding new passenger");
      
      const passengerCount = container.children.length;
      const originalSection = document.getElementById("passenger-info-box");
      
      if (!originalSection) {
        console.error("Original passenger section not found");
        return;
      }

      // Clone the passenger info box
      const newPassengerSection = originalSection.cloneNode(true);
      const newPassengerId = `passenger-info-box-${passengerCount + 1}`;
      
      newPassengerSection.id = newPassengerId;
      
      // Update header
      const header = newPassengerSection.querySelector("h3");
      if (header) {
        header.textContent = `Passenger ${passengerCount + 1}`;
      }

      // Reset form inputs
      this.resetFormInputs(newPassengerSection);

      // Append new section
      container.appendChild(newPassengerSection);

      // Update button placement
      this.updateButtonPlacement(container);
      
    } catch (error) {
      console.error("Error adding passenger:", error);
    }
  }

  resetFormInputs(section) {
    const inputs = section.querySelectorAll("input, select");
    inputs.forEach((input) => {
      if (input.tagName.toLowerCase() === "input") {
        input.value = "";
      } else if (input.tagName.toLowerCase() === "select") {
        input.selectedIndex = 0;
      }
    });
  }

  updateButtonPlacement(container) {
    const passengerBoxes = container.querySelectorAll(".booking-window");
    
    passengerBoxes.forEach((box, index) => {
      // Remove existing button containers
      const existingButtonContainer = box.querySelector(".button-container");
      if (existingButtonContainer) {
        existingButtonContainer.remove();
      }

      // Add button container to the last passenger box
      if (index === passengerBoxes.length - 1) {
        const newButtonContainer = document.createElement("div");
        newButtonContainer.classList.add("button-container");
        
        const newButton = document.createElement("button");
        newButton.textContent = "Continue to Seating";
        newButton.setAttribute("onclick", "openTab(event,'seating')");
        newButton.classList.add("btn", "btn-primary");
        
        newButtonContainer.appendChild(newButton);
        box.appendChild(newButtonContainer);
      }
    });
  }
}

/**
 * Seat Management System
 */
class SeatManager {
  constructor() {
    this.initializeSeatSystem();
  }

  initializeSeatSystem() {
    this.updateUnavailableSeats();
    this.randomizeOccupiedSeats();
    this.bindSeatClickHandlers();
  }

  updateUnavailableSeats() {
    try {
      const seatElements = document.querySelectorAll(".seat");
      
      seatElements.forEach((seat) => {
        const seatId = seat.id;
        const seatNumberMatch = seatId.match(/\d+/);
        
        if (seatNumberMatch) {
          const seatNumber = parseInt(seatNumberMatch[0]);
          
          if (seatNumber >= 23) {
            seat.classList.add("unavailable");
            seat.setAttribute("aria-label", "Seat not available");
          }
        }
      });
    } catch (error) {
      console.error("Error updating seat availability:", error);
    }
  }

  randomizeOccupiedSeats() {
    try {
      // Get all seats in the cabin (rows 17-50)
      const allSeats = document.querySelectorAll(".seat");
      const cabinSeats = Array.from(allSeats).filter(seat => {
        const seatNumberMatch = seat.id.match(/\d+/);
        if (seatNumberMatch) {
          const seatNumber = parseInt(seatNumberMatch[0]);
          return seatNumber >= 17 && seatNumber <= 50;
        }
        return false;
      });
      
      if (cabinSeats.length === 0) return;
      
      // Fisher-Yates shuffle algorithm
      const shuffled = [...cabinSeats];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      
      // Randomize 15% of cabin seats as taken/occupied
      const occupiedCount = Math.ceil(cabinSeats.length * 0.15);
      for (let i = 0; i < occupiedCount; i++) {
        shuffled[i].classList.add("taken");
      }
    } catch (error) {
      console.error("Error randomizing occupied seats:", error);
    }
  }

  bindSeatClickHandlers() {
    try {
      const seatElements = document.querySelectorAll(".seat");
      
      seatElements.forEach((seat) => {
        seat.addEventListener("click", (event) => {
          // Ignore clicks on taken seats
          if (seat.classList.contains("taken")) {
            return;
          }
          
          // Handle unavailable seats (rows 23+)
          if (seat.classList.contains("unavailable")) {
            seat.classList.add("active");
            if (seat.classList.contains("active")) {
              seat.textContent = "NA";
            }
            document.getElementById("seating-details").textContent = "Seat Unavailable";
            return;
          }
          
          // Handle normal seat selection
          seatElements.forEach(s => s.classList.remove("active"));
          seat.classList.add("active");
          const seatNumber = seat.id.replace("seat-", "");
          document.getElementById("seat-number").textContent = seatNumber;
          document.getElementById("seating-details").textContent = "";
        });
      });
    } catch (error) {
      console.error("Error binding seat click handlers:", error);
    }
  }
}

/**
 * Custom Select Dropdown Manager
 */
class CustomSelectManager {
  constructor() {
    this.initializeCustomSelects();
  }

  clearSelectError(select) {
    if (!select.classList.contains('input-error')) return;
    select.classList.remove('input-error');

    const errorId = select.getAttribute('aria-describedby');
    if (errorId) {
      const errorElement = document.getElementById(errorId);
      if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('visible');
      }
    }
  }

  initializeCustomSelects() {
    document.querySelectorAll('.custom-select').forEach(select => {
      // Skip date picker - it has its own handler
      if (select.id === 'date-picker') return;
      
      const trigger = select.querySelector('.custom-select-trigger');
      const options = select.querySelectorAll('.custom-option');
      
      // Toggle dropdown on click of entire select area
      select.addEventListener('click', (e) => {
        e.stopPropagation();
        this.clearSelectError(select);
        // Close other dropdowns
        document.querySelectorAll('.custom-select.open').forEach(other => {
          if (other !== select) other.classList.remove('open');
        });
        select.classList.toggle('open');
      });
      
      // Handle option selection
      options.forEach(option => {
        option.addEventListener('click', (e) => {
          e.stopPropagation();
          const value = option.getAttribute('data-value');
          const text = option.textContent;

          // Update the trigger text and value
          trigger.textContent = text;
          select.setAttribute('data-value', value);
          select.classList.add('has-value');

          // Close the dropdown
          select.classList.remove('open');

          // Clear error if present (for real-time validation)
          // Find the error element associated with this custom select
          this.clearSelectError(select);
        });
      });
    });
    
    // Close dropdowns only when clicking outside any .custom-select
    document.addEventListener('click', (e) => {
      // If the click is not inside any .custom-select, close all
      if (!e.target.closest('.custom-select')) {
        document.querySelectorAll('.custom-select.open').forEach(select => {
          select.classList.remove('open');
        });
      }
    });
  }
}

/**
 * Custom Date Picker Manager
 */
class DatePickerManager {
  constructor() {
    this.currentDate = new Date();
    this.selectedDate = null; // for one-way
    this.rangeStart = null; // for return journey
    this.rangeEnd = null;
    this.isReturnJourney = false;
    this.datePicker = document.getElementById('date-picker');
    if (this.datePicker) {
      this.init();
    }
  }

  init() {
    // Listen for journey type toggle
    const journeyOptions = document.querySelectorAll('input[name="journey-type"]');
    if (journeyOptions.length) {
      const selectedOption = document.querySelector('input[name="journey-type"]:checked');
      this.isReturnJourney = selectedOption ? selectedOption.value === 'return' : false;
      journeyOptions.forEach((option) => {
        option.addEventListener('change', (e) => {
          this.isReturnJourney = e.target.value === 'return';
          // Reset selection when toggling
          this.selectedDate = null;
          this.rangeStart = null;
          this.rangeEnd = null;
          this.renderCalendar();
          this.updateTrigger();
        });
      });
    }
    this.updateTrigger();

    // Toggle calendar on click
    this.datePicker.addEventListener('click', (e) => {
      if (!e.target.closest('.date-picker-dropdown')) {
        e.stopPropagation();
        if (this.datePicker.classList.contains('input-error')) {
          this.datePicker.classList.remove('input-error');
          const errorId = this.datePicker.getAttribute('aria-describedby');
          if (errorId) {
            const errorElement = document.getElementById(errorId);
            if (errorElement) {
              errorElement.textContent = '';
              errorElement.classList.remove('visible');
            }
          }
        }
        document.querySelectorAll('.custom-select.open').forEach(other => {
          if (other !== this.datePicker) other.classList.remove('open');
        });
        this.datePicker.classList.toggle('open');
        if (this.datePicker.classList.contains('open')) {
          this.renderCalendar();
        }
      }
    });
    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.datePicker.contains(e.target)) {
        this.datePicker.classList.remove('open');
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

    // Header row (spans both months)
    const headerRow = document.createElement('div');
    headerRow.className = 'date-picker-header';
    headerRow.style.justifyContent = 'space-between';
    headerRow.style.alignItems = 'center';
    headerRow.style.marginBottom = 'var(--spacing-md)';
    headerRow.style.padding = '0 var(--spacing-sm)';

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'date-nav-btn';
    prevBtn.id = 'prev-month';
    prevBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 19l-7-7 7-7"/></svg>';
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      this.renderCalendar();
    });

    const headerSpan = document.createElement('span');
    headerSpan.style.flex = '1 1 0';
    headerSpan.style.textAlign = 'center';
    headerSpan.textContent = `${monthNames[month]} ${year}`;

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'date-nav-btn';
    nextBtn.id = 'next-month';
    nextBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>';
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      this.renderCalendar();
    });

    headerRow.appendChild(prevBtn);
    headerRow.appendChild(headerSpan);
    headerRow.appendChild(nextBtn);
    calendarContainer.appendChild(headerRow);

    // Helper to render a month
    const renderMonth = (y, m) => {
      const monthDiv = document.createElement('div');
      monthDiv.className = 'date-picker-month';
      // Weekdays
      const weekdays = document.createElement('div');
      weekdays.className = 'date-picker-weekdays';
      ['Su','Mo','Tu','We','Th','Fr','Sa'].forEach(d => {
        const wd = document.createElement('div');
        wd.textContent = d;
        weekdays.appendChild(wd);
      });
      monthDiv.appendChild(weekdays);
      // Days
      const daysGrid = document.createElement('div');
      daysGrid.className = 'date-picker-days';
      const firstDay = new Date(y, m, 1).getDay();
      const daysInMonth = new Date(y, m + 1, 0).getDate();
      const daysInPrevMonth = new Date(y, m, 0).getDate();
      // Previous month days
      for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dayEl = this.createDayElement(day, true, y, m - 1);
        daysGrid.appendChild(dayEl);
      }
      // Current month days
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
  }

  createDayElement(day, isOtherMonth, year, month, dateObjOverride) {
    const dayEl = document.createElement('div');
    dayEl.className = 'date-day';
    dayEl.textContent = day;
    if (isOtherMonth) {
      dayEl.classList.add('other-month');
    }
    // Use provided dateObjOverride or construct
    let dateObj = dateObjOverride || new Date(year, month, day);
    dateObj.setHours(0, 0, 0, 0);
    // Today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Disable and grey out past dates
    if (dateObj < today) {
      dayEl.classList.add('unselectable');
      dayEl.setAttribute('aria-disabled', 'true');
    }
    if (dateObj.getTime() === today.getTime()) {
      dayEl.classList.add('today');
    }
    // Range highlighting
    if (this.isReturnJourney && this.rangeStart && this.rangeEnd) {
      const t = dateObj.getTime();
      const start = this.rangeStart.getTime();
      const end = this.rangeEnd.getTime();
      if (t === start) dayEl.classList.add('range-start');
      if (t === end) dayEl.classList.add('range-end');
      if (t > start && t < end) dayEl.classList.add('range');
    } else if (!this.isReturnJourney && this.selectedDate) {
      if (dateObj.getTime() === this.selectedDate.getTime()) {
        dayEl.classList.add('selected');
      }
    } else if (this.isReturnJourney && this.rangeStart && !this.rangeEnd) {
      if (dateObj.getTime() === this.rangeStart.getTime()) {
        dayEl.classList.add('range-start');
      }
    }
    dayEl.addEventListener('click', (e) => {
      if (dateObj < today) return;
      e.stopPropagation();
      this.handleDateClick(year, month, day);
    });
    return dayEl;
  }

  handleDateClick(year, month, day) {
    const clickedDate = new Date(year, month, day);
    clickedDate.setHours(0, 0, 0, 0);
    let shouldCloseCalendar = false;

    if (this.isReturnJourney) {
      if (!this.rangeStart || (this.rangeStart && this.rangeEnd)) {
        // Start new range
        this.rangeStart = clickedDate;
        this.rangeEnd = null;
      } else if (!this.rangeEnd) {
        if (clickedDate.getTime() === this.rangeStart.getTime()) {
          this.renderCalendar();
          return;
        }

        // Set end date
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

    if (shouldCloseCalendar) {
      this.datePicker.classList.remove('open');
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

/**
 * Application Initialization
 */
let tabProgressManager;

document.addEventListener("DOMContentLoaded", () => {
  // Initialize tab progress manager first (other systems depend on it)
  tabProgressManager = new TabProgressManager();
  
  // Initialize all systems
  new ModalManager();
  tabManager = new TabManager(tabProgressManager);
  new PassengerManager();
  new SeatManager();
  new CustomSelectManager();
  new DatePickerManager();
  new FormValidator(tabProgressManager);

  // Search button is always enabled - validation happens on form submit
  // This allows proper error messages to be shown when required fields are missing

  
  console.log("Application initialized successfully");
});
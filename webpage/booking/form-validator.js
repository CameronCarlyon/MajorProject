import { addManagedEventListener, runManagedCleanups } from './shared.js';

/**
 * Booking page application
 */
export class FormValidator {
  constructor(tabProgressManager, navigateToTab) {
    this.tabProgressManager = tabProgressManager;
    this.navigateToTab = navigateToTab;
    this.routeLayoverCache = new Map();
    this.airportLookupIndex = this.createAirportLookupIndex();
    this.cleanups = [];
    this.isCompletingBooking = false;
    this.reloadFlushStorageKey = 'bookingFormFlushOnReload';
    this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
    this.initializeForms();
  }

  addManagedListener(target, type, handler, options) {
    addManagedEventListener(target, type, handler, options, this.cleanups);
  }

  destroy() {
    runManagedCleanups(this.cleanups);

    document.querySelectorAll('.passenger-form').forEach((form) => {
      delete form.dataset.validationBound;
    });

    document.querySelectorAll('[data-passenger-field="title"]').forEach((select) => {
      delete select.dataset.progressBound;
    });

    document.querySelectorAll('[data-real-time-validation-bound="true"]').forEach((input) => {
      delete input.dataset.realTimeValidationBound;
    });
  }

  initializeForms() {
    this.flushBookingProgressOnReloadIfNeeded();
    this.setupFlightSearchForm();
    this.setupPassengerForms();
    this.setupSeatingForm();
    this.bindProgressTracking();
    this.setupUnsavedChangesWarning();
    this.refreshTabAvailability();
  }

  setupUnsavedChangesWarning() {
    this.addManagedListener(window, 'beforeunload', this.handleBeforeUnload);

      const completeBookingLink = document.getElementById('complete-booking-link');
    if (!completeBookingLink) {
      return;
    }

    this.addManagedListener(completeBookingLink, 'click', (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      this.isCompletingBooking = true;
    });
  }

  handleBeforeUnload(event) {
    if (this.isCompletingBooking || !this.hasUnsavedBookingProgress()) {
      return;
    }

    this.setReloadFlushFlag();
    event.preventDefault();
    event.returnValue = '';
  }

  setReloadFlushFlag() {
    try {
      sessionStorage.setItem(this.reloadFlushStorageKey, '1');
    } catch (error) {
      console.warn('Unable to persist booking reload state.', error);
    }
  }

  consumeReloadFlushFlag() {
    try {
      const shouldFlush = sessionStorage.getItem(this.reloadFlushStorageKey) === '1';
      sessionStorage.removeItem(this.reloadFlushStorageKey);
      return shouldFlush;
    } catch (error) {
      console.warn('Unable to read booking reload state.', error);
      return false;
    }
  }

  isReloadNavigation() {
    const navigationEntry = performance.getEntriesByType('navigation')[0];
    if (navigationEntry?.type) {
      return navigationEntry.type === 'reload';
    }

    return performance.navigation?.type === 1;
  }

  flushBookingProgressOnReloadIfNeeded() {
    const shouldFlush = this.consumeReloadFlushFlag();
    if (!shouldFlush || !this.isReloadNavigation()) {
      return;
    }

    const flightSearchForm = document.getElementById('flight-search-form');
    if (flightSearchForm) {
      flightSearchForm.reset();
    }

    document.querySelectorAll('.passenger-form').forEach((form) => {
      form.reset();
    });

    document.querySelectorAll('.mandatory-fields-banner.visible').forEach((banner) => {
      banner.classList.remove('visible');
    });

    const datePicker = document.getElementById('date-picker');
    if (datePicker) {
      datePicker.setAttribute('data-value', '');
    }

    document.querySelectorAll('[aria-invalid="true"], .input-error').forEach((control) => {
      control.classList.remove('input-error');
      control.setAttribute('aria-invalid', 'false');
    });
  }

  hasUnsavedBookingProgress() {
    return this.hasUnsavedFlightSearch() || this.hasUnsavedPassengerDetails() || this.hasUnsavedSeatingSelection();
  }

  hasUnsavedFlightSearch() {
    const fromInput = document.getElementById('airport-from-input');
    const toInput = document.getElementById('airport-to-input');
    const datePicker = document.getElementById('date-picker');
    const oneWayOption = document.getElementById('journey-one-way');

    return Boolean(
      fromInput?.value.trim() ||
      toInput?.value.trim() ||
      datePicker?.getAttribute('data-value') ||
      oneWayOption?.checked
    );
  }

  hasUnsavedPassengerDetails() {
    return Array.from(document.querySelectorAll('.passenger-form')).some((form) => {
      const {
        titleSelect,
        firstNameInput,
        lastNameInput
      } = this.getPassengerFormFields(form);

      return Boolean(
        titleSelect?.getAttribute('data-value') ||
        firstNameInput?.value.trim() ||
        lastNameInput?.value.trim()
      );
    });
  }

  hasUnsavedSeatingSelection() {
    return Boolean(document.querySelector('.seat.active:not(.unavailable):not(.taken)'));
  }

  showError(input) {
    input.classList.add('input-error');
    input.setAttribute('aria-invalid', 'true');
  }

  clearError(input) {
    input.classList.remove('input-error');
    input.setAttribute('aria-invalid', 'false');
  }

  focusFirstInvalidControl(form) {
    const invalidControl = form.querySelector('[aria-invalid="true"], .input-error');
    if (invalidControl && typeof invalidControl.focus === 'function') {
      invalidControl.focus();
    }
  }

  getMandatoryBanner(form) {
    return form.closest('.booking-window')?.querySelector('.mandatory-fields-banner') || null;
  }

  validateRequired(input) {
    const value = input.value.trim();
    if (!value) {
      this.showError(input);
      return false;
    }
    this.clearError(input);
    return true;
  }

  validatePattern(input) {
    const pattern = input.getAttribute('pattern');
    if (pattern && input.value.trim()) {
      const regex = new RegExp(pattern);
      if (!regex.test(input.value.trim())) {
        this.showError(input);
        return false;
      }
    }
    this.clearError(input);
    return true;
  }

  validateMinLength(input) {
    const minLength = Number.parseInt(input.getAttribute('minlength') || '0', 10);
    if (minLength && input.value.trim().length < minLength) {
      this.showError(input);
      return false;
    }
    return true;
  }

  validateCustomSelect(selectElement) {
    const value = selectElement.getAttribute('data-value');
    if (!value || value === '') {
      selectElement.classList.add('input-error');
      selectElement.setAttribute('aria-invalid', 'true');
      return false;
    }
    selectElement.classList.remove('input-error');
    selectElement.setAttribute('aria-invalid', 'false');
    return true;
  }

  setupFlightSearchForm() {
    const form = document.getElementById('flight-search-form');
    if (!form) {
      console.warn('Flight search form not found');
      return;
    }

    const fromInput = document.getElementById('airport-from-input');
    const toInput = document.getElementById('airport-to-input');
    const datePicker = document.getElementById('date-picker');

    if (!fromInput || !toInput || !datePicker) {
      console.warn('Flight form inputs not found');
      return;
    }

    const handleFlightStateChange = () => {
      this.refreshFlightSummary();
      this.refreshTabAvailability();
    };

    this.addManagedListener(form, 'submit', (e) => {
      e.preventDefault();

      let isValid = true;

      if (!fromInput.value.trim()) {
        this.showError(fromInput);
        isValid = false;
      } else {
        this.clearError(fromInput);
      }

      if (!toInput.value.trim()) {
        this.showError(toInput);
        isValid = false;
      } else {
        this.clearError(toInput);
      }

      const dateValue = datePicker.getAttribute('data-value');
      if (!dateValue || dateValue === '') {
        this.showError(datePicker);
        isValid = false;
      } else {
        this.clearError(datePicker);
      }

      if (
        fromInput.value.trim() &&
        toInput.value.trim() &&
        fromInput.value.trim().toLowerCase() === toInput.value.trim().toLowerCase()
      ) {
        this.showError(toInput);
        isValid = false;
      }

      if (isValid) {
        this.refreshFlightSummary();
        if (this.tabProgressManager) {
          this.tabProgressManager.completeTab('flights');
        }
        const banner = this.getMandatoryBanner(form);
        if (banner) {
          banner.classList.remove('visible');
        }
        this.navigateToTab?.('passengers', e);
      } else {
        const banner = this.getMandatoryBanner(form);
        if (banner) {
          banner.classList.add('visible');
        }
        this.focusFirstInvalidControl(form);
      }
    });

    this.setupRealTimeValidation(fromInput);
    this.setupRealTimeValidation(toInput);

    this.addManagedListener(fromInput, 'change', handleFlightStateChange);
    this.addManagedListener(toInput, 'change', handleFlightStateChange);
    this.addManagedListener(datePicker, 'change', handleFlightStateChange);

    document.querySelectorAll('input[name="journey-type"]').forEach((option) => {
      this.addManagedListener(option, 'change', handleFlightStateChange);
    });

    this.refreshFlightSummary();
  }

  isFlightFormComplete() {
    const fromInput = document.getElementById('airport-from-input');
    const toInput = document.getElementById('airport-to-input');
    const datePicker = document.getElementById('date-picker');

    if (!fromInput || !toInput || !datePicker) {
      return false;
    }

    const fromValue = fromInput.value.trim();
    const toValue = toInput.value.trim();
    const dateValue = datePicker.getAttribute('data-value') || '';

    return Boolean(
      fromValue &&
      toValue &&
      dateValue &&
      fromValue.toLowerCase() !== toValue.toLowerCase()
    );
  }

  getPassengerFormFields(form) {
    return {
      titleSelect: form.querySelector('[data-passenger-field="title"]'),
      firstNameInput: form.querySelector('[data-passenger-field="first-name"]'),
      lastNameInput: form.querySelector('[data-passenger-field="last-name"]')
    };
  }

  validatePassengerForm(form) {
    const {
      titleSelect,
      firstNameInput,
      lastNameInput
    } = this.getPassengerFormFields(form);

    let isValid = true;
    let firstInvalidControl = null;

    const markInvalid = (control) => {
      isValid = false;
      if (!firstInvalidControl) {
        firstInvalidControl = control;
      }
    };

    if (!this.validateCustomSelect(titleSelect)) {
      markInvalid(titleSelect);
    }

    if (!this.validateRequired(firstNameInput)) {
      markInvalid(firstNameInput);
    } else if (!this.validateMinLength(firstNameInput)) {
      markInvalid(firstNameInput);
    } else if (!this.validatePattern(firstNameInput)) {
      markInvalid(firstNameInput);
    }

    if (!this.validateRequired(lastNameInput)) {
      markInvalid(lastNameInput);
    } else if (!this.validateMinLength(lastNameInput)) {
      markInvalid(lastNameInput);
    } else if (!this.validatePattern(lastNameInput)) {
      markInvalid(lastNameInput);
    }

    const banner = this.getMandatoryBanner(form);
    if (banner) {
      banner.classList.toggle('visible', !isValid);
    }

    return { isValid, firstInvalidControl };
  }

  isPassengerFormComplete(form) {
    const {
      titleSelect,
      firstNameInput,
      lastNameInput
    } = this.getPassengerFormFields(form);

    if (!titleSelect || !firstNameInput || !lastNameInput) {
      return false;
    }

    const titleValue = titleSelect.getAttribute('data-value') || '';
    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();
    const namePattern = /^[A-Za-z\s\-']+$/;
    const minLength = 2;

    return Boolean(
      titleValue &&
      firstName.length >= minLength &&
      lastName.length >= minLength &&
      namePattern.test(firstName) &&
      namePattern.test(lastName)
    );
  }

  arePassengerFormsComplete() {
    const forms = Array.from(document.querySelectorAll('.passenger-form'));
    if (!forms.length) {
      return false;
    }

    return forms.every((form) => this.isPassengerFormComplete(form));
  }

  setupPassengerForms() {
    const forms = Array.from(document.querySelectorAll('.passenger-form'));
    if (!forms.length) {
      return;
    }

    forms.forEach((form) => {
      if (form.dataset.validationBound === 'true') {
        return;
      }

      this.addManagedListener(form, 'submit', (e) => {
        e.preventDefault();

        const passengerForms = Array.from(document.querySelectorAll('.passenger-form'));
        let allValid = true;
        let firstInvalidControl = null;

        passengerForms.forEach((passengerForm) => {
          const result = this.validatePassengerForm(passengerForm);
          if (!result.isValid) {
            allValid = false;
            if (!firstInvalidControl) {
              firstInvalidControl = result.firstInvalidControl;
            }
          }
        });

        if (allValid) {
          const primaryPassengerForm = passengerForms[0];
          const primaryFields = this.getPassengerFormFields(primaryPassengerForm);

          this.updatePassengerSummary(
            primaryFields.titleSelect,
            primaryFields.firstNameInput.value,
            primaryFields.lastNameInput.value
          );

          if (this.tabProgressManager) {
            this.tabProgressManager.completeTab('passengers');
          }

          this.navigateToTab?.('seating', e);
        } else if (firstInvalidControl) {
          firstInvalidControl.focus();
        }
      });

      form.dataset.validationBound = 'true';

      const { titleSelect, firstNameInput, lastNameInput } = this.getPassengerFormFields(form);
      if (titleSelect && titleSelect.dataset.progressBound !== 'true') {
        this.addManagedListener(titleSelect, 'change', () => this.refreshTabAvailability());
        titleSelect.dataset.progressBound = 'true';
      }
      this.setupRealTimeValidation(firstNameInput);
      this.setupRealTimeValidation(lastNameInput);
    });

    this.refreshTabAvailability();
  }

  submitForm(form) {
    if (!form) {
      return false;
    }

    if (typeof form.requestSubmit === 'function') {
      form.requestSubmit();
      return true;
    }

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    return true;
  }

  validateSeatingSelection() {
    const activeSeat = document.querySelector('.seat.active:not(.unavailable):not(.taken)');
    if (activeSeat) {
      return true;
    }

    const seatStatus = document.getElementById('seating-status');
    const focusTarget = document.querySelector('.seat[tabindex="0"]') || document.querySelector('.seat:not(.taken)');

    if (seatStatus) {
      seatStatus.textContent = 'Select a valid seat to continue.';
    }

    if (focusTarget && typeof focusTarget.focus === 'function') {
      focusTarget.focus();
    }

    return false;
  }

  isSeatingComplete() {
    return Boolean(document.querySelector('.seat.active:not(.unavailable):not(.taken)'));
  }

  bindProgressTracking() {
    this.addManagedListener(document, 'seat-selection-change', () => {
      this.refreshTabAvailability();
    });
  }

  refreshTabAvailability() {
    const fromInput = document.getElementById('airport-from-input');
    const toInput = document.getElementById('airport-to-input');

    if (fromInput && toInput) {
      this.updateFlightSummary(fromInput.value, toInput.value);
    }

    if (!this.tabProgressManager) {
      return;
    }

    this.tabProgressManager.syncStepAvailability({
      flights: this.isFlightFormComplete(),
      passengers: this.arePassengerFormsComplete(),
      seating: this.isSeatingComplete()
    });
  }

  attemptStepValidation(tabName) {
    switch (tabName) {
      case 'flights':
        return this.submitForm(document.getElementById('flight-search-form'));
      case 'passengers': {
        const passengerForms = Array.from(document.querySelectorAll('.passenger-form'));
        return this.submitForm(passengerForms[passengerForms.length - 1]);
      }
      case 'seating': {
        if (!this.validateSeatingSelection()) {
          return false;
        }

        const selectButton = document.getElementById('select-seat-button');
        if (selectButton) {
          selectButton.click();
          return true;
        }

        return false;
      }
      default:
        return false;
    }
  }

  setupSeatingForm() {
    const selectButton = document.getElementById('select-seat-button');
    if (!selectButton) return;

    this.addManagedListener(selectButton, 'click', (e) => {
      e.preventDefault();

      if (!this.validateSeatingSelection()) {
        return;
      }

      if (this.tabProgressManager) {
        this.tabProgressManager.completeTab('seating');
      }

      this.navigateToTab?.('summary', e);
    });
  }

  setupRealTimeValidation(input) {
    if (!input) return;

    if (input.dataset.realTimeValidationBound === 'true') {
      return;
    }

    input.dataset.realTimeValidationBound = 'true';

    this.addManagedListener(input, 'input', () => {
      if (input.value.trim()) {
        if (input.classList.contains('input-error')) {
          this.clearError(input);
        }
      }

      this.refreshTabAvailability();
    });

    this.addManagedListener(input, 'blur', () => {
      const value = input.value.trim();
      if (value) {
        this.clearError(input);
      }

      this.refreshTabAvailability();
    });
  }

  refreshFlightSummary() {
    const fromInput = document.getElementById('airport-from-input');
    const toInput = document.getElementById('airport-to-input');

    if (!fromInput || !toInput) {
      return;
    }

    this.updateFlightSummary(fromInput.value, toInput.value);
  }

  getStoredAirport(inputElement) {
    const rawAirportData = inputElement?.getAttribute('data-airport');

    if (!rawAirportData) {
      return null;
    }

    try {
      return JSON.parse(rawAirportData);
    } catch (error) {
      console.warn('Unable to parse airport metadata for the summary view.', error);
      return null;
    }
  }

  normalizeAirportLookupValue(value) {
    return (value || '').trim().toLowerCase().replace(/\s+/g, ' ');
  }

  createAirportLookupIndex() {
    const lookupIndex = new Map();
    const availableAirports = Array.isArray(globalThis.airportCatalog) ? globalThis.airportCatalog : [];

    availableAirports.forEach((airport) => {
      [
        `${airport.city} (${airport.iata})`,
        airport.city,
        airport.name,
        airport.iata,
      ].forEach((lookupValue) => {
        const normalizedLookupValue = this.normalizeAirportLookupValue(lookupValue);

        if (normalizedLookupValue && !lookupIndex.has(normalizedLookupValue)) {
          lookupIndex.set(normalizedLookupValue, airport);
        }
      });
    });

    return lookupIndex;
  }

  findAirportByValue(value) {
    const normalizedValue = this.normalizeAirportLookupValue(value);

    if (!normalizedValue || !this.airportLookupIndex.size) {
      return null;
    }

    return this.airportLookupIndex.get(normalizedValue) || null;
  }

  getFallbackAirportCode(value) {
    const codeMatch = (value || '').match(/\(([A-Za-z]{3})\)/);
    if (codeMatch) {
      return codeMatch[1].toUpperCase();
    }

    const lettersOnly = (value || '').replace(/[^A-Za-z]/g, '').toUpperCase();
    return lettersOnly.slice(0, 3) || '---';
  }

  getAirportSummary(inputElement, inputValue) {
    const trimmedValue = (inputValue || '').trim();
    const storedAirport = this.getStoredAirport(inputElement);
    const matchedAirport = storedAirport || this.findAirportByValue(trimmedValue);
    const fallbackCity = trimmedValue.replace(/\s*\([A-Za-z]{3}\)\s*$/, '') || 'Select airport';

    if (!matchedAirport) {
      return {
        code: this.getFallbackAirportCode(trimmedValue),
        city: fallbackCity,
        name: trimmedValue ? 'Selected airport' : 'Select an airport',
        isKnownAirport: false
      };
    }

    return {
      code: matchedAirport.iata,
      city: matchedAirport.city,
      name: matchedAirport.name,
      isKnownAirport: true
    };
  }

  formatSummaryDate(dateValue) {
    if (!dateValue) {
      return 'Select date';
    }

    if (dateValue.includes('|')) {
      const [startDate, endDate] = dateValue.split('|');
      const formattedStart = this.formatSummaryDatePart(startDate);
      const formattedEnd = this.formatSummaryDatePart(endDate);

      if (formattedStart && formattedEnd) {
        return `${formattedStart} - ${formattedEnd}`;
      }

      return formattedStart || formattedEnd || 'Select date';
    }

    return this.formatSummaryDatePart(dateValue) || 'Select date';
  }

  formatSummaryDatePart(rawDate) {
    const parsedDate = new Date(rawDate);

    if (Number.isNaN(parsedDate.getTime())) {
      return '';
    }

    return parsedDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  getSummaryTravelDetails(dateValue) {
    const journeyType = this.getJourneyTypeLabel();
    const isReturnJourney = journeyType === 'Return';

    if (isReturnJourney) {
      const [departureDate = '', arrivalDate = ''] = dateValue.split('|');

      return {
        departureDate: this.formatSummaryDatePart(departureDate || dateValue) || 'Select date',
        secondaryLabel: 'Arrival',
        secondaryValue: this.formatSummaryDatePart(arrivalDate) || 'Select date'
      };
    }

    return {
      departureDate: this.formatSummaryDatePart(dateValue) || 'Select date',
      secondaryLabel: 'Journey',
      secondaryValue: journeyType
    };
  }

  getJourneyTypeLabel() {
    const selectedJourneyType = document.querySelector('input[name="journey-type"]:checked');
    return selectedJourneyType?.value === 'one-way' ? 'One-way' : 'Return';
  }

  getDubaiHubSummary() {
    const hubAirport = this.findAirportByValue('DXB');

    if (hubAirport) {
      return {
        code: hubAirport.iata,
        city: hubAirport.city,
        name: hubAirport.name,
        isKnownAirport: true
      };
    }

    return {
      code: 'DXB',
      city: 'Dubai',
      name: 'Dubai International Airport',
      isKnownAirport: true
    };
  }

  getRouteLayoverHours(originCode, destinationCode) {
    const routeKey = `${originCode}-${destinationCode}`;

    if (!this.routeLayoverCache.has(routeKey)) {
      this.routeLayoverCache.set(routeKey, Math.floor(Math.random() * 5) + 2);
    }

    return this.routeLayoverCache.get(routeKey);
  }

  buildRouteItinerary(origin, destination) {
    const hubAirport = this.getDubaiHubSummary();
    const requiresDubaiStopover = (
      origin.isKnownAirport &&
      destination.isKnownAirport &&
      origin.code !== hubAirport.code &&
      destination.code !== hubAirport.code
    );

    return {
      origin,
      destination,
      stopover: requiresDubaiStopover ? hubAirport : null,
      layoverHours: requiresDubaiStopover
        ? this.getRouteLayoverHours(origin.code, destination.code)
        : null
    };
  }

  updateFlightSummary(from, to) {
    const fromInput = document.getElementById('airport-from-input');
    const toInput = document.getElementById('airport-to-input');
    const datePicker = document.getElementById('date-picker');
    const dateValue = datePicker?.getAttribute('data-value') || '';
    const origin = this.getAirportSummary(fromInput, from);
    const destination = this.getAirportSummary(toInput, to);
    const itinerary = this.buildRouteItinerary(origin, destination);
    const formattedDate = this.formatSummaryDate(dateValue);
    const travelDetails = this.getSummaryTravelDetails(dateValue);

    const originCodeEl = document.getElementById('origin-airport');
    const originCityEl = document.getElementById('origin-airport-city');
    const originNameEl = document.getElementById('origin-airport-name');
    const destinationCodeEl = document.getElementById('destination-details');
    const destinationCityEl = document.getElementById('destination-airport-city');
    const destinationNameEl = document.getElementById('destination-airport-name');
    const layoverEl = document.getElementById('summary-layover');
    const journeyDateEl = document.getElementById('summary-journey-date');
    const secondaryLabelEl = document.getElementById('summary-secondary-label');
    const journeyTypeEl = document.getElementById('summary-journey-type');
    const stubDateEl = document.getElementById('summary-stub-date');
    const routeBadgeOriginEl = document.getElementById('summary-route-badge-origin');
    const routeBadgeDestinationEl = document.getElementById('summary-route-badge-destination');

    if (originCodeEl) originCodeEl.textContent = origin.code;
    if (originCityEl) originCityEl.textContent = origin.city;
    if (originNameEl) originNameEl.textContent = origin.name;
    if (destinationCodeEl) destinationCodeEl.textContent = destination.code;
    if (destinationCityEl) destinationCityEl.textContent = destination.city;
    if (destinationNameEl) destinationNameEl.textContent = destination.name;
    if (layoverEl) layoverEl.hidden = !itinerary.stopover;
    if (layoverEl) {
      layoverEl.textContent = itinerary.layoverHours
        ? `Via Dubai - ${itinerary.layoverHours} Hour Stopover`
        : '';
    }
    if (journeyDateEl) journeyDateEl.textContent = travelDetails.departureDate;
    if (secondaryLabelEl) secondaryLabelEl.textContent = travelDetails.secondaryLabel;
    if (journeyTypeEl) journeyTypeEl.textContent = travelDetails.secondaryValue;
    if (stubDateEl) stubDateEl.textContent = formattedDate;
    if (routeBadgeOriginEl) routeBadgeOriginEl.textContent = origin.code;
    if (routeBadgeDestinationEl) routeBadgeDestinationEl.textContent = destination.code;
  }

  updatePassengerSummary(titleSelect, firstName, lastName) {
    const titleEl = document.getElementById('passenger-title');
    const firstNameEl = document.getElementById('passenger-first-name');
    const lastNameEl = document.getElementById('passenger-last-name');
    const stubPassengerEl = document.getElementById('summary-stub-passenger');
    const titleText = titleSelect?.querySelector('.custom-select-trigger')?.textContent?.trim() || '';
    const normalizedTitle = titleText && titleText !== 'Title' && titleText !== 'Prefer not to say' ? titleText : '—';
    const normalizedFirstName = firstName.trim() || '—';
    const normalizedLastName = lastName.trim() || '—';

    if (titleEl) {
      titleEl.textContent = normalizedTitle !== '—' ? `${normalizedTitle} ` : '';
    }
    if (firstNameEl) firstNameEl.textContent = normalizedFirstName;
    if (lastNameEl) lastNameEl.textContent = normalizedLastName;
    if (stubPassengerEl) {
      const passengerLabel = [
        normalizedTitle !== '—' ? normalizedTitle : '',
        normalizedFirstName !== '—' ? normalizedFirstName : '',
        normalizedLastName !== '—' ? normalizedLastName : ''
      ].filter(Boolean).join(' ');

      stubPassengerEl.textContent = passengerLabel || 'Lead traveller';
    }
  }
}
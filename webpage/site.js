function addManagedEventListener(target, type, handler, options, cleanups) {
  if (!target || typeof target.addEventListener !== 'function') {
    return;
  }

  target.addEventListener(type, handler, options);
  cleanups.push(() => {
    target.removeEventListener(type, handler, options);
  });
}

function runManagedCleanups(cleanups) {
  while (cleanups.length) {
    const cleanup = cleanups.pop();

    try {
      cleanup?.();
    } catch (error) {
      console.warn('Unable to clean up application listener.', error);
    }
  }
}

function updateFooterCopyrightYear() {
  const currentYear = new Date().getFullYear();

  document.querySelectorAll('#footer-copyright').forEach((element) => {
    element.innerHTML = element.innerHTML.replace(/©\s*(?:\d{4}|YYYY)/, `© ${currentYear}`);
  });
}

function initializeInputModalityTracking() {
  const root = document.documentElement;
  root.dataset.inputModality = 'pointer';

  const handleKeydown = (event) => {
    if (event.key === 'Tab') {
      root.dataset.inputModality = 'keyboard';
    }
  };

  const handlePointerDown = () => {
    root.dataset.inputModality = 'pointer';
  };

  document.addEventListener('keydown', handleKeydown, true);
  document.addEventListener('pointerdown', handlePointerDown, true);

  return () => {
    document.removeEventListener('keydown', handleKeydown, true);
    document.removeEventListener('pointerdown', handlePointerDown, true);
  };
}

const ICON_SPRITE_PATH = './assets/svg/icons.svg';

const FONT_AWESOME_ICON_MAP = {
  'fa-earth-europe': 'icon-earth',
  'fa-magnifying-glass': 'icon-search',
  'fa-circle-user': 'icon-user-circle',
  'fa-user': 'icon-user',
  'fa-ticket-simple': 'icon-ticket',
  'fa-plane': 'icon-plane',
};

const MATERIAL_ICON_MAP = {
  travel: 'icon-travel',
  airline_seat_recline_extra: 'icon-seat-recline-extra',
  tv_gen: 'icon-tv-gen',
  restaurant: 'icon-restaurant',
  redeem: 'icon-redeem',
  airline_seat_flat: 'icon-seat-flat',
  shower: 'icon-shower',
};

function createSvgIcon(symbolId, classNames = []) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');

  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.dataset.icon = symbolId;
  svg.classList.add('icon', ...classNames);

  use.setAttribute('href', `${ICON_SPRITE_PATH}#${symbolId}`);
  svg.appendChild(use);

  return svg;
}

function replaceFontAwesomeIcons(root = document) {
  root.querySelectorAll('i.fa-solid, i.fa-regular').forEach((iconElement) => {
    const iconClass = Array.from(iconElement.classList).find((className) => FONT_AWESOME_ICON_MAP[className]);
    if (!iconClass) {
      return;
    }

    const iconClassNames = [];
    if (iconElement.classList.contains('tab-icon')) {
      iconClassNames.push('tab-icon');
    }

    const replacement = createSvgIcon(FONT_AWESOME_ICON_MAP[iconClass], iconClassNames);
    iconElement.replaceWith(replacement);
  });
}

function replaceMaterialIcons(root = document) {
  root.querySelectorAll('.material-symbols-outlined').forEach((iconElement) => {
    const iconName = iconElement.textContent.trim();
    const symbolId = MATERIAL_ICON_MAP[iconName];

    if (!symbolId) {
      return;
    }

    const iconClassNames = ['icon-material'];
    if (iconElement.classList.contains('tab-icon')) {
      iconClassNames.push('tab-icon');
    }

    const replacement = createSvgIcon(symbolId, iconClassNames);
    iconElement.replaceWith(replacement);
  });
}

function initializeLocalIcons() {
  replaceFontAwesomeIcons();
  replaceMaterialIcons();
}

class ModalManager {
  constructor() {
    this.cleanups = [];
    this.initializeModals();
  }

  addManagedListener(target, type, handler, options) {
    addManagedEventListener(target, type, handler, options, this.cleanups);
  }

  destroy() {
    runManagedCleanups(this.cleanups);
  }

  initializeModals() {
    try {
      this.disclaimerModal = document.querySelector('#disclaimer-modal');
      this.featureUnavailableModal = document.querySelector('#feature-unavailable-modal');
      this.surveyArchiveModal = document.querySelector('#survey-archive-modal');
      this.seatUnavailableModal = document.querySelector('#seat-unavailable-modal');
      this.amenitiesModal = document.querySelector('#amenities-modal');
      this.closeFeatureUnavailableModalButton = document.querySelector('#close-feature-unavailable-modal-button');
      this.closeSurveyArchiveModalButton = document.querySelector('#close-survey-archive-modal-button');
      this.closeSeatUnavailableModalButton = document.querySelector('#close-seat-unavailable-modal-button');
      this.closeAmenitiesModalButton = document.querySelector('#close-amenities-modal-button');
      this.disclaimerModalTriggers = document.querySelectorAll('[data-open-disclaimer-modal]');
      this.openSurveyArchiveModalButton = document.querySelector('#open-survey-archive-modal-button');
      this.featureUnavailableElements = document.querySelectorAll('.feature-unavailable');
      this.surveyArchiveLinks = document.querySelectorAll('[data-survey-archive-link]');
      this.amenitiesTriggers = document.querySelectorAll('[data-amenities-modal-open]');

      this.bindEvents();
    } catch (error) {
      console.warn('Modal elements not found on this page:', error.message);
    }
  }

  openSurveyArchiveModal(url) {
    if (!url || !this.surveyArchiveModal) {
      return;
    }

    if (this.openSurveyArchiveModalButton) {
      this.openSurveyArchiveModalButton.href = url;
    }

    this.surveyArchiveModal.showModal();
  }

  closeSurveyArchiveModal() {
    this.surveyArchiveModal?.close();
  }

  bindEvents() {
    if (this.disclaimerModalTriggers.length > 0 && this.disclaimerModal) {
      this.disclaimerModalTriggers.forEach((element) => {
        this.addManagedListener(element, 'click', (event) => {
          event.preventDefault();
          this.disclaimerModal.showModal();
        });
      });
    }

    if (this.featureUnavailableElements.length > 0 && this.featureUnavailableModal) {
      this.featureUnavailableElements.forEach((element) => {
        this.addManagedListener(element, 'click', (event) => {
          event.preventDefault();
          this.featureUnavailableModal.showModal();
        });
      });
    }

    if (this.surveyArchiveLinks.length > 0 && this.surveyArchiveModal) {
      this.surveyArchiveLinks.forEach((element) => {
        this.addManagedListener(element, 'click', (event) => {
          event.preventDefault();
          this.openSurveyArchiveModal(element.href);
        });
      });
    }

    if (this.closeFeatureUnavailableModalButton && this.featureUnavailableModal) {
      this.addManagedListener(this.closeFeatureUnavailableModalButton, 'click', (event) => {
        event.preventDefault();
        this.featureUnavailableModal.close();
      });
    }

    if (this.closeSurveyArchiveModalButton && this.surveyArchiveModal) {
      this.addManagedListener(this.closeSurveyArchiveModalButton, 'click', (event) => {
        event.preventDefault();
        this.closeSurveyArchiveModal();
      });
    }

    if (this.openSurveyArchiveModalButton && this.surveyArchiveModal) {
      this.addManagedListener(this.openSurveyArchiveModalButton, 'click', () => {
        this.closeSurveyArchiveModal();
      });
    }

    if (this.closeSeatUnavailableModalButton && this.seatUnavailableModal) {
      this.addManagedListener(this.closeSeatUnavailableModalButton, 'click', (event) => {
        event.preventDefault();
        this.seatUnavailableModal.close();
      });
    }

    if (this.amenitiesTriggers.length > 0 && this.amenitiesModal) {
      this.amenitiesTriggers.forEach((element) => {
        this.addManagedListener(element, 'click', (event) => {
          event.preventDefault();
          if (!this.amenitiesModal.open) {
            this.amenitiesModal.showModal();
          }
        });
      });
    }

    if (this.closeAmenitiesModalButton && this.amenitiesModal) {
      this.addManagedListener(this.closeAmenitiesModalButton, 'click', (event) => {
        event.preventDefault();
        this.amenitiesModal.close();
      });
    }

    [
      this.disclaimerModal,
      this.featureUnavailableModal,
      this.surveyArchiveModal,
      this.seatUnavailableModal,
      this.amenitiesModal,
    ]
      .filter(Boolean)
      .forEach((modal) => {
        this.addManagedListener(modal, 'click', (event) => {
          if (event.target === modal) {
            modal.close();
          }
        });
      });

    this.addManagedListener(document, 'keydown', (event) => {
      if (event.key === 'Escape') {
        if (this.featureUnavailableModal?.open) {
          this.featureUnavailableModal.close();
        }
        if (this.surveyArchiveModal?.open) {
          this.surveyArchiveModal.close();
        }
        if (this.seatUnavailableModal?.open) {
          this.seatUnavailableModal.close();
        }
        if (this.amenitiesModal?.open) {
          this.amenitiesModal.close();
        }
      }
    });
  }
}

class ContactFormManager {
  constructor() {
    this.cleanups = [];
    this.isSubmittingContactForm = false;
    this.reloadFlushStorageKey = 'contactFormFlushOnReload';
    this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
    this.initialize();
  }

  addManagedListener(target, type, handler, options) {
    addManagedEventListener(target, type, handler, options, this.cleanups);
  }

  destroy() {
    runManagedCleanups(this.cleanups);

    if (this.contactForm) {
      delete this.contactForm.dataset.validationBound;
    }

    document.querySelectorAll('[data-contact-validation-bound="true"]').forEach((input) => {
      delete input.dataset.contactValidationBound;
    });
  }

  initialize() {
    this.contactForm = document.querySelector('.contact-form-section');
    if (!this.contactForm || this.contactForm.dataset.validationBound === 'true') {
      return;
    }

    const nameInput = this.contactForm.querySelector('#contact-name');
    const emailInput = this.contactForm.querySelector('#contact-email');
    const messageInput = this.contactForm.querySelector('#contact-message');

    if (!nameInput || !emailInput || !messageInput) {
      console.warn('Contact form inputs not found');
      return;
    }

    this.fields = { nameInput, emailInput, messageInput };

    this.flushFormOnReloadIfNeeded();

    this.addManagedListener(this.contactForm, 'submit', (event) => {
      const { isValid, firstInvalidControl } = this.validateForm();

      if (!isValid) {
        event.preventDefault();
        if (firstInvalidControl && typeof firstInvalidControl.focus === 'function') {
          firstInvalidControl.focus();
        }
        return;
      }

      this.isSubmittingContactForm = true;
    });

    this.addManagedListener(window, 'beforeunload', this.handleBeforeUnload);

    this.setupRealTimeValidation(nameInput);
    this.setupRealTimeValidation(emailInput);
    this.setupRealTimeValidation(messageInput);

    this.contactForm.dataset.validationBound = 'true';
  }

  handleBeforeUnload(event) {
    if (this.isSubmittingContactForm || !this.hasUnsavedContactFormData()) {
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
      console.warn('Unable to persist contact-form reload state.', error);
    }
  }

  consumeReloadFlushFlag() {
    try {
      const shouldFlush = sessionStorage.getItem(this.reloadFlushStorageKey) === '1';
      sessionStorage.removeItem(this.reloadFlushStorageKey);
      return shouldFlush;
    } catch (error) {
      console.warn('Unable to read contact-form reload state.', error);
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

  flushFormOnReloadIfNeeded() {
    const shouldFlush = this.consumeReloadFlushFlag();
    if (!shouldFlush || !this.isReloadNavigation() || !this.contactForm) {
      return;
    }

    this.contactForm.reset();

    Object.values(this.fields).forEach((field) => {
      this.clearError(field);
    });
  }

  hasUnsavedContactFormData() {
    const { nameInput, emailInput, messageInput } = this.fields || {};

    return Boolean(
      nameInput?.value.trim() ||
      emailInput?.value.trim() ||
      messageInput?.value.trim()
    );
  }

  showError(input) {
    input.classList.add('input-error');
    input.setAttribute('aria-invalid', 'true');
  }

  clearError(input) {
    input.classList.remove('input-error');
    input.setAttribute('aria-invalid', 'false');
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

  validateEmail(input) {
    if (!input.checkValidity()) {
      this.showError(input);
      return false;
    }

    this.clearError(input);
    return true;
  }

  validateForm() {
    const { nameInput, emailInput, messageInput } = this.fields;
    let isValid = true;
    let firstInvalidControl = null;

    const markInvalid = (control) => {
      isValid = false;
      if (!firstInvalidControl) {
        firstInvalidControl = control;
      }
    };

    if (!this.validateRequired(nameInput)) {
      markInvalid(nameInput);
    } else if (!this.validateMinLength(nameInput)) {
      markInvalid(nameInput);
    } else if (!this.validatePattern(nameInput)) {
      markInvalid(nameInput);
    }

    if (!this.validateRequired(emailInput)) {
      markInvalid(emailInput);
    } else if (!this.validateEmail(emailInput)) {
      markInvalid(emailInput);
    }

    if (!this.validateRequired(messageInput)) {
      markInvalid(messageInput);
    }

    return { isValid, firstInvalidControl };
  }

  setupRealTimeValidation(input) {
    if (!input || input.dataset.contactValidationBound === 'true') {
      return;
    }

    input.dataset.contactValidationBound = 'true';

    this.addManagedListener(input, 'input', () => {
      if (input.value.trim() && input.classList.contains('input-error')) {
        this.clearError(input);
      }
    });

    this.addManagedListener(input, 'blur', () => {
      if (input.value.trim()) {
        this.clearError(input);
      }
    });
  }
}

class SiteApp {
  constructor() {
    this.cleanups = [];
    this.initialize();
  }

  initialize() {
    updateFooterCopyrightYear();
    initializeLocalIcons();

    const inputModalityCleanup = initializeInputModalityTracking();
    if (inputModalityCleanup) {
      this.cleanups.push(inputModalityCleanup);
    }

    this.modalManager = new ModalManager();
    this.contactFormManager = new ContactFormManager();
  }

  destroy() {
    this.contactFormManager?.destroy?.();
    this.modalManager?.destroy?.();
    runManagedCleanups(this.cleanups);
  }
}

let siteApp = null;

document.addEventListener('DOMContentLoaded', () => {
  siteApp?.destroy();
  siteApp = new SiteApp();
});
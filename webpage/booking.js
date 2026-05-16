import './booking/panorama-viewer.js';
import { FormValidator } from './booking/form-validator.js';
import { TabManager, TabProgressManager } from './booking/navigation.js';
import { SeatManager } from './booking/seating.js';
import { CustomSelectManager, DatePickerManager } from './booking/controls.js';

class BookingNavLogoManager {
  constructor() {
    this.body = document.body;
    this.logo = document.querySelector('.ek-nav-bar-logo');
    this.visibilityThreshold = 55;
    this.rafId = null;
    this.handleScroll = this.handleScroll.bind(this);

    this.initialize();
  }

  initialize() {
    if (!this.body || !this.logo) {
      return;
    }

    this.body.classList.add('booking-page');
    this.updateVisibility(Math.max(window.scrollY, 0) <= this.visibilityThreshold);
    window.addEventListener('scroll', this.handleScroll, { passive: true });
  }

  destroy() {
    if (!this.body || !this.logo) {
      return;
    }

    if (this.rafId !== null) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    window.removeEventListener('scroll', this.handleScroll);
    this.body.classList.remove('booking-nav-logo-hidden');
  }

  handleScroll() {
    if (this.rafId !== null) {
      return;
    }

    this.rafId = window.requestAnimationFrame(() => {
      this.rafId = null;

      const currentScrollY = Math.max(window.scrollY, 0);
      this.updateVisibility(currentScrollY <= this.visibilityThreshold);
    });
  }

  updateVisibility(isVisible) {
    this.body.classList.toggle('booking-nav-logo-hidden', !isVisible);
  }
}

class BookingApp {
  constructor() {
    this.initialize();
  }

  initialize() {
    this.bookingNavLogoManager = new BookingNavLogoManager();
    this.tabProgressManager = new TabProgressManager();
    this.tabManager = new TabManager(this.tabProgressManager);
    this.seatManager = new SeatManager();
    this.customSelectManager = new CustomSelectManager();
    this.datePickerManager = new DatePickerManager();
    this.formValidator = new FormValidator(
      this.tabProgressManager,
      (tabName, evt) => this.tabManager.navigateToTab(tabName, evt)
    );

    this.tabManager.setStepValidator(this.formValidator);
  }

  destroy() {
    [
      this.bookingNavLogoManager,
      this.formValidator,
      this.datePickerManager,
      this.customSelectManager,
      this.seatManager,
      this.tabManager,
    ].forEach((manager) => {
      manager?.destroy?.();
    });
  }
}

let bookingApp = null;

document.addEventListener('DOMContentLoaded', () => {
  bookingApp?.destroy();
  bookingApp = new BookingApp();
});
import { addManagedEventListener, runManagedCleanups } from './shared.js';

export class TabManager {
  constructor(tabProgressManager) {
    this.tabProgressManager = tabProgressManager;
    this.stepValidator = null;
    this.tabButtons = [];
    this.tabPanels = [];
    this.cleanups = [];
    this.pendingNavigationFrame = null;
    this.scrollBehaviorRestoreTimeout = null;
    this.defaultInlineScrollBehavior = document.documentElement.style.scrollBehavior;
    this.initializeTabs();
  }

  addManagedListener(target, type, handler, options) {
    addManagedEventListener(target, type, handler, options, this.cleanups);
  }

  destroy() {
    if (this.pendingNavigationFrame !== null) {
      window.cancelAnimationFrame(this.pendingNavigationFrame);
      this.pendingNavigationFrame = null;
    }

    if (this.scrollBehaviorRestoreTimeout !== null) {
      window.clearTimeout(this.scrollBehaviorRestoreTimeout);
      this.scrollBehaviorRestoreTimeout = null;
    }

    document.documentElement.style.scrollBehavior = this.defaultInlineScrollBehavior;

    runManagedCleanups(this.cleanups);
  }

  setStepValidator(stepValidator) {
    this.stepValidator = stepValidator;
  }

  initializeTabs() {
    this.tabButtons = Array.from(document.querySelectorAll('.booking-tab[data-tab]'));
    this.tabPanels = Array.from(document.querySelectorAll('.booking-tab-panel'));

    this.tabButtons.forEach((button) => {
      this.addManagedListener(button, 'click', (evt) => {
        const tabName = button.getAttribute('data-tab');
        this.handleTabSelection(evt, tabName);
      });

      this.addManagedListener(button, 'keydown', (evt) => {
        this.handleTabKeydown(evt);
      });
    });

    this.initializeExternalTabLinks();

    const defaultBookingTab = document.getElementById('default-booking-tab');
    if (defaultBookingTab) {
      const tabName = defaultBookingTab.getAttribute('data-tab');
      if (tabName) {
        this.openTab({ currentTarget: defaultBookingTab }, tabName, false);
      }
    }
  }

  initializeExternalTabLinks() {
    document.querySelectorAll('[data-tab-link]').forEach((link) => {
      this.addManagedListener(link, 'click', (evt) => {
        evt.preventDefault();
        this.handleExternalTabSelection(link.getAttribute('data-tab-link'));
      });
    });
  }

  handleExternalTabSelection(tabName) {
    const targetButton = this.tabButtons.find((button) => button.getAttribute('data-tab') === tabName);

    if (!targetButton) {
      return;
    }

    if (targetButton.classList.contains('locked')) {
      this.requestActiveStepValidation();
      return;
    }

    if (this.shouldSubmitBeforeNavigation(tabName)) {
      this.requestActiveStepValidation();
      return;
    }

    this.navigateToTab(tabName);
  }

  getActiveTabName() {
    return this.tabButtons.find((button) => button.classList.contains('active'))?.getAttribute('data-tab') || null;
  }

  getTabIndex(tabName) {
    return this.tabProgressManager?.tabOrder.indexOf(tabName) ?? -1;
  }

  requestActiveStepValidation() {
    const activeTabName = this.getActiveTabName();
    if (!activeTabName || !this.stepValidator) {
      return false;
    }

    return this.stepValidator.attemptStepValidation(activeTabName);
  }

  navigateToTab(tabName, evt = null) {
    evt?.preventDefault?.();

    if (typeof evt?.submitter?.blur === 'function') {
      evt.submitter.blur();
    }

    if (typeof evt?.currentTarget?.blur === 'function') {
      evt.currentTarget.blur();
    }

    if (this.pendingNavigationFrame !== null) {
      window.cancelAnimationFrame(this.pendingNavigationFrame);
    }

    this.pendingNavigationFrame = window.requestAnimationFrame(() => {
      this.pendingNavigationFrame = null;
      this.openTab(null, tabName);
    });
  }

  shouldSubmitBeforeNavigation(targetTabName) {
    const activeTabName = this.getActiveTabName();
    if (!activeTabName || activeTabName === targetTabName) {
      return false;
    }

    const activeIndex = this.getTabIndex(activeTabName);
    const targetIndex = this.getTabIndex(targetTabName);

    return targetIndex === activeIndex + 1;
  }

  handleTabSelection(evt, tabName) {
    const targetButton = evt?.currentTarget;
    if (targetButton?.classList.contains('locked')) {
      evt.preventDefault();
      this.requestActiveStepValidation();
      return;
    }

    if (this.shouldSubmitBeforeNavigation(tabName)) {
      evt.preventDefault();
      this.requestActiveStepValidation();
      return;
    }

    this.navigateToTab(tabName, evt);
  }

  handleTabKeydown(evt) {
    const navigationKeys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
    if (!navigationKeys.includes(evt.key)) {
      return;
    }

    const availableTabs = this.tabButtons.filter((button) => !button.classList.contains('locked'));
    if (!availableTabs.length) {
      return;
    }

    evt.preventDefault();

    const currentIndex = availableTabs.indexOf(evt.currentTarget);
    let nextTab = evt.currentTarget;

    if (evt.key === 'Home') {
      nextTab = availableTabs[0];
    } else if (evt.key === 'End') {
      nextTab = availableTabs[availableTabs.length - 1];
    } else {
      const direction = evt.key === 'ArrowRight' ? 1 : -1;
      const nextIndex = (currentIndex + direction + availableTabs.length) % availableTabs.length;
      nextTab = availableTabs[nextIndex];
    }

    nextTab.focus();

    if (this.shouldSubmitBeforeNavigation(nextTab.getAttribute('data-tab'))) {
      this.requestActiveStepValidation();
      return;
    }

    this.navigateToTab(nextTab.getAttribute('data-tab'));
  }

  syncTabStates(activeTabName) {
    this.tabButtons.forEach((button) => {
      const tabName = button.getAttribute('data-tab');
      const isActive = tabName === activeTabName;
      const isLocked = button.classList.contains('locked');

      button.classList.toggle('active', isActive);
      button.disabled = false;
      button.setAttribute('aria-disabled', String(isLocked));
      button.setAttribute('aria-selected', String(isActive));
      button.setAttribute('aria-expanded', String(isActive));
      button.setAttribute('tabindex', isActive ? '0' : '-1');
    });
  }

  syncPanelStates(activeTabName) {
    this.tabPanels.forEach((panel) => {
      const isActive = panel.id === activeTabName;
      panel.hidden = !isActive;
      panel.style.display = isActive ? 'block' : 'none';
      panel.setAttribute('aria-hidden', String(!isActive));
    });
  }

  focusElement(target, preventScroll = false) {
    if (!target || typeof target.focus !== 'function') {
      return;
    }

    if (preventScroll) {
      try {
        target.focus({ preventScroll: true });
        return;
      } catch (error) {
        // Ignore unsupported focus options and fall back to a normal focus call.
      }
    }

    target.focus();
  }

  openTab(evt, tabName, shouldFocusTab = true) {
    try {
      const tabButton = document.querySelector(`.booking-tab[data-tab="${tabName}"]`);
      if (!tabButton || tabButton.disabled || tabButton.classList.contains('locked')) {
        return;
      }

      const selectedTab = document.getElementById(tabName);
      if (!selectedTab) {
        return;
      }

      this.syncPanelStates(tabName);
      this.syncTabStates(tabName);

      if (tabName === 'seating') {
        window.requestAnimationFrame(() => {
          if (window.seatPanoramaManager?.activate) {
            window.seatPanoramaManager.activate();
            return;
          }

          window.seatPanoramaViewer?.resize?.();
        });
      }

      if (shouldFocusTab) {
        this.focusElement(tabButton, true);
      }
      this.scrollToTop();
    } catch (error) {
      console.error('Error switching tabs:', error);
    }
  }

  scrollToTop() {
    const htmlElement = document.documentElement;
    const resetScrollPosition = () => {
      const scrollingElement = document.scrollingElement || document.documentElement;

      if (scrollingElement) {
        scrollingElement.scrollTop = 0;
      }

      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto',
      });
    };

    if (this.scrollBehaviorRestoreTimeout !== null) {
      window.clearTimeout(this.scrollBehaviorRestoreTimeout);
      this.scrollBehaviorRestoreTimeout = null;
    }

    htmlElement.style.scrollBehavior = 'auto';

    resetScrollPosition();

    window.requestAnimationFrame(() => {
      resetScrollPosition();

      this.scrollBehaviorRestoreTimeout = window.setTimeout(() => {
        htmlElement.style.scrollBehavior = this.defaultInlineScrollBehavior;
        this.scrollBehaviorRestoreTimeout = null;
      }, 0);
    });
  }
}

export class TabProgressManager {
  constructor() {
    this.tabOrder = ['flights', 'passengers', 'seating', 'summary'];
    this.completedTabs = new Set();
  }

  completeTab(tabName) {
    this.completedTabs.add(tabName);

    const tabButton = document.querySelector(`.booking-tab[data-tab="${tabName}"]`);
    if (tabButton) {
      tabButton.classList.add('completed');
    }

    const currentIndex = this.tabOrder.indexOf(tabName);
    if (currentIndex !== -1 && currentIndex < this.tabOrder.length - 1) {
      const nextTab = this.tabOrder[currentIndex + 1];
      this.unlockTab(nextTab);
    }
  }

  markTabIncomplete(tabName) {
    this.completedTabs.delete(tabName);

    const tabButton = document.querySelector(`.booking-tab[data-tab="${tabName}"]`);
    if (tabButton) {
      tabButton.classList.remove('completed');
    }
  }

  syncStepAvailability(stepStates) {
    const activeTabName = document.querySelector('.booking-tab.active')?.getAttribute('data-tab') || 'flights';
    const activeIndex = this.tabOrder.indexOf(activeTabName);

    this.tabOrder.forEach((tabName, index) => {
      const isComplete = Boolean(stepStates[tabName]);
      const tabButton = document.querySelector(`.booking-tab[data-tab="${tabName}"]`);

      if (isComplete) {
        this.completedTabs.add(tabName);
        if (tabButton) {
          tabButton.classList.add('completed');
        }
      } else {
        this.markTabIncomplete(tabName);
      }

      if (!tabButton) {
        return;
      }

      if (index === 0) {
        this.unlockTab(tabName);
        return;
      }

      const previousTab = this.tabOrder[index - 1];
      const previousComplete = Boolean(stepStates[previousTab]);
      const shouldUnlock = index <= activeIndex || previousComplete;

      if (shouldUnlock) {
        this.unlockTab(tabName);
      } else {
        this.lockTab(tabName);
      }
    });
  }

  unlockTab(tabName) {
    const tabButton = document.querySelector(`.booking-tab[data-tab="${tabName}"]`);
    if (tabButton) {
      tabButton.classList.remove('locked');
      tabButton.disabled = false;
      tabButton.setAttribute('aria-disabled', 'false');
    }
  }

  lockTab(tabName) {
    const tabButton = document.querySelector(`.booking-tab[data-tab="${tabName}"]`);
    if (tabButton && tabName !== 'flights') {
      tabButton.classList.add('locked');
      tabButton.disabled = false;
      tabButton.setAttribute('aria-disabled', 'true');
    }
  }

  isTabUnlocked(tabName) {
    const tabButton = document.querySelector(`.booking-tab[data-tab="${tabName}"]`);
    return tabButton && !tabButton.classList.contains('locked');
  }

  isTabCompleted(tabName) {
    return this.completedTabs.has(tabName);
  }

  resetFromTab(tabName) {
    const tabIndex = this.tabOrder.indexOf(tabName);
    if (tabIndex !== -1) {
      for (let i = tabIndex + 1; i < this.tabOrder.length; i++) {
        const tab = this.tabOrder[i];
        this.completedTabs.delete(tab);
        this.lockTab(tab);
        const tabButton = document.querySelector(`.booking-tab[data-tab="${tab}"]`);
        if (tabButton) {
          tabButton.classList.remove('completed');
        }
      }
    }
  }
}
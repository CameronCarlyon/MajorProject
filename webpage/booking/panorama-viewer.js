import { Viewer } from '@photo-sphere-viewer/core';

const DEFAULT_PANORAMA = './assets/panoramas/CabinPanorama.webp';

const FULLSCREEN_ENTER_ICON = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="psv-button-svg" aria-hidden="true">
  <path d="M8 3.5H4.5V7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M16 3.5h3.5V7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M8 20.5H4.5V17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M16 20.5h3.5V17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const FULLSCREEN_EXIT_ICON = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="psv-button-svg" aria-hidden="true">
  <path d="M9 9H5.5V5.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M15 9h3.5V5.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M9 15H5.5v3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M15 15h3.5v3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

class SeatPanoramaManager {
  constructor() {
    this.viewerElement = document.getElementById('viewer');
    this.viewer = null;
    this.pendingPanorama = DEFAULT_PANORAMA;
    this.fullscreenLabelObserver = null;
    this.handleFullscreenChange = () => {
      this.syncFullscreenButtonLabel();
    };
  }

  syncFullscreenButtonLabel() {
    const fullscreenButton = this.viewerElement?.querySelector('.psv-fullscreen-button');
    const isFullscreen = document.fullscreenElement === this.viewerElement;
    const label = isFullscreen ? 'Exit expanded cabin view' : 'Expand cabin view';
    const iconState = isFullscreen ? 'exit' : 'enter';
    const iconMarkup = isFullscreen ? FULLSCREEN_EXIT_ICON : FULLSCREEN_ENTER_ICON;

    if (!fullscreenButton) {
      return;
    }

    if (fullscreenButton.dataset.customIconState !== iconState) {
      fullscreenButton.innerHTML = iconMarkup;
      fullscreenButton.dataset.customIconState = iconState;
    }

    if (fullscreenButton.getAttribute('title') !== label) {
      fullscreenButton.setAttribute('title', label);
    }

    if (fullscreenButton.getAttribute('aria-label') !== label) {
      fullscreenButton.setAttribute('aria-label', label);
    }
  }

  observeFullscreenButtonLabel() {
    if (!this.viewerElement || this.fullscreenLabelObserver) {
      return;
    }

    this.fullscreenLabelObserver = new MutationObserver(() => {
      this.syncFullscreenButtonLabel();
    });

    this.fullscreenLabelObserver.observe(this.viewerElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['title'],
    });
  }

  queueFullscreenButtonSync() {
    window.requestAnimationFrame(() => {
      this.syncFullscreenButtonLabel();
      window.setTimeout(() => {
        this.syncFullscreenButtonLabel();
      }, 0);
      window.setTimeout(() => {
        this.syncFullscreenButtonLabel();
      }, 150);
    });
  }

  ensureViewer() {
    if (!this.viewerElement) {
      return null;
    }

    if (!this.viewer) {
      this.viewer = new Viewer({
        container: this.viewerElement,
        panorama: this.pendingPanorama,
        defaultZoomLvl: 0,
        loadingTxt: 'Preparing your cabin...',
        lang: {
          fullscreenIn: 'Expand cabin view',
          fullscreenOut: 'Exit expanded cabin view',
        },
        mousewheel: true,
        navbar: ['fullscreen'],
      });

      window.seatPanoramaViewer = this.viewer;
      document.addEventListener('fullscreenchange', this.handleFullscreenChange);
      this.observeFullscreenButtonLabel();
      this.queueFullscreenButtonSync();
    }

    return this.viewer;
  }

  activate() {
    const viewer = this.ensureViewer();
    if (!viewer) {
      return null;
    }

    window.requestAnimationFrame(() => {
      viewer.resize?.();
      viewer.autoSize?.();
      this.queueFullscreenButtonSync();
    });

    return viewer;
  }

  setPanorama(panoramaPath = DEFAULT_PANORAMA) {
    this.pendingPanorama = panoramaPath;

    const viewer = this.activate();
    if (!viewer || typeof viewer.setPanorama !== 'function') {
      return;
    }

    viewer.setPanorama(this.pendingPanorama);
  }
}

function initializeSeatPanoramaManager() {
  const viewerElement = document.getElementById('viewer');
  if (!viewerElement) {
    return;
  }

  window.seatPanoramaManager = new SeatPanoramaManager();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSeatPanoramaManager, { once: true });
} else {
  initializeSeatPanoramaManager();
}
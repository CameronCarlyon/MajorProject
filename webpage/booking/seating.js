import { addManagedEventListener, runManagedCleanups } from './shared.js';

const cabinLayoutModule = globalThis.cabinLayoutModule || null;
const ICON_SPRITE_PATH = './assets/svg/icons.svg';

const MATERIAL_ICON_MAP = {
  travel: 'icon-travel',
  airline_seat_recline_extra: 'icon-seat-recline-extra',
  tv_gen: 'icon-tv-gen',
  restaurant: 'icon-restaurant',
  redeem: 'icon-redeem',
  airline_seat_flat: 'icon-seat-flat',
  shower: 'icon-shower',
};

export class SeatManager {
  constructor() {
    this.seats = [];
    this.focusedSeat = null;
    this.selectedSeat = null;
    this.cabinDefinition = null;
    this.rowSeatMap = new Map();
    this.sortedSeatRows = [];
    this.cleanups = [];
    this.initializeSeatSystem();
  }

  addManagedListener(target, type, handler, options) {
    addManagedEventListener(target, type, handler, options, this.cleanups);
  }

  destroy() {
    runManagedCleanups(this.cleanups);
  }

  initializeSeatSystem() {
    this.seatingContainer = document.querySelector('.seating-container');
    this.seatingMap = document.getElementById('seat-map');
    this.cabinLayout = document.getElementById('cabin-layout');
    this.seatNumberDisplay = document.getElementById('seat-number');
    this.seatStatus = document.getElementById('seating-status');
    this.summarySeat = document.getElementById('passenger-seat');
    this.summaryClass = document.getElementById('passenger-class');
    this.totalPrice = document.getElementById('total-price');
    this.selectButton = document.getElementById('select-seat-button');
    this.seatUnavailableModal = document.getElementById('seat-unavailable-modal');

    if (!this.seatingMap || !this.cabinLayout) {
      return;
    }

    this.cabinDefinition = this.getCabinDefinition();

    if (!this.cabinDefinition) {
      console.error('Cabin layout configuration is unavailable.');
      return;
    }

    if (this.summaryClass) {
      this.summaryClass.textContent = this.cabinDefinition.summaryClassLabel || this.cabinDefinition.heading;
    }

    this.renderCabinLayout();
    this.applyResponsiveSeatScale();
    this.bindResponsiveSeatScale();
    this.seats = Array.from(this.cabinLayout.querySelectorAll('.seat'));

    if (!this.seats.length) {
      return;
    }

    this.buildSeatLookup();
    this.updateUnavailableSeats();
    this.randomizeOccupiedSeats();
    this.setupSeatSemantics();
    this.bindSeatClickHandlers();

    const initialSeat = this.getInitialFocusableSeat();
    this.setFocusSeat(initialSeat);
    this.updateSeatDisplays();

    if (this.selectButton) {
      this.selectButton.disabled = true;
    }
  }

  bindResponsiveSeatScale() {
    this.boundApplyResponsiveSeatScale = () => {
      this.applyResponsiveSeatScale();
    };

    this.addManagedListener(window, 'resize', this.boundApplyResponsiveSeatScale, { passive: true });

    if ('ResizeObserver' in window && this.seatingMap) {
      this.seatingScaleObserver = new ResizeObserver(() => {
        this.applyResponsiveSeatScale();
      });
      this.seatingScaleObserver.observe(this.seatingMap);
      this.cleanups.push(() => {
        this.seatingScaleObserver?.disconnect();
        this.seatingScaleObserver = null;
      });
    }
  }

  applyResponsiveSeatScale() {
    if (!this.seatingMap || !this.seatingContainer) {
      return;
    }

    const mobileBreakpoint = 850;

    if (window.innerWidth > mobileBreakpoint) {
      this.seatingMap.style.setProperty('--seat-scale', '1');
      return;
    }

    const seatMapWidth = this.seatingMap.getBoundingClientRect().width;

    if (!seatMapWidth) {
      return;
    }

    const seatingContainerStyles = getComputedStyle(this.seatingContainer);
    const scalableCabinWidth = Number.parseFloat(seatingContainerStyles.getPropertyValue('--mobile-scalable-cabin-width')) || 523;
    const wallWidthTotal = Number.parseFloat(seatingContainerStyles.getPropertyValue('--mobile-wall-width-total')) || 3;
    const seatScale = Math.min(1, Math.max(0.5, (seatMapWidth - wallWidthTotal) / scalableCabinWidth));

    this.seatingMap.style.setProperty('--seat-scale', seatScale.toFixed(4));
  }

  getCabinDefinition() {
    const cabinId = this.seatingMap?.dataset.cabinId || cabinLayoutModule?.defaultCabinId;

    if (!cabinId || !cabinLayoutModule?.cabins) {
      return null;
    }

    return cabinLayoutModule.cabins[cabinId] || null;
  }

  renderCabinLayout() {
    const fragment = document.createDocumentFragment();
    const headingElement = document.createElement('p');

    headingElement.className = 'cabin-heading';
    headingElement.id = 'seat-map-heading';
    headingElement.textContent = this.cabinDefinition.heading;
    fragment.appendChild(headingElement);

    this.cabinDefinition.layout.forEach((rowDefinition) => {
      const rowElement = document.createElement('div');
      rowElement.classList.add('cabin-row');

      switch (rowDefinition.type) {
        case 'letters-row':
          rowElement.classList.add('cabin-row--letters');
          rowElement.setAttribute('aria-hidden', 'true');
          this.appendCabinTrackLabels(rowElement);
          break;
        case 'seat-row':
          this.appendSeatRow(rowElement, rowDefinition);
          break;
        case 'service-row':
          rowElement.classList.add('cabin-row--service');
          rowElement.setAttribute('aria-hidden', 'true');
          this.appendServiceBlocks(rowElement, rowDefinition.blocks);
          break;
        case 'spacer-row':
          rowElement.classList.add('cabin-row--spacer');
          rowElement.setAttribute('aria-hidden', 'true');
          break;
        default:
          break;
      }

      fragment.appendChild(rowElement);
    });

    this.cabinLayout.replaceChildren(fragment);
    this.seatMapHeading = headingElement;
  }

  appendCabinTrackLabels(rowElement) {
    Object.entries(this.cabinDefinition.seatColumnStarts).forEach(([seatLetter, columnStart]) => {
      rowElement.appendChild(this.createTrackLabel(seatLetter, columnStart));
    });
  }

  appendSeatRow(rowElement, rowDefinition) {
    rowElement.appendChild(this.createTrackLabel(rowDefinition.rowNumber, this.cabinDefinition.aisleColumnStarts.left, 'cabin-track-label--row-number'));

    rowDefinition.seatLetters.forEach((seatLetter) => {
      rowElement.appendChild(this.createSeatElement(rowDefinition.rowNumber, seatLetter));
    });

    rowElement.appendChild(this.createTrackLabel(rowDefinition.rowNumber, this.cabinDefinition.aisleColumnStarts.right, 'cabin-track-label--row-number'));
  }

  appendServiceBlocks(rowElement, blocks) {
    blocks.forEach((blockDefinition) => {
      rowElement.appendChild(this.createServiceBlockElement(blockDefinition));
    });
  }

  createTrackLabel(label, columnStart, modifierClass = '') {
    const trackLabel = document.createElement('span');
    trackLabel.className = 'cabin-track-label';

    if (modifierClass) {
      trackLabel.classList.add(modifierClass);
    }

    trackLabel.style.gridColumnStart = String(columnStart);
    trackLabel.style.gridRowStart = '1';
    trackLabel.textContent = label;
    trackLabel.setAttribute('aria-hidden', 'true');
    return trackLabel;
  }

  createSeatElement(rowNumber, seatLetter) {
    const seat = document.createElement('div');
    const seatNumber = `${rowNumber}${seatLetter}`;
    const columnPosition = this.cabinDefinition.seatColumnStarts[seatLetter];

    seat.className = 'seat';
    seat.id = `seat-${seatNumber}`;
    seat.dataset.rowNumber = rowNumber;
    seat.dataset.seatLetter = seatLetter;
    seat.dataset.columnPosition = String(columnPosition);
    seat.style.gridColumnStart = String(columnPosition);
    seat.style.gridRowStart = '1';
    return seat;
  }

  createServiceBlockElement(blockDefinition) {
    const serviceBlock = document.createElement('div');
    const iconContainer = document.createElement('span');

    serviceBlock.className = 'service-block';
    serviceBlock.style.gridColumn = `${blockDefinition.startColumn} / span ${blockDefinition.span}`;
    serviceBlock.style.gridRowStart = '1';
    serviceBlock.title = blockDefinition.label;

    iconContainer.className = 'service-block__icons';
    blockDefinition.iconNames.forEach((iconName) => {
      const iconElement = this.createMaterialIconElement(iconName);
      iconContainer.appendChild(iconElement);
    });

    serviceBlock.appendChild(iconContainer);
    return serviceBlock;
  }

  createMaterialIconElement(iconName) {
    const symbolId = MATERIAL_ICON_MAP[iconName];
    const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const useElement = document.createElementNS('http://www.w3.org/2000/svg', 'use');

    svgElement.classList.add('icon', 'icon-material');
    svgElement.setAttribute('viewBox', '0 0 24 24');
    svgElement.setAttribute('aria-hidden', 'true');
    svgElement.setAttribute('focusable', 'false');

    if (!symbolId) {
      return svgElement;
    }

    useElement.setAttribute('href', `${ICON_SPRITE_PATH}#${symbolId}`);
    svgElement.appendChild(useElement);
    return svgElement;
  }

  buildSeatLookup() {
    this.rowSeatMap.clear();

    this.seats.forEach((seat) => {
      const rowNumber = this.getSeatRowNumber(seat);
      const columnPosition = this.getSeatColumnPosition(seat);

      if (!this.rowSeatMap.has(rowNumber)) {
        this.rowSeatMap.set(rowNumber, []);
      }

      this.rowSeatMap.get(rowNumber).push({ seat, columnPosition });
    });

    this.rowSeatMap.forEach((rowSeats) => {
      rowSeats.sort((leftSeat, rightSeat) => leftSeat.columnPosition - rightSeat.columnPosition);
    });

    this.sortedSeatRows = Array.from(this.rowSeatMap.keys()).sort((leftRow, rightRow) => leftRow - rightRow);
  }

  getSeatNumber(seat) {
    return seat.id.replace('seat-', '');
  }

  getSeatRowNumber(seat) {
    const rowNumber = Number.parseInt(seat.dataset.rowNumber || '0', 10);
    return Number.isNaN(rowNumber) ? 0 : rowNumber;
  }

  getSeatColumnPosition(seat) {
    const columnPosition = Number.parseInt(seat.dataset.columnPosition || '0', 10);
    return Number.isNaN(columnPosition) ? 0 : columnPosition;
  }

  createSeededRandom(seedValue) {
    let seed = 2166136261;

    String(seedValue).split('').forEach((character) => {
      seed ^= character.charCodeAt(0);
      seed = Math.imul(seed, 16777619);
    });

    return () => {
      seed += 0x6D2B79F5;
      let current = seed;
      current = Math.imul(current ^ (current >>> 15), current | 1);
      current ^= current + Math.imul(current ^ (current >>> 7), current | 61);
      return ((current ^ (current >>> 14)) >>> 0) / 4294967296;
    };
  }

  isSeatTaken(seat) {
    return seat.classList.contains('taken');
  }

  isSeatUnavailable(seat) {
    return seat.classList.contains('unavailable');
  }

  setupSeatSemantics() {
    this.seats.forEach((seat) => {
      seat.setAttribute('role', 'radio');
      seat.tabIndex = -1;
      this.syncSeatAccessibility(seat);
    });
  }

  syncSeatAccessibility(seat) {
    const seatNumber = this.getSeatNumber(seat);
    const isSelected = seat === this.selectedSeat;
    const stateLabel = this.isSeatTaken(seat)
      ? 'taken'
      : this.isSeatUnavailable(seat)
        ? 'unavailable'
        : isSelected
          ? 'selected'
          : 'available';

    seat.setAttribute('aria-label', `Seat ${seatNumber}, ${stateLabel}`);
    seat.setAttribute('aria-checked', String(isSelected));
    seat.setAttribute('aria-disabled', String(this.isSeatTaken(seat) || this.isSeatUnavailable(seat)));
  }

  getInitialFocusableSeat() {
    return this.getBoundarySeat() || this.seats[0] || null;
  }

  getBoundarySeat(fromEnd = false) {
    const seatSequence = fromEnd ? [...this.seats].reverse() : this.seats;
    return seatSequence.find((seat) => !this.isSeatTaken(seat) && !this.isSeatUnavailable(seat)) || null;
  }

  setFocusSeat(seat, shouldFocus = false) {
    if (!seat) {
      return;
    }

    this.focusedSeat = seat;
    this.seats.forEach((candidate) => {
      candidate.tabIndex = candidate === seat ? 0 : -1;
    });

    if (shouldFocus) {
      seat.focus();
    }
  }

  moveSeatFocus(currentSeat, direction) {
    let targetSeat = null;

    switch (direction) {
      case 'right':
        targetSeat = this.getHorizontalSeat(currentSeat, 1);
        break;
      case 'left':
        targetSeat = this.getHorizontalSeat(currentSeat, -1);
        break;
      case 'down':
        targetSeat = this.getVerticalSeat(currentSeat, 1);
        break;
      case 'up':
        targetSeat = this.getVerticalSeat(currentSeat, -1);
        break;
      default:
        break;
    }

    if (targetSeat) {
      this.setFocusSeat(targetSeat, true);
    }
  }

  getHorizontalSeat(currentSeat, direction) {
    const rowNumber = this.getSeatRowNumber(currentSeat);
    const rowSeats = this.rowSeatMap.get(rowNumber) || [];
    const currentIndex = rowSeats.findIndex((rowSeat) => rowSeat.seat === currentSeat);

    if (currentIndex === -1) {
      return null;
    }

    return rowSeats[currentIndex + direction]?.seat || null;
  }

  getVerticalSeat(currentSeat, direction) {
    const currentRowNumber = this.getSeatRowNumber(currentSeat);
    const currentColumnPosition = this.getSeatColumnPosition(currentSeat);
    const currentRowIndex = this.sortedSeatRows.indexOf(currentRowNumber);

    if (currentRowIndex === -1) {
      return null;
    }

    for (let rowIndex = currentRowIndex + direction; rowIndex >= 0 && rowIndex < this.sortedSeatRows.length; rowIndex += direction) {
      const rowSeats = this.rowSeatMap.get(this.sortedSeatRows[rowIndex]) || [];
      const matchingSeat = rowSeats.find((rowSeat) => rowSeat.columnPosition === currentColumnPosition);

      if (matchingSeat) {
        return matchingSeat.seat;
      }

      if (rowSeats.length) {
        const closestSeat = rowSeats.reduce((nearestSeat, rowSeat) => {
          if (!nearestSeat) {
            return rowSeat;
          }

          const currentDistance = Math.abs(rowSeat.columnPosition - currentColumnPosition);
          const nearestDistance = Math.abs(nearestSeat.columnPosition - currentColumnPosition);
          return currentDistance < nearestDistance ? rowSeat : nearestSeat;
        }, null);

        if (closestSeat) {
          return closestSeat.seat;
        }
      }
    }

    return null;
  }

  updateSeatDisplays(statusMessage = 'No seat selected.') {
    const totalPrice = this.getDisplayedPrice();

    if (this.selectedSeat) {
      const seatNumber = this.getSeatNumber(this.selectedSeat);
      if (this.seatNumberDisplay) {
        this.seatNumberDisplay.textContent = `Seat ${seatNumber}`;
      }
      if (this.summarySeat) {
        this.summarySeat.textContent = `Seat ${seatNumber}`;
      }
      if (this.seatStatus) {
        this.seatStatus.textContent = statusMessage || `Seat ${seatNumber} selected.`;
      }
      if (this.selectButton) {
        this.selectButton.disabled = false;
      }
      this.updatePricingDisplay(totalPrice);
      return;
    }

    if (this.seatNumberDisplay) {
      this.seatNumberDisplay.textContent = 'Select a Seat';
    }
    if (this.summarySeat) {
      this.summarySeat.textContent = 'Not selected';
    }
    if (this.seatStatus) {
      this.seatStatus.textContent = statusMessage;
    }
    if (this.selectButton) {
      this.selectButton.disabled = true;
    }
    this.updatePricingDisplay(totalPrice);
  }

  getDisplayedPrice() {
    const baseFare = this.cabinDefinition?.pricing?.baseFare || 0;

    if (!this.selectedSeat) {
      return baseFare;
    }

    return baseFare + this.getSeatSurcharge(this.selectedSeat);
  }

  getSeatSurcharge(seat) {
    const pricing = this.cabinDefinition?.pricing;

    if (!pricing) {
      return 0;
    }

    const rowNumber = this.getSeatRowNumber(seat);
    const matchedTier = (pricing.rowSurcharges || []).find((tier) => rowNumber >= tier.startRow && rowNumber <= tier.endRow);
    return matchedTier?.surcharge ?? pricing.defaultSeatSurcharge ?? 0;
  }

  updatePricingDisplay(amount) {
    if (!this.totalPrice) {
      return;
    }

    this.totalPrice.textContent = amount.toFixed(2);
  }

  activateSeat(seat, moveFocusToSelectButton = false) {
    const seatNumber = this.getSeatNumber(seat);

    if (this.isSeatTaken(seat)) {
      this.updateSeatDisplays(`Seat ${seatNumber} is already taken.`);
      return;
    }

    if (this.isSeatUnavailable(seat)) {
      this.updateSeatDisplays(`Seat ${seatNumber} is unavailable.`);
      if (this.seatUnavailableModal && !this.seatUnavailableModal.open) {
        this.seatUnavailableModal.showModal();
      }
      return;
    }

    this.selectedSeat = seat;

    this.seats.forEach((candidate) => {
      const isSelected = candidate === seat;
      candidate.classList.toggle('active', isSelected);
      candidate.textContent = isSelected ? seatNumber : '';
      this.syncSeatAccessibility(candidate);
    });

    const panoramaSource = `./assets/panoramas/${seatNumber}.webp`;
    if (window.seatPanoramaManager?.setPanorama) {
      window.seatPanoramaManager.setPanorama(panoramaSource);
    } else {
      const viewer = window.seatPanoramaViewer;
      if (viewer && typeof viewer.setPanorama === 'function') {
        viewer.setPanorama(panoramaSource);
      }
    }

    this.updateSeatDisplays(`Seat ${seatNumber} selected.`);
    document.dispatchEvent(new Event('seat-selection-change'));

    if (moveFocusToSelectButton && this.selectButton && !this.selectButton.disabled) {
      this.selectButton.focus();
    }
  }

  updateUnavailableSeats() {
    try {
      const unavailableSeatNumbers = new Set(this.cabinDefinition?.seatStateRules?.unavailableSeatNumbers || []);
      const unavailableRowRanges = this.cabinDefinition?.seatStateRules?.unavailableRowRanges || [];

      this.seats.forEach((seat) => {
        const seatNumber = this.getSeatNumber(seat);
        const rowNumber = this.getSeatRowNumber(seat);
        const isUnavailableByRow = unavailableRowRanges.some((range) => rowNumber >= range.startRow && rowNumber <= range.endRow);
        const isUnavailableBySeat = unavailableSeatNumbers.has(seatNumber);

        seat.classList.toggle('unavailable', isUnavailableByRow || isUnavailableBySeat);
      });
    } catch (error) {
      console.error('Error updating seat availability:', error);
    }
  }

  randomizeOccupiedSeats() {
    try {
      const occupiedRatio = this.cabinDefinition?.seatStateRules?.occupiedRatio ?? 0;
      const defaultSeat = this.seats[0] || null;
      const cabinSeats = this.seats.filter((seat) => !seat.classList.contains('unavailable') && seat !== defaultSeat);

      if (cabinSeats.length === 0 || occupiedRatio <= 0) return;

      this.seats.forEach((seat) => {
        seat.classList.remove('taken');
      });

      const shuffled = [...cabinSeats];
      const seededRandom = this.createSeededRandom(`${this.cabinDefinition?.id || 'default'}:${occupiedRatio}:${cabinSeats.length}`);

      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      const occupiedCount = Math.ceil(cabinSeats.length * occupiedRatio);
      for (let i = 0; i < occupiedCount; i++) {
        shuffled[i].classList.add('taken');
      }
    } catch (error) {
      console.error('Error randomizing occupied seats:', error);
    }
  }

  bindSeatClickHandlers() {
    try {
      this.seats.forEach((seat) => {
        this.addManagedListener(seat, 'focus', () => {
          this.setFocusSeat(seat);
        });

        this.addManagedListener(seat, 'click', () => {
          this.setFocusSeat(seat);
          this.activateSeat(seat);
        });

        this.addManagedListener(seat, 'keydown', (event) => {
          switch (event.key) {
            case 'ArrowRight':
              event.preventDefault();
              this.moveSeatFocus(seat, 'right');
              break;
            case 'ArrowLeft':
              event.preventDefault();
              this.moveSeatFocus(seat, 'left');
              break;
            case 'ArrowDown':
              event.preventDefault();
              this.moveSeatFocus(seat, 'down');
              break;
            case 'ArrowUp':
              event.preventDefault();
              this.moveSeatFocus(seat, 'up');
              break;
            case 'Home':
              event.preventDefault();
              this.setFocusSeat(this.getBoundarySeat() || this.seats[0], true);
              break;
            case 'End':
              event.preventDefault();
              this.setFocusSeat(this.getBoundarySeat(true) || this.seats[this.seats.length - 1], true);
              break;
            case 'Enter':
            case ' ': 
              event.preventDefault();
              this.activateSeat(seat, true);
              break;
            default:
              break;
          }
        });
      });
    } catch (error) {
      console.error('Error binding seat click handlers:', error);
    }
  }
}
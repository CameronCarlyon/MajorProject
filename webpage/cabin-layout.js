(function initializeCabinLayoutModule(globalScope) {
  const DEFAULT_CURRENCY_SYMBOL = '£';

  const CABIN_AISLE_COLUMN_STARTS = Object.freeze({
    left: 4,
    right: 9,
  });

  const CABIN_SEAT_COLUMN_STARTS = Object.freeze({
    A: 1,
    B: 2,
    C: 3,
    D: 5,
    E: 6,
    F: 7,
    G: 8,
    H: 10,
    J: 11,
    K: 12,
  });

  function createSeatLetterSet(seatColumnStarts, excludedSeatLetters = []) {
    return Object.freeze(
      Object.keys(seatColumnStarts).filter((seatLetter) => !excludedSeatLetters.includes(seatLetter))
    );
  }

  const FULL_ROW_SEAT_LETTERS = createSeatLetterSet(CABIN_SEAT_COLUMN_STARTS);
  const CENTER_SECTION_SEAT_LETTERS = createSeatLetterSet(CABIN_SEAT_COLUMN_STARTS, ['A', 'B', 'C', 'H', 'J', 'K']);
  const SIDE_SECTION_SEAT_LETTERS = createSeatLetterSet(CABIN_SEAT_COLUMN_STARTS, ['D', 'E', 'F', 'G']);
  const REAR_SECTION_SEAT_LETTERS = createSeatLetterSet(CABIN_SEAT_COLUMN_STARTS, ['C', 'H']);

  function createSeatRow(rowNumber, seatLetters = FULL_ROW_SEAT_LETTERS) {
    return Object.freeze({
      type: 'seat-row',
      rowNumber: String(rowNumber),
      seatLetters: Object.freeze([...seatLetters]),
    });
  }

  function createSeatRows(startRow, endRow, seatLetters = FULL_ROW_SEAT_LETTERS) {
    return Array.from({ length: endRow - startRow + 1 }, (_, index) => createSeatRow(startRow + index, seatLetters));
  }

  function createServiceBlock(startColumn, span, iconNames, label) {
    return Object.freeze({
      startColumn,
      span,
      iconNames: Object.freeze([...iconNames]),
      label,
    });
  }

  function createServiceRow(blocks) {
    return Object.freeze({
      type: 'service-row',
      blocks: Object.freeze([...blocks]),
    });
  }

  function createRowRange(startRow, endRow) {
    return Object.freeze({ startRow, endRow });
  }

  function createPricingTier(startRow, endRow, surcharge) {
    return Object.freeze({ startRow, endRow, surcharge });
  }

  function createSeatStateRules({ unavailableRowRanges = [], unavailableSeatNumbers = [], occupiedRatio = 0 } = {}) {
    return Object.freeze({
      unavailableRowRanges: Object.freeze([...unavailableRowRanges]),
      unavailableSeatNumbers: Object.freeze([...unavailableSeatNumbers]),
      occupiedRatio,
    });
  }

  function createPricingRules({ baseFare, defaultSeatSurcharge = 0, rowSurcharges = [], currencySymbol = DEFAULT_CURRENCY_SYMBOL }) {
    return Object.freeze({
      baseFare,
      defaultSeatSurcharge,
      rowSurcharges: Object.freeze([...rowSurcharges]),
      currencySymbol,
    });
  }

  const b777300erEconomy = Object.freeze({
    id: 'b777-300er-economy',
    name: 'B777-300ER Economy',
    heading: 'Economy Class',
    summaryClassLabel: 'Economy',
    aisleColumnStarts: CABIN_AISLE_COLUMN_STARTS,
    seatColumnStarts: CABIN_SEAT_COLUMN_STARTS,
    seatStateRules: createSeatStateRules({
      unavailableRowRanges: [createRowRange(23, 50)],
      occupiedRatio: 0.15,
    }),
    pricing: createPricingRules({
      baseFare: 489,
      rowSurcharges: [
        createPricingTier(17, 17, 42),
        createPricingTier(18, 18, 28),
        createPricingTier(19, 19, 18),
        createPricingTier(20, 20, 12),
      ],
    }),
    layout: Object.freeze([
      Object.freeze({ type: 'letters-row' }),
      ...createSeatRows(17, 21),
      createServiceRow([
        createServiceBlock(1, 3, ['wc', 'accessible'], 'Washroom and accessible area'),
        createServiceBlock(5, 4, ['wc', 'accessible'], 'Washroom and accessible area'),
        createServiceBlock(10, 3, ['wc', 'accessible'], 'Washroom and accessible area'),
      ]),
      createSeatRow(23, CENTER_SECTION_SEAT_LETTERS),
      ...createSeatRows(24, 36),
      createServiceRow([
        createServiceBlock(1, 3, ['wc', 'accessible'], 'Washroom and accessible area'),
        createServiceBlock(5, 4, ['skillet'], 'Galley'),
        createServiceBlock(10, 3, ['wc', 'accessible'], 'Washroom and accessible area'),
      ]),
      createSeatRow(37, SIDE_SECTION_SEAT_LETTERS),
      ...createSeatRows(38, 45),
      ...createSeatRows(46, 50, REAR_SECTION_SEAT_LETTERS),
      createServiceRow([
        createServiceBlock(1, 3, ['skillet'], 'Galley'),
        createServiceBlock(5, 4, ['wc', 'accessible'], 'Washroom and accessible area'),
      ]),
      Object.freeze({ type: 'spacer-row' }),
      createServiceRow([
        createServiceBlock(1, 3, ['skillet'], 'Galley'),
        createServiceBlock(5, 4, ['skillet'], 'Galley'),
        createServiceBlock(10, 3, ['skillet'], 'Galley'),
      ]),
    ]),
  });

  const premiumEconomySeatColumnStarts = Object.freeze({
    A: 1,
    B: 2,
    D: 5,
    E: 6,
    F: 7,
    G: 8,
    J: 11,
    K: 12,
  });

  const premiumEconomySeatLetters = createSeatLetterSet(premiumEconomySeatColumnStarts);

  const b777300erPremiumEconomy = Object.freeze({
    id: 'b777-300er-premium-economy',
    name: 'B777-300ER Premium Economy',
    heading: 'Premium Economy',
    summaryClassLabel: 'Premium Economy',
    aisleColumnStarts: CABIN_AISLE_COLUMN_STARTS,
    seatColumnStarts: premiumEconomySeatColumnStarts,
    seatStateRules: createSeatStateRules({
      occupiedRatio: 0.08,
    }),
    pricing: createPricingRules({
      baseFare: 1199,
      rowSurcharges: [
        createPricingTier(11, 11, 65),
        createPricingTier(12, 13, 35),
      ],
    }),
    layout: Object.freeze([
      Object.freeze({ type: 'letters-row' }),
      ...createSeatRows(11, 16, premiumEconomySeatLetters),
      createServiceRow([
        createServiceBlock(1, 2, ['skillet'], 'Galley'),
        createServiceBlock(5, 4, ['wc', 'accessible'], 'Washroom and accessible area'),
        createServiceBlock(11, 2, ['skillet'], 'Galley'),
      ]),
    ]),
  });

  globalScope.cabinLayoutModule = Object.freeze({
    defaultCabinId: b777300erEconomy.id,
    cabins: Object.freeze({
      [b777300erEconomy.id]: b777300erEconomy,
      [b777300erPremiumEconomy.id]: b777300erPremiumEconomy,
    }),
  });
})(window);
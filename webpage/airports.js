/**
 * Airport catalog and autocomplete manager
 * Provides autocomplete functionality for airport selection fields
 */

// Emirates destinations catalog
const AIRPORT_CATALOG = [
  // United Arab Emirates (Hub)
  { iata: "DXB", icao: "OMDB", city: "Dubai", name: "Dubai International Airport", country: "United Arab Emirates" },
  
  // Middle East
  { iata: "BAH", icao: "OBBI", city: "Manama", name: "Bahrain International Airport", country: "Bahrain" },
  { iata: "BEY", icao: "OLBA", city: "Beirut", name: "Beirut-Rafic Hariri International Airport", country: "Lebanon" },
  { iata: "BGW", icao: "ORBI", city: "Baghdad", name: "Baghdad International Airport", country: "Iraq" },
  { iata: "BSR", icao: "ORMM", city: "Basra", name: "Basra International Airport", country: "Iraq" },
  { iata: "AMM", icao: "OJAI", city: "Amman", name: "Queen Alia International Airport", country: "Jordan" },
  { iata: "KWI", icao: "OKBK", city: "Kuwait City", name: "Kuwait International Airport", country: "Kuwait" },
  { iata: "MCT", icao: "OOMS", city: "Muscat", name: "Muscat International Airport", country: "Oman" },
  { iata: "SLL", icao: "OOSA", city: "Salalah", name: "Salalah Airport", country: "Oman" },
  { iata: "DMM", icao: "OEDF", city: "Dammam", name: "King Fahd International Airport", country: "Saudi Arabia" },
  { iata: "JED", icao: "OEJN", city: "Jeddah", name: "King Abdulaziz International Airport", country: "Saudi Arabia" },
  { iata: "MED", icao: "OEMA", city: "Madinah", name: "Prince Mohammad bin Abdulaziz Airport", country: "Saudi Arabia" },
  { iata: "RUH", icao: "OERK", city: "Riyadh", name: "King Khalid International Airport", country: "Saudi Arabia" },
  { iata: "IKA", icao: "OIIE", city: "Tehran", name: "Imam Khomeini International Airport", country: "Iran" },
  
  // Europe
  { iata: "VIE", icao: "LOWW", city: "Vienna", name: "Vienna International Airport", country: "Austria" },
  { iata: "BRU", icao: "EBBR", city: "Brussels", name: "Brussels Airport", country: "Belgium" },
  { iata: "LCA", icao: "LCLK", city: "Larnaca", name: "Larnaca International Airport", country: "Cyprus" },
  { iata: "PRG", icao: "LKPR", city: "Prague", name: "Václav Havel Airport Prague", country: "Czech Republic" },
  { iata: "CPH", icao: "EKCH", city: "Copenhagen", name: "Copenhagen Airport", country: "Denmark" },
  { iata: "LYS", icao: "LFLL", city: "Lyon", name: "Lyon-Saint Exupéry Airport", country: "France" },
  { iata: "NCE", icao: "LFMN", city: "Nice", name: "Nice Côte d'Azur Airport", country: "France" },
  { iata: "CDG", icao: "LFPG", city: "Paris", name: "Charles de Gaulle Airport", country: "France" },
  { iata: "DUS", icao: "EDDL", city: "Düsseldorf", name: "Düsseldorf Airport", country: "Germany" },
  { iata: "FRA", icao: "EDDF", city: "Frankfurt", name: "Frankfurt Airport", country: "Germany" },
  { iata: "HAM", icao: "EDDH", city: "Hamburg", name: "Hamburg Airport", country: "Germany" },
  { iata: "MUC", icao: "EDDM", city: "Munich", name: "Munich Airport", country: "Germany" },
  { iata: "ATH", icao: "LGAV", city: "Athens", name: "Athens International Airport", country: "Greece" },
  { iata: "BUD", icao: "LHBP", city: "Budapest", name: "Budapest Ferenc Liszt International Airport", country: "Hungary" },
  { iata: "DUB", icao: "EIDW", city: "Dublin", name: "Dublin Airport", country: "Ireland" },
  { iata: "BLQ", icao: "LIPE", city: "Bologna", name: "Bologna Guglielmo Marconi Airport", country: "Italy" },
  { iata: "MXP", icao: "LIMC", city: "Milan", name: "Milan Malpensa Airport", country: "Italy" },
  { iata: "FCO", icao: "LIRF", city: "Rome", name: "Leonardo da Vinci-Fiumicino Airport", country: "Italy" },
  { iata: "VCE", icao: "LIPZ", city: "Venice", name: "Venice Marco Polo Airport", country: "Italy" },
  { iata: "MLA", icao: "LMML", city: "Malta", name: "Malta International Airport", country: "Malta" },
  { iata: "AMS", icao: "EHAM", city: "Amsterdam", name: "Amsterdam Airport Schiphol", country: "Netherlands" },
  { iata: "OSL", icao: "ENGM", city: "Oslo", name: "Oslo Gardermoen Airport", country: "Norway" },
  { iata: "WAW", icao: "EPWA", city: "Warsaw", name: "Warsaw Chopin Airport", country: "Poland" },
  { iata: "LIS", icao: "LPPT", city: "Lisbon", name: "Humberto Delgado Airport", country: "Portugal" },
  { iata: "OPO", icao: "LPPR", city: "Porto", name: "Francisco Sá Carneiro Airport", country: "Portugal" },
  { iata: "DME", icao: "UUDD", city: "Moscow", name: "Domodedovo International Airport", country: "Russia" },
  { iata: "BCN", icao: "LEBL", city: "Barcelona", name: "Josep Tarradellas Barcelona-El Prat Airport", country: "Spain" },
  { iata: "MAD", icao: "LEMD", city: "Madrid", name: "Adolfo Suárez Madrid-Barajas Airport", country: "Spain" },
  { iata: "ARN", icao: "ESSA", city: "Stockholm", name: "Stockholm Arlanda Airport", country: "Sweden" },
  { iata: "GVA", icao: "LSGG", city: "Geneva", name: "Geneva Airport", country: "Switzerland" },
  { iata: "ZRH", icao: "LSZH", city: "Zurich", name: "Zurich Airport", country: "Switzerland" },
  { iata: "IST", icao: "LTFM", city: "Istanbul", name: "Istanbul Airport", country: "Türkiye" },
  { iata: "BHX", icao: "EGBB", city: "Birmingham", name: "Birmingham Airport", country: "United Kingdom" },
  { iata: "GLA", icao: "EGPF", city: "Glasgow", name: "Glasgow Airport", country: "United Kingdom" },
  { iata: "LGW", icao: "EGKK", city: "London", name: "London Gatwick Airport", country: "United Kingdom" },
  { iata: "LHR", icao: "EGLL", city: "London", name: "London Heathrow Airport", country: "United Kingdom" },
  { iata: "STN", icao: "EGSS", city: "London", name: "London Stansted Airport", country: "United Kingdom" },
  { iata: "MAN", icao: "EGCC", city: "Manchester", name: "Manchester Airport", country: "United Kingdom" },
  { iata: "NCL", icao: "EGNT", city: "Newcastle", name: "Newcastle Airport", country: "United Kingdom" },
  
  // Africa
  { iata: "ALG", icao: "DAAG", city: "Algiers", name: "Houari Boumediene Airport", country: "Algeria" },
  { iata: "LAD", icao: "FNLU", city: "Luanda", name: "Quatro de Fevereiro Airport", country: "Angola" },
  { iata: "ABJ", icao: "DIAP", city: "Abidjan", name: "Félix-Houphouët-Boigny International Airport", country: "Côte d'Ivoire (Ivory Coast)" },
  { iata: "CAI", icao: "HECA", city: "Cairo", name: "Cairo International Airport", country: "Egypt" },
  { iata: "ADD", icao: "HAAB", city: "Addis Ababa", name: "Bole International Airport", country: "Ethiopia" },
  { iata: "ACC", icao: "DGAA", city: "Accra", name: "Kotoka International Airport", country: "Ghana" },
  { iata: "CKY", icao: "GUCY", city: "Conakry", name: "Conakry International Airport", country: "Guinea" },
  { iata: "NBO", icao: "HKJK", city: "Nairobi", name: "Jomo Kenyatta International Airport", country: "Kenya" },
  { iata: "TNR", icao: "FMMI", city: "Antananarivo", name: "Ivato International Airport", country: "Madagascar" },
  { iata: "MRU", icao: "FIMP", city: "Mauritius", name: "Sir Seewoosagur Ramgoolam International Airport", country: "Mauritius" },
  { iata: "CMN", icao: "GMMN", city: "Casablanca", name: "Mohammed V International Airport", country: "Morocco" },
  { iata: "LOS", icao: "DNMM", city: "Lagos", name: "Murtala Muhammed International Airport", country: "Nigeria" },
  { iata: "DSS", icao: "GOBD", city: "Dakar", name: "Blaise Diagne International Airport", country: "Senegal" },
  { iata: "CPT", icao: "FACT", city: "Cape Town", name: "Cape Town International Airport", country: "South Africa" },
  { iata: "DUR", icao: "FALE", city: "Durban", name: "King Shaka International Airport", country: "South Africa" },
  { iata: "JNB", icao: "FAOR", city: "Johannesburg", name: "O. R. Tambo International Airport", country: "South Africa" },
  { iata: "DAR", icao: "HTDA", city: "Dar es Salaam", name: "Julius Nyerere International Airport", country: "Tanzania" },
  { iata: "TUN", icao: "DTTA", city: "Tunis", name: "Tunis-Carthage International Airport", country: "Tunisia" },
  { iata: "EBB", icao: "HUEN", city: "Entebbe", name: "Entebbe International Airport", country: "Uganda" },
  { iata: "LUN", icao: "FLLS", city: "Lusaka", name: "Kenneth Kaunda International Airport", country: "Zambia" },
  { iata: "HRE", icao: "FVHA", city: "Harare", name: "Robert Gabriel Mugabe International Airport", country: "Zimbabwe" },
  
  // Asia and the Pacific
  { iata: "ADL", icao: "YPAD", city: "Adelaide", name: "Adelaide Airport", country: "Australia" },
  { iata: "BNE", icao: "YBBN", city: "Brisbane", name: "Brisbane Airport", country: "Australia" },
  { iata: "MEL", icao: "YMML", city: "Melbourne", name: "Melbourne Airport", country: "Australia" },
  { iata: "PER", icao: "YPPH", city: "Perth", name: "Perth Airport", country: "Australia" },
  { iata: "SYD", icao: "YSSY", city: "Sydney", name: "Sydney Kingsford Smith Airport", country: "Australia" },
  { iata: "DAC", icao: "VGHS", city: "Dhaka", name: "Hazrat Shahjalal International Airport", country: "Bangladesh" },
  { iata: "PNH", icao: "VDPP", city: "Phnom Penh", name: "Phnom Penh International Airport", country: "Cambodia" },
  { iata: "CAN", icao: "ZGGG", city: "Guangzhou", name: "Guangzhou Baiyun International Airport", country: "China" },
  { iata: "HGH", icao: "ZSHC", city: "Hangzhou", name: "Hangzhou Xiaoshan International Airport", country: "China" },
  { iata: "PVG", icao: "ZSPD", city: "Shanghai", name: "Shanghai Pudong International Airport", country: "China" },
  { iata: "HKG", icao: "VHHH", city: "Hong Kong", name: "Hong Kong International Airport", country: "Hong Kong" },
  { iata: "AMD", icao: "VAAH", city: "Ahmedabad", name: "Sardar Vallabhbhai Patel International Airport", country: "India" },
  { iata: "BLR", icao: "VOBL", city: "Bangalore", name: "Kempegowda International Airport", country: "India" },
  { iata: "CCU", icao: "VECC", city: "Kolkata", name: "Netaji Subhas Chandra Bose International Airport", country: "India" },
  { iata: "COK", icao: "VOCI", city: "Kochi", name: "Cochin International Airport", country: "India" },
  { iata: "DEL", icao: "VIDP", city: "Delhi", name: "Indira Gandhi International Airport", country: "India" },
  { iata: "HYD", icao: "VOHS", city: "Hyderabad", name: "Rajiv Gandhi International Airport", country: "India" },
  { iata: "MAA", icao: "VOMM", city: "Chennai", name: "Chennai International Airport", country: "India" },
  { iata: "BOM", icao: "VABB", city: "Mumbai", name: "Chhatrapati Shivaji Maharaj International Airport", country: "India" },
  { iata: "TRV", icao: "VOTV", city: "Thiruvananthapuram", name: "Trivandrum International Airport", country: "India" },
  { iata: "CGK", icao: "WIII", city: "Jakarta", name: "Soekarno-Hatta International Airport", country: "Indonesia" },
  { iata: "DPS", icao: "WADD", city: "Denpasar", name: "Ngurah Rai International Airport", country: "Indonesia" },
  { iata: "SUB", icao: "WARR", city: "Surabaya", name: "Juanda International Airport", country: "Indonesia" },
  { iata: "KIX", icao: "RJBB", city: "Osaka", name: "Kansai International Airport", country: "Japan" },
  { iata: "NRT", icao: "RJAA", city: "Tokyo", name: "Narita International Airport", country: "Japan" },
  { iata: "HND", icao: "RJTT", city: "Tokyo", name: "Tokyo Haneda Airport", country: "Japan" },
  { iata: "ICN", icao: "RKSI", city: "Seoul", name: "Incheon International Airport", country: "South Korea" },
  { iata: "KUL", icao: "WMKK", city: "Kuala Lumpur", name: "Kuala Lumpur International Airport", country: "Malaysia" },
  { iata: "PEN", icao: "WMKP", city: "Penang", name: "Penang International Airport", country: "Malaysia" },
  { iata: "MLE", icao: "VRMM", city: "Malé", name: "Velana International Airport", country: "Maldives" },
  { iata: "AKL", icao: "NZAA", city: "Auckland", name: "Auckland Airport", country: "New Zealand" },
  { iata: "CHC", icao: "NZCH", city: "Christchurch", name: "Christchurch International Airport", country: "New Zealand" },
  { iata: "ISB", icao: "OPIS", city: "Islamabad", name: "Islamabad International Airport", country: "Pakistan" },
  { iata: "KHI", icao: "OPKC", city: "Karachi", name: "Jinnah International Airport", country: "Pakistan" },
  { iata: "LHE", icao: "OPLA", city: "Lahore", name: "Allama Iqbal International Airport", country: "Pakistan" },
  { iata: "PEW", icao: "OPPS", city: "Peshawar", name: "Bacha Khan International Airport", country: "Pakistan" },
  { iata: "MNL", icao: "RPLL", city: "Manila", name: "Ninoy Aquino International Airport", country: "Philippines" },
  { iata: "CEB", icao: "RPVM", city: "Cebu", name: "Mactan-Cebu International Airport", country: "Philippines" },
  { iata: "CRK", icao: "RPLC", city: "Clark", name: "Clark International Airport", country: "Philippines" },
  { iata: "SEZ", icao: "FSIA", city: "Mahé", name: "Seychelles International Airport", country: "Seychelles" },
  { iata: "SIN", icao: "WSSS", city: "Singapore", name: "Singapore Changi Airport", country: "Singapore" },
  { iata: "CMB", icao: "VCBI", city: "Colombo", name: "Bandaranaike International Airport", country: "Sri Lanka" },
  { iata: "TPE", icao: "RCTP", city: "Taipei", name: "Taiwan Taoyuan International Airport", country: "Taiwan" },
  { iata: "BKK", icao: "VTBS", city: "Bangkok", name: "Suvarnabhumi Airport", country: "Thailand" },
  { iata: "HKT", icao: "VTSP", city: "Phuket", name: "Phuket International Airport", country: "Thailand" },
  { iata: "HAN", icao: "VVNB", city: "Hanoi", name: "Noi Bai International Airport", country: "Vietnam" },
  { iata: "SGN", icao: "VVTS", city: "Ho Chi Minh City", name: "Tan Son Nhat International Airport", country: "Vietnam" },
  
  // The Americas
  { iata: "EZE", icao: "SAEZ", city: "Buenos Aires", name: "Ministro Pistarini International Airport", country: "Argentina" },
  { iata: "GRU", icao: "SBGR", city: "São Paulo", name: "São Paulo/Guarulhos International Airport", country: "Brazil" },
  { iata: "GIG", icao: "SBGL", city: "Rio de Janeiro", name: "Rio de Janeiro/Galeão International Airport", country: "Brazil" },
  { iata: "YYZ", icao: "CYYZ", city: "Toronto", name: "Toronto Pearson International Airport", country: "Canada" },
  { iata: "BOG", icao: "SKBO", city: "Bogotá", name: "El Dorado International Airport", country: "Colombia" },
  { iata: "MEX", icao: "MMMX", city: "Mexico City", name: "Mexico City International Airport", country: "Mexico" },
  { iata: "BOS", icao: "KBOS", city: "Boston", name: "Boston Logan International Airport", country: "United States" },
  { iata: "ORD", icao: "KORD", city: "Chicago", name: "O'Hare International Airport", country: "United States" },
  { iata: "DFW", icao: "KDFW", city: "Dallas", name: "Dallas/Fort Worth International Airport", country: "United States" },
  { iata: "IAH", icao: "KIAH", city: "Houston", name: "George Bush Intercontinental Airport", country: "United States" },
  { iata: "LAX", icao: "KLAX", city: "Los Angeles", name: "Los Angeles International Airport", country: "United States" },
  { iata: "MIA", icao: "KMIA", city: "Miami", name: "Miami International Airport", country: "United States" },
  { iata: "EWR", icao: "KEWR", city: "Newark", name: "Newark Liberty International Airport", country: "United States" },
  { iata: "JFK", icao: "KJFK", city: "New York", name: "John F. Kennedy International Airport", country: "United States" },
  { iata: "MCO", icao: "KMCO", city: "Orlando", name: "Orlando International Airport", country: "United States" },
  { iata: "SFO", icao: "KSFO", city: "San Francisco", name: "San Francisco International Airport", country: "United States" },
  { iata: "SEA", icao: "KSEA", city: "Seattle", name: "Seattle-Tacoma International Airport", country: "United States" },
  { iata: "IAD", icao: "KIAD", city: "Washington D.C.", name: "Washington Dulles International Airport", country: "United States" },
];

/**
 * Airport Autocomplete Manager Class
 */
class AirportAutocompleteManager {
  constructor() {
    this.fromInput = null;
    this.toInput = null;
    this.fromDropdown = null;
    this.toDropdown = null;
    this.selectedFrom = null;
    this.selectedTo = null;
    this.activeOptionIndex = {
      from: -1,
      to: -1
    };
    this.scrollState = {
      from: null,
      to: null
    };
    
    this.init();
  }

  init() {
    this.fromInput = document.getElementById('airport-from-input');
    this.toInput = document.getElementById('airport-to-input');
    
    if (!this.fromInput || !this.toInput) {
      console.warn('Airport autocomplete: Input fields not found');
      return;
    }

    // Create dropdown containers
    this.fromDropdown = this.createDropdown('from');
    this.toDropdown = this.createDropdown('to');
    
    // Wrap inputs and add dropdowns
    this.wrapInput(this.fromInput, this.fromDropdown);
    this.wrapInput(this.toInput, this.toDropdown);

    this.fromInput.setAttribute('aria-autocomplete', 'list');
    this.fromInput.setAttribute('aria-controls', this.fromDropdown.id);
    this.fromInput.setAttribute('aria-expanded', 'false');
    this.fromInput.setAttribute('aria-haspopup', 'listbox');

    this.toInput.setAttribute('aria-autocomplete', 'list');
    this.toInput.setAttribute('aria-controls', this.toDropdown.id);
    this.toInput.setAttribute('aria-expanded', 'false');
    this.toInput.setAttribute('aria-haspopup', 'listbox');

    // Infinite scroll for dropdowns
    this.fromDropdown.addEventListener('scroll', () => this.handleScroll('from'));
    this.toDropdown.addEventListener('scroll', () => this.handleScroll('to'));
    
    // Add event listeners
    this.fromInput.addEventListener('input', (e) => this.handleInput(e, 'from'));
    this.toInput.addEventListener('input', (e) => this.handleInput(e, 'to'));
    this.fromInput.addEventListener('keydown', (e) => this.handleKeydown(e, 'from'));
    this.toInput.addEventListener('keydown', (e) => this.handleKeydown(e, 'to'));
    
    this.fromInput.addEventListener('focus', (e) => this.handleFocus(e, 'from'));
    this.toInput.addEventListener('focus', (e) => this.handleFocus(e, 'to'));
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.fromInput.parentElement.contains(e.target)) {
        this.closeDropdown('from');
      }
      if (!this.toInput.parentElement.contains(e.target)) {
        this.closeDropdown('to');
      }
    });
  }

  createDropdown(type) {
    const dropdown = document.createElement('div');
    dropdown.className = 'airport-autocomplete-dropdown';
    dropdown.id = `airport-dropdown-${type}`;
    dropdown.tabIndex = -1;
    dropdown.setAttribute('role', 'listbox');
    dropdown.setAttribute('aria-label', type === 'from' ? 'Departure airport suggestions' : 'Destination airport suggestions');
    return dropdown;
  }

  wrapInput(input, dropdown) {
    const wrapper = document.createElement('div');
    wrapper.className = 'airport-autocomplete-wrapper';
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);
    wrapper.appendChild(dropdown);
  }

  handleInput(e, type) {
    const query = e.target.value.trim().toLowerCase();
    const dropdown = type === 'from' ? this.fromDropdown : this.toDropdown;
    const excludeAirport = type === 'from' ? this.selectedTo : this.selectedFrom;
    
    if (query.length === 0) {
      // Show all airports when input is cleared
      const allAirports = this.getAllAirportsSorted(excludeAirport);
      this.renderDropdown(dropdown, allAirports, type, true);
    } else if (query.length < 1) {
      dropdown.classList.remove('open');
      return;
    } else {
      const matches = this.searchAirports(query, excludeAirport);
      this.renderDropdown(dropdown, matches, type, false, query);
    }
  }

  handleKeydown(e, type) {
    const input = type === 'from' ? this.fromInput : this.toInput;
    const dropdown = type === 'from' ? this.fromDropdown : this.toDropdown;
    const query = input.value.trim().toLowerCase();
    const excludeAirport = type === 'from' ? this.selectedTo : this.selectedFrom;

    switch (e.key) {
      case 'ArrowDown': {
        if (!dropdown.classList.contains('open')) {
          const airports = query.length === 0
            ? this.getAllAirportsSorted(excludeAirport)
            : this.searchAirports(query, excludeAirport);
          this.renderDropdown(dropdown, airports, type, query.length === 0, query);
        }

        const items = this.getNavigableItems(dropdown);
        if (!items.length) {
          return;
        }

        e.preventDefault();
        const nextIndex = this.activeOptionIndex[type] < 0 ? 0 : this.activeOptionIndex[type] + 1;
        this.setActiveOption(type, nextIndex);
        break;
      }
      case 'ArrowUp': {
        const items = this.getNavigableItems(dropdown);
        if (!dropdown.classList.contains('open') || !items.length) {
          return;
        }

        e.preventDefault();
        const nextIndex = this.activeOptionIndex[type] <= 0 ? items.length - 1 : this.activeOptionIndex[type] - 1;
        this.setActiveOption(type, nextIndex);
        break;
      }
      case 'Enter': {
        const items = this.getNavigableItems(dropdown);
        if (!dropdown.classList.contains('open') || this.activeOptionIndex[type] < 0 || !items.length) {
          return;
        }

        e.preventDefault();
        items[this.activeOptionIndex[type]]?.click();
        break;
      }
      case 'Escape':
        if (dropdown.classList.contains('open')) {
          e.preventDefault();
          this.closeDropdown(type);
        }
        break;
      case 'Tab':
        this.closeDropdown(type);
        break;
      default:
        break;
    }
  }

  handleFocus(e, type) {
    const query = e.target.value.trim().toLowerCase();
    const dropdown = type === 'from' ? this.fromDropdown : this.toDropdown;
    const excludeAirport = type === 'from' ? this.selectedTo : this.selectedFrom;
    
    if (query.length >= 1) {
      // Use search functionality when user has typed
      const matches = this.searchAirports(query, excludeAirport);
      this.renderDropdown(dropdown, matches, type, false, query);
    } else {
      this.closeDropdown(type);
    }
  }

  getAllAirportsSorted(excludeAirport = null) {
    let airports = AIRPORT_CATALOG.filter(airport => {
      // Exclude already selected airport
      if (excludeAirport && airport.iata === excludeAirport.iata) {
        return false;
      }
      return true;
    });
    
    // Sort alphabetically by city name
    airports.sort((a, b) => a.city.localeCompare(b.city));
    
    return airports;
  }

  formatAirportValue(airport) {
    return `${airport.city} (${airport.iata})`;
  }

  searchAirports(query, excludeAirport = null) {
    const results = AIRPORT_CATALOG.filter(airport => {
      // Exclude already selected airport
      if (excludeAirport && airport.iata === excludeAirport.iata) {
        return false;
      }
      
      // Search in various fields
      const searchFields = [
        airport.iata.toLowerCase(),
        airport.icao.toLowerCase(),
        airport.city.toLowerCase(),
        airport.name.toLowerCase(),
        airport.country.toLowerCase(),
        this.formatAirportValue(airport).toLowerCase()
      ];
      
      return searchFields.some(field => field.includes(query));
    });
    
    // Sort by relevance (IATA/city exact matches first)
    results.sort((a, b) => {
      const aIataMatch = a.iata.toLowerCase() === query;
      const bIataMatch = b.iata.toLowerCase() === query;
      const aCityStartsWith = a.city.toLowerCase().startsWith(query);
      const bCityStartsWith = b.city.toLowerCase().startsWith(query);
      
      if (aIataMatch && !bIataMatch) return -1;
      if (bIataMatch && !aIataMatch) return 1;
      if (aCityStartsWith && !bCityStartsWith) return -1;
      if (bCityStartsWith && !aCityStartsWith) return 1;
      
      return a.city.localeCompare(b.city);
    });
    
    return results;
  }

  renderDropdown(dropdown, airports, type, showSections = false, searchQuery = '') {
    dropdown.innerHTML = '';
    this.activeOptionIndex[type] = -1;

    const input = type === 'from' ? this.fromInput : this.toInput;
    input.removeAttribute('aria-activedescendant');
        const createNoResultsItem = (queryText) => {
          const emptyState = document.createElement('div');
          emptyState.className = 'airport-autocomplete-empty';

          const title = document.createElement('div');
          title.className = 'airport-autocomplete-empty-title';

          const hint = document.createElement('div');
          hint.className = 'airport-autocomplete-empty-hint';

          const normalizedQuery = (queryText || '').trim();
          const primaryText = normalizedQuery
            ? `No results matching "${normalizedQuery}".`
            : 'No matching airports found.';

          title.textContent = primaryText;
          hint.textContent = 'Try searching by city, airport name, country, or IATA code.';

          emptyState.appendChild(title);
          emptyState.appendChild(hint);
          return emptyState;
        };

    
    const createAirportItem = (airport) => {
      const item = document.createElement('div');
      item.className = 'airport-autocomplete-item';
      item.id = `airport-option-${type}-${airport.iata}`;
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', 'false');
      item.innerHTML = `
        <div class="airport-item-content">
          <div class="airport-item-main">
            <span class="airport-city">${airport.city}</span>
            <span class="airport-country">${airport.country}</span>
          </div>
          <div class="airport-name">${airport.name}</div>
        </div>
        <span class="airport-iata">${airport.iata}</span>
      `;
      item.addEventListener('mouseenter', () => {
        const items = this.getNavigableItems(dropdown);
        this.setActiveOption(type, items.indexOf(item));
      });
      item.addEventListener('click', () => this.selectAirport(airport, type));
      return item;
    };

    const excludeAirport = type === 'from' ? this.selectedTo : this.selectedFrom;
    const currentLocationAirport = AIRPORT_CATALOG.find(a => a.iata === 'DXB');
    const canShowCurrent = currentLocationAirport && (!excludeAirport || excludeAirport.iata !== 'DXB');

    let hasAnyItems = false;

    const allAirports = showSections ? airports.filter(a => a.iata !== 'DXB') : airports;
    const pageSize = showSections ? 10 : 8;

    this.scrollState[type] = {
      dropdown,
      allAirports,
      renderedCount: 0,
      pageSize,
      showSections,
      createAirportItem
    };

    if (showSections) {
      // Current location section
      const currentHeader = document.createElement('div');
      currentHeader.className = 'airport-autocomplete-section';
      currentHeader.textContent = 'Current location';
      dropdown.appendChild(currentHeader);

      if (canShowCurrent) {
        dropdown.appendChild(createAirportItem(currentLocationAirport));
        hasAnyItems = true;
      }

      // All locations section
      const allHeader = document.createElement('div');
      allHeader.className = 'airport-autocomplete-section';
      allHeader.textContent = 'All locations';
      dropdown.appendChild(allHeader);

      if (allAirports.length > 0) {
        hasAnyItems = true;
      }
    } else {
      // Typed state: show only all locations
      if (allAirports.length === 0) {
        dropdown.appendChild(createNoResultsItem(searchQuery));
        this.openDropdown(type);
        return;
      }
      hasAnyItems = true;
    }

    if (!hasAnyItems) {
      this.closeDropdown(type);
      return;
    }

    this.appendNextBatch(type);
    this.openDropdown(type);
  }

  appendNextBatch(type) {
    const state = this.scrollState[type];
    if (!state) return;

    const { dropdown, allAirports, renderedCount, pageSize, createAirportItem } = state;
    const nextBatch = allAirports.slice(renderedCount, renderedCount + pageSize);

    if (nextBatch.length === 0) return;

    nextBatch.forEach(airport => {
      dropdown.appendChild(createAirportItem(airport));
    });

    state.renderedCount += nextBatch.length;
  }

  handleScroll(type) {
    const state = this.scrollState[type];
    if (!state || !state.dropdown) return;

    const { dropdown, renderedCount, allAirports } = state;
    const threshold = 24;

    if (renderedCount >= allAirports.length) return;

    if (dropdown.scrollTop + dropdown.clientHeight >= dropdown.scrollHeight - threshold) {
      this.appendNextBatch(type);
    }
  }

  selectAirport(airport, type) {
    const input = type === 'from' ? this.fromInput : this.toInput;
    
    // Set the selected airport
    if (type === 'from') {
      this.selectedFrom = airport;
    } else {
      this.selectedTo = airport;
    }
    
    // Update input value
    input.value = this.formatAirportValue(airport);
    input.setAttribute('data-iata', airport.iata);
    input.setAttribute('data-airport', JSON.stringify(airport));
    
    this.closeDropdown(type);
    input.focus();
  }

  getNavigableItems(dropdown) {
    return Array.from(dropdown.querySelectorAll('.airport-autocomplete-item'));
  }

  openDropdown(type) {
    const dropdown = type === 'from' ? this.fromDropdown : this.toDropdown;
    const input = type === 'from' ? this.fromInput : this.toInput;
    dropdown.classList.add('open');
    input.setAttribute('aria-expanded', 'true');
  }

  closeDropdown(type) {
    const dropdown = type === 'from' ? this.fromDropdown : this.toDropdown;
    const input = type === 'from' ? this.fromInput : this.toInput;

    dropdown.classList.remove('open');
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    this.activeOptionIndex[type] = -1;

    this.getNavigableItems(dropdown).forEach((item) => {
      item.classList.remove('is-active');
      item.setAttribute('aria-selected', 'false');
    });
  }

  setActiveOption(type, index) {
    const dropdown = type === 'from' ? this.fromDropdown : this.toDropdown;
    const input = type === 'from' ? this.fromInput : this.toInput;
    const items = this.getNavigableItems(dropdown);
    if (!items.length) {
      input.removeAttribute('aria-activedescendant');
      this.activeOptionIndex[type] = -1;
      return;
    }

    const wrappedIndex = ((index % items.length) + items.length) % items.length;
    this.activeOptionIndex[type] = wrappedIndex;

    items.forEach((item, itemIndex) => {
      const isActive = itemIndex === wrappedIndex;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-selected', String(isActive));

      if (isActive) {
        input.setAttribute('aria-activedescendant', item.id);
        item.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  // Public method to get selected airports
  getSelectedAirports() {
    return {
      from: this.selectedFrom,
      to: this.selectedTo
    };
  }
}

globalThis.airportCatalog = AIRPORT_CATALOG;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new AirportAutocompleteManager();
});

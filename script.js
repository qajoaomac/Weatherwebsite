// Weather code to icon mapping (Open-Meteo uses WMO weather codes)
const weatherIcons = {
    0: '☀️',   // Clear sky
    1: '🌤️',   // Mainly clear
    2: '⛅',   // Partly cloudy
    3: '☁️',   // Overcast
    45: '🌫️',  // Fog
    48: '🌫️',  // Depositing rime fog
    51: '🌦️',  // Light drizzle
    53: '🌦️',  // Moderate drizzle
    55: '🌦️',  // Dense drizzle
    56: '🌦️',  // Light freezing drizzle
    57: '🌦️',  // Dense freezing drizzle
    61: '🌧️',  // Slight rain
    63: '🌧️',  // Moderate rain
    65: '🌧️',  // Heavy rain
    66: '🌧️',  // Light freezing rain
    67: '🌧️',  // Heavy freezing rain
    71: '🌨️',  // Slight snow fall
    73: '🌨️',  // Moderate snow fall
    75: '🌨️',  // Heavy snow fall
    77: '🌨️',  // Snow grains
    80: '🌦️',  // Slight rain showers
    81: '🌦️',  // Moderate rain showers
    82: '🌦️',  // Violent rain showers
    85: '🌨️',  // Slight snow showers
    86: '🌨️',  // Heavy snow showers
    95: '⛈️',  // Thunderstorm
    96: '⛈️',  // Thunderstorm with slight hail
    99: '⛈️',  // Thunderstorm with heavy hail
};

const weatherDescriptions = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Thunderstorm with heavy hail',
};

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const errorMessage = document.getElementById('errorMessage');
const retryBtn = document.getElementById('retryBtn');
const weatherDisplay = document.getElementById('weatherDisplay');

// Weather display elements
const cityName = document.getElementById('cityName');
const currentDate = document.getElementById('currentDate');
const weatherIcon = document.getElementById('weatherIcon');
const currentTemp = document.getElementById('currentTemp');
const weatherDescription = document.getElementById('weatherDescription');
const feelsLike = document.getElementById('feelsLike');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const uvIndex = document.getElementById('uvIndex');
const hourlyList = document.getElementById('hourlyList');
const dailyList = document.getElementById('dailyList');
const autocompleteDropdown = document.getElementById('autocompleteDropdown');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const unitToggle = document.getElementById('unitToggle');
const unitText = document.getElementById('unitText');
const favoriteBtn = document.getElementById('favoriteBtn');
const favoritesList = document.getElementById('favoritesList');
const sunriseSunset = document.getElementById('sunriseSunset');
const windDirection = document.getElementById('windDirection');
const airQuality = document.getElementById('airQuality');
const pressure = document.getElementById('pressure');
const temperatureUnit = document.querySelector('.temperature-unit');
const weatherAlerts = document.getElementById('weatherAlerts');
const weatherTrend = document.getElementById('weatherTrend');
const activitySuggestions = document.getElementById('activitySuggestions');
const shareBtn = document.getElementById('shareBtn');

// State
let currentLocation = null;
let autocompleteTimeout = null;
let selectedAutocompleteIndex = -1;
let autocompleteResults = [];
let isCelsius = true;
let isDarkMode = false;
let favorites = [];
let currentWeatherData = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Load saved preferences
    loadPreferences();
    loadFavorites();
    
    // Set current date
    updateCurrentDate();
    
    // Initialize theme and unit display
    applyTheme();
    updateUnitDisplay();
    
    // Event listeners
    searchBtn.addEventListener('click', handleSearch);
    locationBtn.addEventListener('click', handleLocationClick);
    themeToggle.addEventListener('click', toggleTheme);
    unitToggle.addEventListener('click', toggleTemperatureUnit);
    favoriteBtn.addEventListener('click', toggleFavorite);
    if (shareBtn) shareBtn.addEventListener('click', shareWeather);
    
    retryBtn.addEventListener('click', () => {
        if (currentLocation) {
            const locationName = currentLocation.country 
                ? `${currentLocation.name}, ${currentLocation.country}`
                : currentLocation.name;
            fetchWeather(currentLocation.lat, currentLocation.lon, locationName);
        }
    });
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            if (selectedAutocompleteIndex >= 0 && autocompleteResults[selectedAutocompleteIndex]) {
                selectAutocompleteItem(autocompleteResults[selectedAutocompleteIndex]);
            } else {
                handleSearch();
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            navigateAutocomplete(1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            navigateAutocomplete(-1);
        } else if (e.key === 'Escape') {
            hideAutocomplete();
        }
    });
    
    searchInput.addEventListener('input', handleAutocomplete);
    
    // Hide autocomplete when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-wrapper')) {
            hideAutocomplete();
        }
    });
    
    // Render favorites
    renderFavorites();
});

// Update current date
function updateCurrentDate() {
    const date = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDate.textContent = date.toLocaleDateString('en-US', options);
}

// Preferences Management
function loadPreferences() {
    const savedUnit = localStorage.getItem('temperatureUnit');
    const savedTheme = localStorage.getItem('theme');
    
    isCelsius = savedUnit !== 'fahrenheit';
    isDarkMode = savedTheme === 'dark';
    
    updateUnitDisplay();
}

function savePreferences() {
    localStorage.setItem('temperatureUnit', isCelsius ? 'celsius' : 'fahrenheit');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}

// Theme Management
function toggleTheme() {
    isDarkMode = !isDarkMode;
    applyTheme();
    savePreferences();
}

function applyTheme() {
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        // Update icon to moon using emoji
        if (themeIcon) {
            themeIcon.textContent = '🌙';
            themeIcon.style.fontSize = '20px';
        }
    } else {
        document.body.classList.remove('dark-mode');
        // Update icon to sun using emoji
        if (themeIcon) {
            themeIcon.textContent = '☀️';
            themeIcon.style.fontSize = '20px';
        }
    }
}

// Temperature Unit Management
function toggleTemperatureUnit() {
    isCelsius = !isCelsius;
    updateUnitDisplay();
    savePreferences();
    
    // Re-render weather if data exists
    if (currentWeatherData && currentLocation) {
        const locationName = currentLocation.country 
            ? `${currentLocation.name}, ${currentLocation.country}`
            : currentLocation.name;
        displayWeather(currentWeatherData, locationName);
    }
}

function updateUnitDisplay() {
    unitText.textContent = isCelsius ? '°C' : '°F';
    if (temperatureUnit) {
        temperatureUnit.textContent = isCelsius ? '°C' : '°F';
    }
}

function convertTemperature(temp) {
    if (isCelsius) {
        return Math.round(temp);
    } else {
        return Math.round((temp * 9/5) + 32);
    }
}

// Favorites Management
function loadFavorites() {
    const saved = localStorage.getItem('favorites');
    if (saved) {
        favorites = JSON.parse(saved);
    }
}

function saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function addFavorite(location) {
    const favorite = {
        name: location.name,
        country: location.country || '',
        lat: location.lat,
        lon: location.lon,
        fullName: location.country ? `${location.name}, ${location.country}` : location.name
    };
    
    // Check if already exists
    const exists = favorites.some(f => 
        f.lat === favorite.lat && f.lon === favorite.lon
    );
    
    if (!exists) {
        favorites.push(favorite);
        saveFavorites();
        renderFavorites();
        updateFavoriteButton();
    }
}

function removeFavorite(lat, lon) {
    favorites = favorites.filter(f => !(f.lat === lat && f.lon === lon));
    saveFavorites();
    renderFavorites();
    updateFavoriteButton();
}

function isFavorite(lat, lon) {
    return favorites.some(f => f.lat === lat && f.lon === lon);
}

function toggleFavorite() {
    if (!currentLocation) return;
    
    if (isFavorite(currentLocation.lat, currentLocation.lon)) {
        removeFavorite(currentLocation.lat, currentLocation.lon);
    } else {
        addFavorite(currentLocation);
    }
}

function updateFavoriteButton() {
    if (!currentLocation) {
        favoriteBtn.classList.remove('active');
        return;
    }
    
    if (isFavorite(currentLocation.lat, currentLocation.lon)) {
        favoriteBtn.classList.add('active');
    } else {
        favoriteBtn.classList.remove('active');
    }
}

function renderFavorites() {
    favoritesList.innerHTML = '';
    
    favorites.forEach(fav => {
        const favItem = document.createElement('div');
        favItem.className = 'favorite-item';
        favItem.innerHTML = `
            <span>${fav.fullName}</span>
            <button class="remove-btn" data-lat="${fav.lat}" data-lon="${fav.lon}">×</button>
        `;
        
        favItem.querySelector('span').addEventListener('click', () => {
            currentLocation = {
                lat: fav.lat,
                lon: fav.lon,
                name: fav.name,
                country: fav.country
            };
            fetchWeather(fav.lat, fav.lon, fav.fullName);
        });
        
        favItem.querySelector('.remove-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            removeFavorite(fav.lat, fav.lon);
        });
        
        favoritesList.appendChild(favItem);
    });
}

// Handle search
async function handleSearch() {
    const city = searchInput.value.trim();
    if (!city) {
        showError('Please enter a city name');
        return;
    }
    
    showLoading();
    
    try {
        hideAutocomplete();
        const coords = await geocodeCity(city);
        currentLocation = {
            lat: coords.lat,
            lon: coords.lon,
            name: coords.name,
            country: coords.country
        };
        await fetchWeather(coords.lat, coords.lon, coords.fullName);
    } catch (error) {
        showError(error.message || 'City not found. Please try another search.');
    }
}

// Handle location button click
async function handleLocationClick() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }
    
    showLoading();
    locationBtn.disabled = true;
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                const locationName = await reverseGeocode(latitude, longitude);
                // Extract city and country from locationName
                const parts = locationName.split(', ');
                const city = parts[0];
                const country = parts.length > 1 ? parts.slice(1).join(', ') : '';
                currentLocation = { lat: latitude, lon: longitude, name: city, country: country };
                await fetchWeather(latitude, longitude, locationName);
            } catch (error) {
                showError('Unable to get your location. Please try searching for a city instead.');
            } finally {
                locationBtn.disabled = false;
            }
        },
        (error) => {
            showError('Unable to access your location. Please enable location permissions or search for a city.');
            locationBtn.disabled = false;
        }
    );
}

// Fetch autocomplete suggestions
async function fetchAutocompleteSuggestions(query) {
    if (!query || query.length < 2) {
        return [];
    }
    
    try {
        const response = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json`
        );
        const data = await response.json();
        
        if (!data.results || data.results.length === 0) {
            return [];
        }
        
        return data.results.map(result => ({
            name: result.name,
            country: result.country || result.country_code || '',
            admin1: result.admin1 || '', // State/Province
            lat: result.latitude,
            lon: result.longitude
        }));
    } catch (error) {
        console.error('Autocomplete error:', error);
        return [];
    }
}

// Handle autocomplete input
function handleAutocomplete(e) {
    const query = e.target.value.trim();
    
    // Clear previous timeout
    if (autocompleteTimeout) {
        clearTimeout(autocompleteTimeout);
    }
    
    // Hide autocomplete if query is too short
    if (query.length < 2) {
        hideAutocomplete();
        return;
    }
    
    // Debounce the API call
    autocompleteTimeout = setTimeout(async () => {
        const results = await fetchAutocompleteSuggestions(query);
        autocompleteResults = results;
        selectedAutocompleteIndex = -1;
        
        if (results.length > 0) {
            showAutocomplete(results);
        } else {
            hideAutocomplete();
        }
    }, 300);
}

// Show autocomplete dropdown
function showAutocomplete(results) {
    autocompleteDropdown.innerHTML = '';
    
    results.forEach((result, index) => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        item.dataset.index = index;
        
        const displayName = result.country 
            ? `${result.name}, ${result.country}`
            : result.name;
        
        item.innerHTML = `
            <div class="autocomplete-item-icon">📍</div>
            <div class="autocomplete-item-text">
                <div class="autocomplete-item-city">${result.name}</div>
                <div class="autocomplete-item-country">${result.country || ''}${result.admin1 ? ` • ${result.admin1}` : ''}</div>
            </div>
        `;
        
        item.addEventListener('click', () => selectAutocompleteItem(result));
        item.addEventListener('mouseenter', () => {
            selectedAutocompleteIndex = index;
            updateAutocompleteSelection();
        });
        
        autocompleteDropdown.appendChild(item);
    });
    
    autocompleteDropdown.classList.remove('hidden');
}

// Hide autocomplete dropdown
function hideAutocomplete() {
    autocompleteDropdown.classList.add('hidden');
    autocompleteResults = [];
    selectedAutocompleteIndex = -1;
}

// Navigate autocomplete with keyboard
function navigateAutocomplete(direction) {
    if (autocompleteResults.length === 0) return;
    
    selectedAutocompleteIndex += direction;
    
    if (selectedAutocompleteIndex < 0) {
        selectedAutocompleteIndex = autocompleteResults.length - 1;
    } else if (selectedAutocompleteIndex >= autocompleteResults.length) {
        selectedAutocompleteIndex = 0;
    }
    
    updateAutocompleteSelection();
}

// Update autocomplete selection styling
function updateAutocompleteSelection() {
    const items = autocompleteDropdown.querySelectorAll('.autocomplete-item');
    items.forEach((item, index) => {
        if (index === selectedAutocompleteIndex) {
            item.classList.add('selected');
            item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        } else {
            item.classList.remove('selected');
        }
    });
}

// Select autocomplete item
async function selectAutocompleteItem(result) {
    searchInput.value = result.name;
    hideAutocomplete();
    
    showLoading();
    try {
        const locationName = result.country 
            ? `${result.name}, ${result.country}`
            : result.name;
        
        currentLocation = {
            lat: result.lat,
            lon: result.lon,
            name: result.name,
            country: result.country
        };
        
        await fetchWeather(result.lat, result.lon, locationName);
    } catch (error) {
        showError('Failed to load weather data. Please try again.');
    }
}

// Geocode city name to coordinates
async function geocodeCity(city) {
    try {
        const response = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );
        const data = await response.json();
        
        if (!data.results || data.results.length === 0) {
            throw new Error('City not found');
        }
        
        const result = data.results[0];
        const locationName = result.country 
            ? `${result.name}, ${result.country}`
            : result.name;
        
        return {
            lat: result.latitude,
            lon: result.longitude,
            name: result.name,
            country: result.country || result.country_code || '',
            fullName: locationName
        };
    } catch (error) {
        throw new Error('Failed to find city. Please check the spelling and try again.');
    }
}

// Reverse geocode coordinates to city name
async function reverseGeocode(lat, lon) {
    try {
        // Use OpenStreetMap Nominatim for reverse geocoding (free, no API key)
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`
        );
        
        if (!response.ok) {
            throw new Error('Reverse geocoding failed');
        }
        
        const data = await response.json();
        
        if (data.address) {
            // Try to get city name from various fields
            const city = data.address.city || 
                        data.address.town || 
                        data.address.village || 
                        data.address.municipality ||
                        data.address.county ||
                        data.address.state;
            
            const country = data.address.country || '';
            
            if (city) {
                return country ? `${city}, ${country}` : city;
            }
        }
        
        // Fallback to coordinates if no city name found
        return `Location (${lat.toFixed(2)}, ${lon.toFixed(2)})`;
    } catch (error) {
        // Fallback to coordinates on error
        return `Location (${lat.toFixed(2)}, ${lon.toFixed(2)})`;
    }
}

// Fetch weather data
async function fetchWeather(lat, lon, cityName) {
    try {
        // Fetch main weather data (including historical for trend)
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index,surface_pressure&hourly=temperature_2m,apparent_temperature,weather_code,precipitation_probability,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset&timezone=auto&forecast_days=7`
        );
        
        if (!weatherResponse.ok) {
            throw new Error('Failed to fetch weather data');
        }
        
        const weatherData = await weatherResponse.json();
        
        // Fetch air quality data (separate API endpoint)
        let airQualityData = null;
        try {
            const aqResponse = await fetch(
                `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`
            );
            if (aqResponse.ok) {
                airQualityData = await aqResponse.json();
            }
        } catch (aqError) {
            console.log('Air quality data not available');
        }
        
        // Combine data
        const combinedData = {
            ...weatherData,
            airQuality: airQualityData
        };
        
        currentWeatherData = combinedData;
        displayWeather(combinedData, cityName);
        hideLoading();
    } catch (error) {
        showError('Unable to fetch weather data. Please check your connection and try again.');
    }
}

// Helper function to get wind direction
function getWindDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
}

// Helper function to get AQI label
function getAQILabel(aqi) {
    if (aqi <= 50) return { label: 'Good', color: '#4CAF50' };
    if (aqi <= 100) return { label: 'Moderate', color: '#FFC107' };
    if (aqi <= 150) return { label: 'Unhealthy for Sensitive', color: '#FF9800' };
    if (aqi <= 200) return { label: 'Unhealthy', color: '#F44336' };
    if (aqi <= 300) return { label: 'Very Unhealthy', color: '#9C27B0' };
    return { label: 'Hazardous', color: '#673AB7' };
}

// Fetch historical weather for trend comparison
async function fetchHistoricalWeather(lat, lon, currentTemp) {
    try {
        const today = new Date();
        const lastYear = new Date(today);
        lastYear.setFullYear(today.getFullYear() - 1);
        
        const response = await fetch(
            `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${lastYear.toISOString().split('T')[0]}&end_date=${lastYear.toISOString().split('T')[0]}&daily=temperature_2m_max`
        );
        
        if (response.ok) {
            const data = await response.json();
            if (data.daily && data.daily.temperature_2m_max && data.daily.temperature_2m_max[0] !== null) {
                const historicalTemp = data.daily.temperature_2m_max[0];
                const diff = currentTemp - historicalTemp;
                return { historicalTemp, diff };
            }
        }
    } catch (error) {
        console.log('Historical weather data not available');
    }
    return null;
}

// Generate activity suggestions based on weather
function generateActivitySuggestions(weatherCode, temp, feelsLike, windSpeed, precipitationProb) {
    const activities = [];
    
    // Temperature-based activities
    if (temp > 25) {
        activities.push({ icon: '🏊', text: 'Perfect for swimming' });
        activities.push({ icon: '☀️', text: 'Great beach weather' });
        activities.push({ icon: '🧊', text: 'Stay hydrated' });
    } else if (temp > 15) {
        activities.push({ icon: '🚴', text: 'Ideal for cycling' });
        activities.push({ icon: '🏃', text: 'Perfect for running' });
        activities.push({ icon: '🧺', text: 'Great for picnics' });
    } else if (temp > 5) {
        activities.push({ icon: '🚶', text: 'Nice for walking' });
        activities.push({ icon: '☕', text: 'Café weather' });
        activities.push({ icon: '📚', text: 'Cozy indoor activities' });
    } else {
        activities.push({ icon: '🔥', text: 'Stay warm indoors' });
        activities.push({ icon: '☕', text: 'Hot drinks recommended' });
    }
    
    // Weather condition-based
    if (weatherCode === 0 || weatherCode === 1) {
        activities.push({ icon: '🌅', text: 'Clear skies - great views' });
    } else if (weatherCode >= 61 && weatherCode <= 67) {
        activities.push({ icon: '☂️', text: 'Bring an umbrella' });
        activities.push({ icon: '🏠', text: 'Indoor activities recommended' });
    } else if (weatherCode >= 71 && weatherCode <= 77) {
        activities.push({ icon: '❄️', text: 'Snow activities possible' });
    } else if (weatherCode >= 80 && weatherCode <= 86) {
        activities.push({ icon: '🌧️', text: 'Showers possible' });
    }
    
    // Wind-based
    if (windSpeed > 30) {
        activities.push({ icon: '💨', text: 'Strong winds - be careful' });
    } else if (windSpeed > 20) {
        activities.push({ icon: '🪁', text: 'Good for kite flying' });
    }
    
    // Limit to 3-4 suggestions
    return activities.slice(0, 4);
}

// Share weather functionality
async function shareWeather() {
    if (!currentLocation || !currentWeatherData) return;
    
    const current = currentWeatherData.current;
    const locationName = currentLocation.country 
        ? `${currentLocation.name}, ${currentLocation.country}`
        : currentLocation.name;
    
    const shareText = `Weather in ${locationName}: ${Math.round(current.temperature_2m)}°${isCelsius ? 'C' : 'F'}, ${weatherDescriptions[current.weather_code] || 'Clear sky'}. Check it out!`;
    const shareUrl = window.location.href;
    
    if (navigator.share) {
        try {
            await navigator.share({
                title: `Weather in ${locationName}`,
                text: shareText,
                url: shareUrl
            });
        } catch (error) {
            if (error.name !== 'AbortError') {
                copyToClipboard(shareText + ' ' + shareUrl);
            }
        }
    } else {
        copyToClipboard(shareText + ' ' + shareUrl);
    }
}

// Copy to clipboard fallback
function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        alert('Weather information copied to clipboard!');
    } catch (error) {
        console.error('Failed to copy:', error);
    }
    document.body.removeChild(textarea);
}

// Display weather data
function displayWeather(data, locationName) {
    const current = data.current;
    const hourly = data.hourly;
    const daily = data.daily;
    
    // Update city name
    cityName.textContent = locationName;
    
    // Update current weather
    const weatherCode = current.weather_code;
    weatherIcon.textContent = weatherIcons[weatherCode] || '☀️';
    currentTemp.textContent = convertTemperature(current.temperature_2m);
    weatherDescription.textContent = weatherDescriptions[weatherCode] || 'Clear sky';
    
    // Update details
    feelsLike.textContent = `${convertTemperature(current.apparent_temperature)}°`;
    humidity.textContent = `${current.relative_humidity_2m}%`;
    windSpeed.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
    if (windDirection && current.wind_direction_10m !== undefined) {
        windDirection.textContent = getWindDirection(current.wind_direction_10m);
        if (current.wind_gusts_10m && current.wind_gusts_10m > current.wind_speed_10m) {
            windDirection.textContent += ` (gusts ${Math.round(current.wind_gusts_10m)} km/h)`;
        }
    }
    uvIndex.textContent = current.uv_index.toFixed(1);
    
    // Update pressure
    if (pressure && current.surface_pressure !== undefined) {
        pressure.textContent = `${Math.round(current.surface_pressure)} hPa`;
    }
    
    // Update air quality
    if (airQuality && data.airQuality && data.airQuality.current && data.airQuality.current.us_aqi !== undefined) {
        const aqi = data.airQuality.current.us_aqi;
        const aqiInfo = getAQILabel(aqi);
        airQuality.textContent = `${aqi} (${aqiInfo.label})`;
        airQuality.style.color = aqiInfo.color;
    } else if (airQuality) {
        airQuality.textContent = 'N/A';
        airQuality.style.color = 'var(--text-secondary)';
    }
    
    // Update sunrise/sunset
    if (sunriseSunset && daily.sunrise && daily.sunset && daily.sunrise[0]) {
        const sunriseTime = new Date(daily.sunrise[0]);
        const sunsetTime = new Date(daily.sunset[0]);
        sunriseSunset.innerHTML = `
            <div class="sunrise-sunset-item">
                <span>🌅</span>
                <span>Sunrise: ${sunriseTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
            </div>
            <div class="sunrise-sunset-item">
                <span>🌇</span>
                <span>Sunset: ${sunsetTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
            </div>
        `;
    }
    
    // Update weather trend (compare to historical average)
    if (weatherTrend && currentLocation) {
        fetchHistoricalWeather(currentLocation.lat, currentLocation.lon, current.temperature_2m)
            .then(trendData => {
                if (trendData && Math.abs(trendData.diff) > 2) {
                    const diff = convertTemperature(current.temperature_2m) - convertTemperature(current.temperature_2m - trendData.diff);
                    if (diff > 0) {
                        weatherTrend.innerHTML = `<span>📈</span> <span>${Math.abs(diff).toFixed(1)}° warmer than usual</span>`;
                        weatherTrend.className = 'weather-trend trend-up';
                    } else {
                        weatherTrend.innerHTML = `<span>📉</span> <span>${Math.abs(diff).toFixed(1)}° cooler than usual</span>`;
                        weatherTrend.className = 'weather-trend trend-down';
                    }
                    weatherTrend.style.display = 'flex';
                } else {
                    weatherTrend.style.display = 'none';
                }
            })
            .catch(() => {
                weatherTrend.style.display = 'none';
            });
    }
    
    // Update activity suggestions
    if (activitySuggestions) {
        const activities = generateActivitySuggestions(
            weatherCode,
            current.temperature_2m,
            current.apparent_temperature,
            current.wind_speed_10m,
            daily.precipitation_probability_max ? daily.precipitation_probability_max[0] : 0
        );
        
        if (activities.length > 0) {
            activitySuggestions.innerHTML = `
                <div class="activity-suggestions-title">
                    <span>💡</span>
                    <span>Activity Suggestions</span>
                </div>
                <div class="activity-list">
                    ${activities.map(activity => `
                        <div class="activity-item">
                            <span>${activity.icon}</span>
                            <span>${activity.text}</span>
                        </div>
                    `).join('')}
                </div>
            `;
            activitySuggestions.style.display = 'block';
        } else {
            activitySuggestions.style.display = 'none';
        }
    }
    
    // Update weather alerts
    if (weatherAlerts) {
        const alerts = [];
        
        // UV Index alert
        if (current.uv_index >= 8) {
            alerts.push({
                icon: '⚠️',
                title: 'High UV Index Warning',
                description: `UV Index is ${current.uv_index.toFixed(1)}. Protect your skin with sunscreen and seek shade.`
            });
        }
        
        // Wind alert
        if (current.wind_speed_10m >= 50) {
            alerts.push({
                icon: '💨',
                title: 'Strong Wind Warning',
                description: `Wind speed is ${Math.round(current.wind_speed_10m)} km/h. Be cautious outdoors.`
            });
        }
        
        // Extreme temperature alerts
        if (current.temperature_2m >= 35) {
            alerts.push({
                icon: '🌡️',
                title: 'Extreme Heat Warning',
                description: 'Very high temperatures. Stay hydrated and avoid prolonged sun exposure.'
            });
        } else if (current.temperature_2m <= -10) {
            alerts.push({
                icon: '❄️',
                title: 'Extreme Cold Warning',
                description: 'Very low temperatures. Dress warmly and limit time outdoors.'
            });
        }
        
        // Air quality alert
        if (data.airQuality && data.airQuality.current && data.airQuality.current.us_aqi >= 150) {
            const aqiInfo = getAQILabel(data.airQuality.current.us_aqi);
            alerts.push({
                icon: '😷',
                title: 'Air Quality Alert',
                description: `Air quality is ${aqiInfo.label}. Sensitive groups should limit outdoor activities.`
            });
        }
        
        if (alerts.length > 0) {
            weatherAlerts.innerHTML = alerts.map(alert => `
                <div class="weather-alert-item">
                    <div class="weather-alert-icon">${alert.icon}</div>
                    <div class="weather-alert-content">
                        <div class="weather-alert-title">${alert.title}</div>
                        <div class="weather-alert-description">${alert.description}</div>
                    </div>
                </div>
            `).join('');
            weatherAlerts.classList.remove('hidden');
        } else {
            weatherAlerts.classList.add('hidden');
        }
    }
    
    // Update favorite button
    updateFavoriteButton();
    
    // Update hourly forecast
    updateHourlyForecast(hourly);
    
    // Update daily forecast
    updateDailyForecast(daily);
    
    // Update page title and meta description dynamically
    updatePageSEO(locationName, current, weatherCode);
    
    // Add structured data for weather
    addWeatherStructuredData(locationName, current, daily, data.airQuality);
    
    // Show weather display
    hideLoading();
    weatherDisplay.classList.remove('hidden');
}

// Update page SEO dynamically
function updatePageSEO(locationName, current, weatherCode) {
    const temp = convertTemperature(current.temperature_2m);
    const unit = isCelsius ? '°C' : '°F';
    const description = weatherDescriptions[weatherCode] || 'Clear sky';
    
    // Update page title
    document.title = `${locationName} Weather - ${temp}${unit}, ${description} | Weather Forecast`;
    
    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.content = `Current weather in ${locationName}: ${temp}${unit}, ${description}. Get detailed forecast including hourly and 7-day outlook, air quality, UV index, wind speed, and more.`;
    }
    
    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
        ogTitle.content = `${locationName} Weather - ${temp}${unit}, ${description}`;
    }
    
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
        ogDesc.content = `Current weather in ${locationName}: ${temp}${unit}, ${description}. View detailed forecast.`;
    }
    
    // Update Twitter tags
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    if (twitterTitle) {
        twitterTitle.content = `${locationName} Weather - ${temp}${unit}, ${description}`;
    }
    
    const twitterDesc = document.querySelector('meta[property="twitter:description"]');
    if (twitterDesc) {
        twitterDesc.content = `Current weather in ${locationName}: ${temp}${unit}, ${description}`;
    }
}

// Add structured data for weather (Schema.org)
function addWeatherStructuredData(locationName, current, daily, airQualityData) {
    // Remove existing weather structured data
    const existing = document.getElementById('weather-structured-data');
    if (existing) {
        existing.remove();
    }
    
    // Extract coordinates from location (if available)
    const lat = currentLocation?.lat || null;
    const lon = currentLocation?.lon || null;
    
    const weatherData = {
        "@context": "https://schema.org",
        "@type": "WeatherForecast",
        "name": `Weather Forecast for ${locationName}`,
        "description": `Current weather conditions and forecast for ${locationName}`,
        "temperature": {
            "@type": "QuantitativeValue",
            "value": Math.round(current.temperature_2m),
            "unitCode": isCelsius ? "CEL" : "FAH"
        },
        "feelsLike": {
            "@type": "QuantitativeValue",
            "value": Math.round(current.apparent_temperature),
            "unitCode": isCelsius ? "CEL" : "FAH"
        },
        "humidity": {
            "@type": "QuantitativeValue",
            "value": current.relative_humidity_2m,
            "unitCode": "PER"
        },
        "windSpeed": {
            "@type": "QuantitativeValue",
            "value": Math.round(current.wind_speed_10m),
            "unitCode": "KMT"
        },
        "windDirection": getWindDirection(current.wind_direction_10m || 0),
        "pressure": {
            "@type": "QuantitativeValue",
            "value": Math.round(current.surface_pressure || 1013),
            "unitCode": "A97"
        },
        "uvIndex": current.uv_index,
        "conditions": weatherDescriptions[current.weather_code] || "Clear sky"
    };
    
    // Add coordinates if available
    if (lat && lon) {
        weatherData.geo = {
            "@type": "GeoCoordinates",
            "latitude": lat,
            "longitude": lon
        };
        weatherData.location = {
            "@type": "Place",
            "name": locationName,
            "geo": weatherData.geo
        };
    }
    
    // Add air quality if available
    if (airQualityData && airQualityData.current && airQualityData.current.us_aqi !== undefined) {
        weatherData.airQualityIndex = airQualityData.current.us_aqi;
    }
    
    // Add forecast data
    if (daily && daily.temperature_2m_max && daily.temperature_2m_max[0]) {
        weatherData.forecast = {
            "@type": "QuantitativeValue",
            "high": Math.round(daily.temperature_2m_max[0]),
            "low": Math.round(daily.temperature_2m_min[0]),
            "unitCode": isCelsius ? "CEL" : "FAH"
        };
    }
    
    // Create and inject script tag
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'weather-structured-data';
    script.textContent = JSON.stringify(weatherData);
    document.head.appendChild(script);
}

// Update hourly forecast
function updateHourlyForecast(hourly) {
    hourlyList.innerHTML = '';
    
    // Get current time
    const now = new Date();
    const currentTime = now.getTime();
    
    // Find the index of the current hour (or next hour if exact match not found)
    let startIndex = 0;
    for (let i = 0; i < hourly.time.length; i++) {
        const hourTime = new Date(hourly.time[i]).getTime();
        if (hourTime >= currentTime) {
            startIndex = i;
            break;
        }
    }
    
    // Show next 24 hours (or available hours)
    const hoursToShow = Math.min(24, hourly.time.length - startIndex);
    for (let i = 0; i < hoursToShow; i++) {
        const index = startIndex + i;
        const time = new Date(hourly.time[index]);
        const temp = hourly.temperature_2m[index];
        const feelsLike = hourly.apparent_temperature ? hourly.apparent_temperature[index] : null;
        const code = hourly.weather_code[index];
        const precipProb = hourly.precipitation_probability ? hourly.precipitation_probability[index] : null;
        
        const hourItem = document.createElement('div');
        hourItem.className = 'hourly-item';
        
        const timeStr = time.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
        const isNow = i === 0 && time.getTime() - currentTime < 3600000; // Within 1 hour
        
        let innerHTML = `
            <div class="hourly-time">${isNow ? 'Now' : timeStr}</div>
            <div class="hourly-icon" style="font-size: 32px;">${weatherIcons[code] || '☀️'}</div>
            <div class="hourly-temp">${convertTemperature(temp)}°</div>
        `;
        
        if (feelsLike !== null && feelsLike !== temp) {
            innerHTML += `<div class="hourly-feels">Feels ${convertTemperature(feelsLike)}°</div>`;
        }
        
        if (precipProb !== null && precipProb > 0) {
            innerHTML += `<div class="hourly-precip">💧 ${precipProb}%</div>`;
        }
        
        hourItem.innerHTML = innerHTML;
        hourlyList.appendChild(hourItem);
    }
}

// Update daily forecast
function updateDailyForecast(daily) {
    dailyList.innerHTML = '';
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    
    for (let i = 0; i < daily.time.length; i++) {
        const date = new Date(daily.time[i]);
        const dayName = i === 0 ? 'Today' : dayNames[date.getDay()];
        const code = daily.weather_code[i];
        const maxTemp = daily.temperature_2m_max[i];
        const minTemp = daily.temperature_2m_min[i];
        const precipProb = daily.precipitation_probability_max ? daily.precipitation_probability_max[i] : null;
        
        const dayItem = document.createElement('div');
        dayItem.className = 'daily-item';
        
        let tempsHTML = `
            <span class="daily-high">${convertTemperature(maxTemp)}°</span>
            <span class="daily-low">${convertTemperature(minTemp)}°</span>
        `;
        
        if (precipProb !== null && precipProb > 0) {
            tempsHTML += `<span class="daily-precip">💧 ${precipProb}%</span>`;
        }
        
        dayItem.innerHTML = `
            <div class="daily-day">${dayName}</div>
            <div class="daily-weather">
                <div class="daily-icon" style="font-size: 36px;">${weatherIcons[code] || '☀️'}</div>
                <div class="daily-desc">${weatherDescriptions[code] || 'Clear sky'}</div>
            </div>
            <div class="daily-temps">
                ${tempsHTML}
            </div>
        `;
        
        dailyList.appendChild(dayItem);
    }
}

// Show loading state
function showLoading() {
    loadingState.classList.remove('hidden');
    errorState.classList.add('hidden');
    weatherDisplay.classList.add('hidden');
}

// Hide loading state
function hideLoading() {
    loadingState.classList.add('hidden');
}

// Show error state
function showError(message) {
    errorMessage.textContent = message;
    errorState.classList.remove('hidden');
    loadingState.classList.add('hidden');
    weatherDisplay.classList.add('hidden');
}

// Fix: I notice I used cityNameElement instead of cityName in displayWeather
// Let me check the actual variable name and fix it

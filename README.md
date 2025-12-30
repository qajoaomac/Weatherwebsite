# Weather App

A modern, responsive weather application built with vanilla JavaScript. Features real-time weather data, forecasts, and a clean user interface - all without frameworks or build tools.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

## Features

- **Real-Time Weather** - Current conditions with temperature, humidity, wind, UV index
- **Hourly Forecast** - 24-hour forecast with precipitation probability
- **7-Day Forecast** - Week-ahead planning with highs and lows
- **Air Quality Index** - Color-coded AQI alerts
- **Location Search** - City autocomplete with country disambiguation
- **Geolocation** - One-click current location detection
- **Favorites** - Save and quickly access multiple locations
- **Dark Mode** - Automatic and manual theme switching
- **Responsive Design** - Mobile-first, works on all devices
- **No API Key Required** - Uses free Open-Meteo API

## Tech Stack

| Category | Technology |
|----------|------------|
| **Markup** | HTML5 (semantic) |
| **Styling** | CSS3 (variables, flexbox, grid) |
| **Logic** | Vanilla JavaScript (ES6+) |
| **Weather API** | Open-Meteo (free, no key) |
| **Geocoding** | OpenStreetMap Nominatim |
| **Storage** | localStorage |

## Why Vanilla JS?

This project demonstrates that modern, feature-rich web applications can be built without frameworks:

- **Zero dependencies** - No npm install, no build step
- **Fast loading** - No framework overhead
- **Full control** - Direct DOM manipulation
- **Easy deployment** - Just static files

## Getting Started

```bash
# Clone the repository
git clone https://github.com/qajoaomac/Weatherwebsite.git
cd Weatherwebsite

# Open in browser - that's it!
open index.html
# or use a local server
npx serve .
```

## Project Structure

```
Weatherwebsite/
├── index.html      # Main HTML with semantic structure
├── styles.css      # All styling (dark mode, responsive)
├── script.js       # Weather API, UI logic, all features
├── robots.txt      # SEO configuration
└── sitemap.xml     # Search engine sitemap
```

## Features in Detail

### Weather Data
- Temperature (actual and feels-like)
- Humidity percentage
- Wind speed, direction, and gusts
- UV index with safety warnings
- Surface pressure
- Sunrise/sunset times
- Weather history comparison

### User Experience
- Smooth CSS animations
- Intuitive search with autocomplete
- Temperature unit toggle (C/F)
- Activity suggestions based on conditions
- Share weather via Web Share API
- Persistent preferences

### Code Quality
- Semantic HTML for accessibility
- CSS custom properties for theming
- Modern JavaScript (async/await, modules)
- ARIA labels for screen readers
- Mobile-first responsive breakpoints

## APIs Used

| API | Purpose | Cost |
|-----|---------|------|
| [Open-Meteo](https://open-meteo.com/) | Weather data | Free |
| [Nominatim](https://nominatim.openstreetmap.org/) | Geocoding | Free |

## Deployment

Works with any static hosting:

- **GitHub Pages** - Enable in repository settings
- **Netlify** - Drag and drop deployment
- **Vercel** - Zero-config deployment
- **Any web server** - Just upload the files

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

Requires JavaScript and ES6+ features.

## License

MIT

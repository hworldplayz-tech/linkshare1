# Cricket Live Score

A professional cricket live score application with real-time updates, featuring Asia Cup matches and comprehensive cricket data.

## File Structure

```
cricket-live-score/
├── index.html                  # Main HTML file with clean structure
├── cricket-live-score.css      # All custom CSS styles
├── cricket-live-score.js       # Complete JavaScript functionality
└── README.md                   # This documentation file
```

## Files Overview

### 📄 index.html (9.8KB)
- Clean HTML structure with proper SEO meta tags
- Links to external CSS and JS files
- Includes structured data for better search visibility
- Features comprehensive Open Graph and Twitter card meta tags

### 🎨 cricket-live-score.css (7.3KB)
- All custom styles for cricket live score page
- Responsive design with mobile-first approach
- Beautiful animations and hover effects
- CSS custom properties for easy theming

### ⚡ cricket-live-score.js (28.5KB)
- Complete JavaScript application class
- Multi-API support (CricAPI + Cricbuzz RapidAPI)
- Intelligent fallback and retry mechanisms
- Real-time data fetching and rendering

## Features

✅ **Multi-API Integration**
- Primary: CricAPI
- Backup: Cricbuzz RapidAPI

✅ **Real-time Updates**
- Auto-refresh every 60 seconds
- Live score bar with current match info
- Intelligent retry with rate limit handling

✅ **Comprehensive Display**
- Featured Asia Cup section
- Live, upcoming, and completed matches
- Team flags and detailed scorecards
- Progress bars for overs completion

✅ **SEO Optimized**
- Complete meta tags for search engines
- Structured data (Schema.org)
- Social media sharing optimization

✅ **Responsive Design**
- Mobile-first approach
- Beautiful animations and transitions
- Professional UI with your site theme

## API Configuration

The application uses two API sources:
1. **CricAPI**: Primary source for cricket data
2. **Cricbuzz RapidAPI**: Backup source with fallback support

Both APIs are configured with proper headers and error handling.

## Browser Support

- Modern browsers with ES6+ support
- Mobile browsers (iOS Safari, Chrome Mobile)
- Desktop browsers (Chrome, Firefox, Safari, Edge)

## Cache Busting

All external files include version parameters:
- `?v=1.0&cache=20250909`

This ensures browsers load the latest versions of CSS and JS files.

---

**Development**: Files are now properly separated for better maintainability and development workflow.

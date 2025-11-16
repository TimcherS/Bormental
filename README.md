# Business Copilot - AI-Powered Business Dashboard

A modern, minimalistic business analytics dashboard designed for small business owners and managers. Built with React 18, Tailwind v4, and RadixUI with a Figma-like canvas interface.

## Features

### 📊 Visual Canvas Interface
- Figma-inspired dotted grid canvas
- Drag-and-drop widget placement
- Snap-to-grid functionality
- Zoom in/out controls
- Pan navigation with right mouse button
- Multiple canvas support with quick switcher

### 🎨 Design
- OpenAI-inspired minimalistic card design
- Dark/Light theme support
- Smooth animations and transitions
- White, black, and light gray dominant colors
- Muted complementary colors (beige-blue, pink, yellow, violet)
- Responsive design for mobile, tablet, and desktop

### 🧩 8 Widget Types

1. **Social Media Analysis** - Track comments from VK, Instagram, Telegram, WhatsApp
2. **Email Analysis** - Smart email filtering and AI-powered summaries
3. **Calendar** - Unified event calendar from multiple sources (Битрикс24, AmoCRM, etc.)
4. **Revenue Tracking** - Monitor revenue, expenses, and growth metrics
5. **Custom Charts** - Create area, bar, pie, and line charts
6. **Marketing Stats** - Track views, visits, and ad performance
7. **AI Workplace** - Built-in ChatGPT workspace for business analysis
8. **Notes** - Simple note-taking with file attachments

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS v4** - Utility-first styling
- **RadixUI** - Accessible component primitives
- **React Router** - Client-side routing
- **Lucide React** - Icon library

## Project Structure

```
business-copilot/
├── src/
│   ├── components/
│   │   ├── widgets/
│   │   │   ├── SocialMediaWidget.jsx
│   │   │   ├── EmailWidget.jsx
│   │   │   ├── CalendarWidget.jsx
│   │   │   ├── RevenueWidget.jsx
│   │   │   ├── ChartWidget.jsx
│   │   │   ├── MarketingWidget.jsx
│   │   │   ├── ChatGPTWidget.jsx
│   │   │   └── NoteWidget.jsx
│   │   ├── CanvasSwitcher.jsx
│   │   ├── Widget.jsx
│   │   └── WidgetSelector.jsx
│   ├── contexts/
│   │   ├── ThemeContext.jsx
│   │   └── CanvasContext.jsx
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── CanvasSelectPage.jsx
│   │   ├── CanvasPage.jsx
│   │   └── AccountPage.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
├── index.html
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Navigate to the project directory:
```bash
cd business-copilot
```

2. Install dependencies (already done during setup):
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:5173
```

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage Guide

### Canvas Navigation

- **Add Widget**: Click "Add Indicator" button at bottom center
- **Place Widget**: After selecting a widget type, right-click on canvas to place
- **Move Widget**: Drag widgets by their header grip icon
- **Delete Widget**: Click trash icon in widget header
- **Zoom**: Use zoom controls on bottom-right or Ctrl + Mouse Wheel
- **Pan**: Right mouse button + drag to move around canvas
- **Switch Canvas**: Use circular buttons on the left sidebar

### Widget Configuration

Each widget type has specific configuration options:

- **Social Media**: Configure API connections for VK, Instagram, Telegram, WhatsApp
- **Email**: Connect Gmail, Microsoft Mail, Yandex Mail accounts
- **Calendar**: Integrate with Битрикс24, AmoCRM, Яндекс трекер, Google Calendar
- **Revenue**: Connect to accounting/payment systems
- **Charts**: Configure data sources and visualization types
- **Marketing**: Connect advertising platforms
- **AI Workplace**: Direct ChatGPT integration for analysis
- **Notes**: Simple text with file attachments

### Account Management

- **Theme Toggle**: Click sun/moon icon (top-right)
- **Account Settings**: Access via navigation menu
- **Multiple Canvases**: Create separate dashboards for different aspects of your business
- **Data Persistence**: All data is saved in localStorage

## Development Notes

### State Management

- **ThemeContext**: Manages light/dark theme with localStorage persistence
- **CanvasContext**: Handles canvas and widget state management

### Key Features Implementation

1. **Grid Snapping**: Widgets snap to 20px grid for clean alignment
2. **Drag & Drop**: Custom implementation with mouse events
3. **Responsive Design**: Tailwind breakpoints for mobile/tablet/desktop
4. **Theme System**: CSS variables and class-based dark mode
5. **Data Persistence**: LocalStorage for offline-first experience

### Future Enhancements

- [ ] Backend API integration for real data sources
- [ ] Advanced widget configuration modals
- [ ] Collaborative features (team access)
- [ ] Export/import dashboard configurations
- [ ] Advanced analytics and reporting
- [ ] Webhook integrations
- [ ] Real-time data updates
- [ ] Mobile app version

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

This project is part of a hackathon submission.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## Acknowledgments

- Design inspiration from OpenAI and Figma
- UI components from RadixUI
- Icons from Lucide React

# BISUM Conference Client

Frontend React application for the BISUM Conference Website built with React.js and Tailwind CSS.

## Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Component Architecture**: Modular, reusable components
- **Smooth Navigation**: Fixed navigation with smooth scrolling
- **Hero Section**: Engaging hero with background video and countdown timer
- **Real-time Countdown**: Live countdown to conference date (November 15, 2025)

## Tech Stack

- **React 19** - Latest React with hooks
- **Tailwind CSS 4** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server

## Project Structure

```
client/src/
├── components/           # Reusable UI components
│   ├── Navigation.jsx   # Header navigation component
│   ├── BackgroundVideo.jsx # Hero background video component
│   ├── CountdownTimer.jsx  # Conference countdown timer
│   └── index.js         # Component exports
├── pages/               # Page components
│   └── Homepage.jsx     # Main homepage component
├── App.jsx              # Main application component
├── App.css              # Custom styles and animations
└── main.jsx             # Application entry point
```

## Components

### Navigation
- Fixed header with responsive design
- Mobile hamburger menu
- Smooth scrolling navigation
- BISUM branding

### BackgroundVideo
- Full-screen video background
- Fallback pattern background
- Gradient overlay
- Responsive video handling

### CountdownTimer
- Real-time countdown to conference
- Days, hours, minutes, seconds display
- Auto-updating timer
- Styled countdown boxes

### Homepage
- Hero section with main content
- Conference information
- Call-to-action buttons
- Placeholder sections for future content

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

## Development

### Adding New Components
1. Create component in `src/components/`
2. Export from `src/components/index.js`
3. Import and use in pages

### Styling
- Use Tailwind CSS utility classes
- Custom styles in `App.css`
- Responsive design with Tailwind breakpoints

### Navigation
- Add new sections to navigation array in `Navigation.jsx`
- Create corresponding sections in `Homepage.jsx`
- Use `scrollToSection` function for smooth scrolling

## Responsive Breakpoints

- **Mobile**: `< 640px` (sm)
- **Tablet**: `640px - 1024px` (md, lg)
- **Desktop**: `> 1024px` (xl, 2xl)

## Future Enhancements

- [ ] Schedule page with conference timeline
- [ ] Speakers page with speaker profiles
- [ ] Registration form integration
- [ ] Admin dashboard
- [ ] Payment integration
- [ ] Email notifications

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Lazy loading for components
- Optimized video background
- Efficient countdown timer
- Minimal bundle size with Vite

## Contributing

1. Follow component naming conventions
2. Use Tailwind CSS for styling
3. Ensure responsive design
4. Test on multiple devices
5. Update documentation

## License

MIT License - see LICENSE file for details

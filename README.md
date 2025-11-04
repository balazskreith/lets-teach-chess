# Tomasz Chess

A modern, real-time online chess application built with Next.js 15, TypeScript, and WebRTC. Play chess with friends in a peer-to-peer multiplayer environment.

## Prerequisites

## Features

Before you begin, ensure you have the following installed:### 🎨 Design & UI

- **Node.js**: Version 22 or higher- **Professional Design**: Clean, modern chess interface

- **Yarn**: Package manager (or npm)- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices

- **Dark/Light Mode**: Automatic theme switching based on system preferences

### Checking Your Node Version- **Smooth Animations**: Subtle animations and transitions for better UX

````bash### ♟️ Chess Features

node --version

```- **Real-time Gameplay**: Live board synchronization using WebRTC

- **Game Lobby**: Create new games or join existing ones via game ID

If you need to install or upgrade Node.js, visit [nodejs.org](https://nodejs.org/)- **Interactive Board**: Click-to-move interface with visual feedback

- **Move History**: Track all moves made during the game

## Installation- **Player Colors**: Automatic white/black piece assignment



1. **Clone the repository** (or navigate to the project directory):### 🔧 Technical Features



   ```bash- **TypeScript**: Fully typed for better development experience

   cd tomasz-chess- **Tailwind CSS**: Utility-first CSS framework for rapid UI development

   ```- **WebRTC**: Real-time peer-to-peer communication

- **Next.js 15**: Modern React framework with App Router

2. **Install dependencies**:- **Custom Components**: Reusable UI components for consistency



   ```bash## Technology Stack

   yarn install

   ```- **Framework**: Next.js 15 with App Router

- **Language**: TypeScript

   Or if you prefer npm:- **Styling**: Tailwind CSS 4

- **Real-time**: WebRTC with MediaSoup

   ```bash- **Fonts**: Inter (Google Fonts)

   npm install

   ```## Getting Started



## Running Locally### Prerequisites



### Development Mode- Node.js 18 or later

- npm or yarn

Start the development server with hot-reload:

### Installation

```bash

yarn dev1. **Navigate to the tomasz-chess directory**:

````

```bash

Or with npm:   cd tomasz-chess

```

```bash

npm run dev2. **Install dependencies**:

```

````bash

The application will be available at:   npm install

- **Local**: [http://localhost:3000](http://localhost:3000)   ```

- **Network**: The terminal will also show your network IP address

3. **Run the development server**:

### Production Build

```bash

To create an optimized production build:   npm run dev

````

````bash

yarn build4. **Open your browser** and visit `http://localhost:3000`

yarn start

```### Build for Production



Or with npm:```bash

npm run build

```bashnpm start

npm run build```

npm start

```## Project Structure



## Available Scripts```

tomasz-chess/

- `yarn dev` - Start development server with Turbopack├── src/

- `yarn build` - Create production build│   ├── app/                    # Next.js App Router

- `yarn start` - Start production server│   │   ├── globals.css         # Global styles and CSS variables

- `yarn lint` - Run ESLint│   │   ├── layout.tsx          # Root layout component

│   │   └── page.tsx            # Main dashboard page

## Technology Stack│   ├── components/

│   │   ├── dashboard/          # Dashboard-specific components

- **Framework**: Next.js 15 with App Router│   │   │   ├── Header.tsx      # Navigation header

- **Language**: TypeScript 5│   │   │   ├── MetricCard.tsx  # Metric display cards

- **Styling**: Tailwind CSS 4│   │   │   └── Chart.tsx       # Chart components

- **Chess UI**: react-chessboard│   │   └── ui/                 # Reusable UI components

- **Real-time Communication**: WebRTC with MediaSoup│   └── lib/

- **State Management**: Zustand│       └── utils.ts            # Utility functions

- **Fonts**: Inter (Google Fonts)├── public/                     # Static assets

└── package.json

## Project Structure```



```## Dashboard Components

tomasz-chess/

├── src/### Header

│   ├── app/                    # Next.js App Router pages

│   │   ├── [callId]/           # Dynamic game page- Navigation menu

│   │   ├── globals.css         # Global styles- Search functionality

│   │   ├── layout.tsx          # Root layout- Notifications indicator

│   │   └── page.tsx            # Home page with chess board- User actions

│   ├── components/             # React components

│   │   ├── ChessBoard.tsx      # Custom chess board### Metric Cards

│   │   └── ChessLobby.tsx      # Game lobby interface

│   ├── config/                 # Application configuration- Real-time metrics display

│   ├── contexts/               # React contexts- Trend indicators

│   ├── services/               # API and service layers- Status color coding

│   ├── stores/                 # State management- Progress bars for warnings/errors

│   └── types/                  # TypeScript type definitions

├── public/                     # Static assets### Charts

└── package.json

```- **Line Charts**: For time-series data like latency

- **Area Charts**: For connection trends

## Development- **Bar Charts**: For usage metrics

- **Pie Charts**: For distribution data

### Hot Reload

### Status Indicators

The development server includes hot module replacement (HMR), so your changes will be reflected immediately without needing to refresh the browser.

- System health monitoring

### Port Configuration- Service status display

- Color-coded alerts

By default, the app runs on port 3000. To use a different port:

## Customization

```bash

PORT=3001 yarn dev### Color Scheme

````

The dashboard uses CSS custom properties for theming. Colors can be customized in `src/app/globals.css`:

## Troubleshooting

````css

### Port Already in Use:root {

  --primary-blue: #2563eb;

If port 3000 is already in use:  --success: #10b981;

  --warning: #f59e0b;

```bash  --error: #ef4444;

# Kill the process using port 3000  /* ... */

lsof -ti:3000 | xargs kill -9}

````

# Or use a different port

PORT=3001 yarn dev### Data Sources

````

Currently uses mock data, but can be easily connected to real APIs by modifying the data fetching logic in `src/app/page.tsx`.

### Node Version Issues

### Adding New Metrics

If you encounter errors related to Node.js version:

1. Create a new metric card using the `MetricCard` component

1. Check your Node version: `node --version`2. Add data fetching logic

2. Ensure it's 22.0.0 or higher3. Include in the dashboard grid

3. Consider using [nvm](https://github.com/nvm-sh/nvm) to manage Node versions

## Data Integration

### Clear Cache

The dashboard is designed to fetch data from various resources. Currently implemented with mock data, but can be easily connected to:

If you experience issues, try clearing the cache:

- REST APIs

```bash- GraphQL endpoints

rm -rf .next node_modules- WebSocket connections for real-time updates

yarn install- Database connections

yarn dev- Monitoring services (Prometheus, Grafana, etc.)

````

## Performance Features

## Environment Variables

- **Static Generation**: Optimized for fast loading

Currently, the application uses default configuration. For custom settings, create a `.env.local` file:- **Code Splitting**: Automatic code splitting by Next.js

- **Image Optimization**: Built-in Next.js image optimization

````env- **Lazy Loading**: Components load as needed

NEXT_PUBLIC_CONTROLLER_URL=http://your-controller-url:8080

```## Browser Support



## Contributing- Chrome (latest)

- Firefox (latest)

1. Fork the repository- Safari (latest)

2. Create a feature branch (`git checkout -b feature/amazing-feature`)- Edge (latest)

3. Commit your changes (`git commit -m 'Add amazing feature'`)

4. Push to the branch (`git push origin feature/amazing-feature`)## Contributing

5. Open a Pull Request

1. Fork the repository

## License2. Create a feature branch

3. Commit your changes

This project is private and proprietary.4. Push to the branch

5. Create a Pull Request

---

## License

Built with ❤️ using modern web technologies

This project is the Tomasz Chess application.

---

Built with ❤️ using modern web technologies
# lets-teach-chess
````

# Filmique - A Film Photography App

Filmique is a modern web application designed to simulate the experience of film photography, allowing users to manage film rolls, take virtual photos, and explore a community feed.

## Features

- **Film Roll Management**: Load new film, track shots used, and develop completed rolls.
- **Camera Modes**: Switch between "Simple" and "Pro" camera modes.
  - **Simple Mode**: Point-and-shoot experience.
  - **Pro Mode**: Manual control over ISO, Aperture, Shutter Speed, and Focus.
- **Interactive Range Selectors**: Adjust camera settings using intuitive horizontal range selectors with visual feedback.
- **Photo Gallery**: View your developed photos and completed film rolls.
- **User Profile**: Track your progress, earned credits, streaks, badges, and achievements.
- **Community Feed**: Browse photos from other users (mock data).
- **Responsive Design**: Built with Tailwind CSS for a mobile-first, adaptive user interface.

## Tech Stack

- **React**: Frontend library for building user interfaces.
- **TypeScript**: Adds static type checking to JavaScript, enhancing code quality and maintainability.
- **Vite**: Fast development build tool for modern web projects.
- **Tailwind CSS**: A utility-first CSS framework for rapidly building custom designs.
- **Lucide React**: A collection of beautiful, pixel-perfect icons.
- **Pexels**: Used for mock image URLs in the application.

## Project Structure

```
.
├── public/
├── src/
│   ├── assets/             # Static assets (e.g., fonts, images)
│   ├── components/         # Reusable UI components
│   │   ├── CameraView.tsx
│   │   ├── FilmSelectionModal.tsx
│   │   ├── RangeSelector.tsx
│   │   ├── TopBar.tsx
│   │   └── ...
│   ├── context/            # React Context for global state management
│   │   └── AppContext.tsx
│   ├── hooks/              # Custom React hooks
│   ├── views/              # Main application views/pages
│   │   ├── HomeView.tsx
│   │   ├── GalleryView.tsx
│   │   ├── ProfileView.tsx
│   │   └── ...
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Entry point for React application
│   ├── index.css           # Global styles (Tailwind CSS imports)
│   └── vite-env.d.ts       # Vite environment type definitions
├── index.html              # Main HTML file
├── package.json            # Project dependencies and scripts
├── postcss.config.js       # PostCSS configuration for Tailwind CSS
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)

### Installation

1.  **Clone the repository (if applicable):**
    ```bash
    # This step is not applicable in WebContainer, but would be for local setup.
    # git clone <repository-url>
    # cd filmique
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

### Running the Development Server

To start the development server:

```bash
npm run dev
```

This will typically open the application in your browser at `http://localhost:5173` (or another available port).

## Usage

- **Navigate**: Use the bottom navigation bar to switch between Home, Camera, Gallery, and Profile views.
- **Take Photos**: In the Camera view, click the large white button to take a photo.
- **Load Film**: If no film is loaded, a modal will appear to select a film type and capacity.
- **Pro Mode**: Switch to "PRO" mode in the Camera view to manually adjust ISO, Aperture, Shutter Speed, and Focus using the horizontal sliders.
- **View Photos**: Go to the Gallery or Profile view to see your captured photos and developed rolls.

## Contributing

(This section is a placeholder for a real project. In a WebContainer environment, direct contributions via pull requests are not applicable.)

## License

(This section is a placeholder. You would typically specify your project's license here.)

---

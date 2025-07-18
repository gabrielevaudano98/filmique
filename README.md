# Filmique App

Filmique is a modern web application designed for film photography enthusiasts. It provides a unique digital experience that mimics the charm and workflow of traditional film cameras, allowing users to capture, manage, and share their "film" photos.

## Features

*   **Authentic Film Experience**: Simulate various film types, each with unique characteristics (color, grain, contrast).
*   **Camera Modes**: Switch between a simplified "Photo" mode for quick shots and a "Pro" mode for granular control over ISO, Aperture, Shutter Speed, and Focus.
*   **Film Rolls**: Manage digital film rolls with limited capacities, encouraging thoughtful photography.
*   **Development Process**: "Develop" completed rolls to reveal your photos, just like in a darkroom.
*   **Photo Albums**: Organize and browse your developed photos in a beautiful gallery.
*   **Challenges**: Engage in daily, weekly, and special challenges to earn XP, credits, and unique badges.
*   **User Profile**: Track your progress, view your photo collection, developed rolls, and earned achievements.
*   **Responsive Design**: A sleek, mobile-first interface built with React and Tailwind CSS, ensuring a great experience on any device.

## Technologies Used

*   **React**: A JavaScript library for building user interfaces.
*   **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript.
*   **Vite**: A fast build tool that provides a lightning-fast development experience.
*   **Tailwind CSS**: A utility-first CSS framework for rapidly building custom designs.
*   **Lucide React**: A collection of beautiful and customizable open-source icons.
*   **Supabase (Planned)**: For backend services, including database, authentication, and storage.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js (v18 or higher recommended)
*   npm (comes with Node.js)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd filmique
    ```
    (Note: In a WebContainer environment, this step is handled for you.)

2.  **Install dependencies:**
    ```bash
    npm install
    ```

### Running the Application

1.  **Start the development server:**
    ```bash
    npm run dev
    ```
    This will start the Vite development server. You can then open your browser to the address indicated in the terminal (e.g., `http://localhost:5173`).

## Project Structure

```
.
├── public/                 # Static assets
├── src/
│   ├── assets/             # Images, fonts, etc.
│   ├── components/         # Reusable UI components
│   │   ├── AlbumsView.tsx
│   │   ├── CameraView.tsx
│   │   ├── ChallengesView.tsx
│   │   ├── FilmSelectionModal.tsx
│   │   ├── HomeView.tsx
│   │   ├── ProfileView.tsx
│   │   ├── RangeSelector.tsx
│   │   ├── SettingsView.tsx
│   │   └── TopBar.tsx
│   ├── context/            # React Context for global state
│   │   └── AppContext.tsx
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Entry point for React app
│   ├── index.css           # Global styles
│   └── vite-env.d.ts       # Vite environment type definitions
├── .eslintrc.cjs           # ESLint configuration
├── index.html              # Main HTML file
├── package.json            # Project dependencies and scripts
├── postcss.config.js       # PostCSS configuration
├── README.md               # Project README
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

## Usage

*   **Navigation**: Use the bottom navigation bar to switch between Home, Albums, Camera, Challenges, and Profile views.
*   **Camera**:
    *   Tap the large camera button in the bottom navigation to enter camera mode.
    *   In "Photo" mode, simply tap the shutter button to take a picture.
    *   Switch to "Pro" mode to adjust ISO, Aperture, Shutter Speed, and Focus using the range selectors.
    *   Tap the flash icon to toggle flash modes (On, Off, Auto).
    *   Tap the film icon to change the active film roll.
*   **Home**: See your current film roll progress and a feed of recent photos.
*   **Albums**: Browse your developed photos and rolls.
*   **Challenges**: View and complete challenges to earn rewards.
*   **Profile**: See your personal stats, badges, and achievements.

## Contributing

Contributions are welcome! Please feel free to open issues or submit pull requests.

## License

This project is open-source and available under the [MIT License](LICENSE).

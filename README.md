# Nextera

A modern and elegant NextJS template with advanced theme management, pre-configured UI components, and optimized for rapid professional web application development.

![License](https://img.shields.io/badge/license-MIT-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.3.0-black)
![React](https://img.shields.io/badge/React-19.0.0-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.17-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## 🚀 Features

- **Next.js 15.3** - The latest version with optimized performance and TurboPack
- **React 19** - Enjoy the latest React features
- **TypeScript** - Static typing for more robust code
- **TailwindCSS** - With advanced configuration and animations
- **Theme Management** - Full support for light, dark, and dim themes
- **UI Components** - Based on shadcn/ui for an elegant and consistent interface
- **Sonner** - Stylish and accessible toast notifications
- **ESLint & Prettier** - For clean and consistent code

## 🛠️ Project Structure

```
.
├── public/
├── src/
│   ├── app/
│   │   ├── globals.css           # Global styles with CSS variables for themes
│   │   ├── layout.tsx            # Main application layout
│   │   └── page.tsx              # Home page
│   ├── components/
│   │   ├── theme-provider.tsx    # Provider for theme management
│   │   ├── theme-switcher.tsx    # Theme switching component
│   │   └── ui/                   # Reusable UI components
│   └── lib/
│       └── utils.ts              # Utility functions
├── .eslintrc.json
├── .gitignore
├── next.config.ts
├── package.json
├── README.md
├── tailwind.config.ts
└── tsconfig.json
```

## 🌗 Themes

This template includes advanced theme management with:

- **Light** - Default light theme
- **Dark** - Dark theme
- **Dim** - Softened dark theme
- **System** - Adapts to system preferences

Themes are fully customizable via CSS variables in `globals.css`.

## 🚀 Quick Start

1. Clone this repo

```bash
git clone https://github.com/your-username/nextera.git my-project
cd my-project
```

2. Install dependencies

```bash
npm install
# or
yarn
# or
pnpm install
```

3. Start the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser

## 📦 Available Scripts

- `dev` - Starts the development server with TurboPack
- `build` - Builds the application for production
- `start` - Runs the application in production mode
- `lint` - Checks the code with ESLint
- `format` - Formats the code with Prettier

## 🧩 UI Components

This template uses [shadcn/ui](https://ui.shadcn.com/) components for an elegant and consistent user interface. You can easily add more components using the shadcn CLI:

```bash
npx shadcn-ui@latest add [component]
```

## 📱 Responsive Design

All components are optimized for responsive design thanks to TailwindCSS.

## 🛡️ TypeScript

The project is fully configured with TypeScript for static typing and a better development experience.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)
- [next-themes](https://github.com/pacocoursey/next-themes)
- [Sonner](https://sonner.emilkowal.ski/)

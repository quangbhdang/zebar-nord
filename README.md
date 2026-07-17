<p align="center">
    <img src="https://raw.githubusercontent.com/nordtheme/nord/main/assets/nord-logo.png" width="80" alt="Nord Logo" />
    <h2 align="center">Zebar Nord</h2>
</p>

<p align="center">
A fully featured topbar styled with the beautiful, arctic <a href="https://www.nordtheme.com/">Nord</a> theme, built for <a href="https://github.com/glzr-io/zebar">Zebar</a> - the modern desktop widget platform.
</p>

<p align="center">
    <a href="https://www.nordtheme.com/">
        <img src="https://img.shields.io/badge/theme-nord-5e81ac?style=for-the-badge" alt="Nord Theme" />
    </a>
</p>

> [!NOTE]
> This project is a fork of [zebar-rose-pine-aqua](https://github.com/Marianinpb/zebar-rose-pine-aqua) which only modifies the theme to use **Nord**.

## ✨ Features

- **🎨 Nord Theme**: Beautiful color palette inspired by the popular, arctic Nord theme
- **🖥️ Multi-Window Manager Support**: Compatible with GlazeWM, Komorebi, and vanilla window managers
- **📊 System Monitoring**: Real-time CPU, memory, battery, and network statistics
- **🎵 Media Controls**: Integrated media player controls with playback information
- **🕐 Smart Clock**: Elegant date and time display
- **⚡ Performance Optimized**: Built with SolidJS for blazing fast performance
- **🎯 Responsive Design**: Adapts seamlessly to different screen sizes and resolutions

## 🖼️ Preview

<div align="center">
  <img src="resources/preview-image-1.png" alt="Zebar Rose Pine ++ Preview 1" width="800"/>
  <img src="resources/preview-image-2.png" alt="Zebar Rose Pine ++ Preview 2" width="800"/>
</div>

## 🚀 Quick Start

### Prerequisites

- [Zebar](https://github.com/glzr-io/zebar) v3.0.0 or higher
- Node.js 21+ and npm/pnpm/yarn
- A supported window manager (GlazeWM, Komorebi, or None/Vanilla)

### Installation

## 🛠️ Development

1. **Clone the repository**

```bash
git clone https://github.com/quangbhdang/zebar-nord.git
cd zebar-nord
```

2. **Install dependencies**

```bash
npm install
# or
pnpm install
# or
yarn install
```

3. **Build the project**

```bash
npm run build
```

4. **Install in Zebar**
   - Copy the files to your Zebar packs directory

### Available Scripts

| Command                  | Description                       |
| ------------------------ | --------------------------------- |
| `npm run dev:glazewm`    | Build and watch for GlazeWM mode  |
| `npm run dev:komorebi`   | Build and watch for Komorebi mode |
| `npm run dev:vanilla`    | Build and watch for vanilla mode  |
| `npm run build:glazewm`  | Build for GlazeWM                 |
| `npm run build:komorebi` | Build for Komorebi                |
| `npm run build:vanilla`  | Build for vanilla                 |
| `npm run build`          | Build all variants                |

### Project Structure

```
zebar-nord/
├── dist/
│   ├── glazewm/                    # dist folder for GlazeWM
│   ├── komorebi/                   # dist folder for Komorebi
│   └── vanilla/                    # dist folder for Vanilla
├── src/
│   ├── components/
│   │   └── bar/
│   │       ├── background.tsx      # Background component
│   │       ├── battery.tsx         # Battery status
│   │       ├── cpu.tsx             # CPU usage
│   │       ├── datetime.tsx        # Date and time
│   │       ├── direction.tsx       # Direction indicators
│   │       ├── glazewm.tsx         # GlazeWM specific
│   │       ├── komorebi.tsx        # Komorebi specific
│   │       ├── media.tsx           # Media controls
│   │       ├── memory.tsx          # Memory usage
│   │       └── network.tsx         # Network status
│   ├── glazewm.tsx                 # GlazeWM entry point
│   ├── komorebi.tsx                # Komorebi entry point
│   └── vanilla.tsx                 # Vanilla entry point
│   └── index.css                   # Shared css file
├── resources/
│   ├── preview-image-1.png         # Preview image 1
│   └── preview-image-2.png         # Preview image 2
├── glazewm.html                    # GlazeWM HTML entry point
├── komorebi.html                   # Komorebi HTML entry point
├── vanilla.html                    # Vanilla HTML entry point
└── zpack.json                      # Zebar pack configuration
```

## 🎨 Customization

The theme uses Tailwind CSS for styling, making it easy to customize colors, spacing, and layout. The main color palette follows the official Nord theme guidelines:

- **Polar Night** (Dark theme base and backgrounds):
  - `nord0` (`#2e3440`): Primary background
  - `nord1` (`#3b4252`): Elevated widgets background
  - `nord2` (`#434c5e`): Borders and selections
  - `nord3` (`#4c566a`): Muted text and comments
- **Snow Storm** (Typography and highlights):
  - `nord4` (`#d8dee9`): Base text color
  - `nord5` (`#e5e9f0`): Hover/elevated text
  - `nord6` (`#eceff4`): Active / bold text
- **Frost** (Accents and active states):
  - `nord7` (`#8fbcbb`): Teal Frost (network status)
  - `nord8` (`#88c0d0`): Ice Blue Frost (primary icons)
  - `nord9` (`#81a1c1`): Soft Blue Frost (memory usage)
  - `nord10` (`#5e81ac`): Deep Blue Frost (battery status)
- **Aurora** (Status colors and alerts):
  - `nord11` (`#bf616a`): Red Aurora (high CPU, low battery)
  - `nord12` (`#d08770`): Orange Aurora (RSS feed)
  - `nord13` (`#ebcb8b`): Yellow Aurora (battery mid-charge)
  - `nord14` (`#a3be8c`): Green Aurora (battery good, low CPU)
  - `nord15` (`#b48ead`): Purple Aurora (media playback)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Nord Theme](https://www.nordtheme.com/) for the beautiful color palette
- [zebar-rose-pine-aqua](https://github.com/Marianinpb/zebar-rose-pine-aqua) for the original codebase
- [Zebar](https://github.com/glzr-io/zebar) for the amazing desktop widget platform
- [SolidJS](https://solidjs.com) for the reactive framework
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework

## 🔗 Links

- [Zebar Documentation](https://github.com/glzr-io/zebar)
- [Nord Theme Color Palette](https://www.nordtheme.com/docs/colors-and-palettes)
- [SolidJS Documentation](https://solidjs.com)
- [Original Repo (rose-pine-aqua)](https://github.com/Marianinpb/zebar-rose-pine-aqua)
- [Issues](https://github.com/quangbhdang/zebar-nord/issues)

---

<div align="center">
  Made with ❤️ for the Zebar community
</div>

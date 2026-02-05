# SpeedX - Modern Internet Speed Test Application

A blazingly fast, beautifully designed internet speed test application built with **React**, **TypeScript**, and **Vite**. Get accurate download/upload speeds, latency, and AI-powered insights about your network performance.

![SpeedX](https://img.shields.io/badge/version-1.0.0-blue.svg) ![React](https://img.shields.io/badge/React-19-61dafb.svg) ![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg) ![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg)

---

## 🚀 Features

✅ **Real-Time Speed Testing**
- Accurate download speed measurement via Cloudflare CDN
- Precise upload speed calculation using httpbin.org
- Sub-millisecond latency detection
- Jitter measurement for connection stability

✅ **Client Information**
- Auto-detect your public IP address
- Display geographic location
- Show connected server information

✅ **Beautiful UI**
- Modern, responsive design with Tailwind CSS
- Real-time progress tracking with animated gauge
- Color-coded stat cards (Download/Upload/Latency)
- Smooth animations and transitions

✅ **AI-Powered Insights**
- Google Gemini AI integration
- Personalized network performance analysis
- Actionable recommendations for network optimization

✅ **High Performance**
- Built with Vite for lightning-fast builds
- Optimized bundle size
- Instant HMR during development

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI Framework |
| **TypeScript 5.8** | Type Safety |
| **Vite 6.2** | Build Tool & Dev Server |
| **Tailwind CSS** | Styling |
| **Google Gemini API** | AI Insights |
| **Cloudflare API** | Speed Testing |

---

## 📋 Prerequisites

- **Node.js** 18.0 or higher
- **npm** 10.0 or higher
- **Git** for version control
- Google Gemini API key (for AI insights - optional)

---

## 🔧 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/imranext/speedtest-app.git
cd speedtest-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure API Keys (Optional)

Create a `.env.local` file in the root directory:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

Get your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

---

## 📱 Development

### Start Development Server
```bash
npm run dev
```

The app will be available at: **`http://localhost:5173`**

### Hot Module Replacement
Changes to your code will reflect instantly in the browser without full page reload.

---

## 🏗️ Building

### Production Build
```bash
npm run build
```

Creates an optimized production bundle in the `dist/` folder.

### Preview Production Build Locally
```bash
npm run preview
```

Test the production build locally at: **`http://localhost:4173`**

---

## 🌐 Deployment

### Deploy to VPS with aaPanel

**1. Build the project:**
```bash
npm run build
```

**2. Upload to VPS via aaPanel File Manager**
- Upload `dist/` folder and `package.json`
- Or use SFTP: `scp -r dist/* user@vps:/home/wwwroot/domain.com/`

**3. Create Node.js App in aaPanel**
- Add Node.js application
- Set start command: `npm run preview`
- Configure reverse proxy to port 3000
- Enable SSL with Let's Encrypt

**4. Use PM2 for Process Management**
```bash
npm install -g pm2
pm2 start "npm run preview" --name speedx
pm2 startup
pm2 save
```

---

## 📊 How It Works

### Speed Testing Process

**1. Latency Measurement**
- Performs 5 consecutive ping tests to Cloudflare
- Calculates minimum ping and jitter (variance)
- Average latency: 15-50ms depending on connection

**2. Download Test**
- Downloads 25MB test file from Cloudflare CDN
- Ignores first 500ms (connection warmup)
- Calculates speed based on steady-state data
- Typical speed: 10-500 Mbps

**3. Upload Test**
- Uploads 5MB random binary data to httpbin.org echo server
- Measures bytes/second upload rate
- Typical speed: 5-100 Mbps

**4. AI Analysis**
- Sends test results to Google Gemini AI
- Receives personalized insights and recommendations
- Takes 2-5 seconds depending on API latency

### Data Sources

| Metric | Source | API |
|--------|--------|-----|
| Download Speed | Cloudflare CDN | `speed.cloudflare.com/__down` |
| Upload Speed | httpbin.org | `httpbin.org/post` |
| Latency | Cloudflare Trace | `cloudflare.com/cdn-cgi/trace` |
| Client IP | wtfismyip.com | Free IP detection |
| Location | ipapi.co | Free geolocation |

---

## 📁 Project Structure

```
speedtest-app/
├── src/
│   ├── components/
│   │   ├── Gauge.tsx           # Circular speed gauge display
│   │   ├── StatCard.tsx        # Download/Upload/Latency cards
│   │   └── AiInsights.tsx      # AI analysis display
│   ├── services/
│   │   ├── networkService.ts   # Speed test engine
│   │   └── geminiService.ts    # Google Gemini API integration
│   ├── App.tsx                 # Main application component
│   ├── index.tsx               # React DOM render
│   ├── types.ts                # TypeScript type definitions
│   └── index.css               # Global styles
├── public/
│   └── index.html              # HTML template
├── dist/                       # Production build output
├── package.json                # Dependencies & scripts
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript configuration
└── tailwind.config.js          # Tailwind CSS configuration
```

---

## 🔑 Key Components

### SpeedTestEngine Class
Handles all speed testing logic with state management and error handling.

```typescript
const engine = new SpeedTestEngine((state, metrics) => {
  // Update UI with latest metrics
});

await engine.start();  // Start the test
engine.stop();         // Cancel test
```

### Test States
- `IDLE` - Ready to start
- `CONNECTING` - Measuring latency
- `DOWNLOAD` - Testing download speed
- `UPLOAD` - Testing upload speed
- `COMPLETE` - Test finished
- `ERROR` - Test failed

---

## 🎨 UI/UX Features

- **Real-time Progress Bar** - Visual feedback during testing
- **Animated Gauge** - Smooth needle animation showing current speed
- **Color Coding** - Green (Download), Blue (Upload), Yellow (Latency)
- **Responsive Design** - Works on mobile, tablet, and desktop
- **Dark/Light Theme Ready** - Easily customizable with Tailwind

---

## 🔒 Privacy & Security

- ✅ No data is stored on our servers
- ✅ Results are processed locally
- ✅ IP detection uses public APIs only
- ✅ HTTPS encryption for all connections
- ✅ No cookies or tracking

---

## 🐛 Troubleshooting

### Issue: AI Analysis not working
**Solution**: Check your Gemini API key in `.env.local`

### Issue: Speed test showing incorrect values
**Solution**: Ensure stable internet connection and try again

### Issue: IP location showing "Unknown"
**Solution**: Check firewall settings or try VPN

### Issue: Port already in use during development
**Solution**: `npm run dev -- --port 3001`

---

## 🚀 Future Improvements

- [ ] Multi-server testing support
- [ ] Historical speed tracking with charts
- [ ] Network connection type detection (WiFi/4G/5G)
- [ ] Download speed graph during test
- [ ] Share test results via URL
- [ ] Dark mode toggle
- [ ] Mobile app (React Native)
- [ ] Server-side analytics

---

## 📝 Environment Variables

Create `.env.local` for these optional settings:

```env
# Google Gemini API (for AI insights)
VITE_GEMINI_API_KEY=your_key_here

# Optional: Custom test file size (bytes)
VITE_TEST_SIZE=25000000

# Optional: Upload test size (bytes)
VITE_UPLOAD_SIZE=5000000
```

---

## 📄 License

This project is licensed under the **MIT License** - see LICENSE file for details.

---

## 👨‍💻 Author

**ImranX**
- Website: [imran.pro.bd](https://imran.pro.bd)
- GitHub: [@imranext](https://github.com/imranext)
- Email: hi@imran.pro.bd

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📞 Support

For issues and questions:
- GitHub Issues: [speedtest-app/issues](https://github.com/imranext/speedtest-app/issues)
- Email: hi@imran.pro.bd

---

## 📊 Performance Metrics

Typical test results on a good connection:
- **Download**: 50-500 Mbps
- **Upload**: 10-100 Mbps
- **Latency**: 10-50 ms
- **Test Duration**: 30-60 seconds

---

## 🎯 Roadmap

### v1.0.0 (Current)
- ✅ Basic speed testing
- ✅ IP detection
- ✅ AI insights

### v1.1.0 (Planned)
- [ ] Multiple test servers
- [ ] Historical data
- [ ] Result sharing

### v2.0.0 (Planned)
- [ ] Real-time network monitoring
- [ ] Advanced analytics
- [ ] Mobile app

---

**⭐ If you find this project helpful, please consider giving it a star on GitHub!**

---

*Last Updated: February 5, 2026*

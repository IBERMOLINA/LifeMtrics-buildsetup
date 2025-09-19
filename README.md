# 📊 LifeOS Platform

LifeOS is an open-source platform that helps you track, analyze, and visualize your daily metrics. Take control of your data—monitor health, productivity, habits, and more with beautiful, interactive dashboards.

![LifeOS Dashboard](https://img.shields.io/badge/LifeOS-Dashboard-blue?style=for-the-badge&logo=analytics)

## ✨ Features

- 📊 **Track Multiple Metrics**: Monitor health, productivity, mood, habits, and more
- 📈 **Visualize Trends**: Beautiful charts and dashboards to see your progress over time
- 🔒 **Local-First Storage**: Your data stays on your machine - secure and private
- ⚡ **Fast & Lightweight**: Built with performance in mind
- 📱 **Responsive Design**: Works great on desktop, tablet, and mobile
- 🔌 **Easily Extensible**: Add new metrics and integrations with minimal effort
- 🐳 **Docker Ready**: One-command deployment with Docker

## 🛠️ Technology Stack

- **Backend**: Node.js with Express.js
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Charts**: Chart.js for beautiful data visualization
- **Storage**: Local JSON files (local-first approach)
- **Containerization**: Docker for easy deployment

## 🚀 Quick Start

### Method 1: Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/IBERMOLINA/LifeMtrics-buildsetup.git
cd LifeMtrics-buildsetup

# Build and run with Docker
docker build -t lifeos .
docker run -p 3000:3000 -v $(pwd)/data:/app/data lifeos
```

### Method 2: Local Development

```bash
# Clone the repository
git clone https://github.com/IBERMOLINA/LifeMtrics-buildsetup.git
cd LifeMtrics-buildsetup

# Install dependencies
npm install

# Start the application
npm start
```

Open your browser and navigate to `http://localhost:3000` to start tracking your life metrics!

## 📖 Usage

### Dashboard
The main dashboard provides an overview of all your metrics with:
- Current averages for each metric category
- Trend indicators showing if you're improving
- Weekly progress charts
- Monthly summary visualizations

### Tracking Metrics

#### 🏥 Health Metrics
- Overall health score (1-10)
- Sleep hours
- Exercise minutes
- Water intake (glasses per day)

#### ⚡ Productivity Metrics
- Productivity score (1-10)
- Focus hours
- Tasks completed
- Distractions count

#### 😊 Mood Tracking
- Mood score (1-10)
- Energy level (1-10)
- Stress level (1-10)
- Personal notes

#### 🎯 Habit Tracking
- Habit name and completion status
- Current streak count
- Progress notes

### Data Management
- **Local Storage**: All data is stored locally in JSON files
- **Export/Import**: Easy backup and restore capabilities
- **Privacy First**: No data leaves your machine unless you choose to

## 🏗️ Architecture

```
LifeOS/
├── server.js              # Express.js server
├── public/                # Frontend assets
│   ├── index.html        # Main dashboard
│   ├── css/style.css     # Responsive styling
│   └── js/app.js         # Interactive functionality
├── data/                 # Local JSON storage
├── package.json          # Dependencies and scripts
├── Dockerfile            # Container configuration
└── README.md            # This file
```

## 🔧 API Endpoints

- `GET /` - Main dashboard
- `GET /api/{type}` - Retrieve metrics (health, productivity, mood, habits)
- `POST /api/{type}` - Add new metric entry
- `DELETE /api/{type}/{id}` - Remove metric entry
- `GET /health` - Health check endpoint

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

## 📝 Development

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Docker (optional)

### Local Development Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# The app will be available at http://localhost:3000
```

### Building for Production
```bash
# Using Docker
docker build -t lifeos-prod .
docker run -p 3000:3000 lifeos-prod

# Or locally
npm start
```

## 📊 Data Privacy & Security

- **Local-First**: All your data stays on your device
- **No Analytics**: We don't track your usage
- **Open Source**: Full transparency in code
- **Secure**: No external dependencies for data storage

## 🛣️ Roadmap

- [ ] Data export/import functionality
- [ ] Goal setting and achievement tracking
- [ ] Advanced analytics and insights
- [ ] Mobile app companion
- [ ] Plugin system for custom metrics
- [ ] Data synchronization options
- [ ] Advanced visualization options

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Chart.js for beautiful data visualization
- Express.js for the robust backend framework
- The open-source community for inspiration and tools

---

**Start tracking your life metrics today!** 🚀

For questions, suggestions, or support, please [open an issue](https://github.com/IBERMOLINA/LifeMtrics-buildsetup/issues) or contact the maintainers.

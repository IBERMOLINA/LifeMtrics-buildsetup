const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize data files if they don't exist
const dataFiles = {
    health: 'health.json',
    productivity: 'productivity.json',
    mood: 'mood.json',
    habits: 'habits.json'
};

Object.values(dataFiles).forEach(filename => {
    const filePath = path.join(dataDir, filename);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    }
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes for different metric types
app.get('/api/:type', (req, res) => {
    const { type } = req.params;
    if (!dataFiles[type]) {
        return res.status(400).json({ error: 'Invalid metric type' });
    }
    
    try {
        const filePath = path.join(dataDir, dataFiles[type]);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read data' });
    }
});

app.post('/api/:type', (req, res) => {
    const { type } = req.params;
    if (!dataFiles[type]) {
        return res.status(400).json({ error: 'Invalid metric type' });
    }
    
    try {
        const filePath = path.join(dataDir, dataFiles[type]);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        const newEntry = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...req.body
        };
        
        data.push(newEntry);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        
        res.status(201).json(newEntry);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save data' });
    }
});

app.delete('/api/:type/:id', (req, res) => {
    const { type, id } = req.params;
    if (!dataFiles[type]) {
        return res.status(400).json({ error: 'Invalid metric type' });
    }
    
    try {
        const filePath = path.join(dataDir, dataFiles[type]);
        let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        data = data.filter(item => item.id !== parseInt(id));
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        
        res.json({ message: 'Entry deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete data' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
    console.log(`🚀 LifeOS server running on http://localhost:${PORT}`);
    console.log(`📊 Ready to track your life metrics!`);
});
// MongoDB initialization script
print('🚀 Inicializando banco de dados FII Analyzer...');

db = db.getSiblingDB('fii_analyzer');

// Create collections
db.createCollection('fiis');
db.createCollection('fii_history');
db.createCollection('fii_analyses');
db.createCollection('alerts');
db.createCollection('settings');

// Create indexes for better performance
db.fiis.createIndex({ "ticker": 1 }, { unique: true });
db.fiis.createIndex({ "lastUpdate": 1 });
db.fiis.createIndex({ "dividendYield": 1 });

db.fii_history.createIndex({ "ticker": 1, "timestamp": 1 });
db.fii_history.createIndex({ "timestamp": 1 });

db.fii_analyses.createIndex({ "ticker": 1, "timestamp": 1 });
db.fii_analyses.createIndex({ "score": 1 });
db.fii_analyses.createIndex({ "recommendation": 1 });

db.alerts.createIndex({ "ticker": 1 });
db.alerts.createIndex({ "active": 1 });

db.settings.createIndex({ "key": 1 }, { unique: true });

// Insert default settings
db.settings.insertMany([
    {
        key: "analysis_config",
        value: JSON.stringify({
            minDividendYield: 6.0,
            maxPVP: 1.2,
            minPrice: 5.0,
            maxPrice: 200.0,
            weightDividendYield: 0.4,
            weightPVP: 0.3,
            weightPrice: 0.2,
            weightLiquidity: 0.1
        }),
        updatedAt: new Date()
    },
    {
        key: "recommendation_thresholds",
        value: JSON.stringify({
            buy: 0.7,
            hold: 0.4
        }),
        updatedAt: new Date()
    }
]);

print('✅ MongoDB initialization completed successfully!'); 
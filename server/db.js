const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'database.json');

// Ensure data folder exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

class Database {
  constructor() {
    this.data = {
      users: [],
      products: [],
      orders: [],
      payments: [],
      vipMemberships: [],
      wishlists: {},
      reviews: [],
      coupons: []
    };
    this.init();
  }

  init() {
    if (fs.existsSync(DB_PATH)) {
      try {
        const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
        this.data = JSON.parse(fileContent);
      } catch (err) {
        console.error('Error loading database, initializing fresh:', err.message);
        this.save();
      }
    } else {
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save DB to file:', err.message);
    }
  }

  // Generic helpers
  find(collection, predicate) {
    if (!this.data[collection]) return [];
    if (!predicate) return this.data[collection];
    return this.data[collection].filter(predicate);
  }

  findOne(collection, predicate) {
    if (!this.data[collection]) return null;
    return this.data[collection].find(predicate) || null;
  }

  findById(collection, id) {
    return this.findOne(collection, (item) => item.id === id);
  }

  insert(collection, item) {
    if (!this.data[collection]) {
      this.data[collection] = [];
    }
    const record = {
      ...item,
      createdAt: item.createdAt || new Date().toISOString()
    };
    this.data[collection].push(record);
    this.save();
    return record;
  }

  updateById(collection, id, updates) {
    if (!this.data[collection]) return null;
    const index = this.data[collection].findIndex((item) => item.id === id);
    if (index === -1) return null;

    this.data[collection][index] = {
      ...this.data[collection][index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data[collection][index];
  }

  deleteById(collection, id) {
    if (!this.data[collection]) return false;
    const initialLen = this.data[collection].length;
    this.data[collection] = this.data[collection].filter((item) => item.id !== id);
    const deleted = this.data[collection].length < initialLen;
    if (deleted) this.save();
    return deleted;
  }
}

const db = new Database();

module.exports = db;

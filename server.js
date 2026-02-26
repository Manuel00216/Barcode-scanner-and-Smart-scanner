const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public")); 

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "ballislife19", 
    database: "barcode_system"
});

db.connect(err => {
    if (err) console.error("DB connection failed:", err);
    else console.log("MySQL Connected...");
});

// Check barcode
app.get("/check/:code", (req, res) => {
    const code = req.params.code;
    db.query("SELECT * FROM barcodes WHERE barcode_number = ?", [code], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// Register new barcode
app.post("/register-barcode", (req, res) => {
    const { barcode_number } = req.body;
    db.query("INSERT INTO barcodes (barcode_number) VALUES (?)", [barcode_number], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Barcode registered!" });
    });
});

// Save donation
app.post("/donation", (req, res) => {
    const { barcode_number, donor_name, item_name, quantity, expiration_date } = req.body;
    db.query("SELECT * FROM donations WHERE barcode_number = ?", [barcode_number], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) return res.status(400).json({ error: "Duplicate Error: This item is already in inventory." });

        const sql = "INSERT INTO donations (barcode_number, donor_name, item_name, quantity, expiration_date) VALUES (?, ?, ?, ?, ?)";
        db.query(sql, [barcode_number, donor_name, item_name, quantity, expiration_date], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            db.query("UPDATE barcodes SET status='used' WHERE barcode_number=?", [barcode_number]);
            res.json({ message: "Donation saved!" });
        });
    });
});

// Inventory
app.get("/inventory", (req, res) => {
    db.query("SELECT * FROM donations", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// Move to History
app.post('/move-to-history/:barcode', (req, res) => {
    const barcode = req.params.barcode;
    const sqlInsert = `INSERT INTO history (barcode_number, item_name, quantity, usage_date)
                       SELECT barcode_number, item_name, quantity, NOW() 
                       FROM donations WHERE barcode_number = ?`;
    db.query(sqlInsert, [barcode], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ error: "Item not found" });
        db.query("DELETE FROM donations WHERE barcode_number = ?", [barcode], (delErr) => {
            if (delErr) return res.status(500).json({ error: delErr.message });
            res.json({ message: "Success" });
        });
    });
});

app.get('/history', (req, res) => {
    db.query("SELECT * FROM history ORDER BY usage_date DESC", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

app.put('/update-inventory/:barcode', (req, res) => {
    const barcode = req.params.barcode;
    const { item_name, quantity, expiration_date, donor_name } = req.body;
    const sql = `UPDATE donations SET item_name = ?, quantity = ?, expiration_date = ?, donor_name = ? WHERE barcode_number = ?`;
    db.query(sql, [item_name, quantity, expiration_date, donor_name, barcode], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json({ message: "Update successful" });
    });
});

// DELETE a specific barcode from the production queue
app.delete("/api/barcodes/:barcode", (req, res) => {
    const barcode = req.params.barcode;
    const sql = "DELETE FROM barcodes WHERE barcode_number = ?";
    
    db.query(sql, [barcode], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database deletion failed" });
        }
        res.json({ message: "Barcode removed successfully" });
    });
});

const { exec } = require("child_process");

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    
    // Automatically open Chrome
    exec(`start chrome http://localhost:${PORT}`);
});
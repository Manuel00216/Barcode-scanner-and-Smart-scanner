const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // serve frontend

// MySQL connection
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

// Routes

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
    db.query(
        "INSERT INTO donations (barcode_number, donor_name, item_name, quantity, expiration_date) VALUES (?, ?, ?, ?, ?)",
        [barcode_number, donor_name, item_name, quantity, expiration_date],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            db.query("UPDATE barcodes SET status='used' WHERE barcode_number=?", [barcode_number]);
            res.json({ message: "Donation saved!" });
        }
    );
});

// Inventory
app.get("/inventory", (req, res) => {
    db.query("SELECT * FROM donations", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Delete barcode
app.delete("/delete-barcode/:code", (req, res) => {
    const code = req.params.code;
    db.query("DELETE FROM barcodes WHERE barcode_number=?", [code], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Barcode deleted!" });
    });
});

// MOVE TO HISTORY: Transfers from donations to history, then deletes
// This MUST be in server.js
app.post('/move-to-history/:barcode', (req, res) => {
    const barcode = req.params.barcode;

    // 1. Move from donations to history
    const sqlInsert = `
        INSERT INTO history (barcode_number, item_name, quantity)
        SELECT barcode_number, item_name, quantity 
        FROM donations 
        WHERE barcode_number = ?`;

    db.query(sqlInsert, [barcode], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // If the barcode wasn't found in donations
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Item not found in inventory" });
        }

        // 2. Delete from donations
        const sqlDelete = `DELETE FROM donations WHERE barcode_number = ?`;
        db.query(sqlDelete, [barcode], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Success" });
        });
    });
});

// GET HISTORY: Fetch all used items
app.get('/history', (req, res) => {
    db.query("SELECT * FROM history ORDER BY usage_date DESC", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});
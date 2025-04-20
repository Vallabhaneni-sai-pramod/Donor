const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL Database Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "YourActualPassword", // Replace with your actual password
    database: "donorsystem",
    multipleStatements: true
});

const connectWithRetry = () => {
    db.connect(err => {
        if (err) {
            console.error("❌ Database connection failed:", err.message);
            console.log("🔄 Retrying in 5 seconds...");
            setTimeout(connectWithRetry, 5000);
        } else {
            console.log("✅ Connected to MySQL Database");
        }
    });
};
connectWithRetry();

// Get All Donors
app.get("/donors", (req, res) => {
    db.query("SELECT * FROM donors", (err, result) => {
        if (err) return res.status(500).send("Error retrieving donors");
        res.json(result);
    });
});

// Add Donor
app.post("/donors/add", (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).send("Name and email required");

    db.query("INSERT INTO donors (name, email) VALUES (?, ?)", [name, email], (err) => {
        if (err) return res.status(500).send("Error adding donor");
        res.send("✅ Donor added successfully!");
    });
});

// Get All Students
app.get("/students", (req, res) => {
    db.query("SELECT * FROM students", (err, result) => {
        if (err) return res.status(500).send("Error retrieving students");
        res.json(result);
    });
});

// Sponsor a Student
app.post("/donors/:donorId/sponsor/:studentId", (req, res) => {
    const { donorId, studentId } = req.params;
    db.query("SELECT * FROM students WHERE id = ? AND isSponsored = FALSE", [studentId], (err, result) => {
        if (err) return res.status(500).send("Error checking student");
        if (result.length === 0) return res.status(400).send("Student not available for sponsorship");

        db.query("UPDATE students SET donor_id = ?, isSponsored = TRUE WHERE id = ?", [donorId, studentId], (err) => {
            if (err) return res.status(500).send("Error updating sponsorship");
            res.send("✅ Student successfully sponsored!");
        });
    });
});

// Reset Student Sponsorship
app.post("/students/:studentId/reset", (req, res) => {
    const { studentId } = req.params;
    db.query("UPDATE students SET isSponsored = FALSE, donor_id = NULL WHERE id = ?", [studentId], (err) => {
        if (err) return res.status(500).send("Error resetting sponsorship");
        res.send("✅ Student sponsorship reset successfully!");
    });
});

// Get Fund Usage
app.get("/funds/:studentId", (req, res) => {
    const { studentId } = req.params;
    db.query("SELECT amount, purpose FROM funds WHERE student_id = ?", [studentId], (err, result) => {
        if (err) return res.status(500).send("Error retrieving fund usage");
        res.json(result);
    });
});

// Update Student Info
app.put("/students/:studentId", (req, res) => {
    const { studentId } = req.params;
    const { name, email, gpa, education_level, income } = req.body;

    db.query(
        "UPDATE students SET name = ?, email = ?, gpa = ?, education_level = ?, income = ? WHERE id = ?",
        [name, email, gpa, education_level, income, studentId],
        (err) => {
            if (err) return res.status(500).send("Error updating student");
            res.send("✅ Student information updated successfully!");
        }
    );
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("❌ Unexpected error:", err);
    res.status(500).send("An unexpected error occurred");
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

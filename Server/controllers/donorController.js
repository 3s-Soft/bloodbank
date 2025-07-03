const db = require('../config/db');

exports.getAllDonors = (req, res) => {
    db.query('SELECT * FROM donors WHERE available = TRUE', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

exports.addDonor = (req, res) => {
    const { blood_group, district } = req.body;
    const userId = req.user.id;

    db.query(
        'INSERT INTO donors (user_id, blood_group, district) VALUES (?, ?, ?)',
        [userId, blood_group, district],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Donor added', id: result.insertId });
        }
    );
};

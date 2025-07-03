const db = require('../config/db');

exports.getAllSeekers = (req, res) => {
    db.query('SELECT * FROM seekers', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

exports.addSeeker = (req, res) => {
    const { blood_group_needed, district, needed_at } = req.body;
    const userId = req.user.id;

    db.query(
        'INSERT INTO seekers (user_id, blood_group_needed, district, needed_at) VALUES (?, ?, ?, ?)',
        [userId, blood_group_needed, district, needed_at],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Seeker added', id: result.insertId });
        }
    );
};

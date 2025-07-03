const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../auth/jwt');

exports.register = async (req, res) => {
    const { name, email, password, phone, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
        'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
        [name, email, hashedPassword, phone, role],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'User registered', id: result.insertId });
        }
    );
};

exports.login = (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err || results.length === 0) return res.status(401).json({ error: 'Invalid email' });

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: 'Invalid password' });

        const token = generateToken(user);
        res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
    });
};

exports.getAllUsers = (req, res) => {
    db.query('SELECT id, name, email, phone, role, is_approved FROM users', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

exports.approveUser = (req, res) => {
    const { id } = req.params;
    db.query('UPDATE users SET is_approved = TRUE WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User approved' });
    });
};

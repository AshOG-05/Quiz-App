require('dotenv').config();
const fs = require('fs');
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS
});

db.connect(err => {
  if (err) return console.error('Connection failed:', err.message);
  
  const dbName = process.env.DB_NAME || 'quiz_app';
  
  db.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``, err => {
    if (err) return console.error('Create DB error:', err.message);
    
    db.changeUser({ database: dbName }, err => {
      if (err) return console.error('Change user error:', err.message);
      
      const schema = fs.readFileSync('../database/schema.sql', 'utf8');
      const queries = schema.split(';').filter(q => q.trim() !== '');
      let completed = 0;
      let hasError = false;
      
      console.log(`Executing ${queries.length} queries...`);
      queries.forEach(q => {
        db.query(q, (err) => {
          if (err) {
            console.error('Query error:', err.message);
            hasError = true;
          }
          completed++;
          if (completed === queries.length) {
            console.log(hasError ? 'Finished with errors' : '✅ Database and tables created successfully!');
            db.end();
          }
        });
      });
    });
  });
});

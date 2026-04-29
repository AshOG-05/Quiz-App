const db = require('./config/db');

const queries = [
  "ALTER TABLE users ADD COLUMN branch VARCHAR(255) DEFAULT NULL;",
  "ALTER TABLE users ADD COLUMN section VARCHAR(255) DEFAULT NULL;",
  "ALTER TABLE quizzes ADD COLUMN target_branch VARCHAR(255) DEFAULT NULL;",
  "ALTER TABLE quizzes ADD COLUMN target_section VARCHAR(255) DEFAULT NULL;",
  "ALTER TABLE quizzes ADD COLUMN passcode VARCHAR(255) DEFAULT NULL;",
  "ALTER TABLE quizzes ADD COLUMN is_active BOOLEAN DEFAULT TRUE;",
  "ALTER TABLE quizzes ADD COLUMN start_time DATETIME DEFAULT NULL;",
  "ALTER TABLE quizzes ADD COLUMN end_time DATETIME DEFAULT NULL;"
];

async function run() {
  for (let q of queries) {
    try {
      await db.promise().query(q);
      console.log(`Executed: ${q}`);
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
         console.log(`Already exists, skipped: ${q}`);
      } else {
         console.error(`Error on ${q}:`, e.message);
      }
    }
  }
  process.exit();
}

run();

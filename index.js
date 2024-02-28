 const dotenv=require('dotenv')
 dotenv.config();
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const app = express();
const port = process.env.PORT;



app.use(cors());

// Create MySQL connection
const connection = mysql.createConnection({
  host:process.env.DBHOST,
  user: process.env.DBUSERNAME,
  password: process.env.DBPASSWORD,
  database:process.env.DBNAME
});

// Connect to MySQL
connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});
















// API endpoint to display current week leaderboard (Top 200)
app.get('/score_card', (req, res) => {
  // Query database for top 200 leaderboard entries for current week
  const query = `
    SELECT *
    FROM score_card
    WHERE WEEK(Timestamp) = WEEK(NOW())
    ORDER BY Score DESC
    LIMIT 200;
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    res.json(results);
  });
});


app.get('/last-week-leaderboard', (req, res) => {
  const country = req.query.country; // Get country from request query parameter

  // Query database for top 200 leaderboard entries for last week and given country
  const query = `
    SELECT UID, Name, Country, Timestamp, Score
    FROM score_card
    WHERE WEEK(Timestamp, 1) = WEEK(NOW(), 1) - 1
    AND YEAR(Timestamp) = YEAR(NOW())
    AND Country = ?
    ORDER BY Score DESC, Timestamp DESC
    LIMIT 200;
  `;

  connection.query(query, [country], (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    res.json(results);
  });
});

// const casual = require('casual');

// const generateRandomTimestamp = () => {
//   const startDate = new Date('2024-02-15').getTime();
//   const endDate = new Date('2024-03-15').getTime();
//   const randomTimestamp = new Date(casual.integer(startDate, endDate));
//   return randomTimestamp;
// };

// const generateCountryCode = () => {
//   const countries = ['US', 'CA', 'GB', 'FR', 'DE', 'IN', 'AU', 'JP', 'CN', 'BR']; // Add more country codes as needed
//   return casual.random_element(countries);
// };

// const data = [];
// for (let i = 0; i < 10000; i++) {
//   const UID = casual.uuid;
//   const Name = casual.full_name;
//   const Score = casual.integer(0, 10000);
//   const Country = generateCountryCode();
//   const TimeStamp = generateRandomTimestamp();
//   data.push([UID, Name, Score, Country, TimeStamp]);
// }

// const insertQuery = 'INSERT INTO score_card (UID, Name, Score, Country, Timestamp) VALUES ?';
// connection.query(insertQuery, [data], (err, results) => {
//   if (err) {
//     console.error('Error inserting data:', err);
//     return;
//   }
//   console.log('Data inserted successfully');
// });







  
// // Fill database with 1000 sample records (dummy implementation)
// function fillDatabaseWithSampleData() {
//   // Dummy implementation to generate and insert sample data
//   const sampleData = [];
//   for (let i = 0; i < 1000; i++) {
//     const UID = generateUID();
//     const Name = generateName();
//     const Score = Math.floor(Math.random() * 1000); // Random score between 0 and 999
//     const Country = generateCountry();
//     const Timestamp = generateTimestamp();

//     sampleData.push([UID, Name, Score, Country, Timestamp]);
//   }

//   const insertQuery = 'INSERT INTO score_card (UID, Name, Score, Country, Timestamp) VALUES ?';
//   connection.query(insertQuery, [sampleData], (err, results) => {
//     if (err) {
//       console.error('Error inserting sample data:', err);
//       return;
//     }
//     console.log('Sample data inserted successfully');
//   });
// }

// // Function to generate UID (dummy implementation)
// function generateUID() {
//   // Dummy implementation to generate UID
//   return Math.random().toString(36).substring(2);
// }

// // Function to generate Name (dummy implementation)
// function generateName() {
//   // Dummy implementation to generate Name
//   const names = ['Alice', 'Bob', 'Charlie', 'David', 'Emma'];
//   return names[Math.floor(Math.random() * names.length)];
// }

// // Function to generate Country (dummy implementation)
// function generateCountry() {
//   // Dummy implementation to generate Country
//   const countries = ['US', 'UK', 'CA', 'AU', 'JP'];
//   return countries[Math.floor(Math.random() * countries.length)];
// }

// // Function to generate Timestamp (dummy implementation)
// function generateTimestamp() {
//   // Dummy implementation to generate Timestamp
//   return new Date();
// }

// // Fill database with sample data when the server starts
// fillDatabaseWithSampleData();
// API endpoint to display last week leaderboard for a given country (Top 20)



app.get('/user-rank/:userId', (req, res) => {
  const userId = req.params.userId.toString();

  const query = `
    SELECT COUNT(*) + 1 AS UserRank
    FROM score_card
    WHERE Score > (
      SELECT Score
      FROM score_card
      WHERE UID = ?
    );
  `;

  // Execute SQL query
  connection.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const userRank = results[0].UserRank;
    res.json({ userId, rank: userRank });
  });
});




// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

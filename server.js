const express = require('express');
const path = require('path');
const app = express();

const cors = require('cors');

const connectDB = require('./config/db');
connectDB();

const PORT = process.env.PORT || 3000;

// parsing JSON
app.use(express.json());

// Where are all the static files kept
app.use(express.static('public'));

// CORS

const corsOptions = {
  origin: process.env.ALLOWED_CLIENT,
};
app.use(cors(corsOptions));

// Template Engines

app.set('views', path.join(__dirname, '/views'));

app.set('view engine', 'ejs');

// App Routes

const fileRouter = require('./routes/files');
app.use('/api/files', fileRouter);

const showRouter = require('./routes/show');
app.use('/files', showRouter);

// npm run dev
// npm run <script-name>
app.listen(PORT, () => {
  console.log('Server Listening on PORT ', PORT);
});

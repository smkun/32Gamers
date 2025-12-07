const express = require('express');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));

// Define data arrays
const games = [
  { id: 1, name: 'Game 1', description: 'Description of Game 1' },
  { id: 2, name: 'Game 2', description: 'Description of Game 2' },
];

const members = require('./members');

const links = [
  { id: 1, name: 'Link 1', url: 'https://example.com/link1' },
  { id: 2, name: 'Link 2', url: 'https://example.com/link2' },
];

// Define routes
app.get('/', (req, res) => {
  res.render('home');
});

app.get('/history', (req, res) => {
  res.render('history');
});

app.get('/games', (req, res) => {
  res.render('games', { games });
});

app.get('/games/:id', (req, res) => {
  const game = games.find(game => game.id === parseInt(req.params.id));
  res.render('game', { game });
});

app.get('/members', (req, res) => {
  res.render('members', { members });
});

app.get('/members/:id', (req, res) => {
  const member = members.find(member => member.id === parseInt(req.params.id));
  res.render('member', { member });
});

app.get('/contact', (req, res) => {
  res.render('contact');
});

app.get('/links', (req, res) => {
  res.render('links', { links });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
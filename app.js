const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const Person = require('./models/person');
const Note = require('./models/note');
const cors = require('cors');
require('dotenv/config');
// localhost 'mongodb://localhost:27017/immortal'
mongoose.connect(process.env.DB_CONNECTION, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected');
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cors());

app.get('/', (req, res) => {
  res.render('home');
});

//Get index Route for People
app.get('/people', async (req, res) => {
  const people = await Person.find({});
  res.render('people/index', { people });
});

//Get index Route for Notes
app.get('/notes', async (req, res) => {
  const notes = await Note.find({});
  res.render('notes/index', { notes });
});

// Get new Person form
app.get('/people/new', (req, res) => {
  res.render('people/new');
});

// Get new Note form
app.get('/notes/new', (req, res) => {
  res.render('notes/new');
});

// Post people
app.post('/people', async (req, res) => {
  const person = new Person(req.body.person);
  await person.save();
  res.redirect(`/people/${person._id}`);
});

//Post Notes
app.post('/notes', async (req, res) => {
  const note = new Note(req.body.note);
  await note.save();
  res.redirect(`/notes/${note._id}`);
});
// Get person by id
app.get('/people/:id', async (req, res) => {
  const person = await Person.findById(req.params.id);
  res.render('people/show', { person });
});

//Get note by id
app.get('/notes/:id', async (req, res) => {
  const note = await Note.findById(req.params.id);
  res.render('notes/show', { note });
});

//Get Person by id and show edit form
app.get('/people/:id/edit', async (req, res) => {
  const person = await Person.findById(req.params.id);
  res.render('people/edit', { person });
});

//Get note by id and show edit form
app.get('/notes/:id/edit', async (req, res) => {
  const note = await Note.findById(req.params.id);
  res.render('notes/edit', { note });
});
// update person id
app.put('/people/:id', async (req, res) => {
  const { id } = req.params;
  const person = await Person.findByIdAndUpdate(id, {
    ...req.body.person,
  });
  res.redirect(`/people/${person._id}`);
});

//update note id
app.put('/notes/:id', async (req, res) => {
  const { id } = req.params;
  const note = await Note.findByIdAndUpdate(id, {
    ...req.body.note,
  });
  res.redirect(`/notes/${note._id}`);
});
//delete person id
app.delete('/people/:id/', async (req, res) => {
  const { id } = req.params;
  await Person.findByIdAndDelete(id);
  res.redirect('/people');
});
//delete note id
app.delete('/notes/:id/', async (req, res) => {
  const { id } = req.params;
  await Note.findByIdAndDelete(id);
  res.redirect('/notes');
});
//

app.listen(process.env.PORT || 3000, function () {
  console.log(
    'Express server listening on port %d in %s mode',
    this.address().port,
    app.settings.env
  );
});

//seed database
//
// const seedDB = async () => {
//   await Person.deleteMany({});
//   for (let i = 0; i < 50; i++) {
//     const peep = new Person({
//       name: 'John Smith',
//       image: 'https://randomuser.me/api/portraits/women/21.jpg',
//       description: 'This is a person',
//       location: 'loveland, ohio',
//     });
//     await peep.save();
//   }
// };
// seedDB().then(() => {
//   mongoose.connection.close();
// });

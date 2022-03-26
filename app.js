const express = require('express');
const session = require('express-session');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const Person = require('./models/person');
const DndPerson = require('./models/dndperson');
const Note = require('./models/note');
const Investigation = require('./models/investigation');
const cors = require('cors');
require('dotenv/config');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const userRoutes = require('./routes/users');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
// localhost 'mongodb://localhost:27017/immortal'
mongoose.connect(process.env.DB_CONNECTION, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
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
app.use(express.static('public'));

const sessionConfig = {
  secret: 'thisshouldbeabettersecret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

//Auth
// app.get('/fakeUser', async (req, res) => {
//   const user = new User({ email: 'colttt@gmail.com', username: 'colttt' });
//   const newUser = await User.register(user, 'chicken');
//   res.send(newUser);
// });

app.use('/', userRoutes);
app;

app.get('/', (req, res) => {
  res.render('home');
});

//Get index Route for People
app.get('/people', async (req, res) => {
  const people = await Person.find({});
  res.render('people/index', { people });
});

//Get index Route for DndPeople
app.get('/dndpeople', async (req, res) => {
  const dndpeople = await DndPerson.find({});
  res.render('dndpeople/index', { dndpeople });
});

//Get index Route for Notes
app.get('/notes', async (req, res) => {
  const notes = await Note.find({});
  res.render('notes/index', { notes });
});

//Get index Route for Investigations
app.get('/investigations', async (req, res) => {
  const investigations = await Investigation.find({});
  res.render('investigations/index', { investigations });
});
//Get index for Natures
app.get('/natures', (req, res) => {
  res.render('handbook/natures');
});
// Get index for Serenades
app.get('/serenades', (req, res) => {
  res.render('handbook/serenades');
});
// Get index for Skills
app.get('/skills', (req, res) => {
  res.render('handbook/skills');
});
// Get new Person form
app.get('/people/new', (req, res) => {
  res.render('people/new');
});

// Get new Person form
app.get('/dndpeople/new', (req, res) => {
  res.render('dndpeople/new');
});

// Get new Note form
app.get('/notes/new', (req, res) => {
  res.render('notes/new');
});

// Get new Investigation form
app.get('/investigations/new', (req, res) => {
  res.render('investigations/new');
});

// Get Point Allocations page
app.get('/points', (req, res) => {
  res.render('points');
});
// Post people
app.post('/people', async (req, res) => {
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.person.location,
      limit: 1,
    })
    .send();
  const person = new Person(req.body.person);
  person.geometry = geoData.body.features[0].geometry;
  await person.save();
  res.redirect(`/people/${person._id}`);
});

// Post dnd people
app.post('/dndpeople', async (req, res) => {
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.dndperson.location,
      limit: 1,
    })
    .send();
  const dndperson = new DndPerson(req.body.dndperson);
  dndperson.geometry = geoData.body.features[0].geometry || {};
  await dndperson.save();
  res.redirect(`/dndpeople/${dndperson._id}`);
});

//Post Notes
app.post('/notes', async (req, res) => {
  const note = new Note(req.body.note);
  await note.save();
  res.redirect(`/notes/${note._id}`);
});
//Post Investigations
app.post('/investigations', async (req, res) => {
  const investigation = new Investigation(req.body.investigation);
  await investigation.save();
  res.redirect(`/investigations/${investigation._id}`);
});
// Get person by id
app.get('/people/:id', async (req, res) => {
  const person = await Person.findById(req.params.id);
  res.render('people/show', { person });
});

// Get person by id
app.get('/dndpeople/:id', async (req, res) => {
  const dndperson = await DndPerson.findById(req.params.id);
  res.render('dndpeople/show', { dndperson });
});

//Get note by id
app.get('/notes/:id', async (req, res) => {
  const note = await Note.findById(req.params.id);
  res.render('notes/show', { note });
});

//Get investigation by id
app.get('/investigations/:id', async (req, res) => {
  const investigation = await Investigation.findById(req.params.id);
  res.render('investigations/show', { investigation });
});
//Get Person by id and show edit form
app.get('/people/:id/edit', async (req, res) => {
  const person = await Person.findById(req.params.id);
  res.render('people/edit', { person });
});

//Get DND Person by id and show edit form
app.get('/dndpeople/:id/edit', async (req, res) => {
  const dndperson = await DndPerson.findById(req.params.id);
  res.render('dndpeople/edit', { dndperson });
});

//Get note by id and show edit form
app.get('/notes/:id/edit', async (req, res) => {
  const note = await Note.findById(req.params.id);
  res.render('notes/edit', { note });
});
//Get investigation by id and show edit form
app.get('/investigations/:id/edit', async (req, res) => {
  const investigation = await Investigation.findById(req.params.id);
  res.render('investigations/edit', { investigation });
});

// update person id
app.put('/people/:id', async (req, res) => {
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.person.location,
      limit: 1,
    })
    .send();
  const { id } = req.params;
  const person = await Person.findByIdAndUpdate(id, {
    ...req.body.person,
  });
  person.geometry = geoData.body.features[0].geometry;
  await person.save();
  res.redirect(`/people/${person._id}`);
});

// update dndperson id
app.put('/dndpeople/:id', async (req, res) => {
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.dndperson.location,
      limit: 1,
    })
    .send();
  const { id } = req.params;
  const dndperson = await DndPerson.findByIdAndUpdate(id, {
    ...req.body.dndperson,
  });
  dndperson.geometry = geoData.body.features[0].geometry || {};
  await dndperson.save();
  console.log(dndperson);
  res.redirect(`/dndpeople/${dndperson._id}`);
});

//update note id
app.put('/notes/:id', async (req, res) => {
  const { id } = req.params;
  const note = await Note.findByIdAndUpdate(id, {
    ...req.body.note,
  });
  res.redirect(`/notes/${note._id}`);
});

//update investigation id
app.put('/investigations/:id', async (req, res) => {
  const { id } = req.params;
  const investigation = await Investigation.findByIdAndUpdate(id, {
    ...req.body.investigation,
  });
  res.redirect(`/investigations/${investigation._id}`);
});
//delete person id
app.delete('/people/:id/', async (req, res) => {
  const { id } = req.params;
  await Person.findByIdAndDelete(id);
  res.redirect('/people');
});
//delete dnd person id
app.delete('/dndpeople/:id/', async (req, res) => {
  const { id } = req.params;
  await DndPerson.findByIdAndDelete(id);
  res.redirect('/dndpeople');
});

//delete note id
app.delete('/notes/:id/', async (req, res) => {
  const { id } = req.params;
  await Note.findByIdAndDelete(id);
  res.redirect('/notes');
});
//delete investigation id
app.delete('/investigations/:id/', async (req, res) => {
  const { id } = req.params;
  await Investigation.findByIdAndDelete(id);
  res.redirect('/investigations');
});

app.listen(process.env.PORT || 3000, function () {
  console.log(
    'Express server listening on port %d in %s mode',
    this.address().port,
    app.settings.env
  );
});

// seed database

// const seedDB = async () => {
//   await Investigation.deleteMany({});
//   for (let i = 0; i < 50; i++) {
//     const investigation = new Investigation({
//       title: 'seed investigation',
//       description: 'This is an investigation description',
//       status: 'Open',
//       contacts: 'seedy mcseederson',
//     });
//     await investigation.save();
//   }
// };
// seedDB().then(() => {
//   mongoose.connection.close();
// });

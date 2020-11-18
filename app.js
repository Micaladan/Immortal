const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const Person = require('./models/person');
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

app.get('/', (req, res) => {
  res.render('home');
});
app.get('/people', async (req, res) => {
  const people = await Person.find({});
  res.render('people/index', { people });
});
app.get('/people/new', (req, res) => {
  res.render('people/new');
});

app.post('/people', async (req, res) => {
  const person = new Person(req.body.person);
  await person.save();
  res.redirect(`/people/${person._id}`);
});

app.get('/people/:id', async (req, res) => {
  const person = await Person.findById(req.params.id);
  res.render('people/show', { person });
});

app.get('/people/:id/edit', async (req, res) => {
  const person = await Person.findById(req.params.id);
  res.render('people/edit', { person });
});

app.put('/people/:id', async (req, res) => {
  const { id } = req.params;
  const person = await Person.findByIdAndUpdate(id, {
    ...req.body.person,
  });
  res.redirect(`/people/${person._id}`);
});

app.delete('/people/:id/', async (req, res) => {
  const { id } = req.params;
  await Person.findByIdAndDelete(id);
  res.redirect('/people');
});

app.listen(3000, () => {
  console.log('Serving on port 3000');
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

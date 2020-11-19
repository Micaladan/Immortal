const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NoteSchema = new Schema({
  title: String,
  description: String,
});

module.exports = mongoose.model('Note', NoteSchema);

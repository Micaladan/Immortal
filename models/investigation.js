const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NoteSchema = new Schema({
  title: String,
  description: String,
  contacts: String,
  status: {
    type: String,
    enum: ['Open', 'Closed'],
  },
});

module.exports = mongoose.model('Investigation', NoteSchema);

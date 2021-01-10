const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const opts = { toJSON: { virtuals: true } };

const PersonSchema = new Schema(
  {
    name: String,
    image: String,
    geometry: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    description: String,
    location: String,
  },
  opts
);

PersonSchema.virtual('properties.popUpMarkup').get(function () {
  return `<a href="/people/${this._id}">${this.name}</a>`;
});

module.exports = mongoose.model('Person', PersonSchema);

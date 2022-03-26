const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const opts = { toJSON: { virtuals: true } };

const DndPersonSchema = new Schema(
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

DndPersonSchema.virtual('properties.popUpMarkup').get(function () {
  return `<a href="/dndpeople/${this._id}">${this.name}</a>`;
});

module.exports = mongoose.model('DndPerson', DndPersonSchema);

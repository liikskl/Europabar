var mongoose = require('mongoose');

//Review-Schema definieren
var reviewSchema = mongoose.Schema({
    user: {
        id: String,
        name: String,
        room: String
    },
    post: {
        title: String,
        content: String,
    },
    answers: [{
        user_id: String,
        user_name: String,
        user_room: String,
        content: String
    }]
});

//Review-Modell der App hinzufügen
module.exports = mongoose.model('Review', reviewSchema);

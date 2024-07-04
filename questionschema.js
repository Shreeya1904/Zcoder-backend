const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/zcoder")
    .then(() => {
        console.log("mongodb connected");
    })
    .catch(() => {
        console.log("fail.connect");
    })

    const questionSchema = new mongoose.Schema({
        title: {
            type: String,
            required: true,
        },
        link: {
            type: String,
            unique: true,
            required: true
        },
        topics: {
            type: [String]
        },
        solution: {
            type: String,
            required: true,
        }
    });
    

const Question = mongoose.model('Question', questionSchema);
module.exports = Question;
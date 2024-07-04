const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/zcoder")
    .then(() => {
        console.log("mongodb connected");
    })
    .catch(() => {
        console.log("fail.connect");
    })

    const commentschema = new mongoose.Schema({
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question',
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        comment: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    });
    

const Comment = mongoose.model('Comment', commentschema);
module.exports = Comment;
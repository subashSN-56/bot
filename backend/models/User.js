// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//     userId: String,
//     toxicCount: { type: Number, default: 0 },
//     messages: [String]
// });

// export default mongoose.model("User", userSchema);

import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    user: String,
    bot: String
});

const userSchema = new mongoose.Schema({
    userId: String,
    toxicCount: { type: Number, default: 0 },
    messages: [messageSchema]
});

export default mongoose.model("User", userSchema);
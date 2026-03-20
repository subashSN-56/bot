

// import express from "express";
// import Groq from "groq-sdk";
// import User from "../models/User.js";
// import dotenv from "dotenv";

// dotenv.config();

// const router = express.Router();

// const groq = new Groq({
//   apiKey: process.env.GROQ_API_KEY
// });

// // toxic words
// const badWords = ["idiot", "stupid", "hate", "ugly"];

// router.post("/", async (req, res) => {
//   const { message, userId } = req.body;

//   let user = await User.findOne({ userId });
//   if (!user) user = new User({ userId });

//   // 🔴 TOXIC CHECK
//   const isToxic = badWords.some(word =>
//     message.toLowerCase().includes(word)
//   );

//   if (isToxic) {
//     user.toxicCount += 1;

//     if (user.toxicCount === 1) {
//       await user.save();
//       return res.json({ reply: "⚠️ Warning: Be respectful." });
//     }

//     if (user.toxicCount === 2) {
//       await user.save();
//       return res.json({ reply: "⚠️ Final Warning!" });
//     }

//     if (user.toxicCount >= 3) {
//       return res.json({ reply: "🚫 You are blocked." });
//     }
//   }

//   try {
//     // 🤖 GROQ AI RESPONSE
//     // const response = await groq.chat.completions.create({
//     //   model: "llama3-8b-8192",
//     //   messages: [
//     //     { role: "system", content: "You are a helpful AI chatbot." },
//     //     { role: "user", content: message }
//     //   ]
//     // });

//     const response = await groq.chat.completions.create({
//   model: "llama-3.1-8b-instant",
//   messages: [
//     { role: "system", content: "You are a helpful AI chatbot." },
//     { role: "user", content: message }
//   ]
// });
//     const reply = response.choices[0].message.content;

//     // save chat
//     user.messages.push(message);
//     await user.save();

//     res.json({ reply });

//   } catch (error) {
//     console.log(error);
//     res.json({ reply: "Error from AI server" });
//   }
// });

// export default router;


import express from "express";
import Groq from "groq-sdk";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// 🔴 Toxic words list
const badWords = ["idiot", "stupid", "hate", "ugly", "fool", "trash"];

router.post("/", async (req, res) => {
  const { message, userId } = req.body;

  let user = await User.findOne({ userId });
  if (!user) user = new User({ userId });

  // 🚫 TOXIC CHECK
  const isToxic = badWords.some(word =>
    message.toLowerCase().includes(word)
  );

  if (isToxic) {
    user.toxicCount += 1;

    if (user.toxicCount === 1) {
      await user.save();
      return res.json({ reply: "⚠️ Warning: Please be respectful." });
    }

    if (user.toxicCount === 2) {
      await user.save();
      return res.json({ reply: "⚠️ Final Warning!" });
    }

    if (user.toxicCount >= 3) {
      return res.json({ reply: "🚫 You are blocked due to bad behavior." });
    }
  }

  try {
    // 🧠 MEMORY (last 5 messages)
    const history = user.messages.slice(-5).flatMap(msg => [
      { role: "user", content: msg.user },
      { role: "assistant", content: msg.bot }
    ]);

    // 🤖 GROQ AI RESPONSE
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI chatbot. Reply in Tamil or English based on user input."
        },
        ...history,
        { role: "user", content: message }
      ]
    });

    const reply = response.choices[0].message.content;

    // 💾 Save chat
    user.messages.push({
      user: message,
      bot: reply
    });

    await user.save();

    res.json({ reply });

  } catch (error) {
    console.log(error);
    res.status(500).json({ reply: "Error from AI server" });
  }
});

export default router;  
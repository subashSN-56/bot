// import express from "express";
// import Groq from "groq-sdk";
// import User from "../models/User.js";
// import dotenv from "dotenv";

// dotenv.config();

// const router = express.Router();

// const groq = new Groq({
//   apiKey: process.env.GROQ_API_KEY
// });

// // 🔴 Toxic words list
// const badWords = ["idiot", "stupid", "hate", "ugly", "fool", "trash"];


// const menuItems = [
//   "Dashboard",
//   "Recent Creations",
//   "Write Article",
//   "Blog Titles",
//   "Generate Images",
//   "Remove Background",
//   "Remove Object",
//   "Review Resume",
//   "ATS Friendly",
//   "Community"
// ];

// // 👋 Default replies
// const defaultReplies = {
//   hi: "Hello 👋\nHow can I help you today?",
//   hello: "Hello 👋\nHow can I assist you?",
//   hey: "Hey there 👋\nWhat do you need help with?",
//   bye: "Goodbye 👋\nHave a great day!",
//   thanks: "You're welcome 😊\nAnything else I can help with?"
// };

// router.post("/", async (req, res) => {
//   const { message, userId } = req.body;

//   let user = await User.findOne({ userId });
//   if (!user) user = new User({ userId });

//   const cleanMsg = message.toLowerCase().trim();

//   // 🚫 TOXIC CHECK
//   const isToxic = badWords.some(word =>
//     cleanMsg.includes(word)
//   );

//   if (isToxic) {
//     user.toxicCount += 1;

//     if (user.toxicCount === 1) {
//       await user.save();
//       return res.json({ reply: "⚠️ Warning: Please be respectful." });
//     }

//     if (user.toxicCount === 2) {
//       await user.save();
//       return res.json({ reply: "⚠️ Final Warning!" });
//     }

//     if (user.toxicCount >= 3) {
//       return res.json({ reply: "🚫 You are blocked due to bad behavior." });
//     }
//   }

//   // 👋 DEFAULT AUTO REPLY CHECK
//   if (defaultReplies[cleanMsg]) {
//     const reply = defaultReplies[cleanMsg];

//   if (menuItems[cleanMsg]) {
//     const reply = `You selected "${menuItems[cleanMsg]}". This feature go to the sidebar option.`;

//   }
    

//     user.messages.push({
//       user: message,
//       bot: reply
//     });

//     await user.save();

//     return res.json({ reply });
//   }

//   try {
//     // 🧠 MEMORY (last 5 messages)
//     const history = user.messages.slice(-5).flatMap(msg => [
//       { role: "user", content: msg.user },
//       { role: "assistant", content: msg.bot }
//     ]);

//     // 🤖 GROQ AI RESPONSE
//     const response = await groq.chat.completions.create({
//       model: "llama-3.1-8b-instant",
//       messages: [
//    {
//   role: "system",
//   content: "You are a helpful AI chatbot. Reply in one line, in English, and keep the answer under 50 words."
// },
//         ...history,
//         { role: "user", content: message }
//       ]
//     });

//     const reply = response.choices[0].message.content;

//     // 💾 Save chat
//     user.messages.push({
//       user: message,
//       bot: reply
//     });

//     await user.save();

//     res.json({ reply });

//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ reply: "Error from AI server" });
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

// 📌 Sidebar Menu Items
const menuItems = [
  "Dashboard",
  "Recent Creations",
  "Write Article",
  "Blog Titles",
  "Generate Images",
  "Remove Background",
  "Remove Object",
  "Review Resume",
  "ATS Friendly",
  "Community"
];

// 👋 Default replies
const defaultReplies = {
  hi: "Hello 👋 How can I help you today?",
  hello: "Hello 👋 How can I assist you?",
  hey: "Hey there 👋 What do you need help with?",
  bye: "Goodbye 👋 Have a great day!",
  thanks: "You're welcome 😊 Anything else I can help with?"
};

router.post("/", async (req, res) => {
  const { message, userId } = req.body;

  let user = await User.findOne({ userId });
  if (!user) user = new User({ userId, toxicCount: 0, messages: [] });

  const cleanMsg = message.toLowerCase().trim();

  // 🚫 TOXIC CHECK
  const isToxic = badWords.some(word => cleanMsg.includes(word));

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
      await user.save();
      return res.json({ reply: "🚫 You are blocked due to bad behavior." });
    }
  }

  // 👋 DEFAULT AUTO REPLY
  if (defaultReplies[cleanMsg]) {
    const reply = defaultReplies[cleanMsg];

    user.messages.push({
      user: message,
      bot: reply
    });

    await user.save();
    return res.json({ reply });
  }

  // 📌 MENU CLICK / MATCH
  const matchedMenu = menuItems.find(item =>
    item.toLowerCase().includes(cleanMsg)
  );

  if (matchedMenu) {
    const reply = `You selected "${matchedMenu}". Please use the sidebar option.`;

    user.messages.push({
      user: message,
      bot: reply
    });

    await user.save();
    return res.json({ reply });
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
          content:
            "You are a helpful AI chatbot. Reply in one line, in English, and keep the answer under 30 words."
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
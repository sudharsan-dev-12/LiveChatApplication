import express from "express";
import messageDetails from "../models/message.js";
import auth from "../middleware/auth.js";

export const messageRouter = express.Router();

messageRouter.get("/:receiver", auth, async (req, res) => {
  const { receiver } = req.params;
  const sender = req.user.username;
  const message = await messageDetails
    .find({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender },
      ],
    })
    .sort({ createdAt: 1 });
  res.json(message);
});

messageRouter.post("/", auth, async (req, res) => {
  const { text, receiver } = req.body;
  const message = await messageDetails.create({
    sender: req.user.username,
    receiver,
    text,
  });
  res.json({message})
});

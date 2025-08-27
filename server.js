const express = require("express");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const admin = require("firebase-admin");
const path = require("path");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const productRouter = require("./routes/product");
const userRouter = require("./routes/user");
const authRouter = require("./routes/auth");
const notificationserver = require("./routes/notificationserver");
const chatRouter = require("./routes/chat");
dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(",") || "*",
    credentials: true,
  },
});
const auth = (req, res, next) => {
  try {
    const token = req.get("Authorization").split("Bearer ")[1];
    var decoded = jwt.verify(token, "shhhhh");
    if (decoded.email) {
      next();
    } else {
      res.sendStatus(401);
    }
  } catch (err) {
    res.sendStatus(401);
  }
};
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
// Load Firebase service account from .env
const serviceAccountPath = path.resolve(__dirname, "serviceAccount.json");
const serviceAccount = require(serviceAccountPath);

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
app.use("/auth", authRouter.router);
app.use("/api", notificationserver.router);
app.use("/products", productRouter.router);
app.use("/users", auth, userRouter.router);
app.use("/chat", auth, chatRouter.router);
app.get("/", (req, res) => {
  res.send("API running with MongoDB Atlas");
});

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});

// --- Socket auth middleware ---
io.use((socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers.authorization?.split("Bearer ")[1];
    if (!token) return next(new Error("No auth token"));
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "shhhhh");
    socket.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (e) {
    next(new Error("Unauthorized"));
  }
});
// --- Socket connections ---
const onlineUsers = new Map(); // userId -> socketId(s)
io.on("connection", (socket) => {
  const userId = socket.user.id;
  // track multiple sockets per user
  if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
  onlineUsers.get(userId).add(socket.id);

  socket.on("join", async ({ conversationId }) => {
    socket.join(conversationId);
  });

  socket.on("typing", ({ conversationId, isTyping }) => {
    socket.to(conversationId).emit("typing", { userId, isTyping });
  });
  // send message
  socket.on("message:send", async ({ conversationId, text, mediaUrl }) => {
    const msg = await Message.create({
      conversation: conversationId,
      sender: userId,
      text,
      mediaUrl,
    });
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessageAt: new Date(),
    });

    const payload = {
      _id: msg._id,
      conversationId,
      sender: userId,
      text: msg.text,
      mediaUrl: msg.mediaUrl,
      createdAt: msg.createdAt,
    };
    io.to(conversationId).emit("message:new", payload);
    // Push to offline participants
    triggerPushToOtherParticipants(conversationId, userId, payload).catch(
      console.error
    );
  });

  // read receipt
  socket.on("message:read", async ({ conversationId }) => {
    await Message.updateMany(
      { conversation: conversationId },
      { $set: { status: "read" } }
    );
    socket.to(conversationId).emit("message:read", { userId, conversationId });
  });
  socket.on("disconnect", () => {
    const set = onlineUsers.get(userId);
    if (set) {
      set.delete(socket.id);
      if (!set.size) onlineUsers.delete(userId);
    }
  });
});
// Push helper
async function triggerPushToOtherParticipants(
  conversationId,
  senderId,
  payload
) {
  const convo = await Conversation.findById(conversationId).populate(
    "participants",
    "fcmTokens"
  );
  const targets = convo.participants.filter(
    (u) => String(u._id) !== String(senderId)
  );

  // if all targets are online in this room, you might skip push
  // else, send FCM
  for (const user of targets) {
    if (!user.fcmTokens?.length) continue;
    const message = {
      notification: {
        title: "New message",
        body: payload.text ? payload.text : "You received a message",
      },
      data: {
        conversationId: String(conversationId),
        type: "chat",
      },
      tokens: user.fcmTokens,
    };
    await admin.messaging().sendEachForMulticast(message);
  }
}

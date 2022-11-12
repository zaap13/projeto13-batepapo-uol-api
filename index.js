import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import Joi from "joi";
import dayjs from "dayjs";

dotenv.config();
dayjs().format();
const app = express();

app.use(cors());
app.use(express.json());
const mongoClient = new MongoClient(process.env.MONGO_URI);

try {
  await mongoClient.connect();
} catch (err) {
  console.log(err);
}

const db = mongoClient.db("uolChat");
const participantsCollection = db.collection("participants");
const messagesCollection = db.collection("messages");

const userSchema = Joi.object({
  name: Joi.string().required(),
});

const messageSchema = Joi.object({
  to: Joi.string().required(),
  text: Joi.string().required(),
  type: Joi.any().valid("message", "private_message").required(),
});

app.post("/participants", async (req, res) => {
  const { name } = req.body;
  const { error } = userSchema.validate(req.body, { abortEarly: false });

  if (error) {
    console.log(error);
    return res.status(422).send(error.details.map((detail) => detail.message));
  }

  try {
    const participant = await participantsCollection.find(req.body).toArray();
    if (participant[0]) {
      return res.sendStatus(409);
    }

    await participantsCollection.insertOne({
      name,
      lastStatus: Date.now(),
    });
    await messagesCollection.insertOne({
      from: name,
      to: "todos",
      text: "entra na sala...",
      type: "status",
      time: dayjs(Date.now()).format("HH:mm:ss"),
    });
    res.sendStatus(201);
  } catch (err) {
    res.status(422).send(err);
  }
});

app.get("/participants", async (req, res) => {
  try {
    const participants = await participantsCollection.find().toArray();
    res.send(participants);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

app.post("/messages", async (req, res) => {
  const { to, text, type } = req.body;
  const { user } = req.headers;
  const { error } = messageSchema.validate(req.body, { abortEarly: false });

  if (error) {
    console.log(error);
    return res.status(422).send(error.details.map((detail) => detail.message));
  }

  try {
    const participant = await participantsCollection
      .find({ name: user })
      .toArray();
    if (!participant[0]) {
      return res.sendStatus(422);
    }

    await messagesCollection.insertOne({
      from: user,
      to,
      text,
      type,
      time: dayjs(Date.now()).format("HH:mm:ss"),
    });
    res.sendStatus(201);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get("/messages", async (req, res) => {
  const { limit } = req.query;
  const { user } = req.headers;

  try {
    const messages = await messagesCollection
      .find()
      .limit(Number(limit))
      .toArray();

    res.send(
      messages.filter(
        (message) =>
          message.type !== "private_message" ||
          message.to === user ||
          message.from === user
      )
    );
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

app.delete("/messages/:id", async (req, res) => {
  const { id } = req.params;
  const { user } = req.headers;

  try {
    const check = await messagesCollection
      .find({ _id: ObjectId(id) })
      .toArray();

    if (!check[0]) {
      return res.sendStatus(404);
    } else if (user !== check[0].from) {
      return res.sendStatus(401);
    }

    const message = await messagesCollection.deleteOne({ _id: ObjectId(id) });
    console.log(message);
    res.sendStatus(204);
  } catch (err) {
    console.log(err);
    return res.sendStatus(404);
  }
});

app.post("/status", async (req, res) => {
  //Atualizar o atributo lastStatus do participante informado para o timestamp atual
  const { user } = req.headers;
});

app.listen(5000, () => {
  console.log("App running in port 5000");
});

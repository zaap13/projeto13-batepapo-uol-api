import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

try {
  await mongoClient.connect();
  db = mongoClient.db("uolChat");
} catch (err) {
  console.log(err);
}

app.post("/participants", async (req, res) => {
  const { name } = req.body;

  try {
    await db.collection("participants").insertOne({
      name,
      lastStatus: Date.now(),
    });
    res.sendStatus(201);
  } catch (err) {
    res.status(422).send(err);
  }
});

app.get("/participants", async (req, res) => {
  try {
    const participants = await db.collection("participants").find().toArray();
    res.send(participants);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

app.post("/messages", async (req, res) => {
  //Nova MSG
  const { to, text, type } = req.body;
  const { user } = req.headers;

  try {
    await db.collection("messages").insertOne({
      from: user,
      to,
      text,
      type,
      time: Date.now(), //Atualizar para o formato HH:MM:SS
    });
    res.sendStatus(201);
  } catch (err) {
    res.sendStatus(422).send(err);
  }
});

app.get("/messages", async (req, res) => {
  const { limit } = req.query;
  const { user } = req.headers; // Utilizar para autenticação

  try {
    const messages = await db
      .collection("messages")
      .find()
      .limit(Number(limit))
      .toArray();
    res.send(messages);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

app.delete("/messages/:id", async (req, res) => {
  const { id } = req.params;
  const { user } = req.headers;

  try {
    const check = await db
      .collection("messages")
      .find({ _id: ObjectId(id) })
      .toArray();

    if (!check) {
      return res.sendStatus(404);
    } else if (user !== check[0].from) {
      return res.sendStatus(401);
    }

    const message = await db
      .collection("messages")
      .deleteOne({ _id: ObjectId(id) });
    console.log(message);
    res.send("Deu bom aqui em baixo");
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

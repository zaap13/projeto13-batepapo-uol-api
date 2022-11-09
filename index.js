import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";

const app = express();

app.use(cors());
app.use(express.json());
const mongoClient = new MongoClient("mongodb://localhost:27017");
let db;

mongoClient
  .connect()
  .then(() => {
    db = mongoClient.db("uolChat");
  })
  .catch((err) => console.log(err));

app.post("/participants", (req, res) => {
  //cadastro
});

app.get("/participants", (req, res) => {
  //Retornar a lista de todos os participantes
});

app.post("/messages", (req, res) => {
  //Nova MSG
});

app.get("/messages", (req, res) => {
  //Retorna MSGS(deve aceitar query string ?limit=50)
});

app.post("/status", (req, res) => {
  //Atualizar o atributo lastStatus do participante informado para o timestamp atual
});

app.listen(5000, () => {
  console.log("App running in port 5000");
});

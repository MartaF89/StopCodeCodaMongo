import { MongoClient } from "mongodb";
import { Persona } from "./models/persona";
//mi collego al server di mongodb
const client = new MongoClient("mongodb://localhost:27017");
//seleziono il database
const db = client.db("coda");
//seleziono la collection
const persone = db.collection<Persona>("persone");
//esporto un oggetto che ha un campo per ogni collection che voglio usare
export const mongodb = {
  persone: persone,
};

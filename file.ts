import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { mongodb } from "./db";
import { ObjectId } from "mongodb";
const app = express();
// MIDDLEWAREfile.ts
app.use(cors());
app.use(bodyParser.json());
app.listen(3000, () => {
  console.log("** Backend pronto sulla porta 3000 **");
});

app.get("/test", (req, res) => {
  res.send({ ok: true });
});

app.post("/coda", async (req, res) => {
  try {
    const nuovaPersona = req.body;
    nuovaPersona.dataInserimento = new Date();
    nuovaPersona.servito = false;
    const result = await mongodb.persone.insertOne(nuovaPersona);

    res.send({
      message: "persona aggiunta in coda",
    });
  } catch (error) {
    res
      .status(500)
      .send({ error: "Errore durante l'inserimento della persona" });
  }
});
//con questa chiamata se /coda : mostra tutti
//se /coda/?type=unserved :mostra i false in data ascendente
//se /coda/?type=served :mostra i true in data ascendente
app.get("/coda", async (req, res) => {
  //leggo il parametro di query
  const type = req.query.type;
  let filtro: any = {};

  if (type === "served") {
    filtro.servito = true;
  } else if (type === "unserved") {
    filtro.servito = false;
  }
  //se non specifico il tipo, il filtro è vuoto e mostra tutti

  try {
    const persone = await mongodb.persone
      .find(filtro)
      .sort({ dataInserimento: 1 })
      .toArray();

    res.send(persone);
  } catch (error) {
    console.error("Errore:", error);
    res.send({ errore: "Errore nel recupero della coda" });
  }
});
// app.get("/coda", async (req, res) => {
//   try {
//     const persone = await mongodb.persone
//       .find({})
//       .sort({ dataInserimento: 1 })
//       .toArray();
//     res.send(persone);
//   } catch (error) {
//     res.send({ errore: "Errore nel recupero dei dati" });
//   }
// });
// app.get("/coda/unserved", async (rq, res) => {
//   try {
//     const unserved = await mongodb.persone
//       .find({ servito: false })
//       .sort({ dataInserimento: 1 })
//       .toArray();
//     res.send(unserved);
//   } catch (error) {
//     res.send({ errore: "Errore nel recupero dei dati" });
//   }
// });
// app.get("/coda/served", async (req, res) => {
//   try {
//     const served = await mongodb.persone
//       .find({ servito: true })
//       .sort({ dataInserimento: 1 })
//       .toArray();
//     res.send(served);
//   } catch (error) {
//     res.send({ errore: "Errore nel recupero dei dati" });
//   }
// });
app.get("/coda/count", async (req, res) => {
  try {
    const serviti = await mongodb.persone.countDocuments({ servito: true });
    const nonServiti = await mongodb.persone.countDocuments({ servito: false });
    res.send({ serviti, nonServiti });
  } catch (error) {
    res.send({ errore: "Errore nel conteggio" });
  }
});
app.delete("/coda/:id", async (req, res) => {
  const id = req.params.id; //estraggo id passato nell url

  const result = await mongodb.persone.updateOne(
    //updateOne metodo di MOngo che cerca un doc e lo modifica
    { _id: new ObjectId(id) }, //filtro di ricerca
    { $set: { servito: true } } //modifica da eseguire
  );

  result.matchedCount === 0 // se matchedCount ===0 vuol dire che non c e nessuna pers con quell id quindi:
    ? res.status(404).send({ errore: "ID non trovato" })
    : res.send({ messaggio: "Servito ✅" }); //altrimenti
});

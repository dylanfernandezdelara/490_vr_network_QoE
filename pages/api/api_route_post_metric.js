import { MongoClient } from "mongodb";

export default async function handler(req, res) {
    if (req.method === "POST") {
        const data = req.body;
        const client = await MongoClient.connect(
    "mongodb+srv://dylanfernandezdelara:oiq8e7Yes6FGU3F1@cluster0.xb3e9e8.mongodb.net/test/retryWrites=true&w=majority");
        const db = client.db("video_data");
        const yourCollection = db.collection("qoe_stats");
        const result = await yourCollection.insertOne(data);
        console.log(result);
        client.close();
        res.status(201).json({ message: "Data inserted successfully!" });
  }
}
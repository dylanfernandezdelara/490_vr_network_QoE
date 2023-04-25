const { MongoClient } = require('mongodb');

async function main(){
    /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
     */
    const uri = "mongodb+srv://dylanfernandezdelara:oiq8e7Yes6FGU3F1@cluster0.xb3e9e8.mongodb.net/test?retryWrites=true&w=majority";


    const client = new MongoClient(uri);

    try {
        // Connect to the MongoDB cluster
        await client.connect();

        // Make the appropriate DB calls
        // await  listDatabases(client);

        // await createVideoMetricsQoE(
        //     client, 
        //     {
        //         numPlaybackQualityChanges: 1,
        //         numBufferingEvents: 1,
        //         durationPlaybackQualityX: 1,
        //         timeToStartVideo: 1,
        //         totalTimeBuffering: 1 
        //     }
        // );

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

async function listDatabases(client){
    databasesList = await client.db().admin().listDatabases();

    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};

async function createVideoMetricsQoE(client, newVideoMetricsQoE){
    const result = await client.db("video_data").collection("qoe_stats").insertOne(newVideoMetricsQoE);
    console.log(`New VideoMetricsQoE created with the following id: ${result.insertedId}`);
}

main().catch(console.error);
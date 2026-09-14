import { connect } from "mongoose"
import dns from "dns"

// Set Google and Cloudflare DNS servers to bypass local network DNS issues with MongoDB SRV records
dns.setServers(['8.8.8.8', '1.1.1.1'])

const mongo_Url=process.env.MONGODB_URL
if(!mongo_Url){
    console.log("mongodb url not found")
}
let cache=global.mongoose
if(!cache){
   cache= global.mongoose={conn:null,promise:null}
}

const connectDb=async ()=>{
if(cache.conn){
    return cache.conn
}
if(!cache.promise){
    let uriToConnect = mongo_Url!;
    // Bypass local DNS SRV issues by mapping to the exact nodes in code
    if (uriToConnect.startsWith("mongodb+srv://")) {
        uriToConnect = "mongodb://rakshanarware2_db_user:X6I5yOYEqip2V1YD@ac-8pjjxcg-shard-00-00.nngafuu.mongodb.net:27017,ac-8pjjxcg-shard-00-01.nngafuu.mongodb.net:27017,ac-8pjjxcg-shard-00-02.nngafuu.mongodb.net:27017/Ai-SupportBot?ssl=true&replicaSet=atlas-uhri10-shard-0&authSource=admin&retryWrites=true&w=majority";
    }
    
    cache.promise=connect(uriToConnect).then((c)=>c.connection)
}

try {
    cache.conn=await cache.promise
} catch (error: any) {
    console.log(error)
    require('fs').writeFileSync('db-error.log', String(error.stack || error))
}

return cache.conn
}

export default connectDb
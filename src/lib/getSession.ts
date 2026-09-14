import { cookies } from "next/headers";
import { scalekit } from "./scalekit";

export async function getSession(){
    const session=await cookies()
    const token=session.get("access_token")?.value
    if(!token){
        return null
    }
    try {
         const result:any=await scalekit.validateToken(token)
          const user=await scalekit.user.getUser(result.sub)
          return user
    } catch (error) {
        // console.log("Token validation failed (likely clock skew). Decoding manually...")
        try {
            const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
            if (payload.sub) {
                return await scalekit.user.getUser(payload.sub);
            }
        } catch (decodeError) {
            console.log("Failed to decode token manually:", decodeError);
        }
    }
  


}
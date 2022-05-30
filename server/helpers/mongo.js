import "../../models/UserSession.js";

import mongoose from "mongoose";
import { Shopify } from "@shopify/shopify-api";

mongoose.connect(process.env.MONGO_URI);

class MongoStore {
  client;

  constructor() {
    this.client = mongoose.model("userSessions");
  }

  async storeCallback(session) {
    const obj = { sessionContent: JSON.stringify(session) };
    const filter = { sessionId: session.id };
    const settings = { new: true, upsert: true };
    await this.client.findOneAndUpdate(filter, obj, settings);
    return true;
  }

  async loadCallback(id) {
    const reply = await this.client.findOne({ sessionId: id });
    if (reply.sessionContent) {
      const sessionObj = JSON.parse(reply.sessionContent);
      return Shopify.Session.Session.cloneSession(sessionObj, sessionObj.id);
    } else {
      return undefined;
    }
  }

  async deleteCallback(id) {
    try {
      return await this.client.deleteOne({ sessionId: id });
    } catch (e) {
      console.log("error deleting " + e);
      return await this.client.deleteOne({ sessionId: id }).clone();
    }
  }
}

export default MongoStore;

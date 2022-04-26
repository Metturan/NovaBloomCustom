// @ts-check
import { resolve } from "path";
import express from "express";
import cookieParser from "cookie-parser";
import { Shopify, ApiVersion } from "@shopify/shopify-api";
import "dotenv/config";

import applyAuthMiddleware from "./middleware/auth.js";
import verifyRequest from "./middleware/verify-request.js";
import cors from 'cors'

import mongoose from "mongoose";
mongoose.connect(process.env.MONGO_URI)
import '../models/Products.js'
import '../models/PostCodes.js'
import '../models/UpsellCollection.js'
import '../models/CardCollection.js'
import '../models/CardProducts.js'
import '../models/DeliveryOptions.js'
import '../models/Occassions.js' 



const USE_ONLINE_TOKENS = true;
const TOP_LEVEL_OAUTH_COOKIE = "shopify_top_level_oauth";

const PORT = parseInt(process.env.PORT || "8081", 10);
const isTest = process.env.NODE_ENV === "test" || !!process.env.VITE_TEST_BUILD;

Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  SCOPES: process.env.SCOPES.split(","),
  HOST_NAME: process.env.HOST.replace(/https:\/\//, ""),
  API_VERSION: ApiVersion.April22,
  IS_EMBEDDED_APP: true,
  // This should be replaced with your preferred storage strategy
  SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
});

// Storing the currently active shops in memory will force them to re-login when your server restarts. You should
// persist this object in your app.
const ACTIVE_SHOPIFY_SHOPS = {};
Shopify.Webhooks.Registry.addHandler("APP_UNINSTALLED", {
  path: "/webhooks",
  webhookHandler: async (topic, shop, body) => {
    delete ACTIVE_SHOPIFY_SHOPS[shop];
  },
});

// export for test use only
export async function createServer(
  root = process.cwd(),
  isProd = process.env.NODE_ENV === "production"
) {
  const app = express();
  app.use(cors({
    origin: '*'
  }));
  app.set("top-level-oauth-cookie", TOP_LEVEL_OAUTH_COOKIE);
  app.set("active-shopify-shops", ACTIVE_SHOPIFY_SHOPS);
  app.set("use-online-tokens", USE_ONLINE_TOKENS);

  app.use(cookieParser(Shopify.Context.API_SECRET_KEY));

  applyAuthMiddleware(app);

  app.post("/webhooks", async (req, res) => {
    try {
      await Shopify.Webhooks.Registry.process(req, res);
      console.log(`Webhook processed, returned status code 200`);
    } catch (error) {
      console.log(`Failed to process webhook: ${error}`);
      res.status(500).send(error.message);
    }
  });

  app.get("/products-count", verifyRequest(app), async (req, res) => {
    const session = await Shopify.Utils.loadCurrentSession(req, res, true);
    const { Product } = await import(
      `@shopify/shopify-api/dist/rest-resources/${Shopify.Context.API_VERSION}/index.js`
    );

    const countData = await Product.count({ session });
    res.status(200).send(countData);
  });

  app.post("/graphql", verifyRequest(app), async (req, res) => {
    try {
      const response = await Shopify.Utils.graphqlProxy(req, res);
      res.status(200).send(response.body);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

    // Start of my code
    const MongoProduct = mongoose.model('products')
    const MongoPostcode = mongoose.model('postalcode')
    const MongoUpsellCollection = mongoose.model('upsellCollection')
    const MongoCardCollection = mongoose.model('cardCollection')
    const MongoCardProduct = mongoose.model('cardProducts')
    const MongoDeliveryInstructions = mongoose.model('deliveryOptions')
    const MongoOccasions = mongoose.model('occasionOptions')
  
    app.get("/api/deliveryInstructions", async (req, res) => {
      try {
        let deliveryOptionsfromDB = await MongoDeliveryInstructions.find({});
        // console.log('getrequest', req)
        let body = {
          status: 'Success',
          data:  deliveryOptionsfromDB
        }
        res.status(200).send(body)
      } catch(error) {
        console.log('error', error)
      }
    })
  
    app.delete('/api/deliveryInstructions', async (req,res) => {
      try {
        MongoDeliveryInstructions.deleteMany({}, function(err) {
          if (err) return;
          res.status(200).send();
          console.log('Delivery Options deleted')
        })
      } catch(err) {
        console.log(err)
      }
    })
  
    app.post('/api/deliveryInstructions', async (req,res)=> {
      try {
        var jsonString = '';
  
        req.on('data', function (data) {
            jsonString += data;
        });
  
        req.on('end', async function () {
            var body = JSON.parse(jsonString);
            // Check if item in DB
            console.log(body)
            var instance = new MongoDeliveryInstructions({deliveryOptionsId: body})
            await instance.save()
              .then(() => res.status(200).send())
              .catch(err => console.log(err))
        });
      } catch(err) {
        console.log(err)
      }
    })
  
    app.get("/api/collectionCard", async (req, res) => {
      try {
        let collectionCardIdfromDB = await MongoCardCollection.find({});
  
        let body = {
          status: 'Success',
          data:  collectionCardIdfromDB
        }
        res.status(200).send(body)
      } catch(error) {
        console.log('error getting upsell collection:', error)
      }
    })
  
    app.post('/api/cardProducts', async (req,res)=> {
      try {
  
        var jsonString = '';
  
          req.on('data', function (data) {
              jsonString += data;
          });
  
          req.on('end', async function () {
            var body = JSON.parse(jsonString);
            var el = {
              cardList: {
                cardsId: body.products,
                collectionTitle: body.collectionTitle
              }
            }
  
            // Check if item in DB
            var instance = new MongoCardProduct(el)
            await instance.save()
              .then(() => res.status(200).send())
              .catch(err => console.log(err))
          });
      } catch(err) {
        console.log(err)
      }
    })
  
    app.post('/api/collectionCard', async (req,res)=> {
      try {
        var jsonString = '';
  
          req.on('data', function (data) {
              jsonString += data;
          });
  
          req.on('end', async function () {
              var body = JSON.parse(jsonString);
              var instance = new MongoCardCollection({cardCollectionId: body.collection})
              await instance.save()
                .then(() => res.status(200).send())
                .catch(err => console.log(err))
          });
  
      } catch(err) {
        console.log(err)
      }
    })
  
    app.delete('/api/collectionCard', async (req,res) => {
      try {
        MongoCardCollection.deleteMany({}, function (err) {
          if (err) return;
  
          res.status(200).send()
          console.log('card collection deleted')
        })
  
      } catch(err) {
        console.log(err)
      }
    })
  
    app.delete('/api/cardProducts', async (req,res) => {
      try {
  
        MongoCardProduct.deleteMany({}, function(err) {
          if (err) return;
  
          res.status(200).send()
          console.log('Products deleted')
        })
  
      } catch(err) {
        console.log(err)
      }
    })
  
    app.get("/api/collectionUpsell", async (req,res) => {
      try {
        let upsellCollectionIdfromDB = await MongoUpsellCollection.find({});
  
        let body = {
          status: 'Success',
          data:  upsellCollectionIdfromDB
        }
  
        res.status(200).send(body)
      } catch(error) {
        console.log('error getting upsell collection:', error)
      }
    })
  
    app.delete('/api/collectionUpsell', async (req,res) => {
      try {
        MongoUpsellCollection.deleteMany({}, function (err) {
          if (err) return;
  
          res.status(200).send();
          console.log('upsell collection deleted')
        })
      } catch(err) {
        console.log(err)
      }
    })
  
    app.post('/api/collectionUpsell', async (req,res)=> {
      try {
        var jsonString = '';
  
        req.on('data', function (data) {
            jsonString += data;
        });
  
        req.on('end', async function () {
            var body = JSON.parse(jsonString);
            // Check if item in DB
            var instance = new MongoUpsellCollection({upsellCollectionId: body.collection})
            await instance.save()
              .then(() => res.status(200).send())
              .catch(err => console.log(err))
            });
     
      } catch(err) {
        console.log('error saving upsell collection:', err)
      }
    })
  
    app.get("/api/products", async (req,res) => {
      try {
        let productsFromDB = await MongoProduct.find({});
  
        let body = {
          status: 'Success',
          data: productsFromDB
        }
  
        res.status(200).send(body)
      } catch(error) {
        console.log(error)
      }
    })
  
    app.delete('/api/products',  async (req,res) => {
      try {
        MongoProduct.deleteMany({}, function(err) {
          if (err) return;
  
          res.status(200).send()
          console.log('Products deleted')
        })
      } catch(err) {
        console.log(err)
      }
    })
  
    app.post('/api/products', async (req,res)=> {
      try {
        var jsonString = '';
  
        req.on('data', function (data) {
            jsonString += data;
        });
  
        req.on('end', async function () {
            var body = JSON.parse(jsonString);
            // Check if item in DB
            var el = {
              productList: {
                productId: body.products,
                collectionTitle: body.collectionTitle
              }
            }
            var instance = new MongoProduct(el)
            await instance.save()
              .then(() => res.status(200).send())
              .catch(err => console.log(err))
        });
      } catch(err) {
        console.log(err)
      }
    })
  
    app.get("/api/postcode", async (req,res) => {
      try {
        let postcodesFromDB = await MongoPostcode.find({});
        
        let body = {
          status: 'Success',
          data: postcodesFromDB
        }
  
        res.status(200).send(body)
      } catch(error) {
        console.log(error)
      }
    })
  
    app.post('/api/postcode', async (req,res)=> {
      try {
  
        var jsonString = '';
  
        req.on('data', function (data) {
            jsonString += data;
        });
  
        req.on('end', function () {
            var body = JSON.parse(jsonString);
  
            if (body.status == 'blacklisted') {
              MongoPostcode.findOneAndUpdate({"status": "blacklisted"}, {postcode:body.postcodeRecord}, function (err) {
                if (err) return;
                
                res.status(200).send()
                console.log('postcode updated')
              })
            }
      
            if (body.status == 'whitelisted') {
              MongoPostcode.findOneAndUpdate({"status": "whitelisted"}, {postcode:body.postcodeRecord}, function (err) {
                if (err) return;
        
                res.status(200).send()
                console.log('postcode updated')
              })
            }
        });
      } catch(err) {
        console.log(err)
      }
    })
    // End of my code apis

  app.use(express.json());

  app.use(async (req, res, next) => {
    const shop = req.query.shop;
    const session = await Shopify.Utils.loadCurrentSession(req, res, true);
    console.log(session)
    if (Shopify.Context.IS_EMBEDDED_APP && shop) {
      res.setHeader(
        "Content-Security-Policy",
        `frame-ancestors https://${shop} https://admin.shopify.com;`
      );
    } else {
      res.setHeader("Content-Security-Policy", `frame-ancestors 'none';`);
    }
    next();
  });

  app.use("/*", (req, res, next) => {
    const { shop } = req.query;

    // Detect whether we need to reinstall the app, any request from Shopify will
    // include a shop in the query parameters.
    if (app.get("active-shopify-shops")[shop] === undefined && shop) {
      res.redirect(`/auth?${new URLSearchParams(req.query).toString()}`);
    } else {
      next();
    }
  });

  /**
   * @type {import('vite').ViteDevServer}
   */
  let vite;
  if (!isProd) {
    vite = await import("vite").then(({ createServer }) =>
      createServer({
        root,
        logLevel: isTest ? "error" : "info",
        server: {
          port: PORT,
          hmr: {
            protocol: "ws",
            host: "localhost",
            port: 64999,
            clientPort: 64999,
          },
          middlewareMode: "html",
        },
      })
    );
    app.use(vite.middlewares);
  } else {
    const compression = await import("compression").then(
      ({ default: fn }) => fn
    );
    const serveStatic = await import("serve-static").then(
      ({ default: fn }) => fn
    );
    const fs = await import("fs");
    app.use(compression());
    app.use(serveStatic(resolve("dist/client")));
    app.use("/*", (req, res, next) => {
      // Client-side routing will pick up on the correct route to render, so we always render the index here
      res
        .status(200)
        .set("Content-Type", "text/html")
        .send(fs.readFileSync(`${process.cwd()}/dist/client/index.html`));
    });
  }

  return { app, vite };
}

if (!isTest) {
  createServer().then(({ app }) => app.listen(PORT));
}

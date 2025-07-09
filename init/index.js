const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const initData = require("./data.js");

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

const init_db = async () => {
  try {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=> ({...obj, owner : "686be65f446596d6f3b09b2a"}))
    await Listing.insertMany(initData.data);
    console.log("Successfully inserted");
  } catch (err) {
    console.error("Error inserting data:", err);
  }
};

main()
  .then(() => {
    console.log("Connection successful");
    init_db(); // Run only after DB is connected
  })
  .catch((err) => console.log("Connection error:", err));

const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const expressError = require("../utils/expressError.js");
const Listing = require("../models/listing.js");
const { isLoggedin, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const {storage} = require("../cloudconfig.js")
const multer  = require('multer')
const upload = multer({storage})

router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedin,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(listingController.CreateListing)
  );

//new route
router.get("/new", isLoggedin, listingController.NewListingForm);

router
  .route("/:id")
  .get(wrapAsync(listingController.ViewListing))
  .put(
    isLoggedin,
    isOwner,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(listingController.UpdateListing)
  )
  .delete(
    isLoggedin,
    isOwner,
    wrapAsync(listingController.DestroyListing)
  );

//edit route
router.get(
  "/:id/edit",
  isLoggedin,
  isOwner,
  wrapAsync(listingController.EditListingForm)
);

module.exports = router;

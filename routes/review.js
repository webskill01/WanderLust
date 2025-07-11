const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js")
const Review = require("../models/review.js");
const Listing = require("../models/listing.js")
const { validateReview, isLoggedin, isReviewAuthor } = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");


    //Reviews
    //Post Review Route
    router.post("/",isLoggedin,validateReview,wrapAsync(reviewController.CreateReview));

      // Delete Review Route
      router.delete("/:reviewId",isLoggedin,isReviewAuthor,wrapAsync(reviewController.DestroReview))

module.exports = router;
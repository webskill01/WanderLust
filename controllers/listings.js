const Listing = require("../models/listing.js");
const mbxGeoCoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeoCoding({ accessToken: mapToken });

//index
module.exports.index = async (req, res) => {
  const { q } = req.query;
  let listings;

  if (q) {
    // If a search query is provided, perform a case-insensitive search
    const escapeRegex = str => str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    const regex = new RegExp(escapeRegex(q), "i");
    listings = await Listing.find({
      $or: [
        { title: regex },
        { location: regex },
        { country: regex }
      ]
    });
  } else {
    // If no search query, fetch all listings 
    listings = await Listing.find({});
  }
  // Always render the listings page, passing the listings and the search query (if any)
  res.render("listings/index.ejs", { listings, searchQuery: q || "" });
};

module.exports.NewListingForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.ViewListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", " Listing You Requested For Does Not Exist ");
    res.redirect("/listings");
  } else {
    res.render("listings/view.ejs", { listing });
  }
};

module.exports.CreateListing = async (req, res) => {
  try {
    let response = await geocodingClient
      .forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      })
      .send();
    let url = req.file.path;
    let filename = req.file.filename;

    let newlisting = new Listing(req.body.listing);
    newlisting.owner = req.user._id;
    newlisting.image = { url, filename };

    if (!response.body.features.length) {
      throw new Error("Invalid location — no geocode result");
    }
    newlisting.geometry = response.body.features[0].geometry;

    await newlisting.save();

    req.flash("success", " New Listing Created ");
    res.redirect("/listings");
  } catch (err) {
    console.error("Error in CreateListing:", err);
    req.flash("error", "Failed to create listing");
    res.redirect("/listings");
  }
};

module.exports.EditListingForm = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", " Listing You Requested For Does Not Exist ");
    res.redirect("/listings");
  } else {
    let originalImageUrl = listing.image.url;
    originalImageUrl.replace("/upload", "/upload/w_250,e_blur:300/");
    res.render("listings/edit.ejs", { listing, originalImageUrl });
  }
};

module.exports.UpdateListing = async (req, res) => {
  const { id } = req.params;

  try {
    // Geocode the new location from the form
    let response = await geocodingClient
      .forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      })
      .send();
      
    // Prepare updated data
    let updatedData = {
      ...req.body.listing,
      geometry: response.body.features[0].geometry, // Save the new geometry
    };

    // Update the listing
    let updatedListing = await Listing.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });

    // If a new image is uploaded, update it
    if (req.file) {
      updatedListing.image = {
        url: req.file.path,
        filename: req.file.filename
      };
      await updatedListing.save();
    }

    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Error updating listing. Please try again.");
    res.redirect(`/listings/${id}/edit`);
  }
};



module.exports.DestroyListing = async (req, res) => {
  let { id } = req.params;
  let deleted = await Listing.findByIdAndDelete(id);
  console.log(deleted);
  req.flash("success", "Listing Deleted ");
  res.redirect("/listings");
};


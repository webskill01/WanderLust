const Listing = require("../models/listing.js");
const mbxGeoCoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeoCoding({ accessToken: mapToken });

//index
module.exports.index = async (req, res) => {
  let listings = await Listing.find({});
  res.render("listings/index.ejs", { listings });
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
  let response = await geocodingClient.forwardGeocode({
    query: req.body.listing.location,
    limit: 1
  })
    .send()

  let url = req.file.path;
  let filename = req.file.filename;

  let newlisting = new Listing(req.body.listing);
  newlisting.owner = req.user._id;
  newlisting.image = {url,filename};

  newlisting.geometry = response.body.features[0].geometry;
  
  await newlisting.save();

  req.flash("success", " New Listing Created ");
  res.redirect("/listings");
};

module.exports.EditListingForm = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", " Listing You Requested For Does Not Exist ");
    res.redirect("/listings");
  } else {
    let originalImageUrl = listing.image.url;
    originalImageUrl.replace("/upload","/upload/w_250,e_blur:300/")
    res.render("listings/edit.ejs", { listing , originalImageUrl });
  }
};

module.exports.UpdateListing = async (req, res) => {
  let { id } = req.params;
  let updatedListing = await Listing.findByIdAndUpdate(id, {...req.body.listing,});
  if(typeof req.file !== "undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    updatedListing.image = {url,filename};
    updatedListing.save()
  }
  req.flash("success", "Listing Updated ");
  res.redirect(`/listings/${id}`);
};

module.exports.DestroyListing = async (req, res) => {
  let { id } = req.params;
  let deleted = await Listing.findByIdAndDelete(id);
  console.log(deleted);
  req.flash("success", "Listing Deleted ");
  res.redirect("/listings");
};

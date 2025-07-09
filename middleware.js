const Listing = require("./models/listing.js");
const expressError = require("./utils/expressError.js")
const {listingSchema , reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");


module.exports.isLoggedin = (req,res,next)=>{
    if(!req.isAuthenticated()){
      req.session.redirectUrl = req.originalUrl;
        req.flash("error","You Must Be Logged In To Make Changes")
        return res.redirect("/login")
      }else{
        next()
      }
};


module.exports.saveRedirectUrl = (req,res,next)=>{
  if(req.session.redirectUrl){
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
}

module.exports.isOwner = async(req,res,next)=>{
  let {id} = req.params;
  let listing = await Listing.findById(id)
  if(!listing.owner._id.equals(res.locals.currUser._id)){
    req.flash("error","You Are Not The Owner");
    return res.redirect(`/listings/${id}`);
  }
  next()
}
//validating server side listing
module.exports.validateListing = (req,res,next)=>{
  let {error} = listingSchema.validate(req.body)
  if(error){
    let errmsg = error.details.map((el)=>el.message).join(",")
    throw new expressError(400,errmsg)
  }else{
    next();
  }
}

//validating server side review
module.exports.validateReview = (req,res,next)=>{
  let {error} = reviewSchema.validate(req.body)
  if(error){
        let errmsg = error.details.map((el)=>el.message).join(",")
        throw new expressError(400,errmsg)
      }else{
        next();
      }
}

module.exports.isReviewAuthor = async(req,res,next)=>{
  let {id , reviewId} = req.params;
  let review = await Review.findById(reviewId)
  if(!review.author._id.equals(res.locals.currUser._id)){
    req.flash("error","You Did Not Created This Review");
    return res.redirect(`/listings/${id}`);
  }
  next()
}
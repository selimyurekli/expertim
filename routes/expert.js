const express = require("express");
const router = express.Router();
const {getAccessToRoute,getExpertAccess}  = require("../middlewares/authorization/auth");
const {approve,disapprove,getUncheckeds} = require("../controller/expert");

router.use([getAccessToRoute,getExpertAccess]);
router.put("/advertiseapprove/:id",approve);
router.put("/advertisedisapprove/:id",disapprove);
router.get("/uncheckeds",getUncheckeds);


module.exports = router;



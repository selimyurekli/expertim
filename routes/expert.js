const express = require("express");
const router = express.Router();
const {getAccessToRoute,getExpertAccess}  = require("../middlewares/authorization/auth");
const {approve,getApprove,getDisapprove,disapprove,getUncheckeds} = require("../controller/expert");

router.use([getAccessToRoute,getExpertAccess]);

router.post("/advertiseapprove/:id",approve);
router.get("/advertiseapprove/:id",getApprove);

router.get("/advertisedisapprove/:id",getDisapprove);
router.post("/advertisedisapprove/:id",disapprove);

router.get("/uncheckeds",getUncheckeds);


module.exports = router;



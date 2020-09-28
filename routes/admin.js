const express= require("express");
const { getAccessToRoute,getAdminAccess } = require("../middlewares/authorization/auth");
const {checkUserExists} = require("../middlewares/database/databaseErrorHelpers");
const {blockUser,unblockUser,deleteUser,expertRegister,deleteAd} = require("../controller/admin");

const router = express.Router();
router.use([getAccessToRoute,getAdminAccess]);


router.put("/block/user/:id",checkUserExists,blockUser);
router.put("/unblock/user/:id",checkUserExists,unblockUser);
router.delete("/delete/user/:id",checkUserExists,deleteUser);
router.post("/expertregister",expertRegister )
router.delete("delete/ad/:id",deleteAd);
module.exports  = router;
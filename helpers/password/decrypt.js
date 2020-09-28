const bcrypt = require("bcrypt");

const isSame= async function(pw1,pw2){

    const match = await bcrypt.compare(pw1, pw2);
    return match;
}



module.exports = {
    isSame
}
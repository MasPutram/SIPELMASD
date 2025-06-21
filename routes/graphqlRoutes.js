const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const schema = require("../graphql/laporanType");
const { protect } = require("../middleware/authMiddleware"); // atau middleware lain

const router = express.Router();

router.use(
  "/",
  protect, // bisa diganti isAdmin, isPetugasOrAdmin, dsb
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);

module.exports = router;

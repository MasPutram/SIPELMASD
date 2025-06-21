const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLList,
} = require("graphql");
const Laporan = require("../models/Laporan");
const LaporanType = require("./laporanType");

// Root Query
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    laporan: {
      type: new GraphQLList(LaporanType),
      args: {
        status: { type: GraphQLString },
        kategori: { type: GraphQLString },
        lokasi: { type: GraphQLString },
      },
      async resolve(parent, args) {
        const filter = {};
        if (args.status) filter.status = args.status;
        if (args.kategori) filter.kategori = args.kategori;
        if (args.lokasi) filter.lokasi = args.lokasi;

        return await Laporan.find(filter);
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
});

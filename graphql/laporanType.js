const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLNonNull,
} = require("graphql");

const LaporanType = new GraphQLObjectType({
  name: "Laporan",
  fields: () => ({
    id: { type: GraphQLID },
    judul: { type: GraphQLString }, // ✅ tambahan judul
    kategori: { type: GraphQLString },
    isi: { type: GraphQLString },
    lokasi: { type: GraphQLString },
    gambar: { type: GraphQLString }, // ✅ tambahan gambar (URL path)
    status: { type: GraphQLString },
    createdAt: { type: GraphQLString },
  }),
});

module.exports = LaporanType;

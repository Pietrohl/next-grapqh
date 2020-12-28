import { ApolloServer, gql } from 'apollo-server-micro'
import knex from "knex";
import DataLoader from 'dataloader'



const db = knex({
  client: "pg",
  connection: {
    database: process.env.PG_DATABASE,
    user: process.env.PG_USER,
    host: process.env.PG_HOST
  },
  debug: true
});

const typeDefs = gql`
  type Query {
    albums(first: Int = 25, skip: Int = 0): [Album!]!
  }
  type Artist {
    id: ID!
    name: String!
    url: String!
    albums(first: Int = 25, skip: Int = 0): [Album!]!
  }
  type Album {
    id: ID!
    name: String!
    year: String!
    artist: Artist!
  }
`;

const resolvers = {
  Query: {
    albums: (_parent, args, _context) => {
      return db
        .select("*")
        .from("albums")
        .orderBy("year", "asc")
        .limit(Math.min(args.first, 50))
        .offset(args.skip);
    }
  },

  Album: {
    id: (album, _args, _context) => album.id,
    artist: (album, _args, { loader }) => {
      // return db
      //   .select("*")
      //   .from("artists")
      //   .where({ id: album.artist_id })
      //   .first();
      return loader.artist.load(album.artist_id);
    }
  },

  Artist: {
    id: (artist, _args, _context) => artist.id,
    albums: (artist, args, _context) => {
      return db
        .select("*")
        .from("albums")
        .where({ artist_id: artist.id })
        .orderBy("year", "asc")
        .limit(Math.min(args.first, 50))
        .offset(args.skip);
    }
  }
};

const loader = {
  artist: new DataLoader(ids =>
    db
      .select("*")
      .from("artists")
      .whereIn("id", ids)
      .then(rows => ids.map(id => rows.find(row => row.id === id)))
  )
};

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: () => {
    return { loader };
  }
});

const handler = apolloServer.createHandler({ path: "/api/graphql" });

export const config = {
  api: {
    bodyParser: false
  }
};

export default handler;
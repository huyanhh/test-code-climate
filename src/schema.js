const { makeExecutableSchema } = require("graphql-tools")
const resolvers = require("./resolvers")

const typeDefs = `
  type LambdaParams {
    intentName: String!
    dialogState: String!
    payload: [Payload!]
  }
  
  type Activity {
    Url: String
    Name: String
    Ranking: String
    Location: String
    StarRating: String
    Coords: [Float]
    Tags: [String]
  } 
  
  type Query {
    params: [LambdaParams!]!
    allLinks: [Link!]!
   }
   
  union Payload = Activity

  type Link {
    id: ID!
    url: String!
    description: String!
  }
  
  type Mutation {
    createLink(url: String!, description: String!): Link
  }
`

module.exports = makeExecutableSchema({typeDefs, resolvers})
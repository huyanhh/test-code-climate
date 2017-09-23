const { makeExecutableSchema } = require("graphql-tools")
const resolvers = require("./resolvers")

const typeDefs = `
  type LambdaParams {
    intentName: String!
    slots: String!
    sessionAttributes: String!
    message: String!
    dialogState: String!
    slotToElicit: String
    payload: [String!]
  }
  
  type Query {
    params: [LambdaParams!]!
    allLinks: [Link!]!
   }
   
  union Payload = Activity | Hotel | Restaurant

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
const links = [
  {
    id: 1,
    url: 'http://graphql.org/',
    description: 'The Best Query Language'
  },
  {
    id: 2,
    url: 'http://dev.apollodata.com',
    description: 'Awesome GraphQL Client'
  },
];

const aws = require("./lambdaFunctions")

module.exports = {
  Query: {
    allLinks: () => links,
    params: async (obj) => {
      return await LexBot.getResponseMessage((error, res)=>{console.log(error)})
    }
  },
  Mutation: {
    createLink: (_, data) => {
      const newLink = Object.assign({id: links.length + 1}, data)
      links.push(newLink)
      return newLink
    }
  },
  Payload: {
    __resolveType(obj) {
      if (obj.Url) {
        return "Activity" // String resource of Activity in schema
      }
    }
  }
};

LexBot = {}

LexBot.getResponseMessage = (cb) => {
  let lexRuntime = new aws.AWS.LexRuntime()
  // stick this into the api explorer
  let userMessage = { "text": "find activities westminster, california", "userId": "122" }
  const params = {
    botAlias: "$LATEST", /* required */
    botName: "Hecatea", /* required */
    inputText: userMessage.text, /* required */
    userId: userMessage.userId /* required */
    // sessionAttributes: userMessage.sessionAttributes
  }

  // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/LexRuntime.html#postText-property
  return new Promise((resolve, reject) => {
    lexRuntime.postText(params, function(err, lexResponse) {
      if (err) {
        console.error("There was an error with lex")
        reject(err)
      } else {
        console.log("returned data", lexResponse)
        if (lexResponse.dialogState !== "ReadyForFulfillment")
          reject(null, lexResponse)
        else
          resolve(aws.lambda(lexResponse, cb))
      }
    })
  })
}
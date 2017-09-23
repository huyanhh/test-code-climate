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



module.exports = {
  Query: {
    allLinks: () => links,
    params: ,
  },
  Mutation: {
    createLink: (_, data) => {
      const newLink = Object.assign({id: links.length + 1}, data)
      links.push(newLink)
      return newLink
    }
  }
};

LexBot.getResponseMessage = (userMessage, cb) => {

  let lexRuntime = new aws.AWS.LexRuntime()
  // stick this into the api explorer
  let input = { "text": "im bored", "userId": "122" }
  const params = {
    botAlias: "$LATEST", /* required */
    botName: "Hecatea", /* required */
    inputText: userMessage.text, /* required */
    userId: userMessage.userId /* required */
    // sessionAttributes: userMessage.sessionAttributes
  }

  // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/LexRuntime.html#postText-property
  lexRuntime.postText(params, function(err, lexResponse) {
    if (err) {
      console.error("There was an error with lex")
      cb(err)
    } else {
      console.log("returned data", lexResponse)
      if (lexResponse.dialogState !== "ReadyForFulfillment")
        cb(null, lexResponse)
      else
        aws.lambda(lexResponse, cb)
    }
  })
}
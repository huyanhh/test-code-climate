const AWS = require("aws-sdk")
const moment = require("moment")

let configParams = {
  region: "us-east-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
}

AWS.config.update(configParams)

const searchActivities = (lexResponse) => {
  const event = {location: `${lexResponse.slots["City"]}, ${lexResponse.slots["State"]}`, limit: 5}
  return {
    FunctionName: "searchActivities",
    InvocationType: "RequestResponse",
    Payload: JSON.stringify(event)
  }
}

const searchHotelsBooking = (lexResponse) => {
  const checkIn = moment(lexResponse.slots["CheckInDate"], "YYYY-MM-DD")
  // parse dates in tripadvisor format
  const event = {
    city: lexResponse.slots["City"],
    state: lexResponse.slots["State"],
    checkinDate: checkIn.format("YYYY-MM-DD"),
    checkoutDate: moment(checkIn).add(parseInt(lexResponse.slots["Nights"], 10), "days").format("YYYY-MM-DD")
  }
  return {
    FunctionName: "searchHotelsBooking",
    InvocationType: "RequestResponse",
    Payload: JSON.stringify(event)
  }
}

const searchHotelsTripAdvisor = (lexResponse) => {
  const params = searchHotelsBooking(lexResponse)
  params.FunctionName = "searchHotelsTripAdvisor"
  params.Payload = params.Payload.replace(/-/g, "_")
  return params
}

const searchRestaurants = (lexResponse) => {
  const event = {
    currentIntent: {
      slots: {
        price: lexResponse.slots["PriceRange"],
        city: lexResponse.slots["City"],
        cuisine: lexResponse.slots["Cuisine"],
        rating: lexResponse.slots["Rating"]
      },
      name: "Yelp",
      confirmationStatus: "None"
    },
    bot: {
      alias: "$LATEST",
      version: "$LATEST",
      name: "BookTrip"
    },
    userId: "John",
    invocationSource: "DialogCodeHook",
    outputDialogMode: "Text",
    messageVersion: "1.0",
    sessionAttributes: {}
  }
  return {
    FunctionName: "searchRestaurants",
    InvocationType: "RequestResponse",
    Payload: JSON.stringify(event)
  }
}

module.exports = {
  lambda: (lexResponse, cb) => {
    const lambda = new AWS.Lambda()

    let params
    if (lexResponse.intentName === "FindActivity") {
      params = searchActivities(lexResponse)
    } else if (lexResponse.intentName === "FindRestaurant") {
      params = searchRestaurants(lexResponse)
    } else if (lexResponse.intentName === "FindHotel") {
      params = searchHotelsBooking(lexResponse)
    } else {
      console.error("error")
    }

    lambda.invoke(params, function (err, data) {
      if (err) console.log(err, err.stack) // an error occurred
      else     console.log(data)           // successful response
      /*
       data = {
         FunctionError: "",
         LogResult: "",
         Payload: <Binary String>,
         StatusCode: 123
       }
       */
      if (data.StatusCode === 200)
        cb(null, {
          intentName: lexResponse.intentName,
          payload: JSON.parse(data.Payload),
          dialogState: "Fulfilled"
        })
    })
  },
  AWS
}

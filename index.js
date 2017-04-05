/*global require*/
/*global process*/
/*global console*/
/*global setTimeout*/
/*global Buffer*/

require('dotenv').config();
var slack = require('slack');
var bot = slack.rtm.client();
var token = process.env.SLACK_TOKEN;
var http = require('http');

//always use lowercase here, case is thrown away
var activationPhrases =
[
    ":smash:",
    "smash?",
    "round 2?"
];

var responses =
[
    ":smash:",
    "Of course.",
    "Get ready to get :ness:",
    "See you up there in 5!",
    ":ness: :ness: :ness:",
    "Why not? I already played 6 times today.",
    "yeah",
    "ok",
    "sounds good",
    "here comes :ness:"
];
var availableResponseIndices = [];

var resetAvailableIndices = function()
{
    availableResponseIndices = [];
    
    var index;
    for ( index = 0; index < responses.length; index++ )
    {
        availableResponseIndices.push( index );
    }
};

var shouldRespondToMessage = function( messageData )
{
    if ( !messageData || !messageData.text )
    {
        return false;
    }
    
    if ( messageData.type !== "message" )
    {
        return false;
    }
    
    //don't respond to itself
    if ( messageData.user === "U4UBQD43D" )
    {
        return false;
    }
    
    var lower = messageData.text.toLowerCase();
    var activationPhraseIndex;
    for ( activationPhraseIndex = 0; activationPhraseIndex < activationPhrases.length; activationPhraseIndex++ )
    {
        if ( lower.indexOf( activationPhrases[ activationPhraseIndex ] ) >= 0 )
        {
            return true;
        }
    }
    return false;
};

var getResponseMessage = function()
{
    if ( availableResponseIndices.length <= 0 )
    {
        resetAvailableIndices();
    }
    
    var indexIndex = Math.floor( Math.random() * availableResponseIndices.length );
    var response = responses[availableResponseIndices[indexIndex]];
    availableResponseIndices.splice( indexIndex, 1 );
    return response;
};

bot.message( function(messageData)
{
    console.log( "Message received: " + JSON.stringify( messageData ) );
    if ( shouldRespondToMessage( messageData ) )
    {
        slack.chat.postMessage( { token: token, text: getResponseMessage(), channel: messageData.channel, as_user: true }, function( err, data )
        {
            if ( err )
            {
                console.log( "Failed to send response message: " + JSON.stringify( err ) + "\n" + JSON.stringify( data ) );
            }
        }.bind(this));
    }
}.bind(this));

if ( !token )
{
    console.log( "ERROR: You don't have a SLACK_TOKEN in your environment. Either create a .env file or add it to bash_profile. It should be your Slack bot token." );
}
else
{
    bot.listen({ token: token } );
}

var createServer = function()
{
    http.createServer(function(request, response)
    {
        var headers = request.headers;
        var method = request.method;
        var url = request.url;
        var body = [];
        request.on('error', function(err)
        {
            console.error(err);
        }).on('data', function(chunk)
        {
            body.push(chunk);
        }).on('end', function()
        {
            body = Buffer.concat(body).toString();

            response.on('error', function(err)
            {
                console.error(err);
            });

            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');

            var responseBody =
            {
                headers: headers,
                method: method,
                url: url,
                body: body
            };

            response.write(JSON.stringify(responseBody));
            response.end();
        });
    }).listen( process.env.PORT );
    console.log( "Created an HTTP server on port " + process.env.PORT );
};

//start listening via HTTP so the app doesn't shut down on Heroku
createServer();
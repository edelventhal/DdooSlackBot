/*global require*/
/*global process*/
/*global console*/

require('dotenv').config();
var slack = require('slack');
var bot = slack.rtm.client();
var token = process.env.SLACK_TOKEN;

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
    return lower.indexOf( "smash?" ) >= 0 || lower.indexOf( ":smash:" ) >= 0;
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
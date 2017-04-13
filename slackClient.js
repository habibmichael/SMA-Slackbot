'use strict';

const RtmClient = require('@slack/client').RtmClient;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const request = require('superagent');
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
let rtm = null;
let nlp = null;

function handleOnAuthenticated(rtmStartData) {
    console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
}

function getSentiment(keyword,cb){

    request.get('http://localhost:8090/service/sma')
            .query({keyword:keyword})
            .end((err,res)=>{
                if (err){
                    cb(err);
                }else{
                  cb(null,res.body);
                }
            });

}






function handleOnMessage(message) {

    if(message.text.toLowerCase().includes('sma')){

        let text = message.text;
        let words = text.split(" ");
        let keyword = (words.slice(-1)[0]).replace(/\W/g,'');
        getSentiment(keyword,(err,res)=>{
            console.log(res);
            let posPercent = parseFloat(Math.round(res.positive*10000)/100).toFixed(2);
            let negPercent =parseFloat(Math.round(res.negative*10000)/100).toFixed(2);
            let winner = (posPercent>negPercent)?'positive':'negative';
            rtm.sendMessage(`Sentiment Analysis - Senior Project Slackbot\n-------------------------------------------------\nThe overall sentiment of ${keyword} is ${winner} with a positive score of %${posPercent} and a negative score of %${negPercent}`,message.channel); 
        });
    }
     

    // if (message.text.toLowerCase().includes('iris')) {
    //     nlp.ask(message.text, (err, res) => {
    //         if (err) {
    //             console.log(err);
    //             return;
    //         }

    //         try {
    //             if(!res.intent || !res.intent[0] || !res.intent[0].value) {
    //                 throw new Error("Could not extract intent.")
    //             }

    //             const intent = require('./intents/' + res.intent[0].value + 'Intent');

    //             intent.process(res, function(error, response) {
    //                 if(error) {
    //                     console.log(error.message);
    //                     return;
    //                 }
                    
    //                 return rtm.sendMessage(response, message.channel);
    //             })

    //         } catch(err) {
    //             console.log(err);
    //             console.log(res);
    //             rtm.sendMessage("Sorry, I don't know what you are talking about!", message.channel);
    //         }

    //     });
    // }

}

function addAuthenticatedHandler(rtm, handler) {
    rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, handler);
}


module.exports.init = function slackClient(token, logLevel) {

    rtm = new RtmClient(token, { logLevel: logLevel });
    addAuthenticatedHandler(rtm, handleOnAuthenticated);
    rtm.on(RTM_EVENTS.MESSAGE, handleOnMessage);
    return rtm;
}

module.exports.addAuthenticatedHandler = addAuthenticatedHandler;
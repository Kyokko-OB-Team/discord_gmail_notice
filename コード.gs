function printError(error){
  return "[名前] " + error.name + "\n" +
         "[場所] " + error.fileName + "(" + error.lineNumber + "行目)\n" +
         "[メッセージ]" + error.message + "\n" +      
         "[StackTrace]\n" + error.stack;
}

//Discordへwebhookを投げる
function discord(postMsg){
  const webhooks = PropertiesService.getScriptProperties().getProperty("WEBHOOKS_URL");
  const token = PropertiesService.getScriptProperties().getProperty("SLACK_TOKEN");
  const channel = PropertiesService.getScriptProperties().getProperty("DISCORD_CANNEL");
  const userName = PropertiesService.getScriptProperties().getProperty("DISCORD_NAME_MYDNS");
  const parse = 'full';
  const methods = 'post';

  const payload = {
    'token': token,
    'channel': '#mails',
    'content' : postMsg,
    'parse': parse,
  };

  const params = {
    'method': methods,
    'payload' : payload,
    'muteHttpExceptions': true,
  };
  console.log("Push discord.");
  try {
    response = UrlFetchApp.fetch(webhooks, params);
  } catch(e) {
    console.log(printError(e));
  }
  
}

//メールチェック
function mails(){
  var searchQuery = "from:(@registinformation.server-on.net)";
  var dt = new Date();

  //メールをチェックする頻度を指定します。短すぎるとGmailの制限に引っかかります。
  const checkSpanMinute = 30;
  dt.setMinutes(dt.getMinutes() - checkSpanMinute);

  try {
    var threads = GmailApp.search(searchQuery);
    console.log("Mail threads length:" + threads.length);

    var messages = GmailApp.getMessagesForThreads(threads);

    for(var i = 0; i < messages.length; i++) {
      var lastMsgDt = threads[i].getLastMessageDate();

      if(lastMsgDt.getTime() < dt.getTime()) {
        break;
      }

      var mention_user_id = "<@259917965942718465>";
      for(var j = 0; j < messages[i].length; j++) {
        var msgDate = messages[i][j].getDate();
        var msgBody = messages[i][j].getPlainBody();
        var msgFrom = messages[i][j].getFrom();
        var matches = msgFrom.match(/"(.+)".*<(.+)>/)
        {
          var subject = messages[i][j].getSubject();
        //取得したデータを最終的に受け取りたいフォーマットに整えます。Discordでは[```]を引用符として使えるので前後に着けています。
          var postMsg = mention_user_id + "\n" +
                Utilities.formatDate(msgDate, 'Asia/Tokyo', 'yyyy/MM/dd hh:mm:ss') + "\n" +
                "件名: **" + subject + "**\n" +
                "```" +
                msgBody + 
                "```";

          console.log("Call discord.");
          discord(postMsg);

        }
      }
    }
  } catch(e) {
    console.log(printError(e));
    return;
  }
}

var axios = require('axios');
var data = JSON.stringify({
   "chat_session_id": "e0a0e487-c60f-4664-baf4-15e575173993",
   "parent_message_id": null,
   "prompt": "老嫂子你好",
   "ref_file_ids": []
});

var config = {
   method: 'post',
   url: 'https://chat.deepseek.com/api/v0/chat/completion',
   headers: { 
      'accept': '*/*', 
      'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6', 
      'authorization': 'Bearer b1602e5d9ce94e5cafe84e28c73f02f3', 
      'cache-control': 'no-cache', 
      'origin': 'https://chat.deepseek.com', 
      'pragma': 'no-cache', 
      'priority': 'u=1, i', 
      'referer': 'https://chat.deepseek.com/', 
      'sec-ch-ua': '"Microsoft Edge";v="131", "Chromium";v="131", "Not_A Brand";v="24"', 
      'sec-ch-ua-mobile': '?0', 
      'sec-ch-ua-platform': '"Windows"', 
      'sec-fetch-dest': 'empty', 
      'sec-fetch-mode': 'cors', 
      'sec-fetch-site': 'same-origin', 
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0', 
      'x-app-version': '20241018.0', 
      'content-type': 'application/json', 
      'Host': 'chat.deepseek.com', 
      'Connection': 'keep-alive', 
      'Cookie': 'HWWAFSESTIME=1732097577917; HWWAFSESID=01b2c760445a0807bc'
   },
   data : data
};

axios(config)
.then(function (response) {
   console.log(JSON.stringify(response.data));
})
.catch(function (error) {
   console.log(error);
});
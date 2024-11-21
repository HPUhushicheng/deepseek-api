var axios = require('axios');
const readline = require('readline');

let token = 'sk-7d8977725bd0423cae130a8cc4b346da'; // 替换为你的实际 token

// 创建 readline 接口
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// 发送请求到 DeepSeek API
async function sendChatRequest(prompt) {
    var data = JSON.stringify({
        "model": "deepseek-chat",
        "messages": [
            {
                "role": "system",
                "content": "You are a helpful assistant."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "stream": true
    });

    var config = {
        method: 'post',
        url: 'https://api.deepseek.com/chat/completions',
        headers: { 
            'Authorization': `Bearer ${token}`, 
            'User-Agent': 'Apifox/1.0.0 (https://apifox.com)', 
            'Content-Type': 'application/json', 
            'Accept': '*/*', 
            'Host': 'api.deepseek.com', 
            'Connection': 'keep-alive'
        },
        data: data,
        responseType: 'stream' // 设置响应类型为流
    };

    try {
        const response = await axios(config);
        return response.data; // 返回响应数据
    } catch (error) {
        console.error("请求错误:", error);
    }
}

// 提取并输出内容
function extractContent(stream) {
    const rl = readline.createInterface({
        input: stream,
        crlfDelay: Infinity
    });

    let output = '';

    rl.on('line', (line) => {
        if (line.startsWith('data: ')) {
            const jsonStr = line.replace('data: ', '').trim();
            if (jsonStr === '[DONE]') {
                rl.close();
                return;
            }
            try {
                const parsedData = JSON.parse(jsonStr);
                if (parsedData.choices && parsedData.choices.length > 0) {
                    const delta = parsedData.choices[0].delta;
                    if (delta && delta.content) {
                        output += delta.content; // 收集内容
                        process.stdout.write(delta.content); // 实时输出内容
                    }
                }
            } catch (err) {
                console.error("解析错误:", err);
            }
        }
    });

    rl.on('close', () => {
        console.log('\n助手:', output); // 输出助手的回答
        promptUser(); // 继续提示用户输入
    });
}

// 提示用户输入
function promptUser() {
    rl.question('请输入你的问题（或输入 "exit" 退出）：', async (answer) => {
        if (answer.toLowerCase() === 'exit') {
            rl.close();
            process.exit(0);
        } else {
            const stream = await sendChatRequest(answer); // 发送请求
            extractContent(stream); // 提取内容
        }
    });
}

// 启动程序
promptUser();
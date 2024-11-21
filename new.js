var axios = require('axios');
const readline = require('readline');
const fs = require('fs');
const chalk = require('chalk'); // 引入 chalk 库

let tokenGlobal = null;

// 登录并获取 token
async function loginAndGetToken() {
    var data = JSON.stringify({
        "email": "",
        "mobile": "18790492316",
        "password": "12345678910Hututu",
        "area_code": "+86",
        "device_id": "Bb6EAZ0dp5S/KmKp6WFDg7HmpMwavCKvpU+auiduwBX5aNrVu4OniIb6CTn8CCUl1j4ckw==",
        "os": "web"
    });

    var config = {
        method: 'post',
        url: 'https://chat.deepseek.com/api/v0/users/login',
        headers: { 
            'accept': '*/*', 
            'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6', 
            'cache-control': 'no-cache', 
            'origin': 'https://chat.deepseek.com', 
            'pragma': 'no-cache', 
            'priority': 'u=1, i', 
            'referer': 'https://chat.deepseek.com/sign_in', 
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
        data: data
    };

    try {
        const response = await axios(config);
        console.log(chalk.green("Token:", response.data.data.user.token)); // 使用 chalk 输出 token
        return response.data.data.user.token; // 返回 token
    } catch (error) {
        console.error(chalk.red("登录错误:", error)); // 输出错误信息
    }
}

// 使用 token 进行聊天请求
async function chatWithToken(token, prompt) {
    var data = JSON.stringify({
        "chat_session_id": "e0a0e487-c60f-4664-baf4-15e575173993", 
        "parent_message_id": null,
        "prompt": prompt,
        "ref_file_ids": []
    });

    var config = {
        method: 'post',
        url: 'https://chat.deepseek.com/api/v0/chat/completion',
        headers: { 
            'accept': '*/*', 
            'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6', 
            'authorization': `Bearer ${token}`, // 使用获取的 token
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
        },
        data: data,
        responseType: 'stream' // 设置响应类型为流
    };

    try {
        const response = await axios(config);
        return response.data; // 返回响应流
    } catch (error) {
        console.error(chalk.red("聊天错误:", error)); // 输出错误信息
    }
}


// 提取 content 值并实时输出
function extractContent(stream) {
    const rl = readline.createInterface({
        input: stream,
        crlfDelay: Infinity
    });

    rl.on('line', (line) => {
        if (line.startsWith('data: ')) {
            const jsonStr = line.replace('data: ', '').trim();
            if (jsonStr === '[DONE]') {
                rl.close();
                return;
            }
            try {
                const data = JSON.parse(jsonStr);
                if (data.choices && data.choices.length > 0) {
                    const delta = data.choices[0].delta;
                    if (delta && delta.content) {
                        // 处理转义字符
                        const decodedContent = delta.content.replace(/\\n/g, '\n').replace(/\\"/g, '"');
                        process.stdout.write(chalk.blue(decodedContent)); // 使用 chalk 输出内容
                    }
                }
            } catch (err) {
                console.error(chalk.yellow("解析错误:", err)); // 输出解析错误
            }
        }
    });

    rl.on('close', () => {
        console.log('\n聊天结束。');
        promptUser(); // 继续等待用户输入
    });
}

// 提示用户输入
async function promptUser() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('请输入你的问题（或输入 "exit" 退出）：', async (answer) => {
        if (answer.toLowerCase() === 'exit') {
            rl.close();
            process.exit(0);
        } else {
            if (!tokenGlobal) {
                await initializeToken();
            }
            const stream = await chatWithToken(tokenGlobal, answer); // 使用全局 token 进行聊天
            extractContent(stream); // 实时提取并输出 content 值
            rl.close();
        }
    });
}

// 主函数
async function main() {
    await initializeToken(); // 初始化 token
    promptUser(); // 启动用户输入提示
}

async function initializeToken() {
    tokenGlobal = await loginAndGetToken();
    if (!tokenGlobal) {
        console.error(chalk.red("无法获取 token，程序即将退出。"));
        process.exit(1);
    }
}

main();
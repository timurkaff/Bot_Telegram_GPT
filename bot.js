const { Telegraf } = require('telegraf');
const { gpt } = require("gpti");

const bot = new Telegraf('ВАШ ТОКЕН');
const chatMessages = new Map();

bot.telegram.setMyCommands([
    { command: '/clear', description: 'Очистить чат' }
]);

bot.start((ctx) => ctx.reply("Привет! Я GPT-4, одна из самых передовых искусственных интеллектуальных моделей, созданных в 2021 году. Я обучена на огромном объеме данных и знаю миллиарды параметров, позволяющих мне генерировать тексты, отвечать на вопросы и помогать людям во всем, что они могут понадобиться. Моя цель - помогать вам в решении задач и предоставлять информацию, доступную в Интернете. Чат сохраняется и модель помнит твои запросы. Для очистки чата напиши команду /clear"));

bot.command('clear', (ctx) => {
    const userId = ctx.from.id;
    chatMessages.delete(userId);
    ctx.reply('Чат был удален, модель не сохраняет предыдущие сообщения.');
});

bot.on('text', async (ctx) => {
    const userId = ctx.from.id;
    const userText = ctx.message.text;

    if (!chatMessages.has(userId)) {
        chatMessages.set(userId, []);
    }

    const messagesForUser = chatMessages.get(userId);
    messagesForUser.push({ role: "user", content: userText });
    await ctx.sendChatAction('typing');

    gpt.v1({
        messages: messagesForUser,
        prompt: userText,
        markdown: false,
        model: "GPT-4"
    }, (err, data) => {
        if (err != null) {
            console.log(err);
            ctx.reply("Произошла ошибка при обработке запроса.");
        } else {
            ctx.reply(data.gpt)
                .then(() => {
                    messagesForUser.push({ role: "assistant", content: data.gpt });
                })
                .catch((error) => {
                    console.error("Ошибка при отправке ответа:", error);
                });
        }
    });
});

bot.launch();

const { Telegraf } = require('telegraf');
const { gpt } = require("gpti");

const bot = new Telegraf('?');
const chatMessages = new Map(); // Используем Map для хранения сообщений каждого пользователя

bot.start((ctx) => ctx.reply("Привет! Я GPT-4, одна из самых передовых искусственных интеллектуальных моделей, созданных в 2021 году. Я обучена на огромном объеме данных и знаю миллиарды параметров, позволяющих мне генерировать тексты, отвечать на вопросы и помогать людям во всем, что они могут понадобиться. Моя цель - помогать вам в решении задач и предоставлять информацию, доступную в Интернете. Чат сохраняеться и модель помнит твои запросы для очистки чаты напиши команду /clear"));

bot.command('clear', (ctx) => {
    const userId = ctx.from.id;
    chatMessages.delete(userId); // Удаляем сообщения для конкретного пользователя
    ctx.reply('Чат был удален, модель не сохраняет предыдущие сообщения.');
});

bot.on('text', async (ctx) => {
    const userId = ctx.from.id;
    const userText = ctx.message.text;

    // Создаем массив сообщений для этого пользователя, если его еще нет
    if (!chatMessages.has(userId)) {
        chatMessages.set(userId, []);
    }

    const messagesForUser = chatMessages.get(userId);
    messagesForUser.push({ role: "user", content: userText });

    // Отправляем сообщение "Печатаю..."
    const typingMessage = await ctx.reply("Печатаю...");

    gpt({
        messages: messagesForUser,
        prompt: userText,
        markdown: false,
        model: "GPT-4"
    }, (err, data) => {
        if (err != null) {
            console.log(err);
            ctx.reply("Произошла ошибка при обработке запроса.");
        } else {
            // Отправляем ответ от модели
            ctx.reply(data.gpt)
                .then(() => {
                    ctx.deleteMessage(typingMessage.message_id);
                    messagesForUser.push({ role: "", content: userText });

                })
                .catch((error) => {
                    console.error("Ошибка при удалении сообщения:", error);
                });
        }
    });
});

bot.launch();

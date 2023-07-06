require('dotenv').config();
import { Events, Message } from 'discord.js';

const PREFIX: string = process.env.PREFIX;

module.exports = {
    name: Events.MessageCreate,
    execute: async (message: Message) => {
        if (!message.content.startsWith(PREFIX) || message.author.bot) return;

        const args = message.content
            .slice(PREFIX.length)
            .trim()
            .match(/(?:[^\s"]+|"[^"]*")+/g)
            .map((arg) => arg.replace(/"(.*)"/, '$1'));
        const command = args.shift();

        if (!message.client.commands.has(command)) {
            return message.reply(`Unknown Command\nTry ${PREFIX}help`);
        }

        try {
            message.client.commands.get(command).execute(message);
        } catch (error) {
            console.error(error);
            message.reply('There was an error trying to execute this command!');
        }

        console.log(message.content);
    },
};

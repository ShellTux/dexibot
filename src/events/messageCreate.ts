import { Events } from 'discord.js';

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
	    console.log(message.content);
    },
};

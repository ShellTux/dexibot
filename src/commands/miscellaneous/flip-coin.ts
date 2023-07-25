import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../definitions';
import { capitalizeWords } from '../../functions';

const flipCoin: Command = {
	data: new SlashCommandBuilder()
		.setName('flip-coin')
		.setDescription('Flip a coin'),
	execute: async (message: Message | ChatInputCommandInteraction) => {
		const coinFlipGif = './assets/flip-coin/coinflip.gif';
		const coinResults = [{
			name: 'Heads',
			path: './assets/flip-coin/heads.jpg',
		}, {
			name: 'Tails',
			path: './assets/flip-coin/tails.jpg',
		}];

		const response = await message.channel.send({
			files: [coinFlipGif],
		});

		const index = Math.floor(Math.random() * coinResults.length);
		const result = coinResults[index];

		setTimeout(async () => {
			await response.delete();
			message.reply({
				content: capitalizeWords(result.name),
				files: [result.path],
			});
		}, 5 * 1e3);
		return message;
	},
};

export = flipCoin;
module.exports = flipCoin;

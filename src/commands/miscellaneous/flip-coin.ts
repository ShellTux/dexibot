import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../definitions';
import { capitalizeWords } from '../../functions';

const flipCoin: Command = {
	data: new SlashCommandBuilder()
		.setName('flip-coin')
		.setDescription('Flip a coin'),
	execute: async (message: Message | ChatInputCommandInteraction) => {
		const coinFlipGif = './assets/flip-coin/coinflip.gif';
		const coinResults = {
			heads: './assets/flip-coin/heads.jpg',
			tails: './assets/flip-coin/tails.jpg',
		};

		const response = await message.channel.send({
			files: [coinFlipGif],
		});

		const keys = Object.keys(coinResults);
		const index = Math.floor(Math.random() * keys.length);
		const result = keys[index];
		const coinPath: string = coinResults[result];

		setTimeout(async () => {
			await response.delete();
			message.reply({
				content: capitalizeWords(result),
				files: [coinPath],
			});
		}, 5 * 1e3);
		return message;
	},
};

export = flipCoin;
module.exports = flipCoin;

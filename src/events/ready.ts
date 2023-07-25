import { Client, Events } from 'discord.js';
import { Debug, debugMessage } from '../functions';
import chalk from 'chalk';

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute: (client: Client) => {
		debugMessage(
			Debug.OK,
			'Ready! Logged in as ' + chalk.underline(client.user.tag)
		);
	},
};

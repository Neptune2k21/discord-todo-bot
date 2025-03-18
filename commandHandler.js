const fs = require('fs');
const path = require('path');
const { PREFIX } = require('./config');

module.exports = (client) => {
    client.commands = new Map();
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        client.commands.set(command.name, command);
    }

    client.on('messageCreate', async message => {
        if (!message.content.startsWith(PREFIX) || message.author.bot) return;

        const args = message.content.slice(PREFIX.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = client.commands.get(commandName);
        if (!command) return;

        try {
            command.execute(message, args);
        } catch (error) {
            console.error(error);
            message.reply('Une erreur est survenue lors de l\'exécution de cette commande.');
        }
    });
};
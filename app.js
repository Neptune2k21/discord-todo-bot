const { Client, GatewayIntentBits } = require('discord.js');
const { TOKEN } = require('./config');
const commandHandler = require('./commandHandler');

// Initialisation du client Discord avec seulement les intents nécessaires
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ] 
});

// Chargement des commandes
commandHandler(client);

// Événement de démarrage
client.once('ready', () => {
    console.log(`Bot connecté en tant que ${client.user.tag}!`);
});

// Connexion du bot à Discord
client.login(TOKEN);
const dataManager = require('../dataManager');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'list',
    description: 'Afficher la liste des tâches',
    execute(message, args) {
        try {
            const tasks = dataManager.getUserTasks(
                message.author.id,
                message.guild.id
            ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            
            if (tasks.length === 0) {
                return message.reply('Vous n\'avez pas de tâches à faire.');
            }

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('📋 Votre Liste de Tâches')
                .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
                .setTimestamp();
            
            tasks.forEach((task, index) => {
                let status = '⬜ À faire';
                if (task.status === 'in_progress') status = '🔄 En cours';
                else if (task.status === 'completed') status = '✅ Terminée';
                
                let assignedInfo = '';
                if (task.assignedTo) {
                    const assignedUser = message.guild.members.cache.get(task.assignedTo);
                    assignedInfo = assignedUser ? `\nAssignée à: ${assignedUser.user.username}` : '';
                }
                
                const createdDate = new Date(task.createdAt).toLocaleDateString('fr-FR');
                embed.addFields({ 
                    name: `${index + 1}. ${task.description}`, 
                    value: `Statut: ${status}${assignedInfo}\nCréée le ${createdDate}` 
                });
            });

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            return message.reply('Une erreur est survenue lors de la récupération de vos tâches.');
        }
    }
};
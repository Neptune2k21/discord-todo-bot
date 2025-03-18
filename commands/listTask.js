const dataManager = require('../dataManager');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'list',
    description: 'Afficher la liste des tâches du serveur',
    execute(message, args) {
        try {
            const tasks = dataManager.getServerTasks(message.guild.id)
                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            
            if (tasks.length === 0) {
                return message.reply('Il n\'y a pas de tâches à faire sur ce serveur.');
            }

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('📋 Liste des Tâches du Serveur')
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
                const createdBy = message.guild.members.cache.get(task.userId);
                const creatorInfo = createdBy ? `\nCréée par: ${createdBy.user.username}` : '';
                
                embed.addFields({ 
                    name: `${index + 1}. ${task.description}`, 
                    value: `Statut: ${status}${assignedInfo}${creatorInfo}\nCréée le ${createdDate}` 
                });
            });

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            return message.reply('Une erreur est survenue lors de la récupération des tâches.');
        }
    }
};
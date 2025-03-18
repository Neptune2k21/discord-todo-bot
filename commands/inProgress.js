const dataManager = require('../dataManager');

module.exports = {
    name: 'progress',
    description: 'Marquer une tâche comme en cours',
    execute(message, args) {
        if (!args.length) return message.reply('Veuillez spécifier le numéro de la tâche à marquer comme en cours.');

        const taskIndex = parseInt(args[0]) - 1;

        try {
            const tasks = dataManager.getUserTasks(
                message.author.id,
                message.guild.id
            ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

            if (taskIndex < 0 || taskIndex >= tasks.length) {
                return message.reply('Numéro de tâche invalide.');
            }

            const task = tasks[taskIndex];
            dataManager.setTaskInProgress(task.id, message.author.id, message.guild.id);

            return message.reply(`🔄 Tâche marquée comme en cours: ${task.description}`);
        } catch (error) {
            console.error(error);
            return message.reply('Une erreur est survenue lors de la mise à jour de votre tâche.');
        }
    }
};
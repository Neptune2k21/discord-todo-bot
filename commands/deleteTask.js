const dataManager = require('../dataManager');

module.exports = {
    name: 'delete',
    description: 'Supprimer une tâche',
    execute(message, args) {
        if (!args.length) return message.reply('Veuillez spécifier le numéro de la tâche à supprimer.');

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
            dataManager.deleteTask(task.id, message.author.id, message.guild.id);

            return message.reply(`🗑️ Tâche supprimée: ${task.description}`);
        } catch (error) {
            console.error(error);
            return message.reply('Une erreur est survenue lors de la suppression de votre tâche.');
        }
    }
};
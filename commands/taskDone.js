const dataManager = require('../dataManager');

module.exports = {
    name: 'done',
    description: 'Marquer une tâche comme terminée',
    execute(message, args) {
        if (!args.length) return message.reply('Veuillez spécifier le numéro de la tâche terminée.');

        const taskIndex = parseInt(args[0]) - 1;

        try {
            const tasks = dataManager.getServerTasks(message.guild.id)
                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

            if (taskIndex < 0 || taskIndex >= tasks.length) {
                return message.reply('Numéro de tâche invalide.');
            }

            const task = tasks[taskIndex];
            dataManager.completeTask(task.id, task.userId, message.guild.id);

            return message.reply(`✅ Tâche marquée comme terminée: ${task.description}`);
        } catch (error) {
            console.error(error);
            return message.reply('Une erreur est survenue lors de la mise à jour de la tâche.');
        }
    }
};
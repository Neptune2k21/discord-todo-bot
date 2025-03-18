const dataManager = require('../dataManager');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'add',
    description: 'Ajouter une tâche complète avec assignation et détails',
    execute(message, args) {
        if (args.length === 0) {
            return message.reply(
                '**📋 Usage de la commande add:**\n' +
                '```!todo add [description] --assigné @utilisateur --priorité [haute/moyenne/basse] --échéance JJ/MM/AAAA --notes [notes additionnelles]```\n' +
                '**Exemple:** !todo add Créer la maquette du site --assigné @Alice --priorité haute --échéance 25/03/2025 --notes Utiliser Figma\n\n' +
                '**Note:** Tous les paramètres sont optionnels sauf la description.'
            );
        }

        try {
            // Parser les arguments pour extraire les options
            const parsedArgs = parseArguments(args.join(' '));
            const description = parsedArgs.description;
            
            if (!description) {
                return message.reply('Veuillez fournir une description pour la tâche.');
            }

            // Créer la tâche de base
            const newTask = {
                userId: message.author.id,
                serverId: message.guild.id,
                description: description,
                completed: false,
                createdAt: new Date().toISOString(),
                status: 'pending',
                assignedTo: null,
                priority: parsedArgs.priority || 'moyenne', 
                dueDate: parsedArgs.dueDate || null,
                notes: parsedArgs.notes || ''
            };

            // Trouver l'utilisateur assigné si mentionné
            if (parsedArgs.assignedUserMention) {
                const userMatches = parsedArgs.assignedUserMention.match(/<@!?(\d+)>/);
                if (userMatches && userMatches[1]) {
                    newTask.assignedTo = userMatches[1];
                }
            }

            // Ajouter la tâche à la base de données
            const task = dataManager.addTaskComplete(newTask);
            
            // Créer un embed élégant pour afficher les détails de la tâche créée
            const embed = new EmbedBuilder()
                .setColor(getPriorityColor(newTask.priority))
                .setTitle('✅ Nouvelle tâche créée')
                .setDescription(`**${description}**`)
                .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
                .setTimestamp();

            // Ajouter les champs pour les détails
            const fields = [];
            
            fields.push({ 
                name: '🆔 ID', 
                value: `#${task.id || '?'}`, 
                inline: true 
            });
            
            fields.push({ 
                name: '🔍 Statut', 
                value: '⬜ À faire', 
                inline: true 
            });
            
            fields.push({ 
                name: '🚩 Priorité', 
                value: getPriorityEmoji(newTask.priority) + ' ' + capitalizeFirstLetter(newTask.priority), 
                inline: true 
            });

            if (newTask.assignedTo) {
                const assignedUser = message.guild.members.cache.get(newTask.assignedTo);
                fields.push({ 
                    name: '👤 Assignée à', 
                    value: assignedUser ? assignedUser.toString() : 'Utilisateur inconnu', 
                    inline: true 
                });
            }

            if (newTask.dueDate) {
                fields.push({ 
                    name: '📅 Échéance', 
                    value: formatDate(newTask.dueDate), 
                    inline: true 
                });
            }
            
            fields.push({ 
                name: '📝 Créée le', 
                value: formatDate(newTask.createdAt), 
                inline: true 
            });

            if (newTask.notes) {
                fields.push({ 
                    name: '📌 Notes', 
                    value: newTask.notes, 
                    inline: false 
                });
            }

            embed.addFields(fields);
            
            return message.channel.send({ embeds: [embed] });
            
        } catch (error) {
            console.error(error);
            return message.reply('Une erreur est survenue lors de la création de votre tâche.');
        }
    }
};

// Fonction pour analyser les arguments complexes avec des options
function parseArguments(argsString) {
    const result = {
        description: '',
        assignedUserMention: null,
        priority: null,
        dueDate: null,
        notes: null
    };

    // Extraction des paramètres nommés avec regex
    const assigneeMatch = argsString.match(/--assigné\s+(<@!?\d+>)/i);
    if (assigneeMatch) {
        result.assignedUserMention = assigneeMatch[1];
        argsString = argsString.replace(assigneeMatch[0], '');
    }

    const priorityMatch = argsString.match(/--priorité\s+(haute|moyenne|basse)/i);
    if (priorityMatch) {
        result.priority = priorityMatch[1].toLowerCase();
        argsString = argsString.replace(priorityMatch[0], '');
    }

    const dueDateMatch = argsString.match(/--échéance\s+(\d{1,2}\/\d{1,2}\/\d{4})/i);
    if (dueDateMatch) {
        const dateParts = dueDateMatch[1].split('/');
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1; // Les mois commencent à 0 en JavaScript
        const year = parseInt(dateParts[2], 10);
        
        const date = new Date(year, month, day);
        if (!isNaN(date.getTime())) {
            result.dueDate = date.toISOString();
        }
        
        argsString = argsString.replace(dueDateMatch[0], '');
    }

    const notesMatch = argsString.match(/--notes\s+([^-]+)(?=--|$)/i);
    if (notesMatch) {
        result.notes = notesMatch[1].trim();
        argsString = argsString.replace(notesMatch[0], '');
    }

    // Tout ce qui reste est considéré comme la description
    result.description = argsString.trim();

    return result;
}

// Fonction pour obtenir la couleur en fonction de la priorité
function getPriorityColor(priority) {
    switch (priority.toLowerCase()) {
        case 'haute':
            return '#ff4242'; // Rouge
        case 'moyenne':
            return '#ffaa00'; // Orange
        case 'basse':
            return '#4287f5'; // Bleu
        default:
            return '#696969'; // Gris par défaut
    }
}

// Fonction pour obtenir l'emoji en fonction de la priorité
function getPriorityEmoji(priority) {
    switch (priority.toLowerCase()) {
        case 'haute':
            return '🔴';
        case 'moyenne':
            return '🟠';
        case 'basse':
            return '🔵';
        default:
            return '⚪';
    }
}

// Fonction pour formater une date ISO en format lisible
function formatDate(isoDate) {
    if (!isoDate) return 'Non spécifiée';
    
    const date = new Date(isoDate);
    return date.toLocaleDateString('fr-FR', { 
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Fonction pour mettre en majuscule la première lettre
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
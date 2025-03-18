const fs = require('fs-extra');
const path = require('path');

// Assurons-nous que le répertoire de données existe
const DATA_DIR = path.join(__dirname, 'data');
fs.ensureDirSync(DATA_DIR);

class DataManager {
    constructor() {
        this.tasksFile = path.join(DATA_DIR, 'tasks.json');
        this.tasks = [];
        this.loadTasks();
    }

    loadTasks() {
        try {
            if (fs.existsSync(this.tasksFile)) {
                this.tasks = fs.readJSONSync(this.tasksFile);
            } else {
                this.tasks = [];
                this.saveTasks();
            }
        } catch (error) {
            console.error('Erreur lors du chargement des tâches:', error);
            this.tasks = [];
        }
    }

    saveTasks() {
        try {
            fs.writeJSONSync(this.tasksFile, this.tasks);
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des tâches:', error);
        }
    }

    addTask(userId, serverId, description) {
        const newTask = {
            id: Date.now().toString(), // ID unique basé sur le timestamp
            userId,
            serverId,
            description,
            completed: false,
            createdAt: new Date().toISOString(),
            dueDate: null,
            assignedTo: null,
            status: 'pending' // 'pending', 'in_progress', 'completed'
        };
        
        this.tasks.push(newTask);
        this.saveTasks();
        return newTask;
    }

    getUserTasks(userId, serverId) {
        return this.tasks.filter(task => task.userId === userId && task.serverId === serverId);
    }
    
    getServerTasks(serverId) {
        return this.tasks.filter(task => task.serverId === serverId);
    }

    completeTask(taskId, userId, serverId) {
        const taskIndex = this.tasks.findIndex(t => 
            t.id === taskId && t.userId === userId && t.serverId === serverId);
            
        if (taskIndex === -1) return null;
        
        this.tasks[taskIndex].completed = true;
        this.tasks[taskIndex].status = 'completed';
        this.saveTasks();
        return this.tasks[taskIndex];
    }

    deleteTask(taskId, userId, serverId) {
        const taskIndex = this.tasks.findIndex(t => 
            t.id === taskId && t.userId === userId && t.serverId === serverId);
            
        if (taskIndex === -1) return null;
        
        const deletedTask = this.tasks[taskIndex];
        this.tasks.splice(taskIndex, 1);
        this.saveTasks();
        return deletedTask;
    }

    assignTask(taskId, userId, serverId, assignedToId) {
        const taskIndex = this.tasks.findIndex(t => 
            t.id === taskId && t.userId === userId && t.serverId === serverId);
            
        if (taskIndex === -1) return null;
        
        this.tasks[taskIndex].assignedTo = assignedToId;
        this.saveTasks();
        return this.tasks[taskIndex];
    }

    setTaskInProgress(taskId, userId, serverId) {
        const taskIndex = this.tasks.findIndex(t => 
            t.id === taskId && t.userId === userId && t.serverId === serverId);
            
        if (taskIndex === -1) return null;
        
        this.tasks[taskIndex].status = 'in_progress';
        this.saveTasks();
        return this.tasks[taskIndex];
    }

addTaskComplete(taskData) {
    const newTask = {
        id: Date.now().toString(), // ID unique basé sur le timestamp
        userId: taskData.userId,
        serverId: taskData.serverId,
        description: taskData.description,
        completed: false,
        createdAt: taskData.createdAt || new Date().toISOString(),
        dueDate: taskData.dueDate || null,
        assignedTo: taskData.assignedTo || null,
        status: taskData.status || 'pending',
        priority: taskData.priority || 'moyenne',
        notes: taskData.notes || ''
    };
    
    this.tasks.push(newTask);
    this.saveTasks();
    return newTask;
}
}

module.exports = new DataManager();
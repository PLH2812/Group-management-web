const API_URL = 'http://localhost:3000/api'
async function loginRequest(account) {
    return await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            "Content-Type": "application/json",
            "Accept": 'application/json',
            
        },
        body: JSON.stringify(account)
    })
}
async function logoutRequest() {
    return await fetch(`${API_URL}/users/me/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            "Content-Type": "application/json",
            "Accept": 'application/json',
            
        },
    })
}
async function registerRequest(account) {
    return await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            "Content-Type": "application/json",
            "Accept": 'application/json',
            
        },
        body: JSON.stringify(account)
    })
}

async function getUserByEmail(email) {
    return await fetch(`${API_URL}/users/getUser/${email}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            "Content-Type": "application/json",
            "Accept": 'application/json',
            
        }
    }).then(res => res.json())
}

async function addUserToGroup(userId, groupId, type) {
    return await fetch(`${API_URL}/users/me/addUser/${userId}/${type}/${groupId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
            "Content-Type": "application/json",
            "Accept": 'application/json',
            
        }
    }).then(res => res.json())
}

async function addUserToTable(userId, tableId, groupId, type) {
    return await fetch(`${API_URL}/users/me/addUser/${userId}/${type}/${tableId}/${groupId}`, {
        method: 'PATCH',
        credentials: 'include',
        
        headers: {
            "Content-Type": "application/json",
            "Accept": 'application/json',
            
        }
    }).then(res => res.json())
}

async function createGroup(group) {
    return await fetch(`${API_URL}/users/me/createGroup`, {
        method: 'POST',
        credentials: 'include',
        
        headers: {
            "Content-Type": "application/json",
            "Accept": 'application/json',
            
        },
        body: JSON.stringify(group)
    })
}

async function createTableInGroup(table, id) {
    return await fetch(`${API_URL}/users/me/createTable/inGroup/${id}`, {
        method: 'POST',
        credentials: 'include',
        
        headers: {
            "Content-Type": "application/json",
            "Accept": 'application/json',
            
        },
        body: JSON.stringify(table)
    })
}
async function getTableInGroup() {
    return await fetch(`${API_URL}/users/me/getTables/inGroup`, {
        method: 'GET',
        credentials: 'include',
        
        headers: {
            "Content-Type": "application/json",
            "Accept": 'application/json',
        },
    }).then(res => res.json())
}

async function getTableInGroupById(id) {
    return await fetch(`${API_URL}/users/me/getTables/inGroup/${id}`, {
        method: 'GET',
        credentials: 'include',
        
        headers: {
            "Content-Type": "application/json",
            "Accept": 'application/json',
            
        },
    }).then(res => res.json()).then(data => data)
}

async function getTableById(id) {
    return await fetch(`${API_URL}/users/me/getTables/inGroup/${id}`, {
        method: 'GET',
        credentials: 'include',
        
        headers: {
            "Content-Type": "application/json",
            "Accept": 'application/json',
            
        },
    }).then(res => res.json())
}

async function getGroup() {
    return await fetch(`${API_URL}/users/me/groups`, {
        method: 'GET',
        credentials: 'include',
        
        headers: {
            
        },
    })
        .then(res => res.json())
}

async function getProfileUser() {
    return await fetch(`${API_URL}/users/me`, {
        method: 'GET',
        credentials: 'include',
        
        headers: {
            
        },
    })
        .then(res => res.json())
}

async function createTask(task, id) {
    return await fetch(`${API_URL}/users/me/createTask/fromTable/${id}`, {
        method: 'POST',
        credentials: 'include',
        
        headers: {
            "Content-Type": "application/json",
            "Accept": 'application/json',
            
        },
        body: JSON.stringify(task)
    })
}

async function getTask() {
    return await fetch(`${API_URL}/users/me/getTasks/fromTable`, {
        method: 'GET',
        credentials: 'include',
        
        headers: {
            "Content-Type": "application/json",
            "Accept": 'application/json',
            
        },

    }).then(res => res.json())
}

async function getMyTask() {
    return await fetch(`${API_URL}/users/me/getMyTasks`, {
        method: 'GET',
        credentials: 'include',
        
        headers: {

            "Content-Type": "application/json",
            "Accept": 'application/json',
            
        },

    }).then(res => res.json())
}
async function getTaskByIdTable(id) {
    return await fetch(`${API_URL}/users/me/getTasks/fromTable/${id}`, {
        method: 'GET',
        credentials: 'include',
        
        headers: {
            "Content-Type": "application/json",
            "Accept": 'application/json',
            
        },

    }).then(res => res.json())
}

async function pickTaskRequest(taskId, tableId) {
    return await fetch(`${API_URL}/users/me/pickTask/${taskId}/fromTable/${tableId}`, {
        method: 'PATCH',
        credentials: 'include',
        
        headers: {
            "Content-Type": "application/json",
            "Accept": 'application/json',
            
        },

    }).then(res => res.json())
}

async function submitTaskRequest(taskId) {
    return await fetch(`${API_URL}/users/me/submitTask/${taskId}`, {
        method: 'PATCH',
        credentials: 'include',
        
        headers: {
            "Content-Type": "application/json",
            "Accept": 'application/json',
            
        },

    }).then(res => res.json())
}

async function removeUser(userId,groupId) {
    return await fetch(`${API_URL}/users/me/removeUser/${userId}/fromGroup/${groupId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
            "Content-Type": "application/json",
            "Accept": 'application/json',
            
        },

    }).then(res => res.json())
}



export {
    loginRequest,
    logoutRequest,
    registerRequest,
    getUserByEmail,
    addUserToGroup,
    addUserToTable,
    createGroup,
    createTableInGroup,
    getTableInGroup,
    getTableById,
    getGroup,
    getProfileUser,
    createTask,
    getTask,
    getMyTask,
    getTaskByIdTable,
    pickTaskRequest,
    submitTaskRequest,
    getTableInGroupById,
    removeUser
};
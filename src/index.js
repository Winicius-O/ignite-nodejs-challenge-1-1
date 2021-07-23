const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;

  const user = users.find((user) => user.username == username);
  if(!user){
    return response.status(404).json({error: "Username not found!"});
  }

  request.user = user;

  return next();
}

function getTodo(response, id, todos){
  const todo = todos.find((todo) => todo.id === id);

  if(!todo){
    return response.status(404).json({error: "todo not found!"});
  }

  return todo;
}

/* 
{ 
	id: 'uuid', // precisa ser um uuid
	name: 'Danilo Vieira', 
	username: 'danilo', 
	todos: []
}
*/
app.post('/users', (request, response) => {
  const {name, username} = request.body;

  const userSearch = users.find((user) => user.username == username);
  if(userSearch){
    return response.status(400).json({error: "Username already in use!"});
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };
  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;

  return response.json(user.todos);
});

/* 
{ 
	id: 'uuid', // precisa ser um uuid
	title: 'Nome da tarefa',
	done: false, 
	deadline: '2021-02-27T00:00:00.000Z', 
	created_at: '2021-02-22T00:00:00.000Z'
}
*/
app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {title, deadline} = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };
  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params; // id da task
  const {title, deadline} = request.body;

  const todoToUpdate = getTodo(response, id, user.todos);

  todoToUpdate.title = title;
  todoToUpdate.deadline = new Date(deadline);

  return response.status(201).json(todoToUpdate);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;

  const todoToUpdate = getTodo(response, id, user.todos);

  todoToUpdate.done = true;

  return response.json(todoToUpdate);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;

  const todoToUpdate = getTodo(response, id, user.todos);

  if(todoToUpdate){
    user.todos.splice(user.todos.indexOf(todoToUpdate), 1);
  }

  return response.status(204).json();
});

module.exports = app;
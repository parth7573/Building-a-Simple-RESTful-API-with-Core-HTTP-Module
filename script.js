const http = require('http');
const fs = require('fs');
const url = require('url');
const { parse } = require('querystring');

const dataFilePath = './users.json';


const readUserData = () => {
  try {
    const data = fs.readFileSync(dataFilePath);
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

const writeUserData = (data) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
};


const server = http.createServer((req, res) => {
  const method = req.method;
  const parsedUrl = url.parse(req.url, true);
  const userId = parsedUrl.pathname.split('/')[2]; 
  
  
  res.setHeader('Content-Type', 'application/json');
  
  if (method === 'GET' && parsedUrl.pathname === '/users') {
    
    const users = readUserData();
    res.writeHead(200);
    res.end(JSON.stringify(users));

  } else if (method === 'POST' && parsedUrl.pathname === '/users') {

    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        const newUser = JSON.parse(body);
        const users = readUserData();
        users.push(newUser);
        writeUserData(users);
        res.writeHead(201);
        res.end(JSON.stringify({ message: 'User created successfully', user: newUser }));
      } catch (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ message: 'Invalid user data' }));
      }
    });

  } else if (method === 'DELETE' && parsedUrl.pathname.startsWith('/users/')) {
   
    if (!userId) {
      res.writeHead(400);
      res.end(JSON.stringify({ message: 'User ID is required' }));
      return;
    }

    const users = readUserData();
    const userIndex = users.findIndex(user => user.id === userId);

    if (userIndex !== -1) {
      users.splice(userIndex, 1); 
      writeUserData(users);
      res.writeHead(200);
      res.end(JSON.stringify({ message: 'User deleted successfully' }));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ message: 'User not found' }));
    }

  } else {
    
    res.writeHead(404);
    res.end(JSON.stringify({ message: 'Route not found' }));
  }
});


server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

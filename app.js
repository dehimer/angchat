var util = require('util');
var _ = require('underscore');


var http = require('http');
var url = require("url");
var io = require('socket.io');
var static = require('node-static');
var file = new static.Server('./public');


var http = require('http');
var querystring = require('querystring');


var server = http.createServer(function(request, response) {

    request.addListener('end', function() {

        if (request.url == '/') {
            file.serveFile('/index.html', 200, {}, request, response);
        }
        //вернуть клиенту его адрес для создания им сокетного соединения
        else if (request.url === '/getip') { // getip - вернуть IP-адрес и порт
            response.writeHead(200, {
                'Content-Type': 'text/html'
            });
            response.end(request.headers.host);
            return;
        }
        //подтверждаем подписку 
        else if (url.parse(request.url).pathname === '/callback') {
            if (request.method === 'GET') {
                Instagram.subscriptions.handshake(request, response);
            }
        }
        //просто отдаем файл
        else {
            file.serve(request, response, function(e, res) {
                if (e && (e.status === 404)) {
                    file.serveFile('/not-found.html', 404, {}, request, response);
                }
            });
        }
    }).resume();


}).on('error', function(error) {
    console.log(error);
}).listen(3000);

var sockets = io.listen(server);

var users = {};


// var messages =  

sockets.on('connection', function(socket) {

    socket.on('user:login', function(user) {

        if (!users[user]) {
            users[user] = {}
        }

        //запоминаем сокет пользователя
        users[user].socket = socket;

        //передаем список активных пользователей всем
        console.log(_.keys(users))
        sockets.emit('users:logged', _.keys(users));

        if (users[user].messagestosend && users[user].messagestosend.length > 0) {

            users[user].socket.emit('chat:messages', users[user].messagestosend);
            users[user].messagestosend = [];
        }

    });

    socket.on('send:message', function(message) {
        console.log(message)
        //если получатель в сети - передать сообщение
        if (users[message.to]) {
            users[message.to].socket.emit('chat:messages', message)
        } else {

            if (!users[message.to]) {
                users[message.to] = {}
            }

            if (!users[message.to].messagestosend) {
                users[message.to].messagestosend = [];
            }

            users[message.to].messagestosend.push(message);
        }
    });
});
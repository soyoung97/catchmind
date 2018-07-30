var express = require('express');
var socket = require('socket.io');

var app = express();


server = app.listen(8080, function(){
    console.log('server is running on port 8080')
});

io = socket(server);

io.on('connection', (socket) => {
    console.log(socket.id);

    socket.on('SEND_MESSAGE', function(data){
        io.emit('RECEIVE_MESSAGE', data);
        console.log(data);
        var answer;
        if (data["message"] === "sampleanswer"){
          answer = { author: "ADMIN", message: data["author"] + ": got Correct answer -!!!" };
          io.emit('RECEIVE_MESSAGE', answer);
        }
    })
  socket.on("mouseEvent", function(data){
    io.emit("mouseEvent", data);
    console.log("got mouse event")
    console.log(data)
  })
});

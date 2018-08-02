var express = require('express');
var socket = require('socket.io');
var sqlite = require('sqlite-sync');
//var letterdb = ["거실","텔레비젼","소파","전화기","에어컨","장식장","화분","서랍장","카페트","오디오","라디오","창문","책장","유리창","베란다","매트","바닥","천장","장판","손잡이","문","커튼","전등","인터폰","쿠션","액자","사진","DVD","컴퓨터","책상","노트북","의자","모니터","키보드","프린터","카메라","방석","선풍기","책꽃이","거울","콘센트","멀티탭","휴지통","휴지","각티슈","옷걸이","벤치","벽","피아노","바이올린","보면대","공책","책","리모콘","인형","장난감","블록","레고","자동차","비행기","상자","가방","책가방","신발","슬리퍼","실내화","운동화","구두","신발장","현관","초인종","진공청소기","화장실","수건","비누","샴푸","로션","드라이어","세면대","비데","변기","욕조","샤워기","구급약","칫솔","치약","옷장","화장대","화장품","배개","안방","침대","장롱","이불","탁자","시계","부엌","식탁","쟁반","싱크대","컵","물병","냉장고","칼","가위","환풍기","머그컵","가스레인지","김치냉장고","앞치마","고무장갑","설탕","소금","참기름","우유","고추장","찬장","전기밥솥","압력밥솥","국자","선반","프라이팬","토스트기","접시","냄비","전기포트","수저통","도마","밥그릇","국그릇","냄비","쌀독"]
var letterdb = ['이규한', '직장인', '구준엽', '자폐증', '싸움닭', '잠수', '우거지', '질풍', '맨발', '대중가요', '아름다운시절', '개인기', '첼레스타', '포세이돈', '오스람전구', '진혼곡', '퇴학', '조트리오', '가라오케', '판도라의상자', '애인', '위기', '강변']
var app = express();
const sqlite3 = require('sqlite3').verbose();
function random(array){
  return array[Math.floor(Math.random() * array.length)]
}
/*** Environment Settings *****/
sample = random(letterdb);
var roomlist = [];
sqlite.connect('/home/soyoung/chatapp/user.db');
//let db = new sqlite3.Database('/home/soyoung/chatapp/user.db', sqlite3.OPEN_READWRITE, (err)=>{
//  if (err){
//    console.error(err.message);
//  }
//  console.log('Connected to user.db database.');
//});
server = app.listen(8080, function(){
    console.log('server is running on port 8080')
});
io = socket(server);

function getpeople(roomnumber){
  let db = new sqlite3.Database('/home/soyoung/chatapp/user.db', sqlite3.OPEN_READWRITE);
  var raw;
  let sql = "select ids from room where roomnumber =="+ roomnumber;
  console.log(sql);
  sqlite.run(sql, function(res){
    console.log("res:"+res);
    console.log(res[0]);
    res.forEach((row) => {
      raw = row.ids;
      });
  });
  db.close();
  return raw;
};

io.on('connection', (socket) => {
    console.log(socket.id);
/*
 * Text Chatting -
 */
  socket.on('SEND_MESSAGE',async function(data){
    var roomnumber;
    let db = new sqlite3.Database('/home/soyoung/chatapp/user.db', sqlite3.OPEN_READWRITE);
    var answer;
    let sql0 = "select \"group\" from users where id == \""+ data["author"] + "\"";
      //console.log(sql0);
      sqlite.run(sql0,function(res){
        res.forEach((row) => {
         // roomnumber = row.group;
          roomnumber = data.roomNumber; //이렇게 하니깐 돌아가는거 확인했습니다.
          console.log("roomnumber: "+roomnumber);
        });
      });

      console.log("%%%%%%%%%%%%%% roomnumber is %%%%%%%%%%%%%");
      console.log(roomnumber);

    let sql5 = "select answer from room where roomnumber == "+roomnumber;
      sqlite.run(sql5,function(res){
        res.forEach((row) => {
          answer = row.answer;
          console.log("answer : "+ answer);
        });
      });

      console.log("message sent data is : " + data["message"]);

    if (data["message"] === answer){ /* When got correct answer! */
        var cnt;
        data["isCorrect"] = true;
        var send_answer = { author: "관리자", message: '['+data["author"] + ']'+" got Correct answer - "+answer+"!!!" , roomNumber : roomnumber};
        answer = random(letterdb);
        let sql6 = "update room set answer == \""+ answer + "\" where roomnumber == "+ roomnumber;
        sqlite.run(sql6,function(res){
            console.log("updated room's answer to: "+ answer);
        });
        io.emit('RECEIVE_MESSAGE', send_answer);
        //alter permission to draw.
        var raw = getpeople(roomnumber);
        var grouplist = raw.split(",");
        var before_permiss_id = grouplist[0];
        grouplist.push(before_permiss_id);
        grouplist.shift();
        let sql = "update users set turn = 1 where id = \""+grouplist[0]+"\"";
        let sql2 = "update users set turn = 0 where id = \""+before_permiss_id+"\"";
        grouplist = grouplist.join(",");
        let sql4 = "update room set ids = \""+grouplist+"\" where roomnumber == "+roomnumber;
        sqlite.run(sql, function(res){
        });
        sqlite.run(sql2, function(res){
        });
 			  sqlite.run(sql4, function(res){
        });
        let sql_inc_score = "update users set score = score + 1 where id == \""+ data["author"] + "\"";
        let sql_inc_count = "update room set count = count + 1 where roomnumber == " + roomnumber;
        let sql_count = "select count from room where roomnumber == "+ roomnumber;
        sqlite.run(sql_inc_count);

      /*
       *누님 여기서 밑의 row 출력해보면 count에 null 이 들어가네요 . 아마 처음 초기화 할 때 count = null 로 초기화 되 있어서 문제가
       발생하는 것 같습니다 ^^77
       */
        sqlite.run(sql_count, function(res){
          res.forEach((row) => {
            console.log(row);
            cnt = row.count;
          });
        });
        console.log("cnt : " + cnt);
        sqlite.run(sql_inc_score);
        if (cnt == 5){
          var ppl_string = getpeople(roomnumber);
          var ppl_list = ppl_string.split(",");
          var real_ppl_string = ppl_list.join("\' or id == \'");
          console.log("count was 3~! and ppl_list is : ");
          console.log(ppl_list);
          console.log("real_ppl_string is : ");
          console.log(real_ppl_string);
          var playerlist = [];
          var i = 0;
          var bd;
          for (bd = 0; bd < ppl_list.length; bd ++){
            let sql_moon = "select score from users where id == \"" + ppl_list[bd] + "\"";
            sqlite.run(sql_moon, function(res){
              res.forEach((row) => {
                playerlist.push({"name" : ppl_list[bd], "score" : row.score});
              });
            });
          };
         // let sql_setplayerlist = "select score from users where id == \'"+ real_ppl_string + "\'";
         // sqlite.run(sql_setplayerlist, function(res){
         //   res.forEach((row) => {
         //     console.log("row.score is ");
         //     console.log(row.score);
         //     playerlist.push({"name" : ppl_list[i], "score" : row.score});
         //     i = i + 1;
         //   });
         // });
          console.log("playerlist is ...")
          console.log(playerlist);
          io.emit("end", {"roomNumber" : roomnumber, "playerList" : playerlist});
          let set_score_0 = "update users set score = 0 where id == \'" + real_ppl_string + "\'";
          sqlite.run(set_score_0);
        }

    }
      else{
        data["isCorrect"] = false;
      }
      data["roomNumber"] = roomnumber;
      console.log("message request computing success....");
      io.emit('RECEIVE_MESSAGE', data);
    db.close();
    });

/*
 * everything about mouse event!
 */

  socket.on("mouseEvent", function(data){
    io.emit("mouseEvent", data);
  });

  /*
   * Computed when User tries to login
   */

  socket.on("loginInfo", function(data){
    let db = new sqlite3.Database('/home/soyoung/chatapp/user.db', sqlite3.OPEN_READWRITE);
    var id = data.Id
    var password = data.Password
    var sessionid = data.socketId;
    console.log("in Logininfo. id = "+id + " and socketId is "+sessionid);
    let sql = "Select id, password from users where id == \""+ id + "\" and password == \"" + password + "\"";
    sqlite.run(sql,function(res){
      res.forEach((row) => {
        io.to(sessionid).emit("Info", {"result":"true"});
        //TODO need send signal to specific server - not just emit!
        console.log("Inside loginInfo - row is : ");
        console.log(row);
      });
    });
  db.close();
  });

  /*
   * Computed when user tries to register.
   */
  socket.on("registerInfo", function(data){
    let db = new sqlite3.Database('/home/soyoung/chatapp/user.db', sqlite3.OPEN_READWRITE);
    var id = data.Id;
    var sessionid = data.socketId;
    console.log("in registerinfo. id = "+id + " and socketId is "+sessionid);
    var exists = new Boolean(false);
    var password = data.Password;
    let sql = "Select id, password from users where id == \""+ id + "\"";
    sqlite.run(sql,function(res){
      res.forEach((row) => {
        io.to(sessionid).emit("Register", {"result":"Register failed"});
        console.log("REGISTER FAILED______________________________");
        exists = true;
      });
    });

    console.log("INSERTING TO DATABASE: USER id is "+id);
    let sql2 = "Insert into users (id, password, turn, score, etc, \"group\") values (\""+id+"\", \""+password+"\", 0,0,0, -1)";
    console.log("exists is ....")
    console.log(exists);
    if(exists == false){
      console.log("exists is false in registerinfo");
      sqlite.run(sql2,function(res){
        io.to(sessionid).emit("Register", {"result":"Success"});
        console.log("Register was success.");
      });
    }
  db.close();
  });

  /* Turn: send to react every 1 second.
   */
  socket.on("turn", function(data){
  let db = new sqlite3.Database('/home/soyoung/chatapp/user.db', sqlite3.OPEN_READWRITE);
  var id = data.Id;
  var answwwer;

  let sql2 = "Select answer from room where ids LIKE \"%%" + id +"%%\"";
  sqlite.run(sql2, function(res){
    res.forEach((row) => {
      answwwer = row.answer;
    });
  });
  let sql = "Select turn from users where id == \""+id+"\"";
  sqlite.run(sql, function(res){
    res.forEach((row) => {
      io.emit("turn", {"id": id, "turn":row.turn, "word": answwwer });
    });
  });
  db.close();
  });

  /*
   * Create Room: INPUT - userid, OUTPUT - update userid's groupid, allocate roomnumber. gives roomnumber and userid.
   */
  socket.on("createRoom", function(data){
    let db = new sqlite3.Database('/home/soyoung/chatapp/user.db', sqlite3.OPEN_READWRITE);
    var i;
    for (i = 0; i <roomlist.length ; i++) {
      if (roomlist.includes(x => x.roomNumber == i) === false){
				i = i - 1;
				break;};
    }
		i = i + 1;
    console.log("in create room. i = " + i);
		var element = {"roomNumber" : i, "isStarted" : false, "nop" : 1}
    roomlist.push(element);
    let sql = "update users set \"group\" = "+i+", turn = 1 where id == \""+data.id+"\"";
    console.log("In CREATE ROOM@#@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
    io.emit("createRoom", {"id":data.id, "roomNumber": i});
    sqlite.run(sql, function(res){
      console.log(res);
      console.log("successfully updated user's group id. room number = "+i+", roomlist = "+roomlist);
    });
  db.close();
  });

  /*
   * roomList: OUTPUT roomlist.
   */
	socket.on("roomList", function(data){
		io.emit("roomList", {"roomList" : roomlist});
    console.log(roomlist);
  });

  /*
   * JoinRoom: INPUT - userid. OUTPUT - update user's groupid
   */
	socket.on("joinRoom", function(data){
    let db = new sqlite3.Database('/home/soyoung/chatapp/user.db', sqlite3.OPEN_READWRITE);
		var id = data.id;
    var roomnumber = data.roomNumber;
		let sql = "update users set \"group\" = "+ roomnumber + " where id == \""+ id + "\"";
	  sqlite.run(sql, function(res){
			console.log("updated user " + id + " into room number "+roomnumber+" in JoinROOm");
		});
    var idx = roomlist.findIndex((x) =>{return  x.roomNumber == roomnumber});
    console.log("idx in joinRoom is .... " + idx + "and roomnumber is " + roomnumber);
    roomlist[idx].nop = roomlist[idx].nop + 1;
  });

/*
 * Start: Input - roomNumber, OUTPUT - make table in "room", search ids with the roomnumber and put them.
 *        allocate random answer and also put them into it.
 */
  socket.on("Start", function(data){
    var roomnumber = data.roomNumber;
    let db = new sqlite3.Database('/home/soyoung/chatapp/user.db', sqlite3.OPEN_READWRITE);
    if (roomnumber == -1){
      console.log("ROOMNUMBER -1 INSERTED INSIDE..............");
    };

    let sql = "select id from users where \"group\" == "+roomnumber;
    var cup = [];
    console.log(sql);
		sqlite.run(sql, function(res){
      console.log("inside sqlite in Start. cup is .....");
      console.log(cup);
			res.forEach((row) => {
			  cup.push(row.id);
      });
		});
    cup.toString();
    let sql2 = "Insert into room (roomnumber, answer, ids, count) values ("+ roomnumber+", \""+ random(letterdb)+"\", \""+cup+"\", 0)";
    if (cup != []){
    sqlite.run(sql2, function(res){
			console.log("successfully made new room.");
		});
    }

    var idx = roomlist.findIndex((x) =>{return  x.roomNumber == roomnumber});
    console.log("idx in start is .." + idx);
    roomlist[idx].isStarted = true;
    io.emit("Clear", {"roomNumber" : roomnumber});
    io.emit("Start", {"roomNumber" : roomnumber});
  db.close();
  });

/*Clear*/
  socket.on("Clear", function(data){
    io.emit("Clear", data);
  });

/*
 * Quit
 */
  socket.on("Quit", function(data){
    var id = data.id;
    var turn;
    var roomNumber = data.roomNumber;
    let db = new sqlite3.Database('/home/soyoung/chatapp/user.db', sqlite3.OPEN_READWRITE);
    let sql = "update users set \"group\" == -1 where id == \"" + id + "\"";
    sqlite.run(sql, function(res){
      console.log("successfully updated user "+ id + " to -1 in quit.");
    });

//    let sql1 = "select turn from users where id == \"" + id;
//    sqlite.run(sql1, function(res){
//      res.forEach((row) => {
//        turn = row.turn;
//      });
    var raw = getpeople(roomNumber);
    var grouplist = raw.split(",");
    console.log("in quit. the id is = "+id);
    var index = grouplist.indexOf(id);
    console.log("index of person that wants to quit is " + index);
    if (index == 0){ // means that id's turn was 1.
      let sql2 = "update users set turn == 0 where id == \""+id+"\"";
      sqlite.run(sql2);
      //make next person's turn to 1.
      let sql3 = "update users set turn == 1 where id == \""+grouplist[1]+"\"";
      sqlite.run(sql3);
    };
    //erase that person's id from room's ids
    grouplist.splice(index,1);
    var length = grouplist.length;
    //restore grouplist to string
    grouplist = grouplist.join(",");
    let sql4 = "update room set ids = \""+grouplist+"\" where roomnumber == "+roomNumber;
 		sqlite.run(sql4, function(res){
    });
    var idx = roomlist.findIndex((x) =>{return  x.roomNumber == roomNumber});
    if (length == 0){ // that person was the last person to quit to the room - need to erase the room & update roomlist
      let sql5 = "delete from room where roomnumber =="+roomNumber;
      sqlite.run(sql5);
      roomlist.splice(idx,1);
    }
    else{
      roomlist[idx].nop = roomlist[idx].nop - 1;
    };
    // reset that id's score to 0;
    let sql_resetid = "update users set score = 0 where id == \"" + id + "\"";
    sqlite.run(sql_resetid);
  });
});


//db.close((err) =>{
//  if (err) {
//    console.error(err.message);
//  }
//  console.log('Closed the database Connection.');
//});
//
//

var contains = function(needle) {
    // Per spec, the way to identify NaN is that it is not equal to itself
    var findNaN = needle !== needle;
    var indexOf;

    if(!findNaN && typeof Array.prototype.indexOf === 'function') {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function(needle) {
            var i = -1, index = -1;

            for(i = 0; i < this.length; i++) {
                var item = this[i];

                if((findNaN && item !== item) || item === needle) {
                    index = i;
                    break;
                }
            }

            return index;
        };
    }

    return indexOf.call(this, needle) > -1;
};

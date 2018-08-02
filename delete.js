var sqlite = require('sqlite-sync');

sqlite.connect('/home/soyoung/chatapp/user.db');

function make_groupid(num){
  let sql = 'update users set \"group\" = -1 where etc == 0';
  sqlite.run(sql);
};

function make_score(){
  let sql = 'update users set score = 0';
  sqlite.run(sql);
};

function turn(num){
  let sql = 'update users set turn =' + num + ' where etc == 0';
  sqlite.run(sql);
};

function delete_user(){
  let sql = 'delete from users where score == 0';
  sqlite.run(sql);
}

function delete_room(){
  let sql = "delete from room";
  sqlite.run(sql);
}

make_score();
turn(0);
delete_room();
make_groupid(0);

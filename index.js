/*******************
 * デバッグに色をつけるため
 ******************/
var black   = '\u001b[30m';
var red     = '\u001b[31m';
var green   = '\u001b[32m';
var yellow  = '\u001b[33m';
var blue    = '\u001b[34m';
var magenta = '\u001b[35m';
var cyan    = '\u001b[36m';
var white   = '\u001b[37m';

var reset   = '\u001b[0m';

//console.log(red + 'This text is red. ' + green + 'Greeeeeeen!' + reset);
/*******************
 * モジュール
 ******************/
var app				= require('express')();
var server			= require("http").createServer(app);
var io				= require("socket.io")(server);
var session			= require("express-session")({
	secret: "my-secret",
	resave: true,
	saveUninitialized: true
});
var sharedsession	= require("express-socket.io-session");


/*******************
 * use
 ******************/
// expressでexpress-sessionの使用を宣言
app.use(session);
// Socket.ioでexpress-socket.io-sessionの使用を宣言
io.use(sharedsession(session, {
  autoSave: true
}));
//Debugging express
app.use("*", function(req, res, next) {
  console.log("Express `req.session` data is %j.", req.session);
  next();
});
// Debugging io
io.use(function(socket, next) {
  console.log("socket.handshake session data is %j.", socket.handshake.session);
  next();
});

app.use(require("express").static(__dirname));

/*
 * loginにアクセスがあったときのルーティング
 * expressのリクエスト経由でセッションをセットする
 */
app.use("/login", function(req, res, next) {
	console.log("Requested /login: " + yellow + JSON.stringify(req.session) + reset)
	//セッションにuserを追加
	req.session.user = {
		username: "hogehoge.express"
	};
	//TODO:この下のsave()はなに？
	//req.session.save();
	res.redirect("/");
});

/*
 * logouotにアクセスがあったときのルーティング
 * expressのリクエスト経由でセッションをアンセットする
 */
app.use("/logout", function(req, res, next) {
	console.log("Requested /logout: " + yellow + JSON.stringify(req.session) + reset)
	//セッションからuserを削除
	delete req.session.user;
	//TODO:この下のsave()はなに？
	//req.session.save();
	res.redirect("/");
});


/*
 * Socket.ioでコネクションが張られたときの処理
 */
io.on("connection", function(socket) {

	// sessiondataイベントを送信
	socket.emit("sessiondata", socket.handshake.session);
	console.log("Emitting session data");
	
	/*
	 * ログイン処理
	 * Socket.io経由でセッションをセットする
	 */
	socket.on("login", function() {
		console.log("Received login message: " + yellow + JSON.stringify(socket.handshake.session) + reset)
		//セッションにuserを追加
		socket.handshake.session.user = {
			username: "hogehoge.socketio"
		};
		//console.log("socket.handshake session data is %j.", JSON.stringify(socket.handshake.session));
		//TODO:この下のsave()はなに？
		// socket.handshake.session.save();
		//emit logged_in for debugging purposes of this example
		socket.emit("logged_in", socket.handshake.session);
	});

	/*
	 * ログアウト処理
	 * Socket.io経由でセッションをアンセットする
	 */
	socket.on("logout", function() {
		console.log("Received login message: " + yellow + JSON.stringify(socket.handshake.session) + reset)
		socket.handshake.session.user = {};
		//セッションからloggedを削除
		delete socket.handshake.session.logged;
		//TODO:この下のsave()はなに？
		// socket.handshake.session.save();
		//emit logged_out for debugging purposes of this example
		//console.log("socket.handshake session data is %j.", socket.handshake.session);
		socket.emit("logged_out", socket.handshake.session);
	});
});

//サーバ開始
server.listen(3000);
console.log('接続開始: localhost:3000');

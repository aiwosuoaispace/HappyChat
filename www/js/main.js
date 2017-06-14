var chat = null;
$(function() {
	initEmoji();
	loginBtn();
	sendNewMsgBtn();
	sendFileBtn();
	chat = new HiChat();
	chat.init();

});

var HiChat = function() {
	this.socket = null;
	this.init = function() {
		var that = this;
		//建立到服务器的socket连接
		this.socket = io.connect();
		//监听socket的connect事件，此事件表示连接已经建立
		this.socket.on('connect', function() {
			//连接到服务器后
			//var name=$("#user_name_text").val();
			//that.socket.emit('login', name);
			//alert("连接服务器成功");
		});
		this.socket.on('nickExisted', function() {
			alert("昵称被占用");
		});
		this.socket.on('loginSuccess', function() {
			//alert("登录成功");
			$("#connect_btn").attr("disabled", true);
		});
		this.socket.on('system', function(nickName, userCount, type) {
			//判断用户是连接还是离开以显示不同的信息
			var msg = nickName + (type == 'login' ? '进入' : '离开');
			that.displayNewMsg('system ', msg, 'red');
			document.getElementById('usr_online_status').textContent = userCount + "人在线";
		});
		this.socket.on('newMsg', function(user, msg) {
			that.displayNewMsg(user, msg);
		});
		this.socket.on('newImg', function(user, img) {
			that.displayImage(user, img);
		});

	};
	this.displayNewMsg = function(user, msg, color) {
		var container = document.getElementById('history_msg_content');
		var msgToDisplay = document.createElement('p');
		var date = new Date().toTimeString().substr(0, 8);
		msg = this.showEmoji(msg);
		msgToDisplay.style.color = color || '#000';
		msgToDisplay.innerHTML = user + '(' + date + '): ' + msg;
		container.appendChild(msgToDisplay);
		container.scrollTop = container.scrollHeight;
	};
	this.displayImage = function(user, imgData, color) {
		var container = document.getElementById('history_msg_content');
		var msgToDisplay = document.createElement('p');
		var date = new Date().toTimeString().substr(0, 8);
		msgToDisplay.style.color = color || '#000';
		msgToDisplay.innerHTML = user + '(' + date + '):  <br/>' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
		container.appendChild(msgToDisplay);
		container.scrollTop = container.scrollHeight;
	};
	this.showEmoji = function(msg) {
		var match;
		var result = msg;
		var	reg = /\[emoji:\d+\]/g;
		var	emojiIndex;
		var totalEmojiNum = document.getElementById('emoji_content').children.length;
		while(match = reg.exec(result)) {
			emojiIndex = match[0].slice(7, -1);
			if(emojiIndex > totalEmojiNum) {
				result = result.replace(match[0], '[xxxxx]');
			} else {
				result = result.replace(match[0], '<img class="emoji" src="img/faceList/' + emojiIndex + '.gif" />');
			};
		};
		return result;
	};
};
//登录
function loginBtn() {
	$("#connect_btn").click(function() {
		var name = $("#user_name_text").val();
		if(name.trim().length == 0) {
			alert("请输入昵称");
		} else {
			chat.socket.emit('login', name);
		}

	});
}
//发送消息
function sendNewMsgBtn() {
	$("#send_btn").click(function() {

		var msg = $("#message_input").val();
		var col = $("#color_btn").val();
		if(msg.trim().length != 0) {
			chat.socket.emit('postMsg', msg); //把消息发送到服务器
			chat.displayNewMsg('我', msg, col); //把自己的消息显示到自己的窗口中
			$("#message_input").val("");
		};
	});
}
//发送图片文件
function sendFileBtn() {
	$("#file_btn").change(function() {
		//检查是否有文件被选中
		if(this.files.length != 0) {
			//获取文件并用FileReader进行读取
			var file = this.files[0],
				reader = new FileReader();
			if(!reader) {
				that._displayNewMsg('system', '!你的浏览器不支持fileReader', 'red');
				this.value = '';
				return;
			};
			reader.onload = function(e) {
				//读取成功，显示到页面并发送到服务器
				this.value = '';
				chat.socket.emit('img', e.target.result);
				chat.displayImage('我', e.target.result);
			};
			reader.readAsDataURL(file);
		};
	});
}
//初始化表情
function initEmoji() {
	var emojiContainer = document.getElementById('emoji_content');
	for(var i = 1; i <= 75; i++) {
		var emojiItem = document.createElement('img');
		emojiItem.src = 'img/faceList/' + i + '.gif';
		emojiItem.title = i;
		emojiContainer.appendChild(emojiItem);
	};
	$("#emoji_btn").click(function() {
		$("#emoji_content").show();
	});
	$(window).click(function(e) {
		var emojiContainer = document.getElementById('emoji_content');
		var em_btn = document.getElementById('emoji_btn');
		if(e.target != emojiContainer && e.target != em_btn) {
			emojiContainer.style.display = 'none';
		};
	});

	$("#emoji_content img").click(function(e) {
		var target = e.target;
		var messageInput = document.getElementById('message_input');
		messageInput.focus();
		messageInput.value = messageInput.value + '[emoji:' + target.title + ']';
	});
}
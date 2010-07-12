//
// end.js
//
// $Id: end.js,v 1.1 2010/07/09 16:16:41 axfree Exp axfree $
//

var boardType = location.href.match(/bo_table=([a-z_]*)/);
if (boardType)
	boardType = boardType[1];

//console.log(boardType);

//localStorage.clear();
var users = localStorage.getItem("cnUsers") ? JSON.parse(localStorage.getItem("cnUsers")) : {};

if (boardType == "image")
	$(".resContents").each(function(index) {
		modifyBoard($(this));
	})
else if (boardType)
	modifyBoard($(".board_main"));
	
try {
	localStorage.setItem("cnUsers", JSON.stringify(users));
}
catch (e) {
	console.log("error: " + e);
}

function modifyBoard(e) {
	var replyHeads    = $(e).find(".reply_head");
	var replyContents = $(e).find(".reply_content");
	var replyTexts    = $(e).find("TEXTAREA");
	var replyCount    = replyHeads.length;

	// local
	var divs = [];

	var replyAt = $(replyHeads[0]).prev();
	var replies = document.createElement("DIV");

	for (var k = 0; k < replyCount; k++) {
		var head = replyHeads[k];
		var cont = replyContents[k];
		var text = replyTexts[k];

		$(head).detach();
		$(cont).detach();

		var uimg   = $(head).find(".user_id IMG").attr("SRC");
		var uname  = $(head).find(".user_id SPAN").text();
		var uid    = $(head).find(".user_id A").attr("TITLE");
		var uip    = $(head).find(".ip");
		var uscore = 0;

		if (uimg)
			uname = uimg.match(/.*\/(.*)$/)[1];
		if (uid)
			uid = uid.match(/\[(.*)\]/)[1];

		//console.log("uid=" + uid +", uname=" + uname);

		var u = users[uname];
		if (!u) {
			var ips = {};
			if (uip)
				ips[uip.text()] = true;
			users[uname] = { uid:uid, ips:ips, score:0 };
		}
		else {
			if (uid)
				u.uid = uid;
			if (uip)
				u.ips[uip.text()] = true;

			uscore = u.score;
		}

		var div = document.createElement("DIV");
		$(div).append(head);
		$(div).append(cont);
		$(div).addClass("cl-comment");
		$(div).attr("u-name", uname);
		//$(div).css("background-color", "#DDDDDD");

		// if (bans[uname])
		// 	$(cont).css("background-color", "#666666");

		if (true) {
			var liDn = document.createElement("LI");
			var liSc = document.createElement("LI");
			var liUp = document.createElement("LI");
			$(liDn).addClass("cl-thumb-down");
			$(liUp).addClass("cl-thumb-up");
			$(liSc).addClass("cl-score");
			//$(liDn).attr("uname", uname);
			//$(liUp).attr("uname", uname);
			$(liDn).click(function() { scoreDown($(this).parent().parent().parent().attr("u-name")) });
			$(liUp).click(function() { scoreUp($(this).parent().parent().parent().attr("u-name")) });

			$(head).find(".reply_btn").append(liDn)
			  						  .append(liSc)
									  .append(liUp);
		}

		//console.log("*" + uname + "*");
		divs[uname.toLowerCase()] = div;

		var re = text.value.match(/^(.+)[\s]*님/);
		if (re) {
			re = re[1].toLowerCase().trim();
			//console.log("re:" + re);
			if (divs[re]) {
				$(div).addClass("cl-reply")
				$(divs[re]).append(div);
			}
			else
				$(replies).append(div);
		}
		else
			$(replies).append(div);

		scoreApply(div, uscore, false);
	}

	$(replies).insertAfter(replyAt);
}

//console.log("end of end.js");


function scoreApply(div, score, animate) {
	$(div).find(".reply_content:first").css("opacity", (score + 5) / 5.0);
	
	if (score == -5) {
		$(div).find(".reply_head:first .reply_info").css("text-decoration", "line-through");
		if (animate)
			$(div).find(".reply_content:first").animate({"height":"toggle"}, 500);
		else
			$(div).find(".reply_content:first").hide();
	}
	else {
		$(div).find(".reply_head:first .reply_info").css("text-decoration", "none");
		if (!$(div).find(".reply_content:first").is(":visible")) {
			if (animate)
				$(div).find(".reply_content:first").animate({"height":"toggle"}, 500);
			else
				$(div).find(".reply_content:first").show();
		}
	}
	$(div).find(".cl-score:first").text(score > 0 ? ("+" + score) : score == 0 ? "-" : score);
}

function scoreUp(uname)
{
	var u = users[uname];
	
	if (!u)
		return;
	if (u.score < 5)
		u.score++;
		
	//scoreApply($(replies).find("DIV[u-name='" + uname + "']"), u.score, true);
	scoreApply($("DIV[u-name='" + uname + "']"), u.score, true);
	
	try {
		localStorage.setItem("cnUsers", JSON.stringify(users));
	}
	catch (e) {
		console.log("error: " + e);
	}
}

function scoreDown(uname)
{
	var u = users[uname];
	
	if (!u || u.score == -5)
		return;
	if (u.score > -5)
		u.score--;
		
	//scoreApply($(replies).find("DIV[u-name='" + uname + "']"), u.score, true);
	scoreApply($("DIV[u-name='" + uname + "']"), u.score, true);

	try {
		localStorage.setItem("cnUsers", JSON.stringify(users));
	}
	catch (e) {
		console.log("error: " + e);
	}
}


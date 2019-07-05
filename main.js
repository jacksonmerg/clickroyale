var socket = io.connect("http://rugged-shenandoah-55894.herokuapp.com");
var game = 0
var dotdotdot=0;
username=prompt("Please enter your name", "")
socket.emit("newplayer",{username:username});
upgrades=["Upgrade Auto Clicker","Upgrade Manual Clicks","Upgrade Attack Bonus","Upgrade Interest"]
desc=["1 click per second","1 click every click",".5 extra damage per click","2% interest per second"]
for(var i=0;i<upgrades.length;i++)$("#"+i.toString()).hide();
$("#winner").hide();
function price(type,count){
	return Math.floor([10,50,100,200][type]*Math.pow(1.3,count).toString())
}
window.onbeforeunload = function(){
   socket.emit("quit",{game:game});
}
socket.on('heartbeat',
	function(data) {
		if(game>0){
			players = data.games[game]
			for(var i=0;i<players.length;i++)if(players[i].id==socket.id){
				player=players[i]
				$("#button").html(Math.floor(player.clicks).toString())
				if(player.clicks<0){
				    game=0
				    socket.emit("newplayer",{});
				    $("#button").html("Waiting")
				    for(var i=0;i<upgrades.length;i++)$("#"+i.toString()).hide();
				}
				for(var j=0;j<upgrades.length;j++)$("#"+j.toString()).html("<span title='"+desc[j]+"'>"+upgrades[j]+"'("+price(j,player.upgrades[j]).toString()+")</span>")
			}
			for(var i=0;i<players.length;i++)if(players[i].id!=socket.id){
				$(".enemy").filter(function () {
					return $(this).data("id") == players[i].id;
				}).html("<span title='"+players[i].username+"'>"+Math.floor(players[i].clicks).toString()+"</span>");
				
				
			}
		}
	}
).on('heartbeat2',
	function(data) {
	    if(game==0){
	        dotdotdot++
	        if(dotdotdot==1)$("#button").html("Wait.")
	        if(dotdotdot==2)$("#button").html("Wait..")
	        if(dotdotdot==3)$("#button").html("Wait...")
	        if(dotdotdot==3)dotdotdot=0
	    }
		players = data.games[game]
		$(".enemy").css("background-color:#FFAF50;")
		$("#enemies").html("<p class='display'>Enemies:</p>")
	    if(game==0)$("#enemies").html("<p class='display'>Lobby:</p>")
		$("#enemies2").html("<p class='display'>"+players.length.toString()+" Alive</p>")
		if(players.length==1&&game>0){
		    game=0
			socket.emit("newplayer",{});
		    $("#button").html("Waiting")
			for(var i=0;i<upgrades.length;i++)$("#"+i.toString()).hide();
			$("#winner").show()
		}
		if(game==0)$("#enemies2").html("<p class='display'>"+players.length.toString()+"/5</p>")
		for(var i=0;i<players.length&&i<12;i++)if(players[i].id!=socket.id){
			var r=$("<button class='enemy'></button>").html("<span title='"+players[i].username+"'>"+Math.floor(players[i].clicks).toString()+"</span>").data("id",players[i].id)
			$("#enemies").append(r)
		}
		for(var i=12;i<players.length;i++)if(players[i].id!=socket.id){
			var r=$("<button class='enemy'></button>").text(Math.floor(players[i].clicks).toString()).data("id",players[i].id)
			$("#enemies2").append(r)
		}
		$(".enemy").click(function(event){
			if(game>0)socket.emit("attack",{game:game,id:$(event.target).data("id")});
			
		})
	}
).on('startgame',
	function(data) {
		if(game==0){
		    game=data.game
    	    for(var i=0;i<upgrades.length;i++)$("#"+i.toString()).show();
    	    $("#winner").hide()
		}
	}
).on('attack',
	function(data) {
		if(data.attacked==socket.id){
			console.log(data)
			$(".enemy").filter(function () {
				return $(this).data("id") == data.attacker;
			}).css({backgroundColor:"#f00"});
		}
	}
);
for(var i=0;i<upgrades.length;i++){
	$("#"+i.toString()).on("click",function(i){
		return function(){if(game>0)socket.emit("upgrade",{type:i,game:game})}
	}(i))
}

$("#button").on("click",function(){
	if(game>0)socket.emit("click",{game:game});
	
}).bind('keypress', function(e)
{
   if(e.keyCode == 13)
   {
      return false;
   }
});
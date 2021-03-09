/*



拍賣市場 賣掉後自己有的項目移除

每個玩家可自行開發熟練技能裝備之後再到拍賣市場自由出價賣出

玩家開設旅館 可向其他玩家收費 恢復該玩家生命魔力

怪物給裝備&技能 種族判斷可否裝備使用 判斷是否重覆裝備使用

戰鬥死亡 依等級 噴經驗

殺死怪物 設計者得到一定金幣
怪物殺死玩家 設計者得到大量金幣

探索地區 地區設計者得到一定金幣
發佈討伐任務 地區設計者得到一定金幣
地區設計者可蓋旅館 向玩家收費恢復生命魔力




=OK=
技能裝備經驗 LV*20
地區經驗 LV*100



裝備技能數值加成 
cost 固定數值
effect %數或固定數值(取高者)
裝備(技能)不限數量 看累積物理(魔法)防禦是否足夠 
每個裝備
=OK=


*/

var System = {
    "now_page":"",
    "tmp":{},
    "config":null,
    "member":{},
    "char":{},
    "char_bonus_set":{},
    "time":null,
    "ServerTimeStop":false,
    "_timer":null,
    "_timer_list":{},
    "default_char":{
        "name":"",
        "battle_sn":"",
        "item":{"money":0},
        "lv":1,
        "exp":0,
        "expm":10,
        "hpm":10,
        "hp":10,
        "mp":0,
        "mpm":0,
        "atk":5,
        "matk":5,
        "def":5,
        "mdef":5,
        "agi":5,
        "magi":5,
        "hit":5,
        "mhit":5,
        "bonus":5,
        "skill":{
            "0":{
                "char_create" : {
                    "account" : "",
                    "name" : "name",
                    "time" : ""
                    },
                    "char_update" : {
                    "account" : "",
                    "name" : "",
                    "time" : ""
                    },
                    "id" : "0",
                    "lv" : 1,
                    "name" : "攻擊",
                    "type" : {
                    "active" : "active",
                    "atk" : "atk"
                    },
                    "exp":0,
                    "expm":100,
                    "spend":0,
                    "effect":{
                    "hp":1,
                    "mp":1
                    },
                    "need":{
                    "mdef":0
                    },
                    "use" : "use"
            }
        },
        "time_last":{
            "hp":"",
            "mp":"",
            "attack":"",
            "quest":""
        }
    },
    "c_s_word":{
        "name":"角色名稱",
        "lv":"等級",
        "exp":"經驗",
        "hp":"生命",
        "mp":"魔力",
        "atk":"力量",
        "matk":"智慧",
        "def":"耐久",
        "mdef":"精神",
        "agi":"敏捷",
        "magi":"詠唱",
        "hit":"靈巧",
        "mhit":"集中",
        "bonus":"升級點數",
        "kill":"擊殺次數",
        "dead":"死亡次數",
        "group":"族群數量",
        "area":"出沒地區",
        "atk_type":"攻擊傾向",
        "int_type":"智能程度",
        "group_type":"族群習性",
        "race_type":"怪物種族",
        "drop_exp":"怪物經驗"
    },
    "monster_status":{
        "area":"",
        "name":"",
        "lv":0,
        "exp":0,
        "hp":0,
        "mp":0,
        "atk":0,
        "matk":0,
        "def":0,
        "mdef":0,
        "agi":0,
        "magi":0,
        "hit":0,
        "mhit":0,
        "kill":0,
        "dead":0,
        "group":0,
        "drop_exp":0,
        "atk_type":"",
        "int_type":"",
        "group_type":"",
        "race_type":""
    },
    "skill":{
        "atk":{"matk":"魔法","atk":"物理"},
        "active":{
            "active":"主動",
            "buff":"被動",
            "self_buff":"己方增益",
            "enemy_debuff":"敵方損益"
        },
        "lv_up_expm":20,
        "lv_up_money":100,
        "new_money":100
    },
    "equipment":{
        "lv_up_expm":20,
        "lv_up_money":100,
        "new_money":100
    },
    "area":{
        "lv_up_expm":100,
        "lv_up_money":100,
        "new_money":1000
    },
    "trade":{
        "type":{
            "skill":"技能",
            "equipment":"裝備",
            "item":"道具"
        },
        "new_money":100
    },
    "monster":{
        "atk_type":
        {
            "atk":"攻擊傾向強烈(攻擊型)",
            "def":"無攻擊傾向(防禦型)",
            "agi":"觀察警戒心重(敏捷型)"
        },
        "int_type":
        {
            "atk":"頭腦簡單四脂發達(智慧,精神,集中偏低，力量,耐久,靈巧偏高)",
            "matk":"或許能交流，普遍會使用魔法(智慧,精神,集中偏高，力量,耐久,靈巧偏低)",
            "atk_matk":"殘虐，會單純為了玩樂虐殺獵物(力量,智慧,靈巧,集中偏高，耐久,精神低)",
            "def_mdef":"無法交流，但個性溫馴(生命,精神,耐久偏高)",
            "agi_magi":"能夠交流，但個性膽小(敏捷,詠唱偏高)",
            "sp1":"高智能,但無法交流,看不起其他種族(生命,力量,耐久偏高)",
            "sp2":"高智能,樂於與其他種族交流(生命,魔力偏高)",
        },
        "group_type":
        {
            "group1":"團體行動(被擊殺時成長較快速)",
            "group2":"單體行動(擊殺玩家時成長較快速)",
            "group3":"侵略型行動(成長快速,能力上升幅度較小)",
            "group4":"地域型行動(成長緩慢,能力上升幅度較大)"
        },
        "race_type":
        {
            "race1":"人型(裝備適性A)(技能適性D)",
            "race2":"獸型(裝備適性B)(技能適性C)",
            "race3":"蟲型(裝備適性C)(技能適性B)",
            "race4":"幻想型(裝備適性D)(技能適性A)"
        },
        //裝備B => 需求X2 C => 需求X3 D => X4
        //技能B => 需求X2 C => 需求X3 D => X4
        "lv_up_expm":"Math.ceil(System.tmp.lv*System.tmp.lv*10/1.5)"
    },
    "skill_effect":{
        "hp":"生命",
        "mp":"魔力",
        "atk":"力量",
        "matk":"智慧",
        "def":"耐久",
        "mdef":"精神",
        "agi":"敏捷",
        "magi":"詠唱",
        "hit":"靈巧",
        "mhit":"集中"
    },
    "area_limit":{
        "atk":"力量",
        "matk":"智慧",
        "def":"耐久",
        "mdef":"精神",
        "agi":"敏捷",
        "magi":"詠唱",
        "hit":"靈巧",
        "mhit":"集中"
    },
    "dice_btn":
    {
        "six":{
            "name":"設置骰子(6面骰)",
            "obj":null
        },
        "ten":{
            "name":"設置骰子(10面骰)",
            "obj":null
        },
        "cls":{
            "name":"清除骰子",
            "obj":null
        },
        "run":{
            "name":"擲出骰子",
            "obj":null
        }
    },
    "dice_select":{},
    "dice_rand_six":{},
    "client_id":"1036544994321-al81uon4c7ojtummblkmolna1qvckmuv.apps.googleusercontent.com"
};


//1036544994321-bthq2kkn0tie229d9gd9kuh4j5j5chs9.apps.googleusercontent.com

//1036544994321-al81uon4c7ojtummblkmolna1qvckmuv.apps.googleusercontent.com



var DB = firebase;
//DB.initializeApp({databaseURL: "https://kfsrpg.firebaseio.com"});


eval(atob("REIuaW5pdGlhbGl6ZUFwcCh7ZGF0YWJhc2VVUkw6ICJodHRwczovL2tmc3JwZy5maXJlYmFzZWlvLmNvbSJ9KTs="));



var WorkerBattle = new Worker("battle.js");


window.onload = function()
{
    var div = document.createElement("div");
    div.id = "Mask";
    document.body.innerHTML = "";
    document.body.appendChild(div);
    document.body.className = "loading";


    gapi.load("auth2",function(){

        if(location.href.indexOf("file")!=0)
            gapi.auth2.init({"client_id":System.client_id});
        
        DB = DB.database();
        DB.ref("/system/config").once( "value",_sys=>{ 
            System.config = _sys.val();

            for(var key in System.config)
            {
                if(System[key]!=undefined)
                {
                    System[key] = System.config[key];
                }
            }

            document.title += "【版本:"+System.config.version+"】";

            if(System.config.maintain==1)
            {
                document.body.innerHTML = 
                    "<div style=color:#fff;font-size:20px;text-align:center;>系統維護中，請稍後再試。"+System.config.maintain_word+"</div>";
                return;
            }


            setTimeout(function(){
                if(document.querySelector("div#Mask"))
                document.querySelector("div#Mask").className = "off";
                
                setTimeout(function(){
                    if(document.querySelector("div#Mask"))
                    document.querySelector("div#Mask").style.display = "none";
                    document.body.className = "";
                },500);

                Main();
            },100);
        });

    });


    document.body.addEventListener("touchmove",function(e){

        if(e.target.parentElement.getAttribute("draggable")=="true")
        {
            var touchLocation = e.targetTouches[0];
        
            e.target.parentElement.style.left = touchLocation.pageX - e.target.parentElement.clientWidth/2;
            e.target.parentElement.style.top = touchLocation.pageY - e.target.parentElement.clientHeight/3;
        }

        if(e.target.getAttribute("draggable")=="true")
        {
            var touchLocation = e.targetTouches[0];
        
            e.target.style.left = touchLocation.pageX - this.clientWidth/2;
            e.target.style.top = touchLocation.pageY - this.clientHeight/3;
        }
    });


    document.body.addEventListener("dragend",function(e){
        
        if(e.target.getAttribute("draggable")=="true")
        {
            e.target.style.left = e.clientX;
            e.target.style.top = e.clientY;
        }
    });




    document.body.addEventListener("click",function(e){
        var obj = e.target;
        if( obj.getAttribute("page") )
        {
            System.session.menu[obj.getAttribute("page")].list_id = obj.id;
            MenuClick(obj.getAttribute("page"),"open");
        }

        if(obj.nodeName=="IMG")
        {
            if(obj.classList.contains("default")==false)
            {
                var style_idx;
                for(var i in document.styleSheets[0].rules)
                    if(document.styleSheets[0].rules[i].selectorText=="#Main")
                        style_idx = i;


                var _padding = document.styleSheets[0].rules[style_idx].style.getPropertyValue( document.styleSheets[0].rules[style_idx].style[1] ).split("px")[0];


                obj.style.width = document.querySelector("div#Main").clientWidth - _padding*3;
            }
            else
            {
                obj.style.width = "";
            }

            obj.classList.toggle("default");   
        }

        if(obj.className=="battle_log_memo")
        {
            var tr_all = document.querySelectorAll("table#battle_log tr").length;

            document.querySelectorAll("table#battle_log tr")[tr_all-obj.id].querySelectorAll("li.memo").forEach(function(li){
                li.classList.toggle("print");
            });

            setTimeout(function(){
                DivMainClientHeight()
            },500);
        }

        
    });
    


    

}



function Main()
{
    var _tmp = JSON.parse(localStorage.kfs||'{}');
    System.member = _tmp.rpg||{};

    System.session = JSON.parse(sessionStorage.rpg||'{}');
  
    
    if(System.member.account==undefined)
    {
        MenuLi();
        MenuClick("account","open");
        return;
    }
    else
    {
        DB.ref("/char/" + System.member.account ).once( "value",_data=>{

            System.char = _data.val()||{};

            System.char.skill = System.char.skill||{};
            System.char.equipment = System.char.equipment||{};

            

        }).then(function(){

            if(System.char.name==undefined)
            {
                DB.ref("member/"+ System.member.account ).once( "value",_data=>{
                    if( _data.val()==null )
                    {
                        delete localStorage.kfs;
                        location.reload();
                        return;
                    }
                });
            }

            
            document.body.innerHTML = "";
            MenuLi();
    
            var _open_id = "";
            for(var _id in System.session.menu)
            {
                if( System.session.menu[_id].open=="open" )
                {
                    _open_id = _id;
                }
            }

            if(_open_id=="") _open_id = "system_news";

            if(System.char.battle_sn!="" && 
            System.char.battle_sn!=undefined && 0)
            {
                System.session.menu.battle.list_id = System.char.battle_sn;
                sessionStorage.rpg = JSON.stringify(System.session);
                MenuClick("battle","open");
                return;
            }

            if(System.char.name==undefined || 
            System.char.name=="")
            {
                MenuClick("char_status","open");
                return;
            }
            
            MenuClick(_open_id,"open");
        });
    }
    
}

function MenuLi()
{
    var _div = document.createElement("div");
    _div.id = "char_menu";
    _div.setAttribute("draggable","true");
    document.body.appendChild(_div);

    var _btn = document.createElement("div");
    _btn.className = "btn";
    _btn.innerHTML = "角色狀態";
    _div.appendChild(_btn);

    _btn.addEventListener("click",function(){
        OpenCharMenu();
    });


    var div = document.createElement("div");
    div.id = "Menu";
    var ul = document.createElement("ul");
    var list = {
        "system_news":{"name":"系統公告","class":"hr"},
        "char":{"name":"玩家功能","class":"hr"},
        "char_status":{"name":"狀態"},
        "skill":{"name":"技能"},
        "equipment":{"name":"裝備"},
        "monster":{"name":"怪物"},
        "area":{"name":"地區"},


        "trade_menu":{"name":"玩家交流","class":"hr"},
        "trade":{"name":"交易中心"},
        "battle_menu":{"name":"探索戰鬥","class":"hr"},

        "search":{"name":"探索"},
        "battle":{"name":"戰鬥"},

        "log_menu":{"name":"記錄排行","class":"hr"},
        "battle_log":{"name":"戰鬥記錄"},
        "money_log":{"name":"交易記錄"},
        "char_list":{"name":"玩家排行"},

        "setting":{"name":"系統帳號管理","class":"hr"},
        "account":{"name":"帳號管理"},
        "system_info":{"name":"遊戲系統說明"},
    }

    if(System.char.name===undefined)
    {
        list = {
            "system_news":{"name":"系統公告"},
            "char_status":{"name":"玩家狀態"},
            "account":{"name":"帳號管理"},
            "system_info":{"name":"遊戲系統說明"},
        }
    }

    

    for(var key in list)
    {
        System.session.menu = System.session.menu||{};
        System.session.menu[key] = System.session.menu[key]||{};

        System.session.search = System.session.search||{};
        System.session.search[key] = System.session.search[key]||{};
    }


    for(var i in list)
    {
        var li = document.createElement("li");
        li.id = i;
        li.className = list[i].class||"";
        li.innerHTML = list[i].name;

        ul.appendChild(li);

        var li_div = document.createElement("div");
        li_div.id = i;    
        ul.appendChild(li_div);
    }

    div.appendChild(ul);

    document.body.appendChild(div);

    document.querySelectorAll("#Menu ul li").forEach(function(li){

        li.addEventListener("click",function(){MenuClick(li.id,"close");} );
        
    });

}


function MenuClick(id,act)
{
//    console.log(id);

    for(var key in System._timer_list)
    {
        clearInterval(System._timer_list[key]);
    }


    if(act=="close")
    {
        if(System.session.menu[id].open=="open")
        {
            document.querySelectorAll("#Menu ul>div").forEach(function(div){
                div.innerHTML = "";
                div.style.height = "0px";
            });
            System.session.menu[id].open = "close";
            sessionStorage.rpg = JSON.stringify(System.session);
        }
        else
        {
            document.querySelectorAll("#Menu ul>div").forEach(function(div){
                div.innerHTML = "";
                div.style.height = "0px";
            });

            setTimeout(function(){
                MenuClick(id,"open");
            },0);
        }
        return;
    }
    else
    {
        document.querySelectorAll("#Menu ul>div").forEach(function(div){
            if(div.id!=id)
            {
                div.innerHTML = "";
                div.style.height = "0px";
            }
        });
    }

    System.now_page = id;



    System.session.menu = System.session.menu||{};
    System.session.menu[id] = System.session.menu[id]||{};

    for(var _id in System.session.menu)
    {
        if(_id==id)
        {
            System.session.menu[_id].open = "open";
            System.session.menu[_id].list_id = System.session.menu[_id].list_id||"list";
        }
        else
        {
            System.session.menu[_id].open = "close";
        }
    }


    sessionStorage.rpg = JSON.stringify(System.session);

    
    var div = document.createElement("div");
    div.id = "Main";

    var menu = {};

/*
<HR>
【2/16公告】<BR>
新增遊戲系統說明，<a style="color:#f00;cursor:pointer;" onclick=MenuClick("system_info","open")>按此</a><BR>
<HR><P>
*/

    if(id=="system_news")
    {
        var str = "【置頂公告】<HR>感謝各位玩家協助測試，目前為測試階段，如果有重大改革或更新可能會清除資料庫還請注意，目前還有各種BUG跟系統不平橫的地方也請多多包涵，未來會進入到什麼階段我這邊也沒辦法保證，目前就先走一步算一步吧。<HR><P>" + 
        System.config.news;


        var _div = document.createElement("div");
        _div.className = "info";
        _div.innerHTML = str;
        div.appendChild(_div);


        ListMake(title,list,div,id);
    }


    if(id=="system_info")
    {
        var _div = document.createElement("div");
        _div.className = "info";
        _div.innerHTML = System.config.system_info;
        div.appendChild(_div);


        ListMake(title,list,div,id);
    }



    if(id=="account")
    {
       if(System.member.account==undefined )
       {
            menu = {
                "google":{
                    "type":"button",
                    "span":"",
                    "value":"登入GOOGLE綁定帳號",
                    "event":{"click":function(){


                        Gapi("signIn",function(_r){

                            if( typeof(_r.getId)!="undefined")
                            {
                                RegisterMember(_r.getId());
                            }
                        },function(err){
                            alert("GOOGLE登入失敗");
                            return;
                        });
                        


                    }}
                }
            }
        }
        else
        {
            menu = {
                "button3":{
                    "type":"button",
                    "value":"清除角色資料",
                    "span":"",
                    "event":{"click":function(){

                        if( confirm("確定要清除角色資料嗎?\n(登入GOOGLE帳號後繼續程序)")===false ) return;

                        Gapi("signIn",function(_r){
                            if( typeof(_r.getId)!="undefined")
                            {
                                DelAccount(_r.getId());
                            }
                            
                        },function(err){
                            alert("GOOGLE登入失敗");
                            return;
                        });
                    }}
                }
            }
        }
        

        RowMake(menu,div,id);
    }

    if(id=="char_status")
    {
        if(System.session.menu.char_status.list_id!="list")
        {
            DB.ref("/char/"+System.session.menu.char_status.list_id).once("value",function(char)
            {
                char = char.val();

                if(char==null || 1)
                {
                    System.session.menu.char_status.list_id = "list";
                    MenuClick("char_status","open");
                    return;
                }
            });
            return;
        }

        if(System.char.name===undefined)
        {
            menu.name = {
                "type":"text",
                "span":"角色名稱",
                "value":"",
                "class":""
            }

            menu.button = {
                "type":"button",
                "value":"決定名稱",
                "span":"",
                "event":{"click":function(){

                    var name = document.querySelector("#name").value;

                    if(name=="")
                    {
                        alert("名稱不可空白");
                        return;
                    }

                    DB.ref("/char/").orderByChild("name").equalTo(name).once( "value",_name=>{
                        _name = _name.val();
            
                        if(_name!=null)
                        {
                            alert("名稱已有人使用");
                            return;
                        }
                        if(confirm("確定要使用【"+name+"】這個名稱嗎?\n(不可更改)")==false) return;
                        
                        System.char = System.default_char;

                        System.char.name = name;
                        System.char.id = System.member.account;
                        
                        for(var i in System.char.time_last)
                        {
                            System.char.time_last[i] = 
                            firebase.database.ServerValue.TIMESTAMP;
                        }

                        System.char.skill["0"].char_create = {
                            "account" : System.member.account,
                            "name" : name,
                            "time" : firebase.database.ServerValue.TIMESTAMP
                        }

                        System.char.skill["0"].char_update = {
                            "account" : System.member.account,
                            "name" : name,
                            "time" : firebase.database.ServerValue.TIMESTAMP
                        }
                        
            
                        DB.ref("/char/"+System.member.account).set( System.char );
            
                        var money_log = {
                            "payer":"bank",
                            "taker":"bank",
                            "lost_money":100,
                            "add_money":100,
                            "memo":{
                                "type":"new_member",
                                "name":name
                            }
                        };
                        
                        DbRowAdd(DB,"/system/config/bank_money",100,money_log );
                        
                        document.body.innerHTML = "";
                        MenuLi();
                        MenuClick("char_status","open");
                    });                    
                }}
            }

            RowMake(menu,div,id);
            return;
        }




        System.char_bonus_set = JSON.parse(JSON.stringify(System.char));

        var str = System.c_s_word;

        var line_ary = ["hp","mp","exp"];
        var no_bonus = ["name","lv","bonus","exp"];



        for(var i in System.default_char)
        {
            if(str[i]===undefined) continue;


            menu[i] = {
                "type":"text",
                "span":str[i],
                "disabled":"disabled",
                "value":System.char[i],
                "class":"number"
            }

            if( line_ary.indexOf(i)!=-1 ) 
            {
                menu[i].line = {
                    "now":System.char[i],
                    "max":System.char[i+"m"]
                }
            }

            if(System.char.bonus>0)
            if( no_bonus.indexOf(i)==-1 ) 
            {
                menu[i].bonus_set = 1;
            }
        }
        menu.money = {
            "type":"text",
            "span":"擁有金幣",
            "disabled":"disabled",
            "value":System.char.item.money,
            "class":"number"
        }

        menu.name.class = "";


        
        
        if(System.char.exp>=System.char.expm)
        {
            menu["button2"] = {
                "type":"button",
                "value":"升級",
                "span":"",
                "event":{"click":LvUp}
            }
        }

        if(System.char.bonus>0)
        {
            var re_char_status = JSON.parse(JSON.stringify(System.char));

            menu["button3"] = {
                "type":"button",
                "value":"重新分配",
                "span":"",
                "event":{"click":function(){
                    System.char = re_char_status;
                    MenuClick("char_status","open");
                }}
            }
        }

        var _btn_str = "分配點數";
        

        menu["button"] = {
            "type":"button",
            "value":_btn_str,
            "span":"",
            "event":{"click":EditChar}
        }

        if(System.char.name==="")
        {
            var _div = document.createElement("div");
            _div.className = "info";
            _div.innerHTML = "請輸入角色名稱並儲存開始遊戲<BR>角色名稱日後不可更改<BR>或在【帳號管理】使用序號及繼承碼繼承已有帳號";
            div.appendChild(_div);
        }

        RowMake(menu,div,id);


        var list = [];
        var div_list = {};
        for(var _id in System.char.equipment)
        {
            var _data = System.char.equipment[_id];
            if(_data.on!="on") continue;
            
            var cost_word = "";
            for(var _c in _data.cost)
            {
                cost_word +=
                System.c_s_word[ _c ]+"："+_data.cost[_c]+"<BR>"
            }

            var need_word = "";
            for(var _n in _data.need)
            {
                need_word += 
                System.c_s_word[ _n ]+"："+_data.need[_n]+"<BR>";
            }

            var effect_word = "";
            for(var _e in _data.effect)
            {
                effect_word += 
                System.c_s_word[ _e ]+"："+_data.effect[_e]+"<BR>";
            }

            var info_word = 
            "【效果】<BR>" + 
            effect_word +
            "<hr>【消耗】<BR>" + 
            cost_word + 
            "<hr>【限制】<BR>" + 
            need_word + "<HR>";

            
            for(var row in _data.effect)
            {
                var _parent = document.querySelector("#"+row).parentNode;
                var _item = document.createElement("input");
                _item.className = "number blue";
                _item.disabled = "disabled";
                _item.type = "text";
                _item.setAttribute("parent_id",_data.id);

                if(row=="hp" || row=="mp") continue;

                if(_data.effect[row]>0)
                    _item.value = "+"+_data.effect[row];
                else
                    _item.value = "-"+_data.effect[row];

                if( document.querySelector("#"+row+".bonus") )
                    _parent.insertBefore(_item,document.querySelector("#"+row+".bonus"));
                else
                    _parent.appendChild(_item);
            }


            div_list[ _data.id ] = {};
            div_list[ _data.id ].id = _data.id;
            
            div_list[ _data.id ].div_word = "<span>" + System.item_part[ _data.part ]+"</span>" + "<BR>" + _data.name+" LV"+_data.lv;
            
            
            div_list[ _data.id ].detail_content = 
            _data.name + " LV"+_data.lv+"<HR>" + 
            "【"+System.item_part[ _data.part ] + "】<HR>"+
            info_word + 
            need_word + 
            _data.money + "元<BR>" + 
            "<HR>【製作者】<BR><span page=char_status id="+_data.char_create.account+">"+_data.char_create.name+"</span>";
        
        }


        var _div = document.createElement("div");
        _div.className = "info";
        _div.innerHTML = "目前使用裝備";
        div.appendChild(_div);

        ListDiv(div_list,div);
        

        var div_list = {};

        var _word = {
            "active":["主","主動"],
            "buff":["被","被動"],
            "atk":["物","物攻"],
            "matk":["魔","魔攻"],
        }

        for(var _id in System.char.skill)
        {
            var _data = System.char.skill[_id];
            
            if(_data.on!="on") continue;
            
            var cost_word = "";
            for(var _c in _data.cost)
            {
                cost_word +=
                System.c_s_word[ _c ]+"："+_data.cost[_c]+"<BR>"
            }

            var need_word = "";
            for(var _n in _data.need)
            {
                need_word += 
                System.c_s_word[ _n ]+"："+_data.need[_n]+"<BR>";
            }

            var effect_word = "";
            for(var _e in _data.effect)
            {
                effect_word += 
                System.c_s_word[ _e ]+"："+_data.effect[_e]+"<BR>";
            }


            for(var row in _data.effect)
            {
                var _parent = document.querySelector("#"+row).parentNode;
                var _item = document.createElement("input");
                _item.className = "number red";
                _item.disabled = "disabled";
                _item.type = "text";
                _item.setAttribute("parent_id",_data.id);

                if(row=="hp" || row=="mp") continue;
                if(_data.type.active=="active") continue;

                if(_data.effect[row]>0)
                    _item.value = "+"+_data.effect[row];
                else
                    _item.value = "-"+_data.effect[row];

                if( document.querySelector("#"+row+".bonus") )
                    _parent.insertBefore(_item,document.querySelector("#"+row+".bonus"));
                else
                    _parent.appendChild(_item);
            }


            var info_word = 
            "【效果】<BR>" + 
            effect_word +
            "<hr>【消耗】<BR>" + 
            cost_word + 
            "<hr>【限制】<BR>" + 
            need_word + "<HR>";

            


            div_list[ _data.id ] = {};
            div_list[ _data.id ].id = _data.id;
            div_list[ _data.id ].div_word = 
            "<span>"+ _word[ _data.type.active ][0]+"</span>" + 
            "<span>"+ _word[ _data.type.atk ][0]+"</span><BR>" + 
            _data.name+" LV"+_data.lv;
            
            div_list[ _data.id ].detail_content = 
            _data.name + " LV"+_data.lv+"<HR>" + 
            "【"+_word[ _data.type.active ][1]+"】【" + 
            _word[ _data.type.atk ][1]+"】<HR>" + 
            info_word + 
            _data.money + "元<BR>" + 
            "<HR>【製作者】<BR><span page=char_status id="+_data.char_create.account+">"+_data.char_create.name+"</span>";
        }


        var _div = document.createElement("div");
        _div.className = "info";
        _div.innerHTML = "目前準備技能";
        div.appendChild(_div);

        ListDiv(div_list,div);
    }


    if(id=="skill")
    {
        JobSkillMenu(div,id);
    }

    if(id=="equipment")
    {
        JobEquipmentMenu(div,id);
    }
    if(id=="monster")
    {
        JobMonsterMenu(div,id);
    }


    if(id=="area")
    {
        var menu = {};
        var list_id = System.session.menu[System.now_page].list_id;


        menu["new"] = {
            "type":"button",
            "value":"開發新地區",
            "span":"",
            "event":{"click":function(){
                System.session.menu[System.now_page].list_id = "new";
                sessionStorage.rpg = JSON.stringify(System.session);
    
                MenuClick(System.now_page,"open");
                return;
            }}
        }

        menu["list"] = {
            "type":"button",
            "value":"顯示清單",
            "span":"",
            "event":{"click":function(){
                System.session.menu[System.now_page].list_id = "list";
                sessionStorage.rpg = JSON.stringify(System.session);
    
                MenuClick(System.now_page,"open");
                return;
            }}
        }



        if(list_id!="list")
        {
            var effect = document.createElement("div");
            for(var key in System.area_limit)
            {
                var checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.id = "char";
                checkbox.value = key;
                var span = document.createElement("span");
                span.innerHTML = System.area_limit[key];
                effect.appendChild(checkbox);
                effect.appendChild(span);
                effect.appendChild( document.createElement("br") );
            }

            var effect2 = document.createElement("div");
            for(var key in System.area_limit)
            {
                var checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.id = "monster";
                checkbox.value = key;
                var span = document.createElement("span");
                span.innerHTML = System.area_limit[key];

                effect2.appendChild(checkbox);
                effect2.appendChild(span);
                effect2.appendChild( document.createElement("br") );
            }

            menu["name"] = {
                "type":"text",
                "span":"地區名稱"
            }

            menu["char"] = {
                "type":"text",
                "span":"玩家限制條件",
                "class":"chkbox_list",
                "html":effect
            }

            menu["monster"] = {
                "type":"text",
                "span":"怪物危險程度",
                "class":"chkbox_list",
                "html":effect2
            }

            var btn = document.createElement("input");
            btn.type = "button";
            btn.value = "開發開始";
            btn.addEventListener("click",function(){

                //this.setAttribute("disabled","disabled");
                AreaRandCreate();
            });

            if(list_id=="new")
            {
                var _div = document.createElement("div");
                _div.id = "info";
                _div.innerHTML = "<span id=new_money>1000</span> 金幣";
    
                menu["step7"] = {
                    "type":"text",
                    "span":"開發費用",
                    "html":_div
                }

                menu["submit"] = {
                    "type":"button",
                    "span":"",
                    "html":btn
                }

            }

            menu["data_result"] = {
                "html":document.createElement("div")
            }
        
            RowMake(menu,div,id);
            DivMainClientHeight();

            if(list_id!="new")
            {

                DB.ref("area/"+list_id).once("value",new_data=>{

                    new_data = new_data.val();
                    if(new_data==null)
                    {
                        System.session.menu[System.now_page].list_id = "list";
                        sessionStorage.rpg = JSON.stringify(System.session);
    
                        MenuClick(System.now_page,"open");
                        return;
                    }

                    var all_obj = document.querySelectorAll("input[type=text],input[type=checkbox],select");
                    for(var i=0;i<all_obj.length;i++) 
                        all_obj[i].setAttribute("disabled","disabled");
                    
                    for(var row in new_data)
                    {
                        var _obj = document.querySelector("#"+row);
                        var _value = new_data[row];
                        
                        if(_obj!=null)
                            _obj.value = _value;
                        
                        
                        if( typeof(new_data[row])=="object" )
                        {
                            for(var row2 in _value)
                            {
                                var _obj2 = document.querySelector("[id='"+row+"."+row2+"']");

                                if(_obj2!=null)
                                    _obj2.value = _value[row2];
        
        
                                if(row=="char" || row=="monster")
                                {
                                    _obj2 = document.querySelector("input[type=checkbox][value="+row2+"]");
        
                                    
                                    _obj2.checked = true
                                }
                            }
                        }
                    }

                    var _char = "";
                    for(var key in new_data.char)
                    {
                        _char += System.c_s_word[key] + "："+new_data.char[key]+"<BR>";
                    }
                
                    var _monster = "";
                    for(var key in new_data.monster)
                    {
                        _monster += System.c_s_word[key] + "："+new_data.monster[key]+"<BR>";
                    }
                    
                
                
                    var table = document.createElement("table");
                    table.innerHTML = 
                    "<tr><td>【地區名稱】</td><td>"+new_data.name+"</td></tr>"+
                    "<tr><td>【地區等級】</td><td>"+new_data.lv+"</td></tr>" +
                    "<tr><td id=exp>【探索進度】</td><td>"+new_data.exp+" / "+new_data.expm+"</td></tr>" + 
                    "<tr><td>【玩家限制條件】</td><td>"+_char+"</td></tr>" + 
                    "<tr><td>【怪物危險程度】</td><td>"+_monster+"</td></tr>" + 
                    "<tr><td>【怪物種類數量】</td><td>"+new_data.monster_count+"</td></tr>";

                    document.querySelector("#data_result").appendChild(table);
                    

                    if(new_data.exp>new_data.expm)
                    {
                        document.querySelectorAll("td#exp").forEach(function(td){
                            td.bgColor = "#ff0";
                        });
        
                        var lvup_btn = document.createElement("input");
                        lvup_btn.type = "button";
                        lvup_btn.value = "地區升級";
                        lvup_btn.addEventListener("click",function(){
                            this.setAttribute("disabled","disabled");
                            LvUpArea(new_data.id); 
                        });
        
                        var span = document.createElement("span");
                        span.innerHTML = "升級費用："+new_data.lv*System.area.lv_up_money+"金幣";

                        div.appendChild(span);
                        div.appendChild( document.createElement("br") );
                        div.appendChild(lvup_btn);
                    }

                    DivMainClientHeight();

                });
            }
            
            return;
        }


        if(list_id=="list")
        {
            var div_list = {};

            var ref = DB.ref("area");
            ref = ref.orderByChild("char_create/account").equalTo(System.member.account);


            ref.once("value",area=>{
                area = area.val()||{};
    
                var menu_list_btn = 
                {
                    "on":{"off":"開放探索","on":"禁止探索","no_start":"怪物數量未達討伐底標"},
                    "detail":"查看明細",
                    "del":"廢棄地區"
                };
                for(var _id in area)
                {
                    var _data = area[_id];

                    var on_word = "<hr>禁止探索中";

                    if(_data.on=="on")
                        on_word = "<hr><a style=color:#f00>開放探索中</a>";

                    if(_data.on=="no_start")
                        on_word = "<hr>怪物數量未達討伐底標";

                    div_list[ _data.id ] = _data;
                    div_list[ _data.id ].div_word = 
                    _data.name+" LV"+_data.lv + 
                    "<BR>探索進度" +_data.exp + "/" + _data.expm + 
                    "<BR>怪物種類數量："+_data.monster_count + 
                    on_word;

                    var menu_list_div = document.createElement("div");
                    for(var _btn in menu_list_btn)
                    {
                        var btn = document.createElement("input");
                        btn.type = "button";
                        
                        if(_btn=="on")
                        {
                            btn.value = menu_list_btn[_btn][ _data.on ];
                            if(_data.on=="no_start")
                                btn.setAttribute("disabled","disabled");
                        }
                        else
                            btn.value = menu_list_btn[_btn];

                        btn.id = _id;       
                        btn.setAttribute("spend",_data.spend);
                        btn.setAttribute("name",_data.name);
                        btn.setAttribute("lv",_data.lv);
                        btn.setAttribute("on",_data.on);
                        btn.setAttribute("func",_btn);

                        menu_list_div.appendChild(btn);
                        menu_list_div.appendChild( document.createElement("br") );
                    }

                    div_list[ _data.id ].detail_content = 
                    _data.name + " LV"+_data.lv + "<hr>" + 
                    menu_list_div.outerHTML;

                    div_list[ _data.id ]["detail_func"] = {
                        "type":"click",
                        "func":function(){
                        System.session.menu[System.now_page].list_id = this.id;
                        sessionStorage.rpg = JSON.stringify(System.session);
                        MenuClick(System.now_page,"open");
                    }};

                    div_list[ _data.id ]["del_func"] = {
                        "type":"click",
                        "func":function(){
        
                        if(confirm("確定要廢棄【"+this.getAttribute("name")+"】【LV"+this.getAttribute("lv")+"】嗎?")==false) return;
    
                        DB.ref("area/"+this.id).remove();

                        MenuClick(System.now_page,"open");
                    }};

                    div_list[ _data.id ]["on_func"] = {
                        "type":"click",
                        "func":function(){

                        if(this.getAttribute("on")=="no_start") return;
    
                        var _word,on;
                        if(this.getAttribute("on")=="off")
                        {
                            on = "on";
                            _word = "開放探索";                     
                        }
                        else
                        {
                            on = "off";
                            _word = "禁止探索";
                        }
    
                        if(confirm("確定要"+_word+"【"+this.getAttribute("name")+"】?")==false) return;
    
                        
                        DB.ref("area/"+this.id+"/on").set( on );
                        
    
                        MenuClick(System.now_page,"open");
                    }};

                }

                ListDiv(div_list,div,System.now_page);
            
            });
            
        }

        RowMake(menu,div,id);

        DivMainClientHeight();
        return;
    }


    if(id=="trade")
    {
        var menu = {};
        var list_id = System.session.menu[System.now_page].list_id;
        
        menu["new"] = {
            "type":"button",
            "value":"登錄拍賣商品",
            "span":"",
            "event":{"click":function(){
                System.session.menu[System.now_page].list_id = "new";
                sessionStorage.rpg = JSON.stringify(System.session);
    
                MenuClick(System.now_page,"open");
                return;
            }}
        }
    
        menu["list"] = {
            "type":"button",
            "value":"顯示拍賣清單",
            "span":"",
            "event":{"click":function(){
                System.session.menu[System.now_page].list_id = "list";
                sessionStorage.rpg = JSON.stringify(System.session);
    
                MenuClick(System.now_page,"open");
                return;
            }}
        }

        if(list_id=="new")
        {
            var _select = document.createElement("select");
            _select.innerHTML = "<option value>選擇類型</option>";

            for(var key in System.trade.type)
                _select.innerHTML += "<option value="+key+">"+System.trade.type[key]+"</option>";

            _select.addEventListener("change",function(){
                var obj_list = System.char[this.value];
                
                _item.innerHTML = "<option value>先選擇類型</option>";
                for(var key in obj_list)
                {
                    if(key=="money") continue;
                    if(this.value=="skill" && key==0) continue;
                    _item.innerHTML += "<option value="+key+">"+obj_list[key].name+"</option>";
                }

            });

            var _item = document.createElement("select");
            _item.innerHTML = "<option value>先選擇類型</option>";

            menu["type"] = {
                "type":"text",
                "id":"type",
                "span":"拍賣商品類型",
                "html":_select
            }


            menu["item"] = {
                "type":"text",
                "id":"item",
                "span":"玩家擁有項目",
                "html":_item
            }

            menu["money"] = {
                "type":"number",
                "class":"number",
                "id":"money",
                "span":"拍賣價錢"
            }

            var _div = document.createElement("div");
            _div.id = "info";
            _div.innerHTML = "<span id=new_money>"+System.trade.new_money+"</span> 金幣";

            menu["new_money"] = {
                "type":"text",
                "span":"登錄費用",
                "html":_div
            }

            var btn = document.createElement("input");
            btn.type = "button";
            btn.value = "登錄拍賣";
            btn.addEventListener("click",function(){

                this.setAttribute("disabled","disabled");
                TradeRegister();
            });

            menu["submit"] = {
                "type":"button",
                "span":"",
                "html":btn
            }

            RowMake(menu,div,id);
            DivMainClientHeight();
            return;
        }


        if(list_id=="list")
        {
            var detail = document.createElement("div");
            detail.className = "detail";
            detail.setAttribute("draggable","true");

            var btn_buy = document.createElement("input");
            btn_buy.type = "button";
            btn_buy.value = "購買";

            btn_buy.addEventListener("click",function(){
                TradeBuy(
                    db_data[this.parentElement.id]
                );
            });


            var buyer_menu = document.createElement("div");

            var btn_buy = document.createElement("input");
            btn_buy.type = "button";
            btn_buy.value = "購買";

            btn_buy.addEventListener("click",function(){
                TradeBuy(
                    db_data[this.parentElement.id]
                );
            });
            buyer_menu.appendChild(btn_buy);
            


            var solder_menu = document.createElement("div");

            var btn_off = document.createElement("input");
            btn_off.type = "button";
            btn_off.value = "下架";

            btn_off.addEventListener("click",function(){
                TradeOff(
                    db_data[this.parentElement.id]
                );
            });
            solder_menu.appendChild(btn_off);


            var btn_close = document.createElement("input");
            btn_close.type = "button";
            btn_close.value = "關閉";
            btn_close.addEventListener("click",function(){
                this.parentElement.style.display = "none";
            });


            var detail_content = document.createElement("div");

            detail.appendChild(detail_content);
            detail.appendChild(solder_menu);
            detail.appendChild(buyer_menu);
            detail.appendChild(btn_close);
            div.appendChild(detail);


            var title = {
                "0":{
                    "title":"",
                    "html":"menu",
                    "class":"btn",
                    "id":"id",
                    "event":{"click":function(){

                        var _trade = db_data[this.id];
                        var _data = _trade.data;

                        var _name = _data.name;
                        if(_data.lv!=undefined) _name += " LV"+_data.lv;
                        
                        detail_content.innerHTML = 
                        _name + "<hr>" + 
                        EffectCostNeed(_data) + 
                        "價錢：" +_trade.money + "<hr>";


                        detail.style.display = "block";
                        detail.id = this.id;
                        solder_menu.id = this.id;
                        buyer_menu.id = this.id;

                        if(_trade.char_create.account!=System.member.account ||
                            _trade.on=="off")
                        {
                            solder_menu.remove();
                        }
                        if(_trade.on=="off")
                        {
                            buyer_menu.innerHTML = "<span page class=red>已結束拍賣</span>";
                        }


                    }}
                },
                "1":{
                    "title":"拍賣項目",
                    "html":"info"
                },
                "2":{
                    "title":"拍賣玩家<BR>買下玩家",
                    "html":"char_info"
                },
                "3":{
                    "title":"登錄時間<BR>賣出時間",
                    "html":"time_info"
                }
            };


            var list = [];
            var db_data = {};


            var orderByChild = System.session.search[id].orderByChild||"char_create/time";
            var Desc = System.session.search[id].Desc||"";

            var ref = DB.ref("trade").orderByChild(orderByChild);

            if(Desc!="desc")
                ref = ref.limitToLast(20);
            else
                ref = ref.limitToFirst(20);

            ref.once("value",function(_r){
                db_data = _r.val();

                _r.forEach(function(char){

                    var _data = char.val();

                    var list_idx = list.length;

                    _data.menu = "詳細";

                    var _name = _data.data.name;
                    if(_data.data.lv!=undefined) _name += " LV"+_data.data.lv;

                    _data.info = 
                    _name+"<BR>價錢："+_data.money+" 金幣";

                    if(_data.on=="off")
                    {
                        _data.info+=
                        "<BR><span page class=red>已結束拍賣</span>";
                    }

                    _data.char_info = 
                    "<span id="+_data.char_create.account+" page=char_status>"+_data.char_create.name+"</span>";

                    if(_data.char_update.account!="")
                    {
                        _data.char_info += "<BR><span id="+_data.char_update.account+" page=char_status>"+_data.char_update.name+"</span>";
                    }

                    _data.time_info = 
                    DateFormat( new Date(_data.char_create.time) );

                    if(_data.char_update.time!="")
                    {
                        _data.time_info += "<BR>" + 
                        DateFormat( new Date(_data.char_update.time) );
                    }


                    list[ list_idx ] = _data;
                
                });

                if(Desc!="desc")
                    list.reverse();


                ListMake(title,list,div,id);

            });
        }

        RowMake(menu,div,id);
    }



    if(id=="char_list")
    {
        var title = {
            "0":{
                "title":"玩家",
                "html":"name_account"},
            "2":{
                "title":"最後活動時間",
                "html":"time_last_word"}
        };

        var list = [];


        var orderByChild = System.session.search[id].orderByChild||"lv";
        var Desc = System.session.search[id].Desc||"";


        var ref = DB.ref("char").orderByChild(orderByChild);

        if(Desc!="desc")
            ref = ref.limitToLast(20);
        else
            ref = ref.limitToFirst(20);

        ref.once("value",function(_r){

            
            _r.forEach(function(char){

                var _data = char.val();

                var list_idx = list.length;

                list[ list_idx ] = _data;

                list[ list_idx ].name_account = 
                "LV"+_data.lv+"【<span page=char_status id="+char.key+">"+_data.name + "</span>】";

                _data.time_last = _data.time_last||{};
                _data.time_last.attack = _data.time_last.attack||{};

                list[ list_idx ]["time_last_word"] = 
                DateFormat( new Date(_data.time_last.attack) );
            
            });

            if(Desc!="desc")
                list.reverse();



            var _div = document.createElement("div");
            _div.innerHTML = "玩家清單";
            _div.className = "info";
            div.appendChild(_div);

            _div.appendChild( SearchBar("char_list") );

            ListMake(title,list,div,id);


        });

        return;
    }

    if(id=="equipment" && 0)
    {
        System.char.equipment = System.char.equipment||{};

        var char_equipment = JSON.parse(JSON.stringify(System.char.equipment));

        var ref = DB.ref("/equipment/");

        var orderByChild = System.session.search[id].orderByChild||"";
        var equalTo = System.session.search[id].equalTo||"";

 
        if(orderByChild!="")
            ref = ref.orderByChild(orderByChild).equalTo(equalTo);
         

        ref.once("value",function(equipment)
        {
            equipment = equipment.val();
            

            var div_list = {};

            var menu_list_btn = 
            {"use":
                {"item":"使用",
                
                "equipment":{"off":"裝備","on":"卸下"},
                "equipage":{"off":"裝備","on":"卸下"}},
            "sold":"賣出",
            "lvup":"強化"};

            for(var key in char_equipment)
            {
                if(key=="money") continue;

                var _data = char_equipment[key];

                var cost_word = "";
                for(var _c in _data.cost)
                {
                    cost_word +=
                    System.c_s_word[ _c ]+"："+_data.cost[_c]+"<BR>"
                }

                var need_word = "";
                for(var _n in _data.need)
                {
                    need_word += 
                    System.c_s_word[ _n ]+"："+_data.need[_n]+"<BR>";
                }

                var effect_word = "";
                for(var _e in _data.effect)
                {
                    if(_e=="hp" || _e=="mp") effect_word += "恢復";

                    effect_word += 
                    System.c_s_word[ _e ]+"："+_data.effect[_e]+"<BR>";
                }

                var info_word = 
                "【效果】<BR>" + 
                effect_word +
                "<hr>【消耗】<BR>" + 
                cost_word + 
                "<hr>【限制】<BR>" + 
                need_word + "<HR>";



                _data.add_class = System.char.equipment[_data.id].on;
                


                var menu_list_div = document.createElement("div");
                for(var _btn in menu_list_btn)
                {
                    var btn = document.createElement("input");
                    btn.type = "button";
                    if(_btn=="use")
                    {
                        if(_data.type=="equipment")
                        {
                            btn.value = menu_list_btn[_btn][ _data.type ][ _data.add_class ];
                        }
                        else
                            btn.value = menu_list_btn[_btn][ _data.type ];
                    }
                    else
                        btn.value = menu_list_btn[_btn];
                    
                    btn.id = key;
                    btn.setAttribute("money",_data.money);
                    btn.setAttribute("name",_data.name);
                    btn.setAttribute("obj_type","equipment");
                    btn.setAttribute("func",_btn);
                    
                    btn.className = "menu_list."+_btn;

                    menu_list_div.appendChild(btn);
                    menu_list_div.appendChild( document.createElement("br") );
                }





                div_list[ _data.id ] = {};
                div_list[ _data.id ].id = _data.id;
                div_list[ _data.id ].add_class = _data.add_class;
                div_list[ _data.id ].div_word = "<span>" + System.item_part[ _data.part ]+"</span>" + "<BR>" + _data.name+" LV"+_data.lv;

                
                

                div_list[ _data.id ].detail_content = 
                _data.name + " LV"+_data.lv+"<HR>" + 
                "【"+System.item_part[ _data.part ] + "】<HR>"+
                EffectCostNeed(_data) + 
                _data.money + "元<BR>" + 
                "<HR>【製作者】<BR><span page=char_status id="+_data.char_create.account+">"+_data.char_create.name+"</span><BR>" + 
                menu_list_div.outerHTML;


                div_list[ _data.id ]["use_func"] = {
                    "type":"click",
                    "func":function(){
                    ObjUse(this);
                }};

                div_list[ _data.id ]["sold_func"] = {
                    "type":"click",
                    "func":function(){
                    ObjSold(this);
                }};

                div_list[ _data.id ]["lvup_func"] = {
                    "type":"click",
                    "func":function(){
                    ObjLvUP(this);
                }};

            }

            var _div = document.createElement("div");
            _div.innerHTML = "持有裝備";
            _div.className = "info";
            div.appendChild(_div);


            ListDiv(div_list,div,"equipment");

            div.appendChild( document.createElement("p") );


            div_list = {};
            
            for(var key in equipment)
            {
                var _data = equipment[key];

                if(_data.on!="on") continue;

                var cost_word = "";
                for(var _c in _data.cost)
                {
                    cost_word +=
                    System.c_s_word[ _c ]+"："+_data.cost[_c]+"<BR>"
                }

                var need_word = "";
                for(var _n in _data.need)
                {
                    need_word += 
                    System.c_s_word[ _n ]+"："+_data.need[_n]+"<BR>";
                }

                var effect_word = "";
                for(var _e in _data.effect)
                {
                    if(_e=="hp" || _e=="mp") effect_word += "恢復";

                    effect_word += 
                    System.c_s_word[ _e ]+"："+_data.effect[_e]+"<BR>";
                }

                var info_word = 
                "【效果】<BR>" + 
                effect_word +
                "<hr>【消耗】<BR>" + 
                cost_word + 
                "<hr>【限制】<BR>" + 
                need_word + "<HR>";

                



                div_list[ _data.id ] = {};
                div_list[ _data.id ].id = _data.id;
                div_list[ _data.id ].div_word = "<span>" + System.item_part[ _data.part ]+"</span>" + "<BR>" + _data.name+" LV"+_data.lv;

                if(System.char.equipment[ _data.id ]!=undefined)
                    div_list[ _data.id ].add_class = "on";
                

                var buy_btn = document.createElement("input");
                buy_btn.type = "button";
                buy_btn.name = _data.name;
                buy_btn.id = _data.id;
                buy_btn.setAttribute("obj_type","equipment");
                buy_btn.setAttribute("func","buy");
                buy_btn.value = "購買";
                

                div_list[ _data.id ].detail_content = 
                _data.name + " LV"+_data.lv+"<HR>" + 
                "【"+System.item_part[ _data.part ] + "】<HR>"+
                info_word + 
                _data.money + "元<BR>" + 
                "<HR>【製作者】<BR><span page=char_status id="+_data.char_create.account+">"+_data.char_create.name+"</span><BR>" + 
                buy_btn.outerHTML;

                div_list[ _data.id ].buy_func = {
                    "type":"click",
                    "func":function(){
                    ObjBuy(this);
                }};
                

                


            }
            
            var _div = document.createElement("div");
            _div.innerHTML = "販賣中裝備";
            _div.className = "info";
            div.appendChild(_div);

            _div.appendChild( SearchBar("equipment") );

            var money_div = document.createElement("div");
            money_div.className = "info";
            money_div.innerHTML = "擁有金錢：【<span id=char_money>"+(System.char.item.money)+"</span>】";
            div.appendChild(money_div);


            ListDiv(div_list,div,"equipment");
            
            div.appendChild( document.createElement("p") );


        
        });
    }

    if(id=="item")
    {
        System.char.item = System.char.item||{};

        var char_item = JSON.parse(JSON.stringify(System.char.item));

        var ref = DB.ref("/item/");

        var orderByChild = System.session.search[id].orderByChild||"";
        var equalTo = System.session.search[id].equalTo||"";

 
        if(orderByChild!="")
            ref = ref.orderByChild(orderByChild).equalTo(equalTo);
         

        ref.once("value",function(item)
        {
            item = item.val();
            

            var div_list = {};

            var menu_list_btn = 
            {
                "sold":"賣出"
            };

            for(var key in char_item)
            {
                if(key=="money") continue;

                var _data = char_item[key];

                var menu_list_div = document.createElement("div");
                for(var _btn in menu_list_btn)
                {
                    var btn = document.createElement("input");
                    btn.type = "button";

                    if(_btn=="use")
                    {
                        btn.value = menu_list_btn[_btn][ _data.type ];
                    }
                    else
                        btn.value = menu_list_btn[_btn];
                    
                    btn.id = key;
                    btn.setAttribute("money",_data.money);
                    btn.setAttribute("name",_data.name);
                    btn.setAttribute("obj_type","item");
                    btn.setAttribute("func",_btn);
                    
                    btn.className = "menu_list."+_btn;

                    menu_list_div.appendChild(btn);
                    menu_list_div.appendChild( document.createElement("br") );
                }


                div_list[ _data.id ] = {};
                div_list[ _data.id ].id = _data.id;
                div_list[ _data.id ].div_word = "<span>"+
                _data.name+"</span><BR>" + 
                _data.money + "元 ("+_data.count+")";

                
                

                div_list[ _data.id ].detail_content = 
                _data.name + "<HR>" + 
                _data.count+"數量<HR>"+
                _data.money + "元<BR>" + 
                "<HR>【掉落怪物】<BR><span page id="+_data.drop_enemy.id+">"+_data.drop_enemy.name+"</span><BR>" + 
                menu_list_div.outerHTML;


                div_list[ _data.id ]["use_func"] = {
                    "type":"click",
                    "func":function(){
                    ObjUse(this);
                }};

                div_list[ _data.id ]["sold_func"] = {
                    "type":"click",
                    "func":function(){
                    ObjSold(this);
                }};


            }

            var _div = document.createElement("div");
            _div.innerHTML = "持有道具";
            _div.className = "info";
            div.appendChild(_div);


            ListDiv(div_list,div,"item");

            div.appendChild( document.createElement("p") );


            div_list = {};
            
            for(var key in item)
            {
                var _data = item[key];

                div_list[ _data.id ] = {};
                div_list[ _data.id ].id = _data.id;
                div_list[ _data.id ].div_word = 
                "<span>"+
                _data.name+"</span><BR>" + 
                _data.money + "元 ("+_data.count+")";
                

                var buy_btn = document.createElement("input");
                buy_btn.type = "button";
                buy_btn.name = _data.name;
                buy_btn.id = _data.id;
                buy_btn.setAttribute("obj_type",_data.type);
                buy_btn.setAttribute("func","buy");
                buy_btn.value = "購買";
                
                div_list[ _data.id ].detail_content = 
                _data.name +"<HR>" + 
                _data.count + "數量<HR>" + 
                _data.money + "元<BR>" + 
                "<HR>【掉落者】<BR><span page id="+_data.drop_enemy.id+">"+_data.drop_enemy.name+"</span><BR>" + 
                buy_btn.outerHTML;

                div_list[ _data.id ].buy_func = {
                    "type":"click",
                    "func":function(){
                        ObjBuy(this);
                }};
            }
            
            var _div = document.createElement("div");
            _div.innerHTML = "販賣中道具";
            _div.className = "info";
            div.appendChild(_div);

            _div.appendChild( SearchBar() );

            var money_div = document.createElement("div");
            money_div.className = "info";
            money_div.innerHTML = "擁有金錢：【<span id=char_money>"+(System.char.item.money)+"</span>】";
            div.appendChild(money_div);


            ListDiv(div_list,div,"item");
            
            div.appendChild( document.createElement("p") );


        
        });
    }


    if(id=="skill" && 0)
    {
        System.char.skill = System.char.skill||{};
        var c_skill = JSON.parse(JSON.stringify(System.char.skill));

        var ref = DB.ref("/skill/");
        
        var orderByChild = System.session.search[id].orderByChild||"";
        var equalTo = System.session.search[id].equalTo||"";
        

        if(orderByChild!="")
        ref = ref.orderByChild(orderByChild).equalTo(equalTo);
        

        ref.once( "value",skill=>{
            skill = skill.val()||{};

            var _word = {
                "active":["主","主動"],
                "buff":["被","被動"],
                "atk":["物","物攻"],
                "matk":["魔","魔攻"],
                "part":{
                    "atk":["攻","攻擊"],
                    "def":["防","防禦"],
                    "sup":["輔","輔助"],
                }
            }


            var div_list = {};

            var menu_list_btn = 
            {"use":{"off":"準備","on":"取消"},
            "sold":"賣出",
            "lvup":"強化"};
            for(var _id in c_skill)
            {
                var _data = c_skill[_id];
                if(_data.part==undefined) _data.part = "atk";

                var cost_word = "";
                for(var _c in _data.cost)
                {
                    cost_word +=
                    System.c_s_word[ _c ]+"："+_data.cost[_c]+"<BR>"
                }

                var need_word = "";
                for(var _n in _data.need)
                {
                    need_word += 
                    System.c_s_word[ _n ]+"："+_data.need[_n]+"<BR>";
                }

                var effect_word = "";
                for(var _e in _data.effect)
                {
                    if(_e=="hp" || _e=="mp") effect_word += "恢復";

                    effect_word += 
                    System.c_s_word[ _e ]+"："+_data.effect[_e]+"<BR>";
                }


                var info_word = 
                "【效果】<BR>" + 
                effect_word +
                "<hr>【消耗】<BR>" + 
                cost_word + 
                "<hr>【限制】<BR>" + 
                need_word + "<HR>";

                _data.add_class = System.char.skill[_data.id].on;




                var menu_list_div = document.createElement("div");
                for(var _btn in menu_list_btn)
                {
                    var btn = document.createElement("input");
                    btn.type = "button";

                    if(_btn=="use")
                        btn.value = menu_list_btn[_btn][ c_skill[_id].on ];
                    else
                        btn.value = menu_list_btn[_btn];

                    btn.id = _id;
                    btn.setAttribute("money",_data.money);
                    btn.setAttribute("name",_data.name);
                    btn.setAttribute("obj_type","skill");
                    btn.setAttribute("func",_btn);
                    
                    btn.className = "menu_list."+_btn;

                    menu_list_div.appendChild(btn);
                    menu_list_div.appendChild( document.createElement("br") );
                }


                div_list[ _data.id ] = {};
                div_list[ _data.id ].id = _data.id;
                div_list[ _data.id ].add_class = _data.add_class;
                div_list[ _data.id ].div_word = 
                "<span>"+ _word[ _data.type.active ][0]+"</span>" + 
                "<span>"+ _word[ _data.type.atk ][0] +"</span>" + 
                "<span>"+ _word.part[ _data.part ][0] +"</span><BR>" + 
                _data.name+" LV"+_data.lv;

                
                

                div_list[ _data.id ].detail_content = 
                _data.name + " LV"+_data.lv+"<HR>" + 
                "【"+_word[ _data.type.active ][1]+"】"+
                "【"+_word[ _data.type.atk ][1]+"】"+
                "【"+_word.part[ _data.part ][1]+"】<HR>" + 
                info_word +  
                _data.money + "元<BR>" + 
                "<HR>【製作者】<BR><span page=char_status id="+_data.char_create.account+">"+_data.char_create.name+"</span><BR>" + 
                menu_list_div.outerHTML;


                div_list[ _data.id ]["use_func"] = {
                    "type":"click",
                    "func":function(){
                    ObjUse(this);
                }};

                div_list[ _data.id ]["sold_func"] = {
                    "type":"click",
                    "func":function(){
                    ObjSold(this);
                }};

                div_list[ _data.id ]["lvup_func"] = {
                    "type":"click",
                    "func":function(){
                    ObjLvUP(this);
                }};

            }

            var _div = document.createElement("div");
            _div.className = "info";
            _div.innerHTML = "擁有技能";//<BR>每"+System.config.buff_skill_limit+"級可發動1個被動技能
            div.appendChild(_div);


            ListDiv(div_list,div,"skill");

            div.appendChild( document.createElement("p") );


            

            
            div_list = {};

            for(var _id in skill)
            {
                var _data = skill[_id];
                if(_data.part==undefined) _data.part = "atk";

                if(_data.on!="on") continue;

                var cost_word = "";
                for(var _c in _data.cost)
                {
                    cost_word +=
                    System.c_s_word[ _c ]+"："+_data.cost[_c]+"<BR>"
                }

                var need_word = "";
                for(var _n in _data.need)
                {
                    need_word += 
                    System.c_s_word[ _n ]+"："+_data.need[_n]+"<BR>";
                }

                var effect_word = "";
                for(var _e in _data.effect)
                {
                    if(_e=="hp" || _e=="mp") effect_word += "恢復";

                    effect_word += 
                    System.c_s_word[ _e ]+"："+_data.effect[_e]+"<BR>";
                }


                var info_word = 
                "【效果】<BR>" + 
                effect_word +
                "<hr>【消耗】<BR>" + 
                cost_word + 
                "<hr>【限制】<BR>" + 
                need_word + "<HR>";


                div_list[ _data.id ] = {};
                div_list[ _data.id ].id = _data.id;
                div_list[ _data.id ].div_word = 
                "<span>"+ _word[ _data.type.active ][0]+"</span>" + 
                "<span>"+ _word[ _data.type.atk ][0] +"</span>" + 
                "<span>"+ _word.part[ _data.part ][0] +"</span><BR>" + 
                _data.name+" LV"+_data.lv;


                if(System.char.skill[ _data.id ]!=undefined)
                    div_list[ _data.id ].add_class = "on";


                var buy_btn = document.createElement("input");
                buy_btn.type = "button";
                buy_btn.name = _data.name;
                buy_btn.id = _data.id;
                buy_btn.setAttribute("func","buy");
                buy_btn.setAttribute("obj_type","skill");
                buy_btn.value = "購買";
                

                div_list[ _data.id ].detail_content = 
                _data.name + " LV"+_data.lv+"<HR>" + 
                "【"+_word[ _data.type.active ][1]+"】"+
                "【"+_word[ _data.type.atk ][1]+"】"+
                "【"+_word.part[ _data.part ][1]+"】<HR>" + 
                info_word +  
                _data.money + "元<BR>" + 
                "<HR>【製作者】<BR><span page=char_status id="+_data.char_create.account+">"+_data.char_create.name+"</span><BR>" + 
                buy_btn.outerHTML;

                div_list[ _data.id ].buy_func = {
                    "type":"click",
                    "func":function(){
                        ObjBuy(this);
                }};

            }



            var _div = document.createElement("div");
            _div.className = "info";
            _div.innerHTML = "可學技能清單";
            div.appendChild(_div);

            _div.appendChild( SearchBar() );

            var money_div = document.createElement("div");
            money_div.className = "info";
            money_div.innerHTML = "擁有金錢：【<span id=char_money>"+(System.char.item.money)+"</span>】";
            div.appendChild(money_div);



            ListDiv(div_list,div,"skill");

            div.appendChild( document.createElement("p") );



        });
    }



    if(id=="search")
    {
        var ref = DB.ref("area").orderByChild("on").equalTo("on");

        ref.once("value",function(_r){
            _r = _r.val();

            var div_list = {};

            for(var _id in _r)
            {
                var _data = _r[_id];
                
                var _char = "";
                for(var key in _data.char)
                {
                    _char += System.c_s_word[key] + "："+_data.char[key]+"<BR>";
                }
            
                var _monster = "";
                for(var key in _data.monster)
                {
                    _monster += System.c_s_word[key] + "："+_data.monster[key]+"<BR>";
                }
                


                var _btn = document.createElement("input");
                _btn.type = "button";
                _btn.name = _data.name;
                _btn.id = _data.id;
                _btn.setAttribute("func","quest");
                _btn.value = "探索";


                div_list[ _data.id ] = {};
                div_list[ _data.id ].id = _data.id;
                div_list[ _data.id ].div_word = 
                _data.name + "<br>" + 
                "探索等級："+_data.lv + "<br>" +
                "探索進度："+_data.exp+" / "+_data.expm;

                div_list[ _data.id ].detail_content = 
                _data.name + "<HR>" +
                "探索等級：" + _data.lv + "<hr>" + 
                "玩家限制程度<br>" + _char + "<hr>" +
                "怪物危險程度<br>" + _monster + "<hr>" + _btn.outerHTML; 

                _btn.outerHTML;

                div_list[ _data.id ].quest_func = {
                    "type":"click",
                    "func":function(){
                        QuestGo(this);
                }};



            }



            ListDiv(div_list,div,System.now_page);

        });
        return;
    }


    if(id=="battle")
    {
        var enemy = {};

        if(System.char.battle_sn!="")
        {
            WorkerBattleFunc(
                {
                    "act":"db_get",
                    "db_path":"battle_ing/"+System.char.battle_sn
                },
                function(e)
                {
                    var data = e.data;
                    var battle = data.db_back;
                    
                    if(battle==null)
                    {
                        System.session.menu.battle_log.list_id = System.char.battle_sn;
                        sessionStorage.rpg = JSON.stringify(System.session);
                        MenuClick("battle_log","open");
                        return;
                    }


                    enemy = JSON.parse(JSON.stringify(battle.enemy));

                    var title = {
                        "0":{
                            "title":"怪物狀態",
                            "html":"name"
                        },
                        "1":{
                            "title":"",
                            "html":"status1"
                        }
                    }

                    var list = [];
                    list["0"] = enemy;

                    var name = "";
                    if(enemy.boss=="boss") name += "【BOSS】<BR>";

                    name += "【LV"+enemy.lv+"】<BR>【"+enemy.name+"】";

                    list[0].name = name;

                    list["0"].status1 = 
                    "【"+System.c_s_word.hp +"】" + enemy.hp + "/" + enemy.hpm + "<BR>"+
                    "【"+System.c_s_word.mp +"】" + enemy.mp + "/" + enemy.mpm + "<BR>"+
                    "【"+System.c_s_word.atk +"】"+ enemy.atk + 
                    "【"+System.c_s_word.matk +"】"+ enemy.matk + "<BR>" + 
                    "【"+System.c_s_word.def + "】"+ enemy.def + 
                    "【"+System.c_s_word.mdef + "】"+ enemy.mdef + "<BR>" + 
                    "【"+System.c_s_word.agi + "】"+ enemy.agi + 
                    "【"+System.c_s_word.magi + "】"+ enemy.magi + "<BR>" + 
                    "【"+System.c_s_word.hit + "】"+ enemy.hit + 
                    "【"+System.c_s_word.mhit + "】"+ enemy.mhit;

                    var _div = document.createElement("div");
                    _div.className = "info";
                    _div.innerHTML = "戰鬥記錄編號【"+System.char.battle_sn+"】";
                    div.appendChild(_div);

                    

                    ListMake(title,list,div,id, "enemy");

                    var title = {
                        "0":{
                            "title":"玩家狀態",
                            "html":"name"
                        },
                        "1":{
                            "title":"",
                            "html":"status1"
                        }
                    }
        
                    var list = [];
                    var char = JSON.parse(JSON.stringify( System.char ));
                    list["0"] = char;
                    list["0"].name = "【LV"+char.lv+"】<BR>【"+char.name+"】";
        
                    list["0"].status1 = 
                    "【"+System.c_s_word.hp +"】" + char.hp + "/" + char.hpm + "<BR>"+
                    "【"+System.c_s_word.mp +"】" + char.mp + "/" + char.mpm + "<BR>"+
                    "【"+System.c_s_word.atk +"】"+ char.atk + 
                    "【"+System.c_s_word.matk +"】"+ char.matk + "<BR>" + 
                    "【"+System.c_s_word.def + "】"+ char.def + 
                    "【"+System.c_s_word.mdef + "】"+ char.mdef + "<BR>" + 
                    "【"+System.c_s_word.agi + "】"+ char.agi + 
                    "【"+System.c_s_word.magi + "】"+ char.magi + "<BR>" + 
                    "【"+System.c_s_word.hit + "】"+ char.hit + 
                    "【"+System.c_s_word.mhit + "】"+ char.mhit;
        
        
                    ListMake(title,list,div,id, "char");
                    div.appendChild( document.createElement("p") );

                    var div_list = {};
                    for(var _id in System.char.equipment)
                    {
                        var _data = System.char.equipment[_id];
                        if(_data.use!="use") continue;

                        _data.add_class = _data.use;
                        
                        var cost_word = "";
                        for(var _c in _data.cost)
                        {
                            cost_word +=
                            System.c_s_word[ _c ]+"："+_data.cost[_c]+"<BR>"
                        }

                        var need_word = "";
                        for(var _n in _data.need)
                        {
                            need_word += 
                            System.c_s_word[ _n ]+"："+_data.need[_n]+"<BR>";
                        }

                        var effect_word = "";
                        for(var _e in _data.effect)
                        {
                            effect_word += 
                            System.c_s_word[ _e ]+"："+_data.effect[_e]+"<BR>";
                        }

                        var info_word = 
                        "<hr>【增益】<br>" + 
                        effect_word +
                        "<hr>【損益】<br>" + 
                        cost_word + 
                        "<hr>【需求】<br>" + 
                        need_word + "<hr>";


                        
                        div_list[ _data.id ] = _data;
                        div_list[ _data.id ].div_word = _data.name+"<BR>等級："+_data.lv;
                        
                        div_list[ _data.id ].detail_content = 
                        _data.name + " LV"+_data.lv+
                        info_word +  
                        "【製作者】<BR><span page=char_status id="+_data.char_create.account+">"+_data.char_create.name+"</span>";
                    
                    }


                    var _div = document.createElement("div");
                    _div.className = "info";
                    _div.innerHTML = "使用裝備";
                    div.appendChild(_div);

                    ListDiv(div_list,div,System.now_page);


                    var div_list = {};
                    for(var _id in System.char.skill)
                    {
                        var _data = System.char.skill[_id];

                        
                        if(_data.use!="use" || _data.type.active!="buff") continue;

                        _data.add_class = _data.use;
                        
                        var cost_word = "";
                        for(var _c in _data.cost)
                        {
                            cost_word +=
                            System.c_s_word[ _c ]+"："+_data.cost[_c]+"<BR>"
                        }

                        var need_word = "";
                        for(var _n in _data.need)
                        {
                            need_word += 
                            System.c_s_word[ _n ]+"："+_data.need[_n]+"<BR>";
                        }

                        var effect_word = "";
                        for(var _e in _data.effect)
                        {
                            effect_word += 
                            System.c_s_word[ _e ]+"："+_data.effect[_e]+"<BR>";
                        }

                        var info_word = 
                        "<hr>【增益】<br>" + 
                        effect_word +
                        "<hr>【損益】<br>" + 
                        cost_word + 
                        "<hr>【需求】<br>" + 
                        need_word + "<hr>";

                        
                        
                        div_list[ _data.id ] = _data;
                        div_list[ _data.id ].div_word = _data.name+"<BR>等級："+_data.lv;
                        
                        div_list[ _data.id ].detail_content = 
                        _data.name + " LV"+_data.lv+
                        info_word +  
                        "【製作者】<BR><span page=char_status id="+_data.char_create.account+">"+_data.char_create.name+"</span>";

                    }

                    var _div = document.createElement("div");
                    _div.className = "info";
                    _div.innerHTML = "被動技能";
                    div.appendChild(_div);

                    ListDiv(div_list,div,System.now_page);


                    var div_list = {};
                    for(var _id in System.char.skill)
                    {
                        var _data = System.char.skill[_id];

                        
                        if(_data.use!="use" || _data.type.active=="buff") continue;

                        _data.add_class = _data.use;
                        
                        var cost_word = "";
                        for(var _c in _data.cost)
                        {
                            cost_word +=
                            System.c_s_word[ _c ]+"："+_data.cost[_c]+"<BR>"
                        }

                        var need_word = "";
                        for(var _n in _data.need)
                        {
                            need_word += 
                            System.c_s_word[ _n ]+"："+_data.need[_n]+"<BR>";
                        }

                        var effect_word = "";
                        for(var _e in _data.effect)
                        {
                            effect_word += 
                            System.c_s_word[ _e ]+"："+_data.effect[_e]+"<BR>";
                        }

                        var info_word = 
                        "<hr>【增益】<br>" + 
                        effect_word +
                        "<hr>【損益】<br>" + 
                        cost_word + 
                        "<hr>【需求】<br>" + 
                        need_word + "<hr>";

                        
                        
                        div_list[ _data.id ] = _data;
                        div_list[ _data.id ].div_word = _data.name+"<BR>等級："+_data.lv;
                        
                        div_list[ _data.id ].detail_content = 
                        _data.name + " LV"+_data.lv+
                        info_word +  
                        "【製作者】<BR><span page=char_status id="+_data.char_create.account+">"+_data.char_create.name+"</span>";

                    }

                    var _div = document.createElement("div");
                    _div.className = "info";
                    _div.innerHTML = "主動技能";
                    div.appendChild(_div);

                    ListDiv(div_list,div,System.now_page);


                    var title = [];

                    for(var idx in System.char.skill)
                    {
                        if( System.char.skill[idx].use!="use" || 
                        System.char.skill[idx].type.active=="buff") continue;
                        
                        var _skill = JSON.parse(JSON.stringify(System.char.skill[idx]));

                        var skill_check = true;
                        for(var _n in _skill.need)
                        {
                            if( System.char[_n]*1<_skill.need[_n]*1 )
                            {
                                skill_check = false;
                            }
                        }
                        for(var _c in _skill.cost)
                        {
                            if( System.char[_c]*1<_skill.cost[_c]*1 )
                            {
                                skill_check = false;
                            }
                        }

                        var _l = title.length;
                        title[ _l ] = {
                            "title":System.char.skill[idx].name,
                            "name":System.char.skill[idx].name,
                            "id":idx,
                            "title_class":"btn "+System.char.skill[idx].type.active,
                            "title_event":{"click":function(){

                                if(this.getAttribute("disabled")=="disabled") return;

                                BattleAct(this);
                            }}
                        };
                        if(skill_check==false)
                            title[ _l ].disabled = "disabled";
                    }

                    var _div = document.createElement("div");
                    _div.className = "info";
                    _div.innerHTML = "行動選項";
                    div.appendChild(_div);


                    ListMake(title,{},div,id , "attack_btn");

                    var _btn = document.querySelectorAll("table#attack_btn td");
                    
                
                    for(var i=0;i<_btn.length;i++)
                    {
                        CountDown( _btn[i],_btn[i].id,_btn[i].innerHTML,_btn[i].getAttribute("disabled"));
                    }

                
                    
                    DiceDivSet();


                    BattleLogList(battle,div,id);
                    


                    div.appendChild( document.createElement("p") );
                }
            );
            
        }
        else
        {
            WorkerBattleFunc(
                {
                    "act":"db_get",
                    "db_path":"/battle_ing/",
                    "limitToLast":10
                },
                function(e){

                var data = e.data;
                var battle = data.db_back;
                
                var title = {
                    "0":{
                        "title":"怪物名稱",
                        "html":"enemy_name",
                        "class":"btn",
                        "id":"id",
                        "event":{"click":function(){
                            if(confirm("確定要參戰嗎?")===false) return;
    

                            WorkerBattleFunc(
                                {
                                    "act":"db_get",
                                    "db_path":"/battle_ing/"+this.id
                                },
                                function(e)
                                {
                                    var data = e.data;
                                    var battle = data.db_back;
                        
                                    if(battle.char_end.account!="")
                                    {
                                        alert("戰鬥已結束");
                                        return;
                                    }
                        
                                    System.char.battle_sn = battle.id;
                                    DB.ref("/char/"+System.member.account+"/battle_sn").set(battle.id);
                        
                                    MenuClick("battle","open");
                                }
                            );



    
                        }}
                    },
                    "1":{
                        "title":"發現玩家",
                        "html":"char_start_word"
                    }
                }

                var list = [];
                for(var sn in battle)
                {
                    var list_idx = list.length;

                    list[list_idx] = battle[sn];
                    list[list_idx].id = sn;

                    list[list_idx].enemy_name = "";
                    if(battle[sn].enemy.boss=="boss")
                        list[list_idx].enemy_name += "【BOSS】<BR>";

                    list[list_idx].enemy_name += "【"+battle[sn].enemy.name + "LV" + battle[sn].enemy.lv+"】<BR>【"+sn+"】";

                    list[list_idx].char_start_word = "【"+battle[sn].char_start.name+"】<BR>"+DateFormat( new Date(battle[sn].time_start),"<BR>");
                }
                ListMake(title,list,div,id);
            });
        }
    }


    if(id=="battle_log")
    {
        var enemy = {};
            
        if(System.session.menu[id].list_id!="list")
        {
            WorkerBattleFunc(
                {
                    "act":"db_get",
                    "db_path":"battle/"+System.session.menu[id].list_id
                },
                function(e)
                {
                    var data = e.data;
                    var battle = data.db_back;


                    if(battle==null)
                    {
                        console.log("battle_null");
                        return;

                        System.session.menu.battle_log.list_id = "list";
                        sessionStorage.rpg = JSON.stringify(System.session);
                        MenuClick("battle_log","open");
                        return;
                    }

                    if(System.char.battle_sn!="" && 
                    System.char.battle_sn==battle.id && 
                    battle.log_end!=undefined)
                    {
                        var _reward = 
                        battle.log_end[ System.member.account ];

                        if(_reward!==undefined)
                        {
                            if(_reward.drop.exp)
                            {
                                _reward.drop.exp = Math.floor(_reward.drop.exp*_reward.c_hit/battle.enemy.hpm);

                                System.char.exp-=-1*_reward.drop.exp;
                            }

                            if(_reward.drop.money)
                            {
                                _reward.drop.money = Math.floor(_reward.drop.money*_reward.c_hit/battle.enemy.hpm);
                                System.char.item.money-=-1*_reward.drop.money;
                                OpenCharMenu("money");
                            }
                
                            for(var key in _reward.drop)
                            {
                                if(key=="exp" || key=="money") continue;
                
                                if(System.char.item[ key ]!=undefined)
                                    System.char.item[ key ].count-=-1;
                                else
                                    System.char.item[ key ] = _reward.drop[key];
                            }
                        }

                        System.char.battle_sn = "";

                        DB.ref("char/"+System.member.account).update(System.char);
                    }
                        

                    enemy = JSON.parse(JSON.stringify(battle.enemy));

                    
                    var title = {
                        "0":{
                            "title":"怪物狀態",
                            "html":"name"
                        },
                        "1":{
                            "title":"",
                            "html":"status1"
                        }
                    }

                    var list = [];
                    list["0"] = JSON.parse(JSON.stringify(enemy));
                    list["0"].name = "【LV"+enemy.lv+"】<BR>【"+enemy.name+"】";

                    //if(enemy.boss=="boss") list["0"].name = "【BOSS】<BR>" + list["0"].name;
                    

                    list["0"].name += "<HR>研究者<BR>【<span page=char_status id="+enemy.char_create.account+">"+enemy.char_create.name+"</span>】";

                    list["0"].status1 = 
                    "【"+System.c_s_word.hp +"】" + enemy.hp + "/" + enemy.hpm + "<BR>"+
                    "【"+System.c_s_word.mp +"】" + enemy.mp + "/" + enemy.mpm + "<BR>"+
                    "【"+System.c_s_word.atk +"】"+ enemy.atk + 
                    "【"+System.c_s_word.matk +"】"+ enemy.matk + "<BR>" + 
                    "【"+System.c_s_word.def + "】"+ enemy.def + 
                    "【"+System.c_s_word.mdef + "】"+ enemy.mdef + "<BR>" + 
                    "【"+System.c_s_word.agi + "】"+ enemy.agi + 
                    "【"+System.c_s_word.magi + "】"+ enemy.magi + "<BR>" + 
                    "【"+System.c_s_word.hit + "】"+ enemy.hit + 
                    "【"+System.c_s_word.mhit + "】"+ enemy.mhit;
                    


                    var _div = document.createElement("div");
                    _div.className = "info";
                    _div.innerHTML = "記錄編號【"+System.session.menu[id].list_id+"】";
                    div.appendChild(_div);

                    var _div = document.createElement("div");
                    _div.className = "info btn";
                    _div.innerHTML = "回到列表";
                    _div.addEventListener("click",function(){
                        
                        System.session.menu[id].list_id = "list";
                        sessionStorage.rpg = JSON.stringify(System.session);
                        MenuClick("battle_log","open");
                    });

                    div.appendChild(_div);
                    div.appendChild( document.createElement("p") );


                    if(enemy.pic!=undefined && enemy.pic!="")
                    {
                        var _div = document.createElement("div");
                        _div.className = "pic";
                        _div.innerHTML = "<img src="+enemy.pic+">";
                        div.appendChild(_div);
                    }


                    ListMake(title,list,div,id);
                    div.appendChild( document.createElement("p") );


                    var title = {
                        "0":{
                            "title":"發現玩家",
                            "html":"char_start_word"
                        },
                        "1":{
                            "title":"最後一擊",
                            "html":"char_end_word"
                        }
                    }
                    
                    var list = [];
                    list["0"] = {};
                    list["0"].char_start_word = "【"+battle.char_start.name+" LV"+battle.char_start.lv+"】<BR>"+DateFormat( new Date(battle.time_start));
                    
                    list["0"].char_end_word = "尚未結束";

                    
                    if(battle.time_end!="")
                        list["0"].char_end_word = "【"+battle.char_end.name+" LV"+battle.char_end.lv+"】<BR>"+DateFormat( new Date(battle.time_end));



                    ListMake(title,list,div,id);
                    div.appendChild( document.createElement("p") );


                    BattleLogList(battle,div,id);

                    div.appendChild( document.createElement("p") );


                    var title = {
                        "0":{
                            "title":"參戰玩家戰果",
                            "html":"info"}
                    };



                    var list = [];

                    for(var _id in battle.log_end)
                    {
                        var _data = battle.log_end[_id].drop;

                        var list_idx = list.length;

                        list[ list_idx ] = list[ list_idx ]||{};
                        list[ list_idx ].info = "【"+System.tmp[_id]+"】<hr>";

                        for(var key in _data)
                        {
                            if(key=="money")
                            {
                                list[ list_idx ].info += 
                                "<BR>獲得金錢【"+_data[key]+"】";
                                
                            }
                            else if(key=="exp")
                            {
                                list[ list_idx ].info += 
                                "<BR>獲得經驗【"+_data[key]+"】";
                                
                            }
                            else
                            {
                                list[ list_idx ].info += 
                                "<BR>獲得道具【"+_data[key].name+"】";
                            }
                        }
                    }

                    ListMake(title,list,div,id);
                    div.appendChild( document.createElement("p") );

                }
            );
        }
        else
        {

            var orderByChild = System.session.search[id].orderByChild||"";
            var equalTo = System.session.search[id].equalTo||"";


            WorkerBattleFunc(
                {
                    "act":"db_get",
                    "db_path":"/battle/",
                    "orderByChild":orderByChild,
                    "equalTo":equalTo,
                    "limitToLast":10
                },
                function(e)
                {
                    var data = e.data;
                    var battle = data.db_back;

                    var title = {
                        "0":{
                            "title":"",
                            "html":"detail",
                            "id":"id",
                            "class":"btn",
                            "event":{"click":function(){
        
                                System.session.menu[id].list_id = this.id;
                                sessionStorage.rpg = JSON.stringify(System.session);
        
                                MenuClick("battle_log","open");
                            }}
                        },
                        "1":{
                            "title":"戰鬥記錄",
                            "html":"info",
                        }
                    }
        
                    var list = [];
                    for(var sn in battle)
                    {    
                        var _value = battle[sn];
                        var list_idx = list.length;
                        _value.log = _value.log||{};
        
        
                        list[list_idx] = {};
                        list[list_idx].id = sn;
        
                        list[list_idx].detail = "詳細";
        
                        list[list_idx].info = sn + 
                        "("+Object.keys(_value.log).length+"回合)<P></P>";
        
                        //if(_value.enemy.boss=="boss")
                            //list[list_idx].info += "【BOSS】<BR>";
                        

                        list[list_idx].info += "【"+battle[sn].enemy.name + " LV"+battle[sn].enemy.lv+"】";
        
        
                        list[list_idx].info += 
                        "<HR>【<span page=char_status id="+battle[sn].char_start.account+">"+
                        battle[sn].char_start.name+"</span> LV"+
                        battle[sn].char_start.lv+"】<BR>"+
                        DateFormat( new Date(battle[sn].time_start) );
                        
        
                        if(battle[sn].char_end.account!="")
                        {
                            list[list_idx].info += 
                            "<HR>【<span page=char_status id="+battle[sn].char_end.account+">"+
                            battle[sn].char_end.name+"</span> LV"+
                            battle[sn].char_end.lv+"】<BR>"+
                            DateFormat( new Date(battle[sn].time_end) );
                        }
                        else
                        {
                            list[list_idx].info += 
                            "<HR><span class=red page>尚未結束</span>";
                        }

                    }
                    list.reverse();
        
                    var _div = document.createElement("div");
                    _div.innerHTML = "記錄清單";
                    _div.className = "info";
                    div.appendChild(_div);
        
                    _div.appendChild( SearchBar("id") );
        
                    ListMake(title,list,div,id);
                }
            );
        }        
    }

    if(id=="money_log")
    {
        var ref = DB.ref("/money_log");

        var orderByChild = System.session.search[id].orderByChild||"";
        var equalTo = System.session.search[id].equalTo||"";

        var _list = ["taker/name","payer/name"];

        if(_list.indexOf(orderByChild)==-1 && orderByChild!="")
        {
            equalTo = orderByChild;
            orderByChild = "memo/type";
        }

        if(orderByChild!="")
            ref = ref.orderByChild(orderByChild).equalTo(equalTo);
        
            
        
        ref.limitToLast(30).once("value",function(money_log){
            money_log = money_log.val();

            var list = [];

            var title = {
                "0":{
                    "title":"發生時間",
                    "id":"id",
                    "html":"time"},
                "1":{
                    "title":"詳細資訊",
                    "html":"info"},
            };



            var skillitem_type_ary = {
                "skill_new" : "開發新技能",
                "skill_lvup" : "強化技能",
                "equipment_new" : "鍛造新裝備",
                "equipment_lvup" : "強化裝備",
            }

            var enemy_type_ary = {
                "search_monster": "探索怪物報告",
                "del_enemy":"廢棄怪物報告"
            }

            var deldata_type_ary = {
                "del_equipment": "永久銷毀裝備",
                "del_skill":"永久封印技能"
            }

            
            for(var key in money_log)
            {
                var idx = list.length;
                var data = money_log[key];

                list[ idx ] = data;

                data.id = key;
                data.time = DateFormat( new Date(data.time) );

                data.info = "";

                if(data.memo.type=="new_battle")
                {
                    data.info = "成功討伐【"+data.memo.name+" LV"+data.memo.lv+"】<BR>戰鬥記錄編號：<span page=battle_log id="+data.memo.id+">"+data.memo.id+"</span><BR>這都要歸功於【<span page=char_status id="+data.taker.account+">"+data.taker.name+"</span>】的調查報告<BR>銀行贊助調查費用"+data.add_money+"元";
                }


                if(data.memo.type=="new_member")
                {
                    data.info = "新玩家【"+(data.memo.name)+"】加入，銀行資產增加100金錢";
                }


                if(data.memo.type=="buy")
                {
                    data.info = "【"+data.payer.name+"】花費"+data.lost_money+"金錢購買【"+data.memo.name+"】";

                    if(data.taker=="bank")
                        data.info += "<BR>【銀行】收到"+data.add_money+"金錢";
                    else
                        data.info += "<BR>【"+data.taker.name+"】收到"+data.add_money+"金錢";
                }

                if(data.memo.type=="sold")
                {
                    data.info = "【"+data.taker.name+"】賣出【"+data.memo.name+"】得到"+data.add_money+"金錢";

                    if(data.payer=="bank")
                        data.info += "<BR>【銀行】以"+data.lost_money+"金錢收購";
                    else
                        data.info += "<BR>【"+data.payer.name+"】退回"+data.lost_money+"金錢";
                }


                if(data.memo.type=="skillitem_lvup")
                {
                    data.info = "【"+data.payer.name+"】花費"+data.lost_money+"金錢升級【"+data.memo.name+"】";

                    data.info += "<BR>【"+data.taker.name+"】收到"+data.add_money+"金錢";
                }

                if( skillitem_type_ary[data.memo.type ]!=undefined )
                {
                    data.info = "【"+data.payer.name+"】花費"+data.lost_money+"金錢"+skillitem_type_ary[ data.memo.type ]+"【"+data.memo.name+"】";

                    data.info += "<BR>【銀行】收到"+data.add_money+"金錢";
                }

                if( enemy_type_ary[ data.memo.type ]!=undefined )
                {
                    if(data.memo.type=="search_monster")
                    {
                        data.info = "【"+data.payer.name+"】花費"+data.lost_money+"元調查【"+data.memo.quest_name+"】地區發現新怪物【"+data.memo.name+" LV"+data.memo.lv+"】";

                        data.info += "<BR>【銀行】收到"+data.add_money+"金錢";
                    }
                    else if(data.memo.type=="del_enemy")
                    {
                        data.info = "【"+data.taker.name+"】廢棄【"+data.memo.quest_name+"】地區的【"+data.memo.name+" LV"+data.memo.lv+"】報告得到"+data.add_money+"費用";

                        data.info += "<BR>【銀行】退回"+data.add_money+"金錢";
                    }
                }


                if( deldata_type_ary[data.memo.type ]!=undefined )
                {
                    data.info = "【"+data.taker.name+"】"+deldata_type_ary[ data.memo.type ]+"【"+data.memo.name+"】得到"+data.add_money+"金錢";

                    data.info += "<BR>【銀行】補償"+data.lost_money+"金錢";
                }
            }

            list.reverse();

            //var page_data = {};
            //page_data.nex = list.pop();
            //page_data.bef = list["0"];


            var _div = document.createElement("div");
            _div.className = "info";
            _div.innerHTML = "【銀行公告】<HR>";
            _div.innerHTML += "銀行目前資產："+System.config.bank_money+"<BR>";
            

            div.appendChild(_div);
            
            var _div = document.createElement("div");
            _div.className = "info";
            _div.appendChild( SearchBar(  ) );
            div.appendChild(_div);

            ListMake(title,list,div,id);


            //PageMake(div,id,page_data);

        });
    }

    setTimeout(function()
    {
        if(document.querySelector("div#"+id+" div#Main")!=null)
        {
            document.querySelector("div#"+id).style.height = 
            document.querySelector("div#"+id+" div#Main").clientHeight + "px";
        }
    },500);

    ServerTime();    
}




function QuestGo(obj)
{
    var id = obj.id;
    var name = obj.getAttribute("name");

    if(id==-1)
    {
        alert("探索條件不符");
        return;
    }

    if(System.char.battle_sn!="")
    {
        MenuClick("battle","open");
        return;
    }

    if( confirm("確定要探索【"+name+"】?")===false ) return;

    DB.ref("area/"+id).once( "value",area=>{

        area = area.val();

        if(area==null)
        {
            MenuClick("area","open");
            return;
        }

        if(area.boss!="")
        {
            alert("BOSS戰尚未結束");
            MenuClick("battle","open");
            return;
        }


        DB.ref("char/"+System.member.account).once("value",function(char){
            System.char = char.val();
        }).then(function(){

            var check_need = true;
            for(var _n in area.need)
            {
                if( System.char[_n] < area.need[_n])
                    check_need = false;
            }

            if(check_need==false)
            {
                alert("探索條件不符");
                return;
            }

            BattleCreate(area);
        });


        
    });
}


function BattleCreate(area)
{
    DB.ref("enemy/").orderByChild("area/id").equalTo(area.id).once( "value",enemy_list=>{

        enemy_list = enemy_list.val();

        if(enemy_list==null)
        {
            alert("此區域尚無怪物");
            return;
        }

        if(Object.keys(enemy_list).length==0)
        {
            alert("此區域尚無怪物");
            return;
        }

        var enemy_filter = {
            "dead":[],
            "kill":[],
            "dead_max":0,
            "kill_max":0,
            "dead_min":0,
            "kill_min":0
        };
        for(var _id in enemy_list)
        {
            var _value = enemy_list[_id];

            enemy_filter.dead.push(_value.dead);
            enemy_filter.kill.push(_value.kill);
        }

        for(var key in enemy_filter)
        {
            var _value = enemy_filter[key];
            if( !Array.isArray(_value) )
            {
                if(key.split("_")[1]=="max")
                {
                    enemy_filter[key] = Math.max.apply(null,enemy_filter[key.split("_")[0]]);
                }
                if(key.split("_")[1]=="min")
                {
                    enemy_filter[key] = Math.min.apply(null,enemy_filter[key.split("_")[0]]);
                }
            }
        }
        
        var filter_list = [];
        for(var _id in enemy_list)
        {
            var _value = enemy_list[_id];

            
            if(_value.on=="off" || 
            _value.group<=0 ) continue;

            //if(_value.char_create.account==System.member.account) continue

            filter_list.push(_id);
        }

        if(filter_list.length<=0)
        {
            alert("此區域尚無怪物");
            return;
        }


        Shuffle(filter_list);

        var enemy = enemy_list[ filter_list.pop() ];

        
        enemy.group-=1;
        DB.ref("/enemy/"+enemy.id+"/group").set(enemy.group);

        area.exp-=-1;
        DB.ref("area/"+area.id).update(area);


        battle = {};
        battle.enemy = enemy;
        battle.char_start = {
            "account":System.member.account,
            "name":System.char.name,
            "lv":System.char.lv
        };
        battle.char_end = {
            "account":"",
            "name":"",
            "lv":""
        };
        battle.time_start = firebase.database.ServerValue.TIMESTAMP;
        battle.time_end = "";

        WorkerBattleFunc( {
            "act":"db_set",
            "mode":"new_battle",
            "db_data":battle,
            "db_path":"/battle_ing/"
        } , function(e){

            var data = e.data;

            System.char.battle_sn = data.db_back.id;
            battle = data.db_back;

            /*
            if(battle.enemy.boss=="boss")
            {
                DB.ref("area/"+battle.enemy.area.id+"/boss").set(data.db_back.id);
            }
            */

            DB.ref("char/"+System.member.account+"/battle_sn").set(System.char.battle_sn);

            setTimeout(function(){
                MenuClick("battle","open");
            },500);
            
        });
    });

}


function JoinBattle(battle_sn)
{
    WorkerBattleFunc(
        {
            "act":"db_get",
            "db_path":"battle_ing/"+battle_sn
        },
        function(e)
        {
            var data = e.data;
            var battle = data.db_back;

            if(battle.char_end.account!="")
            {
                alert("戰鬥已結束");
                return;
            }

            System.char.battle_sn = battle_sn;
            DB.ref("/char/"+System.member.account+"/battle_sn").set(battle_sn);

            MenuClick("battle","open");
        }
    );    
}


function BattleAct(obj)
{
    if( Math.ceil((System.char.time_last.attack - System.time)/1000)>0 )
    {
        console.log( Math.ceil((System.char.time_last.attack - System.time)/1000) );
        return;
    }

    if(confirm("確定要發動【"+obj.getAttribute("title")+"】?")==false) return;


    DB.ref("char/"+System.member.account).once("value",function(char){
        System.char = char.val();
    }).then(function(){

        var check_type = ["skill","equipment"];

        var check_need = true;
        for(var type of check_type)
        {
            var need = {};
            for(var key in System.char[type])
            {
                var _data = System.char[type][key];

                if(_data.use!="use") continue;

                for(var row in _data.need)
                {
                    need[row] = need[row]||0;
                    need[row]-=-1*_data.need[row];
                }
            }

            for(var row in need)
            {
                if(System.char[row]<need[row])
                {
                    check_need = false;
                }
            }
        }

        if(check_need==false)
        {
            alert("裝備,技能需求超過上限無法進行戰鬥");
            return;
        }
    


        if(System.char.battle_sn=="")
        {
            location.reload();
            return;
        }

        if(System.char.hp<=0)
        {
            alert("角色死亡中，無法戰鬥");
            return;
        }

        WorkerBattleFunc(
            {
                "act":"battle_act",
                "db_path":"/battle_ing/",
                "System":JSON.parse(JSON.stringify(System)),
                "char":System.char,
                "attack_id":obj.id
            },
            function(e)
            {
                BattleActBack(e.data);
            }
        );

    });//then
}

function BattleActBack(data)
{
    System.member.dice = System.member.dice||{};

    System.dice_select = {};
    delete System.member.dice;
    delete System.member.dice_rand_six;
    var _tmp = {"rpg":System.member};
    localStorage.kfs = JSON.stringify(_tmp);


    var battle = data.battle;
    var char = data.char;
    System.char = char;
    

    if(data.battle==null)
    {
        System.session.menu.battle_log.list_id = System.char.battle_sn;
        MenuClick("battle_log","open");
        return;
    }

    var enemy = battle.enemy;

    if(char.hp<=0)
    {
        DB.ref("enemy/"+battle.enemy.id).once("value",_enemy=>{

            _enemy = _enemy.val();
            _enemy.kill-=-1;

            if(_enemy.group_type=="group2")
            _enemy.exp-=-1*char.hpm*2;

            if(_enemy.group_type=="group1")
                _enemy.exp-=-1*char.hpm;

            if(_enemy.exp>=_enemy.expm)
            {
                MonsterLvUP(_enemy);
            }

            _enemy.skill = enemy.skill||{};
            _enemy.equipment = enemy.equipment||{};

            console.log(_enemy);

            DB.ref("enemy/"+enemy.id).update(_enemy);
        });

        char.hp = char.hpm;
        char.mp = char.mpm;
        char.buff = {};
        char.debuff = {};
    }

    DB.ref("char/"+System.member.account).update(System.char);

    if(enemy.hp<=0)
    {
        DB.ref("enemy/"+battle.enemy.id).once("value",_enemy=>{

            _enemy = _enemy.val();
            _enemy.dead-=-1;

            if(_enemy.group_type=="group1")
                _enemy.exp-=-1*char.hpm*2;

            if(_enemy.group_type=="group2")
                _enemy.exp-=-1*char.hpm;

            if(_enemy.exp>=_enemy.expm)
            {
                MonsterLvUP(_enemy);
            }

            _enemy.skill = enemy.skill||{};
            _enemy.equipment = enemy.equipment||{};

            console.log(_enemy);

            DB.ref("enemy/"+enemy.id).update(_enemy);
        });

        

        System.session.menu.battle_log.list_id = System.char.battle_sn;
        sessionStorage.rpg = JSON.stringify(System.session);

        setTimeout(function(){
            MenuClick("battle_log","open");
        },500);
        

        
        return;
    }
    else
    {

        DiceDivSet("reset");

        var this_log = battle.log[ Object.keys(battle.log).length-1 ];

        var enemy_status = 
            document.querySelector("table#enemy").querySelectorAll("tr")[1].querySelectorAll("td")[1];

        var char_status = 
            document.querySelector("table#char").querySelectorAll("tr")[1].querySelectorAll("td")[1];

        enemy_status.innerHTML = 
        "【"+System.c_s_word.hp +"】" + enemy.hp + "/" + enemy.hpm + "<BR>"+
        "【"+System.c_s_word.mp +"】" + enemy.mp + "/" + enemy.mpm + "<BR>"+
        "【"+System.c_s_word.atk +"】"+ enemy.atk + 
        "【"+System.c_s_word.matk +"】"+ enemy.matk + "<BR>" + 
        "【"+System.c_s_word.def + "】"+ enemy.def + 
        "【"+System.c_s_word.mdef + "】"+ enemy.mdef + "<BR>" + 
        "【"+System.c_s_word.agi + "】"+ enemy.agi + 
        "【"+System.c_s_word.magi + "】"+ enemy.magi + "<BR>" + 
        "【"+System.c_s_word.hit + "】"+ enemy.hit + 
        "【"+System.c_s_word.mhit + "】"+ enemy.mhit;

        

        char_status.innerHTML = 
        "【"+System.c_s_word.hp +"】" + char.hp + "/" + char.hpm + "<BR>"+
        "【"+System.c_s_word.mp +"】" + char.mp + "/" + char.mpm + "<BR>"+
        "【"+System.c_s_word.atk +"】"+ char.atk + 
        "【"+System.c_s_word.matk +"】"+ char.matk + "<BR>" + 
        "【"+System.c_s_word.def + "】"+ char.def + 
        "【"+System.c_s_word.mdef + "】"+ char.mdef + "<BR>" + 
        "【"+System.c_s_word.agi + "】"+ char.agi + 
        "【"+System.c_s_word.magi + "】"+ char.magi + "<BR>" + 
        "【"+System.c_s_word.hit + "】"+ char.hit + 
        "【"+System.c_s_word.mhit + "】"+ char.mhit;
        


        var table = document.querySelector("table#battle_log");
        
        var tr = document.createElement("tr");
        
        table.insertBefore(tr,table.querySelectorAll("tr")[1]);

        var td = document.createElement("td");
        td.innerHTML = Object.keys(battle.log).length;

        tr.appendChild(td);

        var td = document.createElement("td");

        
        td.innerHTML = this_log.word;
        
        td.innerHTML += "<HR>";

        if( Object.keys(this_log.dice).length>0 )
        {
            var log_dice_list = document.createElement("div");
            log_dice_list.style = "height:60px";
            for(var key in this_log.dice)
            {
                var _dice = this_log.dice[key];

                var log_dice = document.createElement("div");
                log_dice.className = "dice";
                log_dice.id = _dice.split(":")[0];
                if(_dice.split(":")[0]=="six")
                {
                    log_dice.style.background = "#eee";
                    log_dice.innerHTML = _dice.split(":")[1];
                }
                else
                {
                    log_dice.style.background = "#ff0";
                    log_dice.innerHTML = _dice.split(":")[1];
                }

                log_dice_list.appendChild(log_dice);

            }
            td.innerHTML+=log_dice_list.outerHTML;
        }

        td.innerHTML += "<BR>"+DateFormat( new Date(System.time) );

        tr.appendChild(td);


        var _btn = document.querySelectorAll("table#attack_btn td");
        
        for(var i=0;i<_btn.length;i++)
        {
            CountDown( _btn[i],_btn[i].id,_btn[i].innerHTML);
        }


        DivMainClientHeight();
    }

}



function ObjUse(obj)
{
    var id = obj.id
    var name = obj.getAttribute("name");
    var type = obj.getAttribute("obj_type");
    
    var _data = System.char.skill[id];

    if(type!="skill")
    {
        _data = System.char.equipment[id];
    }
    
    var on_set = "";
    var alt_msg = "";
    var btn_word = "";

    if(type=="equipment")
    {
        if(System.char.equipment[ id ].on=="on" )
        {
        
            if( confirm("確定要卸下【"+name+"】嗎?")===false ) return;

            alt_msg = "卸下【"+name+"】成功";

            btn_word = "裝備";
            on_set = "off";

            System.char.equipment[ id ].on = on_set;        
        }
        else
        {
            if( confirm("確定要裝備【"+name+"】嗎?")===false ) return;

            alt_msg = "裝備【"+name+"】成功";

            for(var _id in System.char.equipment)
            {
                var _data = System.char.equipment[_id];
                if(_data.part==System.char.equipment[ id ].part && 
                    _id!=id)
                {
                    _data.on = "off";
                    document.querySelector("div.ListDiv div[id='"+_id+"']").className = "off";
                }
            }

            
            btn_word = "卸下";
            on_set = "on";

            System.char.equipment[ id ].on = on_set;
        }
    }
    else
    {
        if(System.char.skill[id].on=="on")
        {
            if( confirm("確定要取消【"+name+"】嗎?")===false ) return;

            System.char.skill[ id ].on = "off";
            alt_msg = "取消【"+name+"】成功";
            
            btn_word = "準備";
            on_set = "off";
        }
        else
        {
            if( confirm("確定要準備【"+name+"】嗎?")===false ) return;


            System.char.skill[ id ].on = "on";
            alt_msg = "準備【"+name+"】成功";

            
            if( System.char.skill[ id ].type.active=="buff" )
            for(var _id in System.char.skill)
            {
                var _data = System.char.skill[_id];
                if(_data.part==System.char.skill[ id ].part && 
                    _data.type.active=="buff" &&
                    _id!=id)
                {
                    _data.on = "off";
                    document.querySelector("div.ListDiv div[id='"+_id+"']").className = "off";
                }
            }
            

            btn_word = "取消";
            on_set = "on";
        }

    }


    DB.ref("/char/"+System.member.account).set( System.char );

    document.querySelector("div.ListDiv div[id='"+id+"']").className = on_set;
    obj.value = btn_word;

    //obj.parentElement.parentElement.parentElement.style.display = "none";
    
    alert(alt_msg);

    
}







function ObjSold(obj)
{
    var id = obj.id;
    var name = obj.getAttribute("name");
    var type = obj.getAttribute("obj_type");

    var _obj = System.char[type][id];



    if(confirm("確定要賣出【"+name+"】嗎?\n("+_obj.money+"元)")===false) return;

    if(_obj===undefined)
    {
        alert("無此商品");
        return;
    }

    if(type!="item")
    if(_obj.char_create.account==System.member.account)
    {
        alert("本人開發不可賣出，只可在工房銷毀或封印");
        return;
    }


    if(type=="item")
    {
        System.char[type][id].count--;

        if(System.char[type][id].count==0)
            delete System.char[type][id];
    }
    else
    {
        delete System.char[type][id];
    }



    var money_log = {
        "payer":"",
        "taker":{
            "name":System.char.name,
            "account":System.member.account
        },
        "lost_money":_obj.money,
        "add_money":_obj.money,
        "memo":{
            "type":"sold",
            "name":name
        }
    };

    if(_obj.drop_enemy!=undefined)
    {
        money_log.payer = "bank";
        
        DbRowAdd(DB,"/system/config/bank_money",-1*_obj.money,money_log);
    }
    else
    {
        money_log.payer = {
            "name":_obj.char_create.name,
            "account":_obj.char_create.account
        }

        DbRowAdd(DB,"char/"+_obj.char_create.account,-1*_obj.money,money_log);
    }


    
    System.char.item.money-=-1*_obj.money;
    OpenCharMenu("money");

    DB.ref("/char/"+System.member.account).update( System.char );
    

    if(document.querySelector("#char_money")!=null)
        document.querySelector("#char_money").innerHTML = System.char.item.money;
    

    if(type=="item")
    {
        DB.ref("/"+type+"/"+id+"/count").once("value",function(_count){
            _count = _count.val();
            if(_count==null)
            {
                _obj.count = 1;
                DB.ref("/"+type+"/"+_obj.id).set(_obj);
            }
            else
            {
                _count -= -1;
                DB.ref("/"+type+"/"+id+"/count").set(_count);
            }
            alert("賣出【"+name+"】獲得"+_obj.money+"元");
            MenuClick("item","open");
            
        });

        return;
    }
    else
    {
        document.querySelector("div.ListDiv div[id='"+id+"']").remove();
    }

     obj.parentElement.parentElement.parentElement.style.display = "none";

    alert("賣出【"+name+"】獲得"+_obj.money+"元");
}


function ObjBuy(obj)
{
    var id = obj.id;
    var name = obj.getAttribute("name");
    var type = obj.getAttribute("obj_type");


    if(confirm("確定要購買【"+name+"】嗎?")===false) return;
    

    DB.ref("/char/"+System.member.account+"/item/money").once("value",function(_money){
        System.char.item.money = _money.val();

    }).then(function(){
    DB.ref("/"+type+"/"+id).once("value",function(_obj){

        _obj = _obj.val();

        if(_obj==null) return;

        if(_obj.on!="on")
        {
            alert("項目已下架");
            return;
        }

        if(_obj.money>System.char.item.money)
        {
            alert("金錢不足");
            return;
        }
    
        System.char[type] = System.char[type]||{};

        if(type=="item")
        {
            _obj.count--;
            if(System.char[type][ id ]!=undefined)
            {
                System.char[type][ id ].count-=-1;
            }
            else
            {
                System.char[type][ id ] = JSON.parse(JSON.stringify(_obj));
                System.char[type][ id ].count = 1;
            }
        }
        else
        {
            if(System.char[type][ id ]!=undefined)
            {
                alert("角色已有【"+name+"】該項目。");
                return;
            }
            else
            {
                System.char[type][ id ] = JSON.parse(JSON.stringify(_obj));
                System.char[type][ id ].on = "off";
            }
        }
        
        System.char.item.money-=_obj.money;
        OpenCharMenu("money");

        if(_obj.char_create==undefined)
        {
            _obj.char_create = {
                "account":_obj.drop_enemy.id,
                "name":_obj.drop_enemy.name
            };
        }


        var money_log = {
            "payer":{
                "name":System.char.name,
                "account":System.member.account
            },
            "taker":{
                "account":_obj.char_create.account,
                "name":_obj.char_create.name
            },
            "lost_money":_obj.money,
            "add_money":_obj.money,
            "memo":{
                "type":"buy",
                "name":name
            }
        };


        if(_obj.drop_enemy!=undefined)
        {
            money_log.taker = "bank";

            DbRowAdd(DB,"/system/config/bank_money",_obj.money,money_log);
        }
        else
        {
            DbRowAdd(DB,"/char/"+_obj.char_create.account+"/item/money",_obj.money,money_log);
        }


        _obj.soldcount++

        if(type=="item")
        {
            if(_obj.count<=0)
                DB.ref("/"+type+"/"+id).remove();
            else
                DB.ref("/"+type+"/"+id).update( _obj );    
        }
        else
        {
            DB.ref("/"+type+"/"+id).update( _obj );
        }
            

        DB.ref("/char/"+System.member.account).update( System.char );


        //alert("花費"+_obj.money+"元成功購買【"+name+"】");


        MenuClick(type,"open");
    });
    });
}


function ObjLvUP(obj)
{
    var id = obj.id;
    var name = obj.getAttribute("name");
    var type = obj.getAttribute("obj_type");
    

    DB.ref("/char/"+System.member.account+"/item/money").once("value",_money=>{
        System.char.item.money = _money.val();

    }).then(function(){
    DB.ref("/"+type+"/"+id).once("value",function(data){

        data = data.val();
        if(data==null)
        {
            alert("無此項目可強化");
            return;
        }

        var char_have;
        if(type=="equipment")
        {
            char_have = System.char.equipment[id];
        }
        else
        {
            char_have = System.char.skill[id];
        }

        if(char_have==undefined)
        {
            alert("無此項目可強化");
            return;
        }

        var lvup_money = data.money - char_have.money;

        if(lvup_money<=0)
        {
            alert("目前已為最高強化品質");
            return;
        }


        if( confirm("確定要強化【"+name+"】嗎?\n(強化需"+lvup_money+"元)")==false) return;

        if((System.char.item.money-lvup_money)<0)
        {
            alert("強化費用不足\n(強化需"+lvup_money+"元)");
            return;
        }



        var money_log = {
            "payer":{
                "name":System.char.name,
                "account":System.member.account
            },
            "taker":{
                "name":data.char_create.name,
                "account":data.char_create.account
            },
            "lost_money":lvup_money,
            "add_money":lvup_money,
            "memo":{
                "type":"skillitem_lvup",
                "name":name
            },
            "time":firebase.database.ServerValue.TIMESTAMP
        };

        DBGetId(DB,"/money_log",function(get_id){

            money_log.id = get_id;

            if(money_log.lost_money>0 || money_log.add_money>0)
            {
                DB.ref("/money_log/"+money_log.id).set(money_log);
            }
        });

        //更新購買玩家本身之資料
        System.char[type][id] = data;

        if(data.char_create.account!=System.member.account)
        {
            System.char.item.money-=lvup_money;
            OpenCharMenu("money");

            DB.ref("/char/"+System.member.account).update( System.char );
        }
        else
        {
            DB.ref("/char/"+System.member.account).update( System.char );
        }

        /*
        if(type=="equipment")
        {
            System.char.equipment[id] = data;

            DB.ref("/char/"+System.member.account+"/equipment").update( System.char.equipment );
        }
        else
        {
            
            DB.ref("/char/"+System.member.account+"/skill").update( System.char.skill );
        }*/


        if(document.querySelector("#char_money")!=null)
        document.querySelector("#char_money").innerHTML = System.char.item.money;
    
        //alert("強化完成");
        
        MenuClick(type,"open");
        
    });
    });
}




function SortData(list,row,mode = 1)
{
    var _list = [];
    for(var idx in list)
    {
        var _list_idx = _list.length;
        _list[ _list_idx ] = list[idx];

        _list[ _list_idx ]["_sort"] = list[idx][row];
    }

    if(mode==1)
    {
        _list.sort(function(a,b){
            if(a._sort>b._sort) return -1;
            return 1;
        });
    }
    else
    {
        _list.sort(function(a,b){
            if(a._sort>b._sort) return 1;
            return -1;
        });
    }
    



    for(var idx in _list)
    {
        delete _list[idx]["_sort"];
    }


    return _list;
}



function ListDiv(list,div,_class)
{
    var _div = document.createElement("div");
    _div.className = "ListDiv";

    if( _class!=undefined )
        _div.classList.add(_class);

    for(var idx in list)
    {
        var _value = list[idx];

        var div_list = document.createElement("div");
        div_list.innerHTML = _value.div_word;
        div_list.id = _value.id;

        if(_value.add_class!=undefined)
            div_list.classList.add(_value.add_class);


        _div.appendChild(div_list);
    }

    var detail = document.createElement("div");
    detail.className = "detail";
    detail.setAttribute("draggable","true");

    var btn_close = document.createElement("input");
    btn_close.type = "button";
    btn_close.value = "關閉";
    var detail_content = document.createElement("div");

    

    detail.appendChild(detail_content);
    detail.appendChild(btn_close);
    div.appendChild(detail);


    div.appendChild(_div);

    btn_close.addEventListener("click",function(){

        this.parentElement.style.display = "none";
    });

    _div.addEventListener("click",function(e){
        for(var key in e.path)
        {
            if(e.path[key].parentElement==this)
            {
                var _id = e.path[key].id;
                detail_content.innerHTML = list[ _id ].detail_content;
                detail.style.display = "block";

                var _btn = detail.querySelectorAll("[func]");
                
                for(var i=0;i<_btn.length;i++)
                {
                    _btn[i].addEventListener(
                        list[_id][_btn[i].getAttribute("func")+"_func"].type,
                        list[_id][_btn[i].getAttribute("func")+"_func"].func);
                }
            }
        }
    });


    
    var id;
    for(var _id in System.session.menu)
    {
        if( System.session.menu[_id].open=="open" )
        {
            id = _id;
        }
    }

    document.querySelectorAll("#Menu ul>div").forEach(function(div){
        div.innerHTML = "";
    });
    document.querySelector("div#"+id).appendChild(div);


    //裝備 被動技能 滑鼠移到上面標註哪些屬性加成
    document.querySelectorAll(".ListDiv div").forEach(function(div){

        div.addEventListener("mouseover",function(){

            document.querySelectorAll("input[parent_id]").forEach(function(input){
                input.classList.remove("focus");
            });

            document.querySelectorAll("input[parent_id='"+this.id+"']").forEach(function(input){
                input.classList.add("focus");
            });
        });

        div.addEventListener("mouseout",function(){

            document.querySelectorAll("input[parent_id]").forEach(function(input){
                input.classList.remove("focus");
            });
        });

    });

    setTimeout(function()
    {
        document.querySelector("div#"+id).style.height = document.querySelector("div#"+id+" div#Main").clientHeight + "px";
    },0);
}






//menu=>obj,div=>div容器
function ListMake(title,list,div,id, table_id = "")
{
    var table = document.createElement("table");
    table.className = "ListTable"

    if(table_id!="")
    {
        table.id = table_id;
    }

    var tr = document.createElement("tr");
    

    for(var row in title)
    {
        var td = document.createElement("td");

        td.innerHTML = title[row].title;

        //td.setAttribute("id",title[row].id||"");
        td.className = title[row].title_class||"";

        for(var e_type in title[row].title_event)
        {
            td.addEventListener(e_type,title[row].title_event[e_type]);
        }
        delete title[row].title_event;

        for(var k in title[row])
        {
            if(k=="html" || k=="value") continue;

            td.setAttribute(k,title[row][k]||"");
        }

        tr.appendChild(td);
    }
    table.appendChild(tr);

    
    for(var a in list)
    {
        var tr = document.createElement("tr");

        for(var row in title)
        {
            var td = document.createElement("td");

            td.innerHTML = list[a][ title[row].html ];

            for(var _i in title[row])
            {
                if( list[a][ title[row][_i] ]!=undefined)
                if(_i=="html" || _i=="value") continue;

                td.setAttribute(_i,list[a][ title[row][_i] ]||"");
            }

            td.setAttribute("id",list[a][ title[row].id ]||"");
            td.className = title[row].class||"";

            for(var e_type in title[row].event)
            {
                td.addEventListener(e_type,title[row].event[e_type]);
            }

            tr.appendChild(td);
        }

        table.appendChild(tr);
    }

    div.appendChild(table);


    document.querySelectorAll("#Menu ul>div").forEach(function(div){
        div.innerHTML = "";
    });
    document.querySelector("div#"+id).appendChild(div);

    setTimeout(function()
    {
        document.querySelector("div#"+id).style.height = document.querySelector("div#"+id+" div#Main").clientHeight + "px";
    },0);

}



function PageMake(div,id,page_data)
{

    var now_page;
    for(var _id in System.session.menu)
    {
        if( System.session.menu[_id].open=="open" )
            now_page = _id;
    }
    System.session.page = System.session.page||{};


    var bef_btn = document.createElement("input");
    bef_btn.type = "button";
    bef_btn.value = "上一頁";

    var nex_btn = document.createElement("input");
    nex_btn.type = "button";
    nex_btn.value = "下一頁";

    div.appendChild(bef_btn);
    div.appendChild(nex_btn);

    nex_btn.addEventListener("click",function(){

        System.session.page[now_page] = page_data.nex.id;

        sessionStorage.rpg = JSON.stringify(System.session);
    });

    nex_btn.addEventListener("click",function(){

        System.session.page[now_page] = page_data.nex.id;

        sessionStorage.rpg = JSON.stringify(System.session);
    });

    setTimeout(function()
    {
        document.querySelector("div#"+id).style.height = document.querySelector("div#"+id+" div#Main").clientHeight + "px";
    },0);
}


//menu=>obj,div=>div容器
function RowMake(menu,div,id)
{
    for(var i in menu)
    {
        var input = document.createElement("input");
        var span = document.createElement("span");
        span.className = "row";

        if(menu[i].html!=undefined && menu[i].html!="")
        {
            input = menu[i].html;
        }

        input.id = i;

        for(var attr in menu[i])
        {
            if( typeof(menu[i][attr])=="object" ) continue;

            input.setAttribute(attr,menu[i][attr]);
        } 
        
        span.innerHTML = menu[i].span||"";

        if(menu[i].event!==undefined)
        {
            for(var _on in menu[i].event)
                input.addEventListener(_on,menu[i].event[_on]);
        }

        if(menu[i].line!==undefined)
        {
            input = document.createElement("div");
            input.className = "line";
            input.id = i;

            var percent = Math.floor( (menu[i].line.now * 100/menu[i].line.max)<0?0:(menu[i].line.now * 100/menu[i].line.max) );

            input.style.background = "linear-gradient(to right, #0f0 "+percent+"%, #fff 0%)";

            input.innerHTML = menu[i].line.now + "/" + menu[i].line.max;
        }
        
        

        var row_div = document.createElement("div");
        row_div.className = "row";

        row_div.appendChild(span);
        row_div.appendChild(input);

        if(menu[i].bonus_set==1)
        {
            BonusSet(row_div,i);
        }

        div.appendChild(row_div);

    }

    document.querySelectorAll("#Menu ul>div").forEach(function(div){
        div.innerHTML = "";
    });
    document.querySelector("div#"+id).appendChild(div);

    setTimeout(function(){
        document.querySelector("div#"+id).style.height = document.querySelector("div#"+id+" div#Main").clientHeight + "px";
    },0);
}


function BonusSet(row_div,i)
{
    var bonus_set = document.createElement("input");
    bonus_set.className = "bonus"
    bonus_set.value = "↑";
    bonus_set.type = "button";
    bonus_set.id = i;
    bonus_set.addEventListener("click",function(){

        var _id = this.id;

        if(System.char_bonus_set.bonus<=0) return;

        System.char_bonus_set.bonus-=1;
        document.querySelector("#bonus").value = System.char_bonus_set.bonus;

        
        if(_id=="hp" || _id=="mp")
        {
            var line_div = document.querySelector("#"+_id);

            System.char_bonus_set[_id]-=(-System.config.lvup["bonus_set_"+_id]);
            System.char_bonus_set[_id+"m"]-=(-System.config.lvup["bonus_set_"+_id]);

            line_div.innerHTML = 
            System.char_bonus_set[_id] + "/" + 
            System.char_bonus_set[_id+"m"];
            

            var percent = Math.floor( (System.char_bonus_set[_id] * 100/System.char_bonus_set[_id+"m"])<0?0:(System.char_bonus_set[_id] * 100/System.char_bonus_set[_id+"m"]) );

            line_div.style.background = "linear-gradient(to right, #0f0 "+percent+"%, #fff 0%)";
        }
        else
        {
            System.char_bonus_set[_id]-=(-1);
            document.querySelector("#"+_id).value = System.char_bonus_set[_id];
        }
    });

    row_div.appendChild(bonus_set);
}



function RegisterMember(gapi_getid)
{
    DB.ref("member/"+gapi_getid).once("value",function(m){
        m = m.val();

        if(m==null)
        {
            m = {};
            m.account = gapi_getid;
            m.time = firebase.database.ServerValue.TIMESTAMP;
    
            System.member = m;
    
            var _tmp = {"rpg":System.member};
            localStorage.kfs = JSON.stringify(_tmp);
            
            DB.ref("/member/"+gapi_getid).set(m);

            Main();
        }
        else
        {
            System.member = m;

            var _tmp = {"rpg":System.member};
            localStorage.kfs = JSON.stringify(_tmp);

            Main();
        }
    });        
}


function DelAccount(gapi_getid)
{
    
    if( confirm("注意!該程序無法恢復資料,確定要繼續嗎?")===false ) return;


    DB.ref("member/"+gapi_getid).once("value",function(m){
        m = m.val();

        if(m!=null)
        {
            DB.ref("/member/"+gapi_getid).remove();
            DB.ref("/char/"+gapi_getid).remove();
            
            delete localStorage.kfs;
            delete sessionStorage.kfs;

            alert("清除完成");
            location.reload();
        }
        else
        {
            alert("該GOOGLE帳號無綁定角色");
            return;
        }

    });

}



function EditChar()
{
    if(confirm("確定要進行點數分配?")===false) return;
    
    if(System.char_bonus_set.bonus<0)
    {
        alert("系統異常");
        return;
    }

    if( BonusCheck() != true )
    {
        alert("系統異常");
        return;
    }
    
    DB.ref("/char/"+System.member.account).update( System.char_bonus_set );

    System.char = System.char_bonus_set;
    
    alert("分配完成");
    MenuClick("char_status","open");
}

function BonusCheck()
{
    var check_row = {};
    for(var key in System.char)
    {
        if(System.char_bonus_set[key]!=System.char[key] && 
            typeof(System.char[key])!="object")
            check_row[key] = [
                System.char[key],
                System.char_bonus_set[key]
            ]
        
    }


    var continue_row = ["bonus","hpm","mpm"];
    var total = 0;
    for(var key in check_row)
    {
        if(continue_row.indexOf(key)!=-1) continue;

        if(key=="hp" || key=="mp")
            total += (check_row[key][1] - check_row[key][0])/System.config.lvup["bonus_set_"+key];
        else
            total += check_row[key][1] - check_row[key][0];
    }

    if(check_row.bonus!=undefined)
    if(total!=(check_row.bonus[0]-check_row.bonus[1]))
    {
        return false;
    }

    return true;
}

function MonsterLvUP(enemy,func)
{
    var rad_seed = [
        "atk",
        "def",
        "agi",
        "matk",
        "mdef",
        "magi",
        "hit",
        "mhit"
    ];

    var set_ary = {};
    var set_value_g_p = 1;
    enemy.lv-=-1;

    enemy.exp-=enemy.expm;
    System.tmp.lv = enemy.lv;// to eval(System.config.lvup.monster.expm)
    enemy.expm = eval(System.config.monster_config.expm);

    if(enemy.group_type=="group3")
    {
        enemy.expm = Math.floor(enemy.expm/2);
        set_value_g_p = 0.5
    }
    if(enemy.group_type=="group4")
    {
        enemy.expm = Math.floor(enemy.expm*2);
        set_value_g_p = 2;
    }

   
    if(enemy.atk_type=="atk") set_ary = {"atk":2,"matk":2,"def":-2,"mdef":-2};
    if(enemy.atk_type=="def") set_ary = {"def":2,"mdef":2,"atk":-2,"matk":-2};
    if(enemy.atk_type=="agi") set_ary = {"agi":2,"magi":2,"hit":2,"mhit":2};

    for(var key in set_ary)
    {
        if(enemy[ key ]==0) enemy[ key ] = 1;

        enemy[ key ] -=
        -1 * Math.ceil(set_value_g_p * (set_ary[key] * Math.ceil(enemy[ key ] * (Rad(enemy.lv) / enemy[ key ] / 10))));

        if(enemy[ key ]==0) enemy[ key ] = 1;
    }


    if(enemy.int_type=="atk") set_ary = {"atk":2,"def":2,"hit":2,"matk":-2,"mdef":-2,"mhit":-2};
    if(enemy.int_type=="matk") set_ary = {"matk":2,"mdef":2,"mhit":2,"atk":-2,"def":-2,"hit":-2};
    if(enemy.int_type=="atk_matk") set_ary = {"atk":2,"matk":2,"hit":2,"mhit":2,"def":-4,"mdef":-4};
    if(enemy.int_type=="def_mdef") set_ary = {"hp":3,"mdef":3,"def":3};
    if(enemy.int_type=="agi_magi") set_ary = {"agi":3,"magi":3};
    if(enemy.int_type=="sp1") set_ary = {"hp":3,"atk":3,"def":3};
    if(enemy.int_type=="sp2") set_ary = {"hp":4,"mp":4};

    for(var key in set_ary)
    {
        if(enemy[ key ]==0) enemy[ key ] = 1;

        enemy[ key ] -=
        -1 * Math.ceil(set_value_g_p * (set_ary[key] * Math.ceil(enemy[ key ] * (Rad(enemy.lv) / enemy[ key ] / 10))));

        if(enemy[ key ]==0) enemy[ key ] = 1;
    }

    for(var key of rad_seed)
    {
        enemy[key]-=-1*Rad(6);
    }

    enemy.hp -=
    -1 * 2 * 
    Math.ceil(enemy.hp * (Rad(enemy.lv) / enemy.hp / 10));

    enemy.mp -=
    -1 * 1 * 
    Math.ceil(enemy.mp * (Rad(enemy.lv) / enemy.mp / 10));


    enemy.hpm = enemy.hp;
    enemy.mpm = enemy.mpm;

        
    enemy.drop.exp =
    Math.ceil(enemy.hp) - 
    -1*Math.ceil(enemy.hp*enemy.def/100) - 
    -1*Math.ceil(enemy.hp*enemy.mdef/100);
    

    if(typeof(func)=="function") func(enemy);
}

function LvUp()
{
    if(confirm("確定要提升等級嗎?")==false) return;

    DB.ref("/char/"+ System.member.account ).once("value",function(char)
    {
        System.char = char.val();

    }).then(function(){

        if(System.char.exp<System.char.expm) return;

        System.char.lv-=-1;
        System.char.exp-=System.char.expm;

        for(var key in System.config.lvup.up)
        {
            System.char[key]+=System.config.lvup.up[key];
        }

        System.char.expm = eval( System.config.lvup.expm );
        System.char.bonus-=-1*eval(System.config.lvup.bonus);


        DB.ref("/char/"+ System.member.account ).update( System.char );

        MenuClick("char_status","open");

    });
}




function SearchBar()
{
    var now_page;
    for(var _id in System.session.menu)
    {
        if( System.session.menu[_id].open=="open" )
            now_page = _id;
    }
    System.session.search = System.session.search||{};


    var search_bar = document.createElement("div");
    search_bar.id = "SearchBar";


    var btn = document.createElement("input");
    btn.type = "button";
    btn.value = "搜尋";

    btn.addEventListener("click",function(){

        var obj_list = this.parentElement.querySelectorAll("#SearchBar input[type=text],#SearchBar select");
        
        for(var i=0;i<obj_list.length;i++)
        {
            var id = obj_list[i].id;

            System.session.search[now_page][ id.split(".")[1] ] = obj_list[i].value;
        }

        sessionStorage.rpg = JSON.stringify(System.session);

        MenuClick(now_page,"open");
    });


    search_bar.appendChild(btn);


    if(now_page=="char_list")
    {
        var _select = document.createElement("select");
        _select.innerHTML = "<option value=>選擇排序方式</option><option value=lv>等級</option><option value=time_last/attack>最後活動時間</option>";
        _select.id = "search.orderByChild";
        _select.value = System.session.search[now_page].orderByChild||"";

        var _select2 = document.createElement("select");
        _select2.innerHTML = "<option value=>正向排序</option><option value=desc>反向排序</option>";
        _select2.id = "search.Desc";
        _select2.value = System.session.search[now_page].Desc||"";


        search_bar.innerHTML = "";
        search_bar.appendChild(_select);
        search_bar.appendChild(_select2);
        search_bar.appendChild(btn);
    }


    if(now_page=="skill")
    {
        var _select = document.createElement("select");
        _select.innerHTML = "<option value=>先選擇搜尋方式</option><option value=char_create/name>製作者</option><option value=type/active>技能類型</option>";
        _select.id = "search.orderByChild";
        _select.value = System.session.search[now_page].orderByChild||"";

        var char_create_obj = document.createElement("input");
        char_create_obj.type = "text";
        char_create_obj.id = "search.equalTo";
        char_create_obj.value = System.session.search[now_page].equalTo||"";

        var active_obj = document.createElement("select");
        active_obj.innerHTML = "<option value>請選擇技能類型</option>";
        active_obj.id = "search.equalTo";

        var active = {"active":"主動","buff":"被動"};
        for(var key in active)
            active_obj.innerHTML += 
            "<option value="+key+">"+active[key]+"</option>";

        active_obj.value = System.session.search[now_page].equalTo||"";


        search_bar.innerHTML = "";
        search_bar.appendChild(_select);

        if(_select.value=="char_create/name")
        {
            search_bar.appendChild( document.createElement("BR") );
            search_bar.appendChild(char_create_obj);
        }
        else if(_select.value=="type/active")
        {
            search_bar.appendChild( document.createElement("BR") );
            search_bar.appendChild(active_obj);
        }
         
        search_bar.appendChild(btn);
        


        _select.onchange = function(){
            search_bar.innerHTML = "";
            search_bar.appendChild(_select);

            if(this.value=="char_create/name")
            {
                char_create_obj.value = "";
                search_bar.appendChild( document.createElement("BR") );
                search_bar.appendChild(char_create_obj);
            }
            else if(this.value=="type/active")
            {                
                active_obj.value = "";
                search_bar.appendChild( document.createElement("BR") );
                search_bar.appendChild(active_obj);
            }
            search_bar.appendChild(btn);
        }
    }


    if(now_page=="battle_log")
    {
        var _search_list = {
            "id":"記錄編號搜尋",
            "enemy/name":"怪物搜尋",
            "char_start/name":"開局搜尋",
            "char_end/name":"尾刀搜尋"
        }

        var _select = document.createElement("select");
        _select.innerHTML = "<option value=>先選擇搜尋方式</option>";

        for(var key in _search_list)
            _select.innerHTML += "<option value="+key+">"+_search_list[key]+"</option>";


        _select.id = "search.orderByChild";
        _select.value = System.session.search[now_page].orderByChild||"";


        var _input = document.createElement("input");
        _input.type = "text";
        _input.id = "search.equalTo";
        

        _input.value = System.session.search[now_page].equalTo||"";

        search_bar.innerHTML = "";
        search_bar.appendChild(_select);
        search_bar.appendChild( document.createElement("BR"));
        search_bar.appendChild(_input);
        search_bar.appendChild(btn);
    }

    if(now_page=="equipment")
    {
        var _select = document.createElement("select");
        _select.innerHTML = "<option value=>先選擇搜尋方式</option><option value=char_create/name>製作者</option><option value=part>裝備類型</option>";
        _select.id = "search.orderByChild";
        _select.value = System.session.search[now_page].orderByChild||"";

        var char_create_obj = document.createElement("input");
        char_create_obj.type = "text";
        char_create_obj.id = "search.equalTo";
        char_create_obj.value = System.session.search[now_page].equalTo||"";

        var part_obj = document.createElement("select");
        part_obj.innerHTML = "<option value>請選擇裝備類型</option>";
        part_obj.id = "search.equalTo";

        for(var key in System.item_part)
            part_obj.innerHTML += 
            "<option value="+key+">"+System.item_part[key]+"</option>";

        part_obj.value = System.session.search[now_page].equalTo||"";


        search_bar.innerHTML = "";
        search_bar.appendChild(_select);

        if(_select.value=="char_create/name")
        {
            search_bar.appendChild( document.createElement("BR") );
            search_bar.appendChild(char_create_obj);
        }
        else if(_select.value=="part")
        {
            search_bar.appendChild( document.createElement("BR") );
            search_bar.appendChild(part_obj);
        }
         
        search_bar.appendChild(btn);
        


        _select.onchange = function(){
            search_bar.innerHTML = "";
            search_bar.appendChild(_select);

            if(this.value=="char_create/name")
            {
                char_create_obj.value = "";
                search_bar.appendChild( document.createElement("BR") );
                search_bar.appendChild(char_create_obj);
            }
            else if(this.value=="part")
            {                
                part_obj.value = "";
                search_bar.appendChild( document.createElement("BR") );
                search_bar.appendChild(part_obj);
            }
            search_bar.appendChild(btn);
        }
    }


    if(now_page=="money_log")
    {
        var _money_log_type_ary = {
            "taker/name":"玩家收益",
            "payer/name":"玩家支出",
            "skillitem_lvup":"買家強化技能",
            "sold":"賣回品項",
            "buy":"買下品項",
            "skill_new" : "開發新技能記錄",
            "skill_lvup" : "強化技能記錄",
            "equipment_new" : "鍛造新裝備記錄",
            "equipment_lvup" : "強化裝備記錄",
            "del_equipment": "永久銷毀裝備記錄",
            "del_skill":"永久封印技能記錄",
            "del_enemy":"廢棄怪物報告",
            "search_monster":"新增調查怪物報告",
            "new_member":"新玩家銀行入帳"
        }

        var _select = document.createElement("select");
        _select.innerHTML = "<option value=>先選擇搜尋方式</option>";

        for(var key in _money_log_type_ary)
            _select.innerHTML += "<option value="+key+">"+_money_log_type_ary[key]+"</option>";


        _select.id = "search.orderByChild";
        _select.value = System.session.search[now_page].orderByChild||"";

        search_bar.innerHTML = "";
        search_bar.appendChild(_select);
        search_bar.appendChild( document.createElement("BR"));



        var _list = ["taker/name","payer/name"];

        var _input = document.createElement("input");
        _input.type = "text";
        _input.id = "search.equalTo";
        _input.value = System.session.search[now_page].equalTo||"";


        if(_list.indexOf(_select.value)!=-1)
        {
            search_bar.appendChild(_input);
        }

        search_bar.appendChild(btn);



        _select.onchange = function(){
            if(_list.indexOf(this.value)!=-1)
            {
                _input.value = "";
                search_bar.innerHTML = "";
                search_bar.appendChild(_select);
                search_bar.appendChild( document.createElement("BR"));
                search_bar.appendChild(_input);
                search_bar.appendChild(btn);
            }
            else
            {
                search_bar.innerHTML = "";
                search_bar.appendChild(_select);
                search_bar.appendChild( document.createElement("BR"));
                search_bar.appendChild(btn);
            }
        }

    }


    return search_bar;
}


function QuestCreate( _id )
{
    var new_data = {};
    var key_ary = {};
    var val_ary = {};

    var _key_ary = ["need","need_monster"];


    document.querySelectorAll("input[type=text],input[type=number]").forEach(function(obj)
    {
        var _value = obj.value;
        var _id = obj.id;

        if(_key_ary.indexOf(_id)!=-1)
        {
            new_data[ _id ] = new_data[ _id ]||{};
            val_ary[ _id ] = val_ary[ _id ]||[];

            val_ary[ _id ].push( _value );
        }
        else
        {
            new_data[ _id ] = _value;
        }     
    });

    document.querySelectorAll("select").forEach(function(obj)
    {
        var _value = obj.value;
        var _id = obj.id;

        if(_key_ary.indexOf(_id)!=-1)
        {
            new_data[ _id ] = new_data[ _id ]||{};
            key_ary[ _id ] = key_ary[ _id ]||[];

            key_ary[ _id ].push( _value );
        }
        else
        {
            new_data[ _id ] = _value;
        }

    });


    for(var key in key_ary)
    for(var val in val_ary)
    {
        if(key==val)
        {
            for(var x in key_ary[key])
                new_data[ key ][ key_ary[key][x] ] = val_ary[val][x];
        }
    }

    if(new_data.name=="")
    {
        alert("地區名稱未填");
        return;
    }

    if(new_data.spend<System.config.query_config.new_quest_money)
    {
        new_data.spend = System.config.query_config.new_quest_money;
    }


    DB.ref("char/"+System.member.account+"/item/money").once("value",money=>{
        
        System.char.item.money = money.val();

    }).then(function(){


        if(System.char.item.money<new_data.spend)
        {
            alert("費用不足");
            return;
        }

        System.char.item.money-=new_data.spend;
        OpenCharMenu("money");


        DBGetId(DB,"/quest/",function(get_id){

            new_data.char_create = {
                "account":System.member.account,
                "name":System.char.name,
                "time":firebase.database.ServerValue.TIMESTAMP
            }
            new_data.char_update = {
                "account":System.member.account,
                "name":System.char.name,
                "time":firebase.database.ServerValue.TIMESTAMP
            }

            new_data.lv = 1;
            new_data.exp = 0;
            new_data.expm = new_data.lv * System.config.area_config.area_lv_exp;

            new_data.boss = "";
            new_data.search = 0;
            new_data.search_boss = 0;
            new_data.sec = 60;


            new_data.on = "on";
            new_data.id = get_id;

            DB.ref("/quest/"+ new_data.id).update( new_data );

            var money_log = {
                "payer":{
                    "name":System.char.name,
                    "account":System.member.account
                },
                "taker":"bank",
                "lost_money":new_data.spend,
                "add_money":new_data.spend,
                "memo":{
                    "type":"new_quest_money",
                    "monster_id":new_data.id,
                    "name":new_data.name
                }
            };

            DbRowAdd(DB,"/system/config/bank_money",new_data.spend,money_log);
        
            DB.ref("char/"+System.member.account+"/item/money").set(System.char.item.money);

            System.session.menu.search_quest.list_id = "list";
            sessionStorage.rpg = JSON.stringify(System.session);

            MenuClick("search_quest","open");

        });

    });

}





function ServerTime()
{
    //if(System.ServerTimeStop==true) console.log("ServerTimeStop");

    if(System.ServerTimeStop==true) return;

    WorkerBattle.postMessage({"act":"ServerTime"});

    WorkerBattle.onmessage = function(e){
        
        System.time = e.data.time;

        clearTimeout(System._timer);
        System._timer = setInterval(function(){

            //if(System.ServerTimeStop==true) console.log("ServerTimeStop");
            if(System.ServerTimeStop==true)
            {
                clearInterval(System._timer);
                return;
            }

            console.log("run");

            WorkerBattle.postMessage({"act":"ServerTime"});
    
            WorkerBattle.onmessage = function(e){
                System.time = e.data.time
            }

        },1000);
    }
}


function DateFormat(timestamp,time = false)
{
    if(timestamp=="Invalid Date") return;

    var tmp = timestamp.toString().split(" ");
    var hms = tmp[4];

    tmp = tmp[3] + "/" + 
        parseInt(new Date(timestamp).getMonth()+1) + "/" + 
        new Date(timestamp).getDate();

    if(time===true) tmp = "";
    if(time===false) tmp += " ";
    if(time==="<BR>") tmp += "<BR>"
    

    tmp += hms.split(":")[0] + ":" 
        + hms.split(":")[1] + ":" 
        + hms.split(":")[2];


    return tmp;
}


function Shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function P(str)
{
    var [...ary] = str;
    Shuffle(ary);
    return ary.join("");
}

function DbRowPlus(DB,path,val)
{
    DB.ref(path).once("value",function(data){
        data = data.val();
        data-=-1*val;
        DB.ref(path).set( Math.round(data) );
    });
}


function DbRowAdd(DB,path,value,log,func)
{
    if(log!=undefined)
    {
        var money_log = {};
        money_log.payer = {};
        money_log.taker = {};

        for(var key in log)
        {
            money_log[key] = log[key];
        }

        money_log.time = firebase.database.ServerValue.TIMESTAMP;


        DBGetId(DB,"money_log",function(get_id){

            money_log.id = get_id;


            if(money_log.lost_money>0 || money_log.add_money>0)
            {
                DB.ref("/money_log/"+money_log.id).set(money_log);
            }

            DB.ref(path).once("value",function(data){
                data = data.val();
                data-=-1*value;
                DB.ref(path).set( Math.round(data) );


                if(func!=undefined && typeof(func)=="function")
                    func();

            });

        });
    }
    else
    {
        DB.ref(path).once("value",function(data){
            data = data.val();
            data-=-1*value;
            DB.ref(path).set( Math.round(data) );


            if(func!=undefined && typeof(func)=="function")
                func();

        });
    }
}


//經驗倍率計算 依怪物角色等級去增減
function ExpCal(e_lv,c_lv,exp)
{
    if(e_lv>=c_lv)
    {
        exp *= 1+(e_lv-c_lv)*0.05;
    }
    else
    {
        exp -= exp*(c_lv-e_lv)*0.05;
    }
    exp = Math.ceil(exp);
    exp = (exp>0)?exp:1;

    return exp;
}



function Rad(number)
{
    return 1+Math.floor(Math.random()*number);
}


function BossRankUp(enemy , quest_search )
{
    quest_search = 
        Math.floor(quest_search / System.config.battle_config.quest_boss_rank);

    enemy.boss = "boss";

   
    for(var key in System.skill_effect)
    {
        enemy[key] = enemy[key] - -1 * Math.floor(enemy[key] * quest_search/5);
    }

    enemy.drop.exp*=2;


    enemy.hpm = enemy.hp;
    enemy.mpm = enemy.mp;

    enemy.skill = enemy.skill||{};

    for(var key in enemy.skill)
    {
        var _skill = enemy.skill[key];

        for(var row in _skill.effect)
        {
            _skill.effect[row] = Math.floor(_skill.effect[row]*quest_search);
        }

        for(var row in _skill.cost)
        {
            _skill.cost[row] = Math.floor(_skill.cost[row]*quest_search);
        }
    }



    enemy.skill["BOSS攻擊"] = {
        "id":"BOSS攻擊",
        "effect":{"atk":enemy.atk},
        "name":"BOSS攻擊",
        "on":"on",
        "type":{"active":"active","atk":"atk" }
    }

    if(enemy.atk<enemy.matk)
    {
        delete enemy.skill["BOSS攻擊"].effect.atk;
        enemy.skill["BOSS攻擊"].effect.matk = enemy.matk;

        enemy.skill["BOSS攻擊"].type.atk = "matk";
    }
    

    enemy.skill[ "BOSS強化" ] = {
        "id":"BOSS強化",
        "effect":{
            "atk":enemy.lv-(-1*Rad(enemy.lv)),
            "def":enemy.lv-(-1*Rad(enemy.lv)),
            "matk":enemy.lv-(-1*Rad(enemy.lv)),
            "mdef":enemy.lv-(-1*Rad(enemy.lv)),
            "agi":enemy.lv-(-1*Rad(enemy.lv)),
            "magi":enemy.lv-(-1*Rad(enemy.lv))
        },
        "on":"on",
        "cost":{
            "hp":Math.ceil(enemy.hpm/10)
        },
        "name":"BOSS強化",
        "type":{"active":"buff","atk":"atk" }
    };

}



function DiceDivSet(act)
{
    var div = document.querySelector("div#battle div#Main");

    var dice_btn = System.dice_btn;
    var dice_div = document.querySelector("div#dice_div");
    var dice_list = document.querySelector("div#dice_list");
    var dice_memo = document.querySelector("div#dice_memo");



    if(dice_div==null)
    {
        dice_div = document.createElement("div");
        dice_div.className = "info";
        dice_div.id = "dice_div";
    }
    
    if(dice_list==null)
    {
        dice_list = document.createElement("div");
        dice_list.id = "dice_list";
        dice_list.style = "height:60px";
    }

    if(dice_memo==null)
    {
        dice_memo = document.createElement("div");
        dice_memo.className = "info";
        dice_memo.id = "dice_memo";
    }
    

    if(act!=undefined)
    {
        System.dice_select = {};

        for(var key in dice_btn)
        {
            var obj = dice_btn[key].obj;
            obj.removeAttribute("disabled");
        }

        dice_list.innerHTML = "";
        dice_memo.remove();
        return;
    }

    

    for(var key in dice_btn)
    {
        var _value = dice_btn[key];
        var obj = document.createElement("input");
        dice_btn[key].obj = obj;
        obj.type = "button";
        obj.id = key;
        obj.value = _value.name;

        if(System.member.dice!=undefined)
            obj.setAttribute("disabled","");


        obj.addEventListener("click",function(){
            
            if(this.id=="cls")
            {
                dice_list.innerHTML = "";
                return;
            }

            if(this.id=="run")
            {
                if(confirm("確定要擲出骰子?\n(擲出後不可重擲)")==false) return;

                DiceRun(dice_list);
                return;
            }

            if(dice_list.querySelectorAll("div.dice").length>=12)
            {
                alert("最多只可設置12顆骰子");
                return;
            }


            var dice = document.createElement("div");
            dice.className = "dice";
            dice.id = this.id;
            if(this.id=="six")
            {
                dice.style.background = "#eee";
                dice.innerHTML = "6"
            }
            else
            {
                dice.style.background = "#ff0";
                dice.innerHTML = "10"
            }

            dice_list.appendChild(dice);

        });

        if(key=="six")
        {
            for(var i=0;i<6;i++)obj.click();
        }
        if(key=="ten")
        {
            for(var i=0;i<6;i++)obj.click();
        }

        dice_div.appendChild( obj );
    }

    


    dice_div.appendChild(dice_list);
    div.appendChild(dice_div);


    if(System.member.dice!=undefined)
    {
        for(var i=0;i<Object.keys(System.member.dice).length;i++)
        {
            var _value = System.member.dice[i];

            var dice = document.createElement("div");
            dice.className = "dice";
            dice.id = _value.dice;
            dice.setAttribute("eq",i);
            dice.innerHTML = _value.value;

            if(_value.dice=="six")
            {
                dice.style.background = "#eee";
            }
            else
            {
                dice.style.background = "#ff0";
            }


            dice.addEventListener("click",function(){
                DiceSelect(this);
            });

            dice_list.appendChild(dice);
        }

        dice_memo.innerHTML = "依序選擇骰子決定強化屬性<BR>";

        dice_memo.innerHTML += "本次亂數對應點數："
        for(var key in System.member.dice_rand_six)
        {
            dice_memo.innerHTML += "("+key+")"+System.c_s_word[ System.member.dice_rand_six[key] ]+ " ";
        }


        div.appendChild(dice_memo);
    }
}



function DiceSelect(obj)
{
    if(obj.classList.contains("selected"))return;

    obj.style = "";
    obj.classList.add("selected");

    var value = obj.innerHTML;
    var memo_div = document.querySelector("#dice_memo");
    memo_div.innerHTML = "依序選擇骰子決定強化屬性<BR>";

    memo_div.innerHTML += "本次亂數對應點數："
    for(var key in System.member.dice_rand_six)
    {
        memo_div.innerHTML += "("+key+")"+System.c_s_word[ System.member.dice_rand_six[key] ]+ " ";
    }


    System.dice_select = System.dice_select||{};
    var dice_select = System.dice_select;

    dice_select[ Object.keys(dice_select).length ] = value;

    /*
    var char_status = {
        "1":"物攻",
        "2":"物防",
        "3":"敏捷",
        "4":"魔攻",
        "5":"魔防",
        "6":"詠唱",
    }*/

    var char_status = System.member.dice_rand_six;

    
    var span = {};
    var number_fill = false;
    for(var i=0;i<Object.keys(dice_select).length;i++ )
    {
        if(dice_select[i]=="10") dice_select[i] = "0";

        var span_length = Object.keys(span).length;

        if( span_length==0 || number_fill==true)
        {
            number_fill = false;
            span[ span_length ] = document.createElement("span");

            obj = span[ span_length ];
            obj.setAttribute("page","");
            obj.id = "status";
            
            if( char_status[ dice_select[i] ] != undefined)
            {
                obj.innerHTML = "<BR>【"+System.c_s_word[ char_status[ dice_select[i] ] ]+"】增加 <span id=number page check>0</span>%";
            }
            else
            {
                obj.innerHTML = "<BR>【隨機屬性】增加 <span id=number page check>0</span>%";
            }
            memo_div.appendChild(obj);
        }
        else
        {
            var obj = span[ span_length-1 ];
            if(obj.querySelector("span#number").getAttribute("check")!=null)
            {
                obj.querySelector("span#number").removeAttribute("check");
                obj.querySelector("span#number").innerHTML = "";
            }

            obj.querySelector("span#number").innerHTML += dice_select[i];

            if(obj.querySelector("span#number").innerHTML.length>=2)
                number_fill = true;
            
        }
    }

    var _btn = document.createElement("input");
    _btn.type = "button";
    _btn.value = "重新選擇";
    _btn.addEventListener("click",function(){

        System.dice_select = {};
        memo_div.innerHTML = "依序選擇骰子決定強化屬性<BR>";
        memo_div.innerHTML += "本次亂數對應點數："
        for(var key in System.member.dice_rand_six)
        {
            memo_div.innerHTML += "("+key+")"+System.c_s_word[ System.member.dice_rand_six[key] ]+ " ";
        }

        document.querySelectorAll("#dice_list div.dice").forEach(function(div){
            div.classList.remove("selected");

            if(div.id=="six")
            {
                div.style.background = "#eee";
            }
            else
            {
                div.style.background = "#ff0";
            }

        });


    });


    memo_div.innerHTML += "<BR>";
    memo_div.appendChild(_btn);

    DivMainClientHeight("battle");
}


function DiceRun(div)
{
    var dice_ary = document.querySelector("div#dice_list").querySelectorAll("div.dice");

    var _tmp = JSON.parse(localStorage.kfs||'{}');
    System.member = _tmp.rpg||{};

    if(System.member.dice!=undefined)
    {
        location.reload();
        return;
    }

    var i = 0;
    var seed = [];
    var max;
    var _t = setInterval(function(){

        //i 累加到最後 無骰子可計算時 end結算
        if(dice_ary[i]===undefined)
        {
            var dice = {};

            for(var l=0;l<dice_ary.length;l++)
            {
                dice[ l ] = {
                    "dice":dice_ary[l].id,
                    "value":dice_ary[l].innerHTML
                }
            }

            System.member.dice = dice;
            
            var char_status = [
                "atk",
                "def",
                "agi",
                "matk",
                "mdef",
                "magi",
                "hit",
                "mhit"
            ];
            System.member.dice_rand_six = System.member.dice_rand_six||{};
            for(var _six=1;_six<=6;_six++)
            {
                Shuffle(char_status);
                System.member.dice_rand_six[_six] = char_status.pop();
            }
            var _tmp = {"rpg":System.member};
            localStorage.kfs = JSON.stringify(_tmp);
            
            
            var _div = document.createElement("div");
            _div.className = "info";
            _div.id = "dice_memo";
            _div.innerHTML = "依序選擇骰子決定強化屬性<BR>";
            _div.innerHTML += "本次亂數對應點數："
            for(var key in System.member.dice_rand_six)
            {
                _div.innerHTML += "("+key+")"+System.c_s_word[ System.member.dice_rand_six[key] ]+ " ";
            }

            document.querySelectorAll("div#dice_div input[type=button]").forEach(function(btn){
                btn.setAttribute("disabled","");
            });
            
            
            div.parentElement.parentElement.insertBefore(_div,div.parentElement.nextElementSibling );

            DivMainClientHeight("battle");


            clearInterval(_t);

            alert("點擊骰子進行屬性加成分配");

            return;
        }

        for(var l=0;l<dice_ary.length;l++)
        {
            if( dice_ary[l].id=="six" )
            {
                max = 6;
            }
            else
            {
                max = 10;
            }
            seed = [];
            for(var x=1;x<=max;x++)
                seed.push(x);
    
            Shuffle(seed);
            
            dice_ary[l].innerHTML = seed.pop();

            dice_ary[l].addEventListener("click",function(){
                DiceSelect( this );
            });
        }

        dice_ary[i].classList.add("run");

        i++;

    },100);
}


function DBGetId(DB,path,func)
{
    DB.ref(path).orderByKey().limitToLast(1).once("value",function(last_data){

        var id;
        last_data = last_data.val();


        if(last_data==null)
        {
            id = new Date().getTime().toString().substr(2);
        }
        else
        {
            for(var key in last_data) 
                id = key-(-1);
        }

        func.call(this,id);
    });
}



function WorkerBattleFunc(post,func)
{
//    console.log(post);

    if( typeof(func)!="function" ) return;

    clearInterval(System._timer);
    System.ServerTimeStop = true;

    WorkerBattle.postMessage(
        post
    );

    WorkerBattle.onmessage = function(e){
        func(e);

//        console.log("onmessage");
//        console.log(post);
        

        System.ServerTimeStop = false;
        ServerTime();
    }
}


function CountDown(obj,timer_id,end_word,disabled)
{
    clearInterval(System._timer_list[timer_id]);

    var sec = Math.ceil(( System.char.time_last.attack - System.time)/1000);

    if(sec>0)
    {
        obj.setAttribute("disabled","disabled");
        obj.value = sec;
        obj.innerHTML = sec;
    }
    else
    {
        if(disabled!="disabled") obj.removeAttribute("disabled");
        obj.value = end_word;
        obj.innerHTML = end_word;
    }



    System._timer_list[timer_id] = setInterval(function(){

        var sec = Math.ceil(( System.char.time_last.attack - System.time)/1000);

        if(sec>0)
        {
            obj.setAttribute("disabled","disabled");
            obj.value = sec;
            obj.innerHTML = sec;
        }
        else
        {
            if(disabled!="disabled") obj.removeAttribute("disabled");
            obj.value = end_word;
            obj.innerHTML = end_word;
            clearInterval(System._timer_list[timer_id]);
        }

    },100);
}


function EffectCostNeed(obj)
{
    var cost_word = "";
    for(var _c in obj.cost)
    {
        cost_word +=
        System.c_s_word[ _c ]+"："+obj.cost[_c]+"<BR>"
    }

    var need_word = "";
    for(var _n in obj.need)
    {
        need_word += 
        System.c_s_word[ _n ]+"："+obj.need[_n]+"<BR>";
    }

    var effect_word = "";
    for(var _e in obj.effect)
    {
        if(_e=="hp" || _e=="mp") effect_word += "恢復";

        effect_word += 
        System.c_s_word[ _e ]+"："+obj.effect[_e]+"<BR>";
    }

    var info_word = 
    "【效果】<BR>" + 
    effect_word +
    "<hr>【消耗】<BR>" + 
    cost_word + 
    "<hr>【限制】<BR>" + 
    need_word + "<HR>";


    return info_word;
}



function Gapi(mode,func,errfunc)
{
    if(mode=="signIn")
    {
        gapi.auth2.getAuthInstance().signIn().then(function(_r){

            func.apply(this,[_r]);

        },function(err){
            errfunc.apply(this,[err]);
        });
    }
}


function OpenCharMenu( focus )
{
    var _div = document.querySelector("#char_menu");
    var _btn = document.querySelector("#char_menu div.btn");

    if( focus!=undefined && _div.classList.contains("open") )
    {
        _div.classList.remove("open");
        _div.innerHTML = "";
        _div.appendChild(_btn);

        setTimeout(function(){
            OpenCharMenu( focus )
        },600);
        return;
    }


    if( _div.classList.contains("open") )
    {
        _div.classList.remove("open");

        _div.innerHTML = "";
        _div.appendChild(_btn);
    }
    else
    {
        _div.classList.add("open");

        setTimeout(function(){

            var memo = document.createElement("div");
            memo.className = "word";
            var word = "";
            var line_ary = ["hp","mp"];
            for(var key in System.skill_effect)
            {
                word += "<span id="+key+">"+System.skill_effect[key] + " : ";
                
                if(line_ary.indexOf(key)!=-1)
                    word += System.char[key] + " / " + System.char[key+"m"]+"</span>";
                else
                    word += System.char[key]+"</span>";


                word += "<BR>";
            }

            word += "<hr><span id=money>擁有金幣:<BR>"+System.char.item.money+"</span>";

            memo.innerHTML = word;
            _div.innerHTML = "";
    
            _div.appendChild(_btn);
            _div.appendChild(memo);

            if(focus!=undefined)
            if( memo.querySelector("#"+focus) )
            {
                var _t = setInterval(function(){
                    memo.querySelector("#"+focus).classList.toggle("focus");
                },500);

                setTimeout(function(){
                    clearInterval(_t);
                    memo.querySelector("#"+focus).classList.remove("focus");
                },5000)
            }
            

        },300);
    }
}



function BattleLogList(battle,div,id)
{
    var title = {
        "0":{
            "title":"回合",
            "html":"round"
        },
        "1":{
            "title":"戰鬥記錄",
            "html":"word"
        }
    }



    var list = [];
    for(var idx in battle.log)
    {
        var _value = battle.log[idx];

        System.tmp[ _value.char.account ] = _value.char.name;
        
        list[idx] = {};
        list[idx].word = _value.word;
        
        list[idx].word += "<HR>";

        _value.dice = _value.dice||{};
        if( Object.keys(_value.dice).length>0 )
        {
            var log_dice_list = document.createElement("div");
            log_dice_list.style = "height:60px";
            for(var key in _value.dice)
            {
                var _dice = _value.dice[key];

                var log_dice = document.createElement("div");
                log_dice.className = "dice";
                log_dice.id = _dice.split(":")[0];
                if(_dice.split(":")[0]=="six")
                {
                    log_dice.style.background = "#eee";
                    log_dice.innerHTML = _dice.split(":")[1];
                }
                else
                {
                    log_dice.style.background = "#ff0";
                    log_dice.innerHTML = _dice.split(":")[1];
                }

                log_dice_list.appendChild(log_dice);
            }
            list[idx].word += log_dice_list.outerHTML;
        }

        list[idx].word += DateFormat( new Date(_value.time) );

        list[idx].round = idx-(-1);
    }

    list.reverse();
    ListMake(title,list,div,id,"battle_log");
}


function TradeRegister()
{
    var _data = document.querySelectorAll("input[type=text],input[type=number],select");
    var new_data = {};

    for(var i=0;i<_data.length;i++)
    {
        var _value = _data[i].value;
        var _row = _data[i].id;

        if(_row.split(".").length>1)
        {
            new_data[ _row.split(".")[0] ] = 
            new_data[ _row.split(".")[0] ]||{};
            new_data[ _row.split(".")[0] ][ _row.split(".")[1] ]
            = _value;
        }
        else
        {
            new_data[ _row ] = _value;
        }
    }

    if(System.char.item.money<System.trade.new_money)
    {
        alert("登錄費用不足");
        document.querySelector("input#submit").removeAttribute("disabled");
        return;
    }
    System.char.item.money-=System.trade.new_money;

    if(new_data.type=="" || new_data.item=="")
    {
        alert("未選擇拍賣項目");
        document.querySelector("input#submit").removeAttribute("disabled");
        return;
    }

    if(new_data.money=="")
    {
        alert("價錢不可空白");
        document.querySelector("input#submit").removeAttribute("disabled");
        return;
    }

    new_data.data = System.char[new_data.type][new_data.item];
    new_data.on = "on";


    new_data.char_create = {
        "account":System.member.account,
        "name":System.char.name,
        "time":firebase.database.ServerValue.TIMESTAMP
    }
    new_data.char_update = {
        "account":"",
        "name":"",
        "time":""
    }

    
    DBGetId(DB,"trade/",function(get_id){

        new_data.id = get_id;

        DB.ref("trade/"+ new_data.id).update( new_data );

        DB.ref("char/"+ System.member.account+"/item/money").set(System.char.item.money);
        alert("登錄成功");
        OpenCharMenu("money");

        System.session.menu[System.now_page].list_id = "list";
        sessionStorage.rpg = JSON.stringify(System.session);
        MenuClick(System.now_page,"open");
    });    
}

function TradeOff(_trade)
{
    if(_trade.char_create.account!=System.member.account) return;

    if(confirm("確定要下架【"+_trade.data.name+" LV"+_trade.data.lv+"】這個拍賣項目嗎?")==false) return;

    DB.ref("trade/"+_trade.id+"/on").set("off");
    
    alert("下架成功");

    MenuClick(System.now_page,"open");
}


function TradeBuy(_trade)
{
    if(confirm("確定要花費"+_trade.money+"金幣購買【"+_trade.data.name+" LV"+_trade.data.lv+"】嗎?")==false) return;

    DB.ref("trade/"+_trade.id).once("value",_trade=>{
        
        _trade = _trade.val();
        if(System.char.item.money<_trade.money)
        {
            alert("金幣不足");
            return;
        }

        System.char.item.money-=_trade.money;

        var type_id = Object.keys(System.char[_trade.type]).length;
        _trade.data.id = type_id;
        _trade.data.use = "unuse";
        System.char[_trade.type][ type_id ] = _trade.data;
        DB.ref("char/"+System.member.account).update(System.char);


        _trade.on = "off";
        _trade.char_update = {
            "account":System.member.account,
            "name":System.char.name,
            "time":firebase.database.ServerValue.TIMESTAMP
        }
        DB.ref("trade/"+_trade.id).update(_trade);


        DbRowPlus(DB,"char/"+_trade.char_create.account+"/item/money",_trade.money);

        alert("購買完成");
        OpenCharMenu("money");
        MenuClick(System.now_page,"open");
    });
}

//true手機行動裝置 false非手機
function CheckMobile()
{
    return (navigator.userAgent.indexOf("Mobile")!==-1)?true:false;
}

/*
DB.ref("/GAMEROOM/"+_game_room.ID).set(_game_room);
DB.ref("/PLAYER/"+ GLOBAL.session_user.nick_name ).update( _player );
DB.ref("/system/config").once( "value",_sys=>{System.config = _sys.val();});
*/

/*

取得玩家IP
https://ipinfo.io/
https://ipinfo.io/?callback=callback
GOOGLE get ip address api

*/




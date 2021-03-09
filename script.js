var System = {
    "now_page":"",
    "tmp":{},
    "config":null,
    "member":{},
    "time":null,
    "_timer":null,
    "_timer_list":{},
    "client_id":"856639483080-kmok597o75bun933gebh296jbvjt4ilo.apps.googleusercontent.com"
};



var DB = firebase;
DB.initializeApp({databaseURL: "https://shen-member-default-rtdb.firebaseio.com/"});


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
    _btn.innerHTML = "快捷目錄";
    _div.appendChild(_btn);

    _btn.addEventListener("click",function(){
        OpenCharMenu();
    });


    var div = document.createElement("div");
    div.id = "Menu";
    var ul = document.createElement("ul");
    var list = {
        "system_news":{"name":"系統公告","class":"hr"},
        "memeber_list":{"name":"會員清單"},

        "setting":{"name":"系統帳號管理","class":"hr"},
        "account":{"name":"帳號管理"}
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

    if(id=="system_news")
    {
        var str = System.config.news;


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





function Rad(number)
{
    return 1+Math.floor(Math.random()*number);
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

//true手機行動裝置 false非手機
function CheckMobile()
{
    return (navigator.userAgent.indexOf("Mobile")!==-1)?true:false;
}

/*

取得玩家IP
https://ipinfo.io/
https://ipinfo.io/?callback=callback
GOOGLE get ip address api

*/




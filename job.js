function JobMonsterMenu(div,id)
{

    var menu = {};
    var list_id = System.session.menu[System.now_page].list_id;
    
    menu["new"] = {
        "type":"button",
        "value":"調查新怪物",
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
        
        if(list_id=="new")
        {
            var area;
            DB.ref("area").once( "value",_area=>{ 

                area = _area.val();
                
        
            }).then(function(){

                var area_select = document.createElement("select");
                var monster_option = {};
                

                for(var key in System.monster)
                {
                    monster_option[key] = document.createElement("select");


                    for(var row in System.monster[key])
                    monster_option[key].innerHTML += 
                    "<option value="+row+">"+System.monster[key][row]+"</option>";
                }

                area_select.innerHTML += 
                "<option value>請選擇地區</option>";

                for(var key in area)
                {
                    area_select.innerHTML += 
                        "<option value="+key+">"+area[key].name+"</option>";
                }

                
                menu["area"] = {
                    "type":"text",
                    "span":"選擇探索地區",
                    "html":area_select
                }
                menu["atk_type"] = {
                    "type":"text",
                    "span":"遭遇到的怪物攻擊傾向",
                    "html":monster_option.atk_type
                }
        
                menu["int_type"] = {
                    "type":"text",
                    "span":"遭遇到的怪物智能程度",
                    "html":monster_option.int_type
                }
        
                menu["group_type"] = {
                    "type":"text",
                    "span":"遭遇到的怪物族群習性",
                    "html":monster_option.group_type
                }
        
                menu["race_type"] = {
                    "type":"text",
                    "span":"遭遇到的怪物種族",
                    "html":monster_option.race_type
                }
        
                menu["name"] = {
                    "type":"text",
                    "span":"為遭遇到的怪物命名"
                }


                var _div = document.createElement("div");
                _div.innerHTML = "<span id=new_money>1000</span> 金幣";

                menu["step7"] = {
                    "type":"text",
                    "span":"調查費用",
                    "html":_div
                }
        
                var btn = document.createElement("input");
                btn.type = "button";
                btn.value = "開始調查";
                btn.addEventListener("click",function(){
        
                    this.setAttribute("disabled","disabled");
                    MonsterRandCreate(area);
                    
                });

                menu["submit"] = {
                    "type":"button",
                    "span":"",
                    "html":btn
                }


                menu["monster_result"] = {
                    "type":"button",
                    "span":"",
                    "html":document.createElement("div")
                }

                RowMake(menu,div,id);
                DivMainClientHeight();

                area_select.addEventListener("change",function(){
        
        
                    var area_memo = document.querySelector("#area_memo");
                    if( area_memo==null )
                    {
                        area_memo = document.createElement("div");
                        area_memo.id = "area_memo"
                        area_memo.className = "info";
                        this.parentElement.appendChild(area_memo);
                    }
                
            
                    area_memo.innerHTML = "";
                    if(this.value=="")
                    {
                        area_memo.remove();
                        DivMainClientHeight();
                        return;
                    }
                    
            
                    var _monster = area[this.value].monster;
                    var _char = area[this.value].char;
            
            
                    area_memo.innerHTML = "該地區怪物素質限制<BR>";
                    for(var _n in _monster)
                    {
                        area_memo.innerHTML += "【"+System.c_s_word[_n] + "】上限" + _monster[_n]+"<BR>";
                    }
            
                    area_memo.innerHTML += "<HR>該地區玩家探索限制<BR>";
                    for(var _n in _char)
                    {
                        area_memo.innerHTML += "【"+ System.c_s_word[_n] + "】下限" + _char[_n]+"<BR>";
                    }
        
                    if(area[this.value].on=="off")
                        area_memo.innerHTML += "<HR>該地區禁止探索中<BR>";

                    if(area[this.value].on=="no_start")
                        area_memo.innerHTML += "<HR>怪物數量未達討伐底標<BR>";
                    
                    DivMainClientHeight();
                });

            });
        }
        else
        {
            DB.ref("enemy/"+list_id).once("value",function(enemy){
                enemy = enemy.val();
                if(enemy==null)
                {
                    System.session.menu[System.now_page].list_id = "list";
                    sessionStorage.rpg = JSON.stringify(System.session);

                    MenuClick(System.now_page,"open");
                    return;
                }

                var line_ary = ["hp","mp","exp"];
                var text_ary = ["name","area"];
                for(var key in System.monster_status)
                {
                    menu[key] = {
                        "type":"text",
                        "span":System.c_s_word[key],
                        "disabled":"disabled",
                        "value":enemy[key],
                        "class":"number"
                    }

                    if(key=="drop_exp")
                        menu[key].value = enemy.drop.exp;
                    

                    if(System.monster[key]!=undefined)
                    {
                        menu[key].value = System.monster[key][ enemy[key] ];
                        menu[key].class = "memo";
                    }

                    if( text_ary.indexOf(key)!=-1 )
                        menu[key].class = "";


                    if( line_ary.indexOf(key)!=-1 ) 
                    {
                        menu[key].line = {
                            "now":enemy[key],
                            "max":enemy[key+"m"]
                        }
                    }
                }

                menu.name.span = "怪物名稱";
                menu.area.value = enemy.area.name;

                RowMake(menu,div,id);


                MonsterSkillEquipmentDiv(enemy,div,id);

            });
        }

        return;
    }

    if(list_id=="list")
    {
        RowMake(menu,div,id);

        var ref = DB.ref("enemy");
        ref = ref.orderByChild("char_create/account").equalTo(System.member.account);

        var div_list = {};

        ref.once("value",monster=>{
            monster = monster.val()||{};

            var menu_list_btn = 
            {
                "on":{"off":"發出討伐任務","on":"收回討伐任務"},
                "detail":"查看報告",
                "del":"廢棄報告"
            };
            for(var _id in monster)
            {
                var _data = monster[_id];
                _data.id = _id;

                var on_word = "<hr>未討伐<BR>(地區消失中)";

                if(_data.on=="on")
                    on_word = "<hr><a style=color:#f00>討伐中<BR>(地區騷動中)</a>";

                div_list[ _data.id ] = JSON.parse(JSON.stringify(_data));
                div_list[ _data.id ].div_word = 
                _data.name+
                "<BR>等級："+_data.lv+
                "<BR>經驗：" +_data.exp + "/" + _data.expm + 
                "<BR>族群數量："+_data.group + 
                "<hr>" + _data.area.name + on_word;


                var menu_list_div = document.createElement("div");
                for(var _btn in menu_list_btn)
                {
                    var btn = document.createElement("input");
                    btn.type = "button";
                    
                    if(_btn=="on")
                        btn.value = menu_list_btn[_btn][ _data.on ];
                    else
                        btn.value = menu_list_btn[_btn];

                    btn.id = _id;       
                    btn.setAttribute("spend",_data.spend);
                    btn.setAttribute("name",_data.name);
                    btn.setAttribute("area_name",_data.area.name);
                    btn.setAttribute("lv",_data.lv);
                    btn.setAttribute("on",_data.on);
                    btn.setAttribute("func",_btn);

                    menu_list_div.appendChild(btn);
                    menu_list_div.appendChild( document.createElement("br") );
                }

                div_list[ _data.id ].detail_content = 
                _data.name + " LV"+_data.lv + "<hr>" + 
                menu_list_div.outerHTML;


                div_list[ _data.id ]["on_func"] = {
                    "type":"click",
                    "func":function(){

                    var _word,_word2,on;
                    if(this.getAttribute("on")=="off")
                    {
                        on = "on";
                        _word = "發出";
                        _word2 = "出現";                        
                    }
                    else
                    {
                        on = "off";
                        _word = "收回";
                        _word2 = "消失";
                    }

                    if(confirm("確定要"+_word+"討伐任務?\n(怪物會"+_word2+"在所屬地區)")==false) return;

                    
                    DB.ref("/enemy/"+this.id+"/on").set( on );
                    
                    if(on=="on")
                    DB.ref("/enemy/"+this.id+"/group").set( System.config.monster_config.group );

                    MenuClick(System.now_page,"open");
                }};

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

                    DB.ref("enemy/"+this.id).remove();

                    MenuClick(System.now_page,"open");
                    
                }};


            }

            ListDiv(div_list,div,System.now_page);
            

        });

        return;
    }

    

}


function JobSkillMenu(div,id)
{
    var menu = {};
    var list_id = System.session.menu[System.now_page].list_id;

    menu["new"] = {
        "type":"button",
        "value":"開發新技能",
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

    RowMake(menu,div,id);

    if(list_id!="list")
    {
        var type_atk = document.createElement("select");
        for(var key in System.skill.atk)
            type_atk.innerHTML += "<option value="+key+">"+System.skill.atk[key]+"</option>";


        var type_active = document.createElement("select");
        for(var key in System.skill.active)
            type_active.innerHTML += "<option value="+key+">"+System.skill.active[key]+"</option>";


        var effect = document.createElement("div");
        for(var key in System.skill_effect)
        {
            var checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = "effect";
            checkbox.value = key;
            var span = document.createElement("span");
            span.innerHTML = System.skill_effect[key];
            effect.appendChild(checkbox);
            effect.appendChild(span);
            effect.appendChild( document.createElement("br") );
        }

        var span2 = document.createElement("span");
        span2.style.fontSize = "x-small";
        span2.innerHTML = "(技能類型為敵方負面時<BR>則為負面效果)";
        effect.appendChild(span2);
        
        menu = {};

        menu["name"] = {
            "type":"text",
            "id":"name",
            "span":"技能名稱"
        }

        menu["type.atk"] = {
            "type":"text",
            "id":"type.atk",
            "span":"技能屬性",
            "html":type_atk
        }

        menu["type.active"] = {
            "type":"text",
            "id":"type.active",
            "span":"技能類型",
            "html":type_active
        }

        menu["chkbox_list"] = {
            "type":"text",
            "span":"正面效果",
            "class":"chkbox_list",
            "html":effect
        }

        if(System.char.skill[list_id]==undefined)
        {
            var _div = document.createElement("div");
            _div.id = "info";
            _div.innerHTML = "<span id=new_money>"+System.skill.new_money+"</span> 金幣";

            menu["step7"] = {
                "type":"text",
                "span":"開發費用",
                "html":_div
            }


            var btn = document.createElement("input");
            btn.type = "button";
            btn.value = "開發開始";
            btn.addEventListener("click",function(){

                this.setAttribute("disabled","disabled");
                SkillRandCreate();
            });

            menu["submit"] = {
                "type":"button",
                "span":"",
                "html":btn
            }
        }


        menu["data_result"] = {
            "type":"button",
            "span":"",
            "html":document.createElement("div")
        }

        RowMake(menu,div,id);
        DivMainClientHeight();


        if(System.char.skill[list_id]!=undefined)
        {
            delete menu.submit;

            var new_data = System.char.skill[list_id];
            if(new_data==undefined)
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
                var _value = new_data[row];

                if( typeof(new_data[row])!="object" )
                {
                    var _obj = document.querySelector("#"+row);
                    
                    if(_obj!=null)
                        _obj.value = _value;
                    
                }
                else
                {
                    for(var row2 in _value)
                    {
                        var _obj2 = document.querySelector("[id='"+row+"."+row2+"']");

                        if(_obj2!=null)
                            _obj2.value = _value[row2];


                        if(row=="effect")
                        {
                            _obj2 = document.querySelector("input[type=checkbox][value="+row2+"]");
                            _obj2.checked = true;
                        }
                    }
                }
            }

            var _type = System.skill;

            var _effect = "";
            for(var key in new_data.effect)
            {
                _effect += System.c_s_word[key] + "："+new_data.effect[key]+"<BR>";
            }

            var _cost = "";
            for(var key in new_data.cost)
            {
                _cost += System.c_s_word[key] + "："+new_data.cost[key]+"<BR>";
            }

            var effect_word = "增益";
            if(new_data.type.active=="enemy_buff")
                effect_word = "敵方損益";
            


            var table = document.createElement("table");
            table.innerHTML =
            "<tr><td colspan=2>【"+new_data.name+"】【LV"+new_data.lv+"】</td></tr>" + 
            "<tr><td colspan=2>【技能屬性】"+_type.atk[new_data.type.atk]+"</td></tr>" + 
            "<tr><td colspan=2>【技能類型】"+_type.active[new_data.type.active]+"</td></tr>" + 
            "<tr><td colspan=2 id=exp>【熟練度】"+new_data.exp+"/"+new_data.expm + "</td></tr>" + 
            "<tr><td>【"+effect_word+"】</td><td>"+_effect+"</td></tr>" + 
            "<tr><td>【損益】</td><td>"+_cost+"</td></tr>" + 
            "<tr><td colspan=2>【精神需求】"+new_data.need.mdef + "</td></tr>";

            document.querySelector("#data_result").appendChild(table);


            if(new_data.exp>new_data.expm)
            {
                document.querySelectorAll("td#exp").forEach(function(td){
                    td.bgColor = "#ff0";
                });

                var lvup_btn = document.createElement("input");
                lvup_btn.type = "button";
                lvup_btn.value = "技能升級";
                lvup_btn.id = "lvup_btn";
                lvup_btn.addEventListener("click",function(){
                    this.setAttribute("disabled","disabled");
                    LvUpSkillEquipment(System.now_page,new_data.id); 
                });
                
                var span = document.createElement("span");
                span.innerHTML = "升級費用："+new_data.lv*System.skill.lv_up_money+"金幣";

                div.appendChild(span);
                div.appendChild( document.createElement("br") );
                div.appendChild(lvup_btn);
            }

        }
        return;
        
    }

    

    if(list_id=="list")
    {
        var div_list = {};
    
        var skill = JSON.parse(JSON.stringify(System.char.skill));

        var menu_list_btn = 
        {
            "use":{"use":"取消準備","unuse":"準備技能"},
            "detail":{"detail":"查看明細"},
            "del":{"del":"刪除技能"}
        };
        

        var _type = System.skill;


        for(var _id in skill)
        {
            var _data = skill[_id];

            _data.detail = "detail";
            _data.del = "del";
            _data.add_class = _data.use;
            

            div_list[ _data.id ] = JSON.parse(JSON.stringify(_data));
            div_list[ _data.id ].div_word = 
            _data.name+"<br>" + 
            "等級："+_data.lv +"<BR>"+
            "屬性："+_type.atk[ _data.type.atk ] + "<br>" + 
            "類型："+_type.active[ _data.type.active ] + "<br>" + 
            "精神需求："+_data.need.mdef+ "<br>" + 
            "熟練度："+_data.exp+"/"+_data.expm;


            var menu_list_div = document.createElement("div");
            for(var _btn in menu_list_btn)
            {
                if(_id==0 && _btn!="detail") continue;//攻擊技能封鎖刪除及取消準備鈕

                var btn = document.createElement("input");
                btn.type = "button";
                btn.value = menu_list_btn[_btn][ _data[_btn] ];

                btn.id = _id;
                btn.setAttribute("spend",_data.spend);
                btn.setAttribute("name",_data.name);
                btn.setAttribute("lv",_data.lv);
                btn.setAttribute("func",_btn);

                menu_list_div.appendChild(btn);
                menu_list_div.appendChild( document.createElement("br") );
            }

            div_list[ _data.id ].detail_content = 
            _data.name + " LV"+_data.lv + "<hr>" + 
            menu_list_div.outerHTML;

            
            div_list[ _data.id ]["use_func"] = {
                "type":"click",
                "func":function(){
                
                UseSkillEquipment( this.id,System.char.skill );

            }};


            div_list[ _data.id ]["detail_func"] = {
                "type":"click",
                "func":function(){
                System.session.menu[System.now_page].list_id = this.id;
                sessionStorage.rpg = JSON.stringify(System.session);
                MenuClick(System.now_page,"open");
            }};

            div_list[ _data.id ]["del_func"] = 
            {
                "type":"click",
                "func":function(){

                    if(this.id==0)
                    {
                        alert("【攻擊】無法更動");
                        return;
                    }

                    if(confirm("確定要刪除【"+this.getAttribute("name")+"】嗎?")==false) return;
                    
                    delete System.char.skill[ this.id ];
                    DB.ref("/char/"+ System.member.account).update(System.char);

                    DivMainClientHeight();
                    return true;
                }
            };
        }

        ListDiv(div_list,div,System.now_page);
        

        return;
    }
    

}



function JobEquipmentMenu(div,id)
{
    var menu = {};
    var list_id = System.session.menu[System.now_page].list_id;

    menu["new"] = {
        "type":"button",
        "value":"鍛造新裝備",
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

    RowMake(menu,div,id);

    if(list_id!="list")
    {

        var effect = document.createElement("div");
        for(var key in System.skill_effect)
        {
            var checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = "effect";
            checkbox.value = key;
            var span = document.createElement("span");
            span.innerHTML = System.skill_effect[key];
            effect.appendChild(checkbox);
            effect.appendChild(span);
            effect.appendChild( document.createElement("br") );
        }
        
        menu = {};

        menu["name"] = {
            "type":"text",
            "id":"name",
            "span":"裝備名稱"
        }

        menu["chkbox_list"] = {
            "type":"text",
            "class":"chkbox_list",
            "span":"正面效果",
            "html":effect
        }

        if(System.char.skill[list_id]==undefined)
        {
            var _div = document.createElement("div");
            _div.id = "info";
            _div.innerHTML = "<span id=new_money>"+System.equipment.new_money+"</span> 金幣";

            menu["step7"] = {
                "type":"text",
                "span":"鍛造費用",
                "html":_div
            }


            var btn = document.createElement("input");
            btn.type = "button";
            btn.value = "鍛造開始";
            btn.addEventListener("click",function(){

                this.setAttribute("disabled","disabled");
                EquipmentRandCreate();
            });

            menu["submit"] = {
                "type":"button",
                "span":"",
                "html":btn
            }
        }


        var _div = document.createElement("div");

        menu["data_result"] = {
            "type":"button",
            "span":"",
            "html":_div
        }

        RowMake(menu,div,id);
        DivMainClientHeight();


        if(System.char.equipment[list_id]!=undefined)
        {
            delete menu.submit;

            var new_data = System.char.equipment[list_id];
            if(new_data==undefined)
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


                        if(row=="effect")
                        {
                            _obj2 = document.querySelector("input[type=checkbox][value="+row2+"]");

                            _obj2.checked = true
                        }
                    }
                }
            }


            var _effect = "";
            for(var key in new_data.effect)
            {
                _effect += System.c_s_word[key] + "："+new_data.effect[key]+"<BR>";
            }

            var _cost = "";
            for(var key in new_data.cost)
            {
                _cost += System.c_s_word[key] + "："+new_data.cost[key]+"<BR>";
            }

            var table = document.createElement("table");
            table.innerHTML =
            "<tr><td colspan=2>【"+new_data.name+"】【LV"+new_data.lv+"】</td></tr>" + 
            "<tr><td colspan=2 id=exp>【熟練度】"+new_data.exp+"/"+new_data.expm + "</td></tr>" + 
            "<tr><td>【增益】</td><td>"+_effect+"</td></tr>" + 
            "<tr><td>【損益】</td><td>"+_cost+"</td></tr>" + 
            "<tr><td colspan=2>【耐久需求】"+new_data.need.def + "</td></tr>";

            document.querySelector("#data_result").appendChild(table);


            if(new_data.exp>new_data.expm)
            {
                document.querySelector("td#exp").bgColor = "#ff0";

                var lvup_btn = document.createElement("input");
                lvup_btn.type = "button";
                lvup_btn.value = "裝備升級";
                lvup_btn.id = "lvup_btn";
                lvup_btn.addEventListener("click",function(){
                    this.setAttribute("disabled","disabled");
                    LvUpSkillEquipment(System.now_page,new_data.id); 
                });

                var span = document.createElement("span");
                span.innerHTML = "升級費用："+new_data.lv*System.equipment.lv_up_money+"金幣";

                div.appendChild(span);
                div.appendChild( document.createElement("br") );
                div.appendChild(lvup_btn);
            }

        }
        return;
        
    }

    

    if(list_id=="list")
    {
        var div_list = {};
        System.char.equipment = System.char.equipment||{};
    
        var equipment = JSON.parse(JSON.stringify(System.char.equipment));

        var menu_list_btn = 
        {
            "use":{"use":"卸下裝備","unuse":"使用裝備"},
            "detail":{"detail":"查看明細"},
            "del":{"del":"刪除技能"}
        };

        for(var _id in equipment)
        {
            var _data = equipment[_id];

            _data.detail = "detail";
            _data.del = "del";
            _data.add_class = _data.use;
            

            div_list[ _data.id ] = JSON.parse(JSON.stringify(_data));
            div_list[ _data.id ].div_word = 
            _data.name +"<BR>"+
            "等級："+_data.lv+"<BR>"+
            "耐力需求："+_data.need.def+ "<br>" + 
            "熟練度："+_data.exp+"/"+_data.expm;


            var menu_list_div = document.createElement("div");
            for(var _btn in menu_list_btn)
            {
                var btn = document.createElement("input");
                btn.type = "button";
                btn.value = menu_list_btn[_btn][ _data[_btn] ];

                btn.id = _id;
                btn.setAttribute("spend",_data.spend);
                btn.setAttribute("name",_data.name);
                btn.setAttribute("lv",_data.lv);
                btn.setAttribute("func",_btn);

                menu_list_div.appendChild(btn);
                menu_list_div.appendChild( document.createElement("br") );
            }

            div_list[ _data.id ].detail_content = 
            _data.name + " LV"+_data.lv + "<hr>" + 
            menu_list_div.outerHTML;


            div_list[ _data.id ]["use_func"] = {
                "type":"click",
                "func":function(){
                
                UseSkillEquipment( this.id,System.char.equipment );

            }};


            div_list[ _data.id ]["detail_func"] = {
                "type":"click",
                "func":function(){
                System.session.menu[System.now_page].list_id = this.id;
                sessionStorage.rpg = JSON.stringify(System.session);
                MenuClick(System.now_page,"open");
            }};

            div_list[ _data.id ]["del_func"] = 
            {
                "type":"click",
                "func":function(){
                    if(confirm("確定要刪除【"+this.getAttribute("name")+"】嗎?")==false) return;
                    
                    delete System.char.equipment[ this.id ];
                    DB.ref("/char/"+ System.member.account).update(System.char);

                    DivMainClientHeight();
                    return true;
                }
            };
        }

        ListDiv(div_list,div,System.now_page);
        

        return;
    }
    

}







function OptionMake( option , li_idx = -1 )
{
    var input = document.createElement("input");

    if(option.html!=undefined && option.html!="")
    {
        input = option.html;
    }
    

    for(var attr in option)
    {
        if( typeof(option[attr])=="object" ) continue;

        input.setAttribute(attr,option[attr]);
    }

    if(option.event!==undefined)
    {
        for(var _on in option.event)
            input.addEventListener(_on,option.event[_on]);
    }

    var _ul = document.querySelector("#"+option.ul_id);
    var _li = document.createElement("li");



    if(li_idx!=-1)
    {
        if(_ul.querySelectorAll("li")[ li_idx ]==null) _ul.appendChild(_li);

        _li = _ul.querySelectorAll("li")[ li_idx ];
    }

    if(_ul==null)
    {
        _ul = document.createElement("ul");
        _ul.id = option.ul_id;
        

        _li.appendChild(input);
        _ul.appendChild(_li);

        return _ul;
    }
    else
    {
        if(li_idx!=-1)
        {
            _li.appendChild(input);
        }
        else
        {
            _li.appendChild(input);
            _ul.appendChild(_li);
        }

        DivMainClientHeight();
    }
}



function DivMainClientHeight(_id)
{
    if(_id!=undefined)
    {
        if( System.session.menu[_id].open=="open" )
        {
            document.querySelector("div#"+_id).style.height = document.querySelector("div#"+_id+" div#Main").clientHeight + "px";
        }
        return;
    }


    document.querySelector("div#"+System.now_page).style.height = document.querySelector("div#"+System.now_page+" div#Main").clientHeight + "px";
        
}


function AreaRandCreate()
{
    var _data = document.querySelectorAll("input[type=text],select");
    var _char = document.querySelectorAll("input#char[type=checkbox]");
    var _monster = document.querySelectorAll("input#monster[type=checkbox]");
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
    if(new_data.name=="")
    {
        alert("名稱不可空白");
        document.querySelector("input#submit").removeAttribute("disabled");
        return;
    }

    new_data.spend = System.area.new_money;

    if(new_data.spend>System.char.item.money)
    {
        alert("開發費用不足");
        document.querySelector("input#submit").removeAttribute("disabled");
        return;
    }
    System.char.item.money-= new_data.spend;
    OpenCharMenu("money");


    new_data.char = {};
    for(var i=0;i<_char.length;i++)
    {
        if(_char[i].checked==true)
            new_data.char[ _char[i].value ] = 0;
    }

    new_data.monster = {};
    for(var i=0;i<_monster.length;i++)
    {
        if(_monster[i].checked==true)
            new_data.monster[ _monster[i].value ] = 0;
    }

    if(Object.keys(new_data.char).length<1 || 
    Object.keys(new_data.monster).length<1)
    {
        alert("玩家限制條件,怪物危險程度未選擇");
        document.querySelector("input#submit").removeAttribute("disabled");
        return;
    }



    var value = 0;
    for(var i=1;i<=Object.keys(new_data.char).length;i++)
    {
        value-=-1*
        (Math.ceil(System.char.hit/2 + Rad(System.char.hit/2)) + 
        Math.ceil(System.char.mhit/2 + Rad(System.char.mhit/2)));
    }
    var _rad_key = Object.keys(new_data.char);
    Shuffle(_rad_key);
    while(_rad_key.length>0 && value>0)
    {
        var _value = Rad(value);
        var _row = _rad_key.pop();

        if(_rad_key.length==0)
        {
            new_data.char[ _row ] = value;
        }
        else
        {
            value-=_value;
            new_data.char[ _row ] = _value;
        }
    }

    var value = 0;
    for(var i=1;i<=Object.keys(new_data.monster).length;i++)
    {
        value-=-1*
        (Math.ceil(System.char.agi/2 + Rad(System.char.agi/2)) + 
        Math.ceil(System.char.magi/2 + Rad(System.char.magi/2)));
    }
   
    var _rad_key = Object.keys(new_data.monster);
    Shuffle(_rad_key);
    while(_rad_key.length>0 && value>0)
    {
        var _value = Rad(value);
        var _row = _rad_key.pop();

        if(_rad_key.length==0)
        {
            new_data.monster[ _row ] = value;
        }
        else
        {
            value-=_value;
            new_data.monster[ _row ] = _value;
        }
    }

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
    new_data.expm = new_data.lv*System.area.lv_up_expm;
    new_data.on = "no_start";
    new_data.monster_count = 0;
    new_data.spend = System.area.new_money;
    new_data.boss = "";
    


    DBGetId(DB,"area/",function(get_id){

        new_data.id = get_id;

        DB.ref("area/"+ new_data.id).update( new_data );

        DB.ref("/char/"+ System.member.account+"/item/money").set(System.char.item.money);
    });

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
    "<tr><td>【探索進度】</td><td>"+new_data.exp+"/"+new_data.expm+"</td></tr>" + 
    "<tr><td>【玩家限制條件】</td><td>"+_char+"</td></tr>" + 
    "<tr><td>【怪物危險程度】</td><td>"+_monster+"</td></tr>";



    var btn_ok = document.createElement("input");
    btn_ok.type = "button";
    btn_ok.value = "確認結果";
    btn_ok.addEventListener("click",function(){

        System.session.menu[System.now_page].list_id = "list";
        sessionStorage.rpg = JSON.stringify(System.session);
        MenuClick(System.now_page,"open");

    });

    var btn_reset = document.createElement("input");
    btn_reset.type = "button";
    btn_reset.value = "放棄開發";
    btn_reset.addEventListener("click",function(){

        if(confirm("確定要放棄該地區重新開發嗎?")==false) return;


        
        DB.ref("area/"+new_data.id).remove();
        
        document.querySelector("#data_result").innerHTML = "";
        document.querySelector("input#submit").removeAttribute("disabled");

        DivMainClientHeight();
        return true;
    });

    
    document.querySelector("#data_result").appendChild(table);
    document.querySelector("#data_result").appendChild(btn_reset);
    document.querySelector("#data_result").appendChild(btn_ok);
    
    
    DivMainClientHeight();


}




function SkillRandCreate()
{

    var _data = document.querySelectorAll("input[type=text],select");
    var _effect = document.querySelectorAll("input[type=checkbox]");
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

    if(new_data.name=="")
    {
        alert("名稱不可空白");
        document.querySelector("input#submit").removeAttribute("disabled");
        return;
    }


    new_data.effect = {};
    for(var i=0;i<_effect.length;i++)
    {
        if(_effect[i].checked==true)
            new_data.effect[ _effect[i].value ] = 0;
    }

    if( Object.keys(new_data.effect).length<1 )
    {
        alert("強化效果未選擇");
        document.querySelector("input#submit").removeAttribute("disabled");
        return;
    }

    new_data.spend = System.skill.new_money;
    if(new_data.spend>System.char.item.money)
    {
        alert("開發費用不足");
        document.querySelector("input#submit").removeAttribute("disabled");
        return;
    }


    var value = 0;
    for(var i=1;i<=Object.keys(new_data.effect).length;i++)
    {
        value-=-1*Rad(6);
    }

    var _rad_key = Object.keys(new_data.effect);


    Shuffle(_rad_key);
    while(_rad_key.length>0 && value>0)
    {
        var _value = Rad(value);
        var _row = _rad_key.pop();
        
        if(_rad_key.length==0)
        {
            new_data.effect[ _row ] = value;
        }
        else
        {
            value-=_value;
            new_data.effect[ _row ] = _value;
        }
    }

    
    var reverse_row = {
        "hp":"mp",
        "mp":"hp",
        "atk":"def",
        "def":"atk",
        "matk":"mdef",
        "mdef":"matk",
        "agi":"hit",
        "magi":"mhit",
        "hit":"agi",
        "mhit":"magi"
    }

    new_data.cost = {};
    for(var key in new_data.effect)
    {
        new_data.cost[ reverse_row[key] ] = new_data.effect[key];
    }
    new_data.cost.mp = new_data.cost.mp||0;
    new_data.cost.mp-=-1*Math.ceil(Object.values(new_data.effect).reduce(function(a,b){return a+b})/2);

    new_data.need = {"mdef":
        Object.values(new_data.cost).reduce(function(a,b){return a+b}) + 
        Object.values(new_data.effect).reduce(function(a,b){return a+b})
    }


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
    new_data.expm = new_data.lv*System.skill.lv_up_expm;
    new_data.use = "unuse";
    new_data.id = Object.keys(System.char.skill).length;
    
    System.char.item.money-= new_data.spend;
    OpenCharMenu("money");

    System.char.skill[ new_data.id ] = new_data;

    

    DB.ref("/char/"+ System.member.account).update(System.char);



    var _effect = "";
    for(var key in new_data.effect)
    {
        _effect += System.c_s_word[key] + "："+new_data.effect[key]+"<BR>";
    }

    var _cost = "";
    for(var key in new_data.cost)
    {
        _cost += System.c_s_word[key] + "："+new_data.cost[key]+"<BR>";
    }


    var _type = System.skill;

    var table = document.createElement("table");
    table.innerHTML = 
    "<tr><td colspan=2>【"+new_data.name+"】【LV"+new_data.lv+"】</td></tr>" + 
    "<tr><td colspan=2>【技能屬性】"+_type.atk[new_data.type.atk]+"</td></tr>" + 
    "<tr><td colspan=2>【技能類型】"+_type.active[new_data.type.active]+"</td></tr>" + 
    "<tr><td colspan=2>【熟練度】"+new_data.exp+"/"+new_data.expm + "</td></tr>" + 
    "<tr><td>【增益】</td><td>"+_effect+"</td></tr>" + 
    "<tr><td>【損益】</td><td>"+_cost+"</td></tr>" + 
    "<tr><td colspan=2>【精神需求】"+new_data.need.mdef + "</td></tr>";



    var btn_ok = document.createElement("input");
    btn_ok.type = "button";
    btn_ok.value = "確認結果";
    btn_ok.addEventListener("click",function(){

        System.session.menu[System.now_page].list_id = "list";
        sessionStorage.rpg = JSON.stringify(System.session);
        MenuClick(System.now_page,"open");

    });

    var btn_reset = document.createElement("input");
    btn_reset.type = "button";
    btn_reset.value = "刪除技能";
    btn_reset.addEventListener("click",function(){

        if(confirm("確定要刪除該技能重新開發嗎?")==false) return;
        
        delete System.char.skill[ new_data.id ];
        DB.ref("/char/"+ System.member.account).update(System.char);
        document.querySelector("#data_result").innerHTML = "";
        document.querySelector("input#submit").removeAttribute("disabled");

        DivMainClientHeight();
        return true;
    });

    
    document.querySelector("#data_result").appendChild(table);
    document.querySelector("#data_result").appendChild(btn_reset);
    document.querySelector("#data_result").appendChild(btn_ok);
    

    DivMainClientHeight();
}


function EquipmentRandCreate()
{

    var _data = document.querySelectorAll("input[type=text],select");
    var _effect = document.querySelectorAll("input[type=checkbox]");
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

    if(new_data.name=="")
    {
        alert("名稱不可空白");
        document.querySelector("input#submit").removeAttribute("disabled");
        return;
    }


    new_data.effect = {};
    for(var i=0;i<_effect.length;i++)
    {
        if(_effect[i].checked==true)
            new_data.effect[ _effect[i].value ] = 0;
    }

    if( Object.keys(new_data.effect).length<1 )
    {
        alert("強化效果未選擇");
        document.querySelector("input#submit").removeAttribute("disabled");
        return;
    }

    new_data.spend = System.equipment.new_money;
    if(new_data.spend>System.char.item.money)
    {
        alert("開發費用不足");
        document.querySelector("input#submit").removeAttribute("disabled");
        return;
    }


    var value = 0;
    for(var i=1;i<=Object.keys(new_data.effect).length;i++)
    {
        value-=-1*Rad(6);
    }

    var _rad_key = Object.keys(new_data.effect);


    Shuffle(_rad_key);
    while(_rad_key.length>0 && value>0)
    {
        var _value = Rad(value);
        var _row = _rad_key.pop();
        
        if(_rad_key.length==0)
        {
            new_data.effect[ _row ] = value;
        }
        else
        {
            value-=_value;
            new_data.effect[ _row ] = _value;
        }
    }

    var reverse_row = {
        "hp":"mp",
        "mp":"hp",
        "atk":"def",
        "def":"atk",
        "matk":"mdef",
        "mdef":"matk",
        "agi":"hit",
        "magi":"mhit",
        "hit":"agi",
        "mhit":"magi"
    }

    new_data.cost = {};
    for(var key in new_data.effect)
    {
        new_data.cost[ reverse_row[key] ] = new_data.effect[key];
    }

    new_data.need = {"def": 
        Object.values(new_data.effect).reduce(function(a,b){return a+b})
    }


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
    new_data.expm = new_data.lv*System.equipment.lv_up_expm;
    new_data.use = "unuse";
    new_data.id = Object.keys(System.char.equipment).length;
    
    System.char.item.money-= new_data.spend;
    OpenCharMenu("money");

    System.char.equipment[ new_data.id ] = new_data;


    DB.ref("/char/"+ System.member.account).update(System.char);


    var _effect = "";
    for(var key in new_data.effect)
    {
        _effect += System.c_s_word[key] + "："+new_data.effect[key]+"<BR>";
    }

    var _cost = "";
    for(var key in new_data.cost)
    {
        _cost += System.c_s_word[key] + "："+new_data.cost[key]+"<BR>";
    }
    

    var table = document.createElement("table");
    table.innerHTML = 
    "<tr><td colspan=2>【"+new_data.name+"】【LV"+new_data.lv+"】</td></tr>" + 
    "<tr><td colspan=2>【熟練度】"+new_data.exp+"/"+new_data.expm + "</td></tr>" + 
    "<tr><td>【增益】</td><td>"+_effect+"</td></tr>" + 
    "<tr><td>【損益】</td><td>"+_cost+"</td></tr>" + 
    "<tr><td colspan=2>【耐久需求】"+new_data.need.def + "</td></tr>";

    var btn_ok = document.createElement("input");
    btn_ok.type = "button";
    btn_ok.value = "確認結果";
    btn_ok.addEventListener("click",function(){

        System.session.menu[System.now_page].list_id = "list";
        sessionStorage.rpg = JSON.stringify(System.session);
        MenuClick(System.now_page,"open");

    });

    var btn_reset = document.createElement("input");
    btn_reset.type = "button";
    btn_reset.value = "刪除裝備";
    btn_reset.addEventListener("click",function(){

        if(confirm("確定要刪除該裝備重新鍛造嗎?")==false) return;
        
        delete System.char.equipment[ new_data.id ];
        DB.ref("/char/"+ System.member.account).update(System.char);
        document.querySelector("#data_result").innerHTML = "";
        document.querySelector("input#submit").removeAttribute("disabled");

        DivMainClientHeight();
        return true;
    });

    
    document.querySelector("#data_result").appendChild(table);
    document.querySelector("#data_result").appendChild(btn_reset);
    document.querySelector("#data_result").appendChild(btn_ok);
    

    DivMainClientHeight();
}



function MonsterRandCreate(area)
{
    DB.ref("char/"+System.member.account).once("value",char=>{
        System.char = char.val();
    }).then(function(){

    var _data = document.querySelectorAll("select,input[type=text]");
    var monster_status = [
        "hp",
        "mp",
        "atk",
        "def",
        "agi",
        "matk",
        "mdef",
        "magi",
        "hit",
        "mhit"
    ];

    
    var search_monster_money = 0;

    var new_data = {};
    var set_ary = {};


    
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


    if(new_data.area=="")
    {
        alert("探索地區未選擇");
        document.querySelector("input#submit").removeAttribute("disabled");
        return;
    }
    if(new_data.name=="")
    {
        alert("怪物未命名");
        document.querySelector("input#submit").removeAttribute("disabled");
        return;
    }

    search_monster_money = 1000;
    new_data.spend = search_monster_money;

    if(new_data.spend>System.char.item.money)
    {
        alert("探索費用不足");
        document.querySelector("input#submit").removeAttribute("disabled");
        return;
    }

    System.char.item.money-= new_data.spend;
    OpenCharMenu("money");



    area = area[ new_data.area ];

    new_data.area = {
        "id":area.id,
        "name":area.name
    };

        
    new_data.lv = 1;

    for(var key in area.char)
    {
        var _value = area.char[key];

        if(key=="lv") new_data.lv = _value;
    }

    for(var key in area.monster)
    {
        var _value = area.monster[key];
        if(key=="lv")
        {
            new_data.lv -= -1*Rad( Math.floor(_value/2) );

            if(new_data.lv > _value)
                new_data.lv = _value;
        }
    }

    //new_data.lv = 50;

    for(var key of monster_status)
    {
        if(key=="hp")
            new_data[key] = new_data.lv*20;
        else if(key=="mp")
            new_data[key] = new_data.lv*5;
        else
            new_data[key] = new_data.lv;
    }


    if(new_data.atk_type=="atk") set_ary = {"atk":2,"matk":2,"def":-2,"mdef":-2};
    if(new_data.atk_type=="def") set_ary = {"def":2,"mdef":2,"atk":-2,"matk":-2};
    if(new_data.atk_type=="agi") set_ary = {"agi":2,"magi":2,"hit":2,"mhit":2};

    for(var key in set_ary)
    {
        if(new_data[ key ]==0) new_data[ key ] = 1;

        new_data[ key ] -=
        -1 * set_ary[key] * Math.ceil(new_data[ key ] * (Rad(new_data.lv) / new_data[ key ] / 10));

        if(new_data[ key ]==0) new_data[ key ] = 1;
    }

    if(new_data.int_type=="atk") set_ary = {"atk":2,"def":2,"hit":2,"matk":-2,"mdef":-2,"mhit":-2};
    if(new_data.int_type=="matk") set_ary = {"matk":2,"mdef":2,"mhit":2,"atk":-2,"def":-2,"hit":-2};
    if(new_data.int_type=="atk_matk") set_ary = {"atk":2,"matk":2,"hit":2,"mhit":2,"def":-4,"mdef":-4};
    if(new_data.int_type=="def_mdef") set_ary = {"hp":3,"mdef":3,"def":3};
    if(new_data.int_type=="agi_magi") set_ary = {"agi":3,"magi":3};
    if(new_data.int_type=="sp1") set_ary = {"hp":3,"atk":3,"def":3};
    if(new_data.int_type=="sp2") set_ary = {"hp":4,"mp":4};

    for(var key in set_ary)
    {
        if(new_data[ key ]==0) new_data[ key ] = 1;

        new_data[ key ] -=
        -1 * set_ary[key] * Math.ceil(new_data[ key ] * (Rad(new_data.lv) / new_data[ key ] / 10));

        if(new_data[ key ]==0) new_data[ key ] = 1;
    }
   
    new_data.hp -=-1*( Rad(new_data.def) - -1*Rad(new_data.agi) - Rad(new_data.atk) );
    new_data.mp -=-1*( Rad(new_data.mdef) - -1*Rad(new_data.magi) - Rad(new_data.matk) );

    
    for(var key in area.monster)
    {
        var _value = area.monster[key];
        if(new_data[key]>_value) new_data[key] = _value;
    }


    new_data.exp = 0;

    System.tmp.lv = new_data.lv;// to eval(System.config.lvup.monster.expm)
    new_data.expm = eval(System.monster.lv_up_expm);

    if(new_data.group_type=="group3") new_data.expm = Math.floor(new_data.expm/2);
    if(new_data.group_type=="group4") new_data.expm = Math.floor(new_data.expm*2);


    new_data.drop = {
        "exp":
        Math.ceil(new_data.hp) - 
        -1*Math.ceil(new_data.hp*new_data.def/100) - 
        -1*Math.ceil(new_data.hp*new_data.mdef/100)
    };


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

    new_data.hpm = new_data.hp;
    new_data.mpm = new_data.mp;

    new_data.skill = {"0":
        {
            "char_create" : new_data.char_create,
            "char_update" : new_data.char_create,
            "id" : "0",
            "lv" : 1,
            "name" : "攻擊",
            "type" : {
                "active" : "active",
                "atk" : "atk"
            },
            "exp":0,
            "expm":100,
            "effect":{
                "hp":1,
                "mp":1
            },
            "spend":0,
            "need":{
                "mdef":0
            },
            "use" : "use"
        }
    };


    DBGetId(DB,"enemy/",function(get_id){

        new_data.drop[ area.id+"_"+get_id ] = {
            "id":area.id+"_"+get_id,
            "name":"【"+area.name+"】討伐證明",
            "probability":40,
            "money":new_data.lv*10
        }

        new_data.kill = 0;
        new_data.dead = 0;
        new_data.on = "off";
        new_data.group = System.config.monster_config.group;
        new_data.id = get_id;

        DB.ref("enemy/"+ new_data.id).update( new_data );

        DB.ref("char/"+ System.member.account+"/item/money").set(System.char.item.money);
    });

    
    var enemy = new_data;



    var table = document.createElement("table");
    table.innerHTML =
    "<tr><td colspan=2>【名稱】</td><td colspan=2>"+new_data.name+"</td></tr>" + 
    "<tr><td colspan=2>【等級】</td><td colspan=2>"+new_data.lv+"</td></tr>" + 
    "<tr><td colspan=2>【"+System.c_s_word.hp+"】</td><td colspan=2>"+enemy.hp + "/" + enemy.hpm+"</td></tr>" + 
    "<tr><td colspan=2>【"+System.c_s_word.mp+"】</td><td colspan=2>"+enemy.mp + "/" + enemy.mpm+"</td></tr>" + 
    "<tr><td colspan=2>【"+System.c_s_word.exp+"】</td><td colspan=2>"+enemy.exp + "/" + enemy.expm+"</td></tr>" + 
    "<tr><td>【"+System.c_s_word.atk+"】</td><td>"+enemy.atk +"</td>" + 
    "<td>【"+System.c_s_word.matk+"】</td><td>"+enemy.matk +"</td></tr>" + 
    "<tr><td>【"+System.c_s_word.def+"】</td><td>"+enemy.def +"</td>" + 
    "<td>【"+System.c_s_word.mdef+"】</td><td>"+enemy.mdef +"</td></tr>" + 
    "<tr><td>【"+System.c_s_word.agi+"】</td><td>"+enemy.agi +"</td>" + 
    "<td>【"+System.c_s_word.magi+"】</td><td>"+enemy.magi +"</td></tr>" + 
    "<tr><td>【"+System.c_s_word.hit+"】</td><td>"+enemy.hit +"</td>" + 
    "<td>【"+System.c_s_word.mhit+"】</td><td>"+enemy.mhit +"</td></tr>"; 
 


    var btn_ok = document.createElement("input");
    btn_ok.type = "button";
    btn_ok.value = "確認結果";
    btn_ok.addEventListener("click",function(){

        System.session.menu[System.now_page].list_id = "list";
        sessionStorage.rpg = JSON.stringify(System.session);
        MenuClick(System.now_page,"open");

    });

    var btn_reset = document.createElement("input");
    btn_reset.type = "button";
    btn_reset.value = "廢棄此報告";
    btn_reset.addEventListener("click",function(){
        
        if(confirm("確定要廢棄【"+enemy.name+"】【LV"+enemy.lv+"】此報告重新調查嗎?")==false) return;


        document.querySelector("input#submit").removeAttribute("disabled");
        document.querySelector("#monster_result").innerHTML = "";

        DB.ref("enemy/"+new_data.id).remove();
        

        DivMainClientHeight();
        return true;
    });
    

    //document.querySelector("#monster_result").innerHTML = monster_html;
    
    document.querySelector("#monster_result").appendChild(table);
    document.querySelector("#monster_result").appendChild(btn_reset);
    document.querySelector("#monster_result").appendChild(btn_ok);
    

    document.querySelector("#monster_result").parentElement.style.display = "block";


    DivMainClientHeight();


    });
}


function MonsterSetSkillEquipment(enemy,obj)
{
    DB.ref("char/"+System.member.account).once("value",char=>{
        System.char = char.val();
    }).then(function(){ 

        var type = "equipment";
        if(obj.type!=undefined)
        if(obj.type.atk!=undefined) type = "skill"


        enemy[type] = enemy[type]||{};


        var enemy_type_id = Object.keys(enemy[type]).length;
        
        enemy[type][ enemy_type_id ] = 
            System.char[type][obj.id];

        
        //依種族判斷是否可裝備武器技能
        enemy[type][ enemy_type_id ].use = "unuse";
        enemy[type][ enemy_type_id ].id = enemy_type_id;

        delete System.char[type][obj.id];



        DB.ref("char/"+System.member.account).update(System.char);
        DB.ref("enemy/"+enemy.id).update(enemy);


        MenuClick("monster","open");
        DivMainClientHeight();

        alert("調查完成");
        return;
    });
}

function LvUpArea(id)
{
    DB.ref("area/"+id).once("value",new_data=>{
        new_data = new_data.val();

        if(System.char.item.money<new_data.lv*System.area.lv_up_money)
        {
            alert("升級費用不足");
            return;
        }
        System.char.item.money-= new_data.lv*System.area.lv_up_money;
        OpenCharMenu("money");

        new_data.exp-=new_data.expm;

        if(new_data.exp<0)
        {
            alert("探索進度不足");
            return;
        }

        DB.ref("/char/"+ System.member.account).update(System.char);

        var value = 0;
        for(var i=1;i<=Object.keys(new_data.char).length;i++)
        {
            value-=-1*
            (Math.ceil(System.char.hit/2 + Rad(System.char.hit/2)) + 
            Math.ceil(System.char.mhit/2 + Rad(System.char.mhit/2)));
        }
        var _rad_key = Object.keys(new_data.char);
        Shuffle(_rad_key);
        while(_rad_key.length>0 && value>0)
        {
            var _value = Rad(value);
            var _row = _rad_key.pop();
    
            if(_rad_key.length==0)
            {
                new_data.char[ _row ] -= -1*value;
            }
            else
            {
                value-=_value;
                new_data.char[ _row ] -= -1*_value;
            }
        }
    
        var value = 0;
        for(var i=1;i<=Object.keys(new_data.monster).length;i++)
        {
            value-=-1*
            (Math.ceil(System.char.agi/2 + Rad(System.char.agi/2)) + 
            Math.ceil(System.char.magi/2 + Rad(System.char.magi/2)));
        }
       
        var _rad_key = Object.keys(new_data.monster);
        Shuffle(_rad_key);
        while(_rad_key.length>0 && value>0)
        {
            var _value = Rad(value);
            var _row = _rad_key.pop();
    
            if(_rad_key.length==0)
            {
                new_data.monster[ _row ] -= -1*value;
            }
            else
            {
                value-=_value;
                new_data.monster[ _row ] -= -1*_value;
            }
        }

        new_data.char_update = {
            "account":System.member.account,
            "name":System.char.name,
            "time":firebase.database.ServerValue.TIMESTAMP
        }    

        new_data.spend-=-1*new_data.lv*System.area.lv_up_money;
        new_data.lv-=-1;
        new_data.expm = new_data.lv*System.area.lv_up_expm;


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
        
    
    
        var lvup_table = document.createElement("table");
        lvup_table.innerHTML = 
        "<tr><td>【地區名稱】</td><td>"+new_data.name+"</td></tr>"+
        "<tr><td>【地區等級】</td><td>"+new_data.lv+"</td></tr>" +
        "<tr><td>【探索進度】</td><td>"+new_data.exp+"/"+new_data.expm+"</td></tr>" + 
        "<tr><td>【玩家限制條件】</td><td>"+_char+"</td></tr>" + 
        "<tr><td>【怪物危險程度】</td><td>"+_monster+"</td></tr>" + 
        "<tr><td>【怪物種類數量】</td><td>"+new_data.monster_count+"</td></tr>";;
    

        var btn_ok = document.createElement("input");
        btn_ok.type = "button";
        btn_ok.value = "確定升級";
        btn_ok.addEventListener("click",function(){
            
            DB.ref("area/"+new_data.id).update(new_data);

            MenuClick(System.now_page,"open");
            DivMainClientHeight();
            return;
        });

    
        var btn_reset = document.createElement("input");
        btn_reset.type = "button";
        btn_reset.value = "取消升級";
        btn_reset.addEventListener("click",function(){

            if(confirm("取消升級?")==false) return;

            MenuClick(System.now_page,"open");
            DivMainClientHeight();
            return;
        });
        

        document.querySelector("#data_result table").style.float = "left";
        document.querySelector("#data_result").appendChild(lvup_table);

        document.querySelectorAll("td#exp").forEach(function(td){
            td.bgColor = "#ff0";
        });

        document.querySelector("#data_result").parentElement.parentElement.appendChild(btn_ok);
        document.querySelector("#data_result").parentElement.parentElement.appendChild(btn_reset);
        
        
        DivMainClientHeight();
    
        

        
    });
}


function LvUpSkillEquipment(mode,id)
{
    DB.ref("char/"+System.member.account).once("value",_data=>{
        
        System.char = _data.val();

    }).then(function(){

        new_data = JSON.parse(JSON.stringify(System.char[mode][id]));

        if(System.char.item.money<new_data.lv*System[mode].lv_up_money)
        {
            alert("升級費用不足");
            return;
        }

        System.char.item.money-= new_data.lv*System[mode].lv_up_money;
        OpenCharMenu("money");

        new_data.exp-=new_data.expm;

        if(new_data.exp<0)
        {
            alert("熟練度不足");
            return;
        }

        DB.ref("/char/"+ System.member.account).update(System.char);

        var value = 0;
        for(var i=1;i<=Object.keys(new_data.effect).length;i++)
        {
            value-=-1*Rad(6);
        }

        var _rad_key = Object.keys(new_data.effect);

        Shuffle(_rad_key);
        while(_rad_key.length>0 && value>0)
        {
            var _value = Rad(value);
            var _row = _rad_key.pop();
            
            if(_rad_key.length==0)
            {
                new_data.effect[ _row ] -= -1*value;
            }
            else
            {
                value-=_value;
                new_data.effect[ _row ] -= -1*_value;
            }
        }

        var value = 0;
        for(var i=1;i<=Object.keys(new_data.effect).length;i++)
        {
            value-=-1*Rad(6);
        }

        new_data.cost = new_data.cost||{};
        var _rad_key = Object.keys(new_data.cost);

        if(mode=="skill")
        {
            //攻擊技能升級 精神需求不上升
            if(new_data.id!=0)
            {
                _rad_key.push("need_mdef");
            }
        }
        else
            _rad_key.push("need_def");

        
        Shuffle(_rad_key);
        while(_rad_key.length>0 && value>0)
        {
            var _value = Rad(value);
            var _row = _rad_key.pop();
            
            if(_rad_key.length==0)
            {
                if(new_data.cost[ _row ]!=undefined)
                    new_data.cost[ _row ] -= -1*value;
                else
                    new_data.need[ _row.split("_")[1] ] -= -1*value;
            }
            else
            {
                value-=_value;
                if(new_data.cost[ _row ]!=undefined)
                    new_data.cost[ _row ] -= -1*_value;
                else
                    new_data.need[ _row.split("_")[1] ] -= -1*_value;
            }
        }

        new_data.char_update = {
            "account":System.member.account,
            "name":System.char.name,
            "time":firebase.database.ServerValue.TIMESTAMP
        }


        new_data.spend-=-1*new_data.lv*System[mode].lv_up_money;
        new_data.lv-=-1;
        new_data.expm = new_data.lv*System[mode].lv_up_expm;

        var _effect = "";
        for(var key in new_data.effect)
        {
            _effect += System.c_s_word[key] + "："+new_data.effect[key]+"<BR>";
        }

        var _cost = "";
        for(var key in new_data.cost)
        {
            _cost += System.c_s_word[key] + "："+new_data.cost[key]+"<BR>";
        }


        var _type = System.skill;


        var lvup_table = document.createElement("table");

        if(mode=="skill")
        {
            lvup_table.innerHTML = 
            "<tr><td colspan=2>【"+new_data.name+"】【LV"+new_data.lv+"】</td></tr>" + 
            "<tr><td colspan=2>【技能屬性】"+_type.atk[new_data.type.atk]+"</td></tr>" + 
            "<tr><td colspan=2>【技能類型】"+_type.active[new_data.type.active]+"</td></tr>" + 
            "<tr><td colspan=2 id=exp>【熟練度】"+new_data.exp+"/"+new_data.expm + "</td></tr>" + 
            "<tr><td>【增益】</td><td>"+_effect+"</td></tr>" + 
            "<tr><td>【損益】</td><td>"+_cost+"</td></tr>" + 
            "<tr><td colspan=2>【精神需求】"+new_data.need.mdef + "</td></tr>";
        }
        else
        {
            lvup_table.innerHTML = 
            "<tr><td colspan=2>【"+new_data.name+"】【LV"+new_data.lv+"】</td></tr>" + 
            "<tr><td colspan=2 id=exp>【熟練度】"+new_data.exp+"/"+new_data.expm + "</td></tr>" + 
            "<tr><td>【增益】</td><td>"+_effect+"</td></tr>" + 
            "<tr><td>【損益】</td><td>"+_cost+"</td></tr>" + 
            "<tr><td colspan=2>【耐久需求】"+new_data.need.def + "</td></tr>";
        }

        document.querySelector("#data_result table").style.float = "left";
        document.querySelector("#data_result").appendChild(lvup_table);

        document.querySelectorAll("td#exp").forEach(function(td){
            td.bgColor = "#ff0";
        });



        var btn_ok = document.createElement("input");
        btn_ok.type = "button";
        btn_ok.value = "確定升級";
        btn_ok.addEventListener("click",function(){
            
            System.char[mode][id] = new_data;

            DB.ref("/char/"+ System.member.account).update(System.char);

            MenuClick(System.now_page,"open");
            DivMainClientHeight();
            return;
        });

        var btn_reset = document.createElement("input");
        btn_reset.type = "button";
        btn_reset.value = "取消升級";
        btn_reset.addEventListener("click",function(){

            if(confirm("取消升級?")==false) return;

            MenuClick(System.now_page,"open");
            DivMainClientHeight();
            return;
        });

        document.querySelector("#data_result").parentElement.parentElement.appendChild(btn_ok);
        document.querySelector("#data_result").parentElement.parentElement.appendChild(btn_reset);
        DivMainClientHeight();


        return;
    });
}


function MonsterSkillEquipmentDiv(enemy,div,id)
{
    var _div = document.createElement("div");
    _div.className = "info";
    _div.innerHTML = "怪物裝備";
    div.appendChild(_div);

    menu = {};

    var char_equipment_div = document.createElement("div");
    var _select = document.createElement("select");
    _select.id = "char_equipment";
    for(var _id in System.char.equipment)
    {
        var _data = System.char.equipment[_id];
        _select.innerHTML += 
        "<option value="+_data.id+">"+_data.name+"</option>";
    }
    var _btn = document.createElement("input");
    _btn.type = "button";
    _btn.value = "調查怪物裝備";
    _btn.addEventListener("click",function(){

        var char_equipment = document.querySelector("select#char_equipment").value;
        char_equipment = document.querySelector("select#char_equipment option[value='"+char_equipment+"']");

        if(confirm("確定要進行此調查?\n(調查途中將會被怪物搶奪【"+char_equipment.innerHTML+"】)\n(視種族而定是否會裝備)\n(玩家將會遺失該裝備)")==false) return;


        MonsterSetSkillEquipment(enemy,System.char.equipment[char_equipment.value]);
    });
    

    char_equipment_div.appendChild(_select);
    char_equipment_div.appendChild(_btn);

    menu["char_equipment"] = {
        "type":"text",
        "span":"玩家擁有裝備",
        "html":char_equipment_div
    }

    if(Object.keys(System.char.equipment).length==0)
    {
        menu.char_equipment.html = document.createElement("span");
        menu.char_equipment.html.innerHTML = "【尚未擁有裝備】";
    }


    
    var div_list = {};
    var monster_equipment_div = document.createElement("div");
    for(var _id in enemy.equipment)
    {
        var _data = enemy.equipment[_id];

        div_list[ _data.id ] = JSON.parse(JSON.stringify(_data));

        div_list[ _data.id ].div_word = 
        _data.name+" LV"+_data.lv;

        div_list[ _data.id ].add_class = _data.use;

        var btn_use = document.createElement("input");
        btn_use.type = "button";
        btn_use.value = "使用裝備";
        if(_data.use=="use") btn_use.value="卸下裝備";
        btn_use.id = _data.id;
        btn_use.setAttribute("func","use");

        
        div_list[ _data.id ].detail_content = 
        _data.name + " LV"+_data.lv + "<hr>" +
        EffectCostNeed(_data) + "<HR>" + 
        btn_use.outerHTML;


        div_list[ _data.id ]["use_func"] = {
            "type":"click",
            "func":function(){
            UseSkillEquipmentMonster( enemy,this.id,enemy.equipment );
        }};

    }
    ListDiv(div_list,monster_equipment_div);
    div.appendChild(monster_equipment_div);
    

    RowMake(menu,div,id);

    
    var _div = document.createElement("div");
    _div.className = "info";
    _div.innerHTML = "怪物技能";
    div.appendChild(_div);

    menu = {};

    var char_skill_div = document.createElement("div");
    var _select = document.createElement("select");
    _select.id = "char_skill";
    for(var _id in System.char.skill)
    {
        if(_id==0) continue;

        var _data = System.char.skill[_id];
        _select.innerHTML += 
        "<option value="+_data.id+">"+_data.name+"</option>";
    }
    var _btn = document.createElement("input");
    _btn.type = "button";
    _btn.value = "調查怪物技能";
    _btn.addEventListener("click",function(){

        var char_skill = document.querySelector("select#char_skill").value;
        char_skill = document.querySelector("select#char_skill option[value='"+char_skill+"']");

        if(confirm("確定要進行此調查?\n(調查途中將會被怪物學習【"+char_skill.innerHTML+"】)\n(視種族而定是否學習成功)\n(玩家將會遺忘該技能)")==false) return;

        MonsterSetSkillEquipment(enemy,System.char.skill[char_skill.value]);

    });
    
    char_skill_div.appendChild(_select);
    char_skill_div.appendChild(_btn);

    menu["char_skill"] = {
        "type":"text",
        "span":"玩家擁有技能",
        "html":char_skill_div
    }
    if(Object.keys(System.char.skill).length==0)
    {
        menu.char_skill.html = document.createElement("span");
        menu.char_skill.html.innerHTML = "【尚未擁有技能】";
    }


    var div_list = {};
    var monster_skill_div = document.createElement("div");
    for(var _id in enemy.skill)
    {
        var _data = enemy.skill[_id];

        div_list[ _data.id ] = JSON.parse(JSON.stringify(_data));

        div_list[ _data.id ].div_word = 
        _data.name+" LV"+_data.lv;

        div_list[ _data.id ].add_class = _data.use;

        var btn_use = document.createElement("input");
        btn_use.type = "button";
        btn_use.value = "準備技能";
        if(_data.use=="use") btn_use.value="取消準備";
        btn_use.id = _data.id;
        btn_use.setAttribute("func","use");

        
        div_list[ _data.id ].detail_content = 
        _data.name + " LV"+_data.lv + "<hr>" +
        EffectCostNeed(_data);

        if(_data.id!=0)
        {
            div_list[ _data.id ].detail_content+="<HR>" + btn_use.outerHTML;
        }


        div_list[ _data.id ]["use_func"] = {
            "type":"click",
            "func":function(){
            UseSkillEquipmentMonster( enemy,this.id,enemy.skill );
        }};
        
    }
    ListDiv(div_list,monster_skill_div);
    div.appendChild(monster_skill_div);

    RowMake(menu,div,id);
}

function UseSkillEquipment( id,data )
{
    var _data = data[id];
    var type = "equipment";
    var use = "use";


    if(_data.type!=undefined)
    if(_data.type.atk!=undefined) type = "skill";

    if(id==0 && type=="skill")
    {
        alert("【攻擊】無法更動");
        return;
    }


    if(_data.use=="use") use = "unuse";

    System.char[type][id].use = use;

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
            alert("需求超過上限");
            use = "unuse";
        }
    }

    

    DB.ref("char/"+System.member.account+"/"+type+"/"+id+"/use").set(use);

    MenuClick(System.now_page,"open");
}




function UseSkillEquipmentMonster(enemy,id,data)
{
    var enemy_race_type = {
        "race1":{
            "equipment":1,
            "skill":4
        },
        "race2":{
            "equipment":2,
            "skill":3
        },
        "race3":{
            "equipment":3,
            "skill":2
        },
        "race4":{
            "equipment":4,
            "skill":1
        }
    };

    var _data = data[id];
    var type = "equipment";
    var use = "use";

    if(_data.type!=undefined)
    if(_data.type.atk!=undefined) type = "skill";

    if(id==0 && type=="skill")
    {
        alert("【攻擊】無法更動");
        return;
    }



    if(_data.use=="use") use = "unuse";

    enemy[type][id].use = use;

    var need = {};
    for(var key in enemy[type])
    {
        var _data = enemy[type][key];

        if(_data.use!="use") continue;

        for(var row in _data.need)
        {
            need[row] = need[row]||0;
            need[row]-=-1*_data.need[row];
        }
    }
    for(var row in need)
    {
        var _value = Math.ceil(enemy[row]/enemy_race_type[ enemy.race_type ][ type ]);


        if(_value<need[row])
        {
            alert("需求超過上限");
            use = "unuse";
        }
    }



    DB.ref("enemy/"+enemy.id+"/"+type+"/"+id+"/use").set(use);

    MenuClick(System.now_page,"open");
}
importScripts("https://www.gstatic.com/firebasejs/5.5.6/firebase.js");

//eval(atob("aW1wb3J0U2NyaXB0cygiaHR0cHM6Ly93d3cuZ3N0YXRpYy5jb20vZmlyZWJhc2Vqcy81LjUuNi9maXJlYmFzZS5qcyIpOw=="));

var DB = firebase;
var ServerTime;
//DB.initializeApp({databaseURL: "https://kfsrpg-battle-205b8-default-rtdb.firebaseio.com"});


eval(atob("REIuaW5pdGlhbGl6ZUFwcCh7ZGF0YWJhc2VVUkw6ICJodHRwczovL2tmc3JwZy1iYXR0bGUtMjA1YjgtZGVmYXVsdC1ydGRiLmZpcmViYXNlaW8uY29tIn0pOw=="));

DB = DB.database();

onmessage = function(e)
{

    var data = e.data;
    var act = data.act;
    var mode = data.mode;
    var System = data.System;

    var _db = {};

    for(var key in data)
        _db[key] = data[key];



    if(act=="ServerTime")
    {
        if(ServerTime==undefined)
        {
            DB.ref('ServerTime').set(firebase.database.ServerValue.TIMESTAMP).then(function()
            {
                DB.ref('ServerTime').once('value').then(function(data)
                {
                    ServerTime = data.val();
                    setInterval(function(){ ServerTime+=1000; },1000);
                    postMessage({"time":ServerTime});
                });
            });
        }
        else
        {
            postMessage({"time":ServerTime});
        }
    }



    if(act=="db_get")
    {
        var ref = DB.ref(_db.db_path);
        
        if(_db.orderByKey!=undefined)
        {
            ref = ref.orderByKey().startAt(_db.orderByKey).endAt(_db.orderByKey);
        }

        if(_db.orderByChild!=undefined && _db.equalTo!=undefined && 
            _db.orderByChild!="")
        {
            ref = ref.orderByChild( _db.orderByChild ).equalTo( _db.equalTo );
        }

        if(_db.limitToLast!=undefined)
        {
            ref = ref.limitToLast( _db.limitToLast );
        }

        ref.once("value",function(data)
        {
            postMessage( 
                {
                    "db_back":data.val()
                }
            );
        });
    }

    if(act=="db_set")
    {
        if(mode=="new_battle")
        {
            DB.ref(_db.db_path).orderByKey().limitToLast(1).once("value",function(last_data){

                last_data = last_data.val();
    
    
                if(last_data==null)
                {
                    _db.db_data.id = (new Date().getTime().toString().substr(1)).toString();
                }
                else
                {
                    for(var key in last_data) 
                        _db.db_data.id = (key-(-1)).toString();
                }
                
                DB.ref(_db.db_path+_db.db_data.id).set(_db.db_data);
                DB.ref("battle/"+_db.db_data.id).set(_db.db_data);
    
                postMessage( 
                    {
                        "db_back":_db.db_data
                    }
                );
            });
            return;
        }

        DB.ref(_db.db_path).set(_db.db_data);
    }

    if(act=="db_upd")
    {
        DB.ref(_db.db_path).update(_db.db_data);
    }


    if(act=="battle_act")
    {
        var attack_id = _db.attack_id;

        var enemy_calc = {},
            char_calc = {},
            c_hit = 0,
            e_hit = 0,
            c_active_word = "",
            e_active_word = "";

        var char = System.char;

        char.skill = char.skill||{};

        var skill_list = JSON.parse(JSON.stringify(char.skill));

        var skill = skill_list[ attack_id ];

        


        DB.ref(_db.db_path+char.battle_sn).once("value",function(battle){

            battle = battle.val();
            
            if(battle==null)
            {
                postMessage( 
                    {
                        "act":"battle_act",
                        "battle":battle,
                        "char":System.char
                    }
                );
                return;
            }
            
        
            var log = {"word":""};

            enemy = battle.enemy;
            enemy.skill = enemy.skill||{};

            
            

            enemy_calc = JSON.parse(JSON.stringify(enemy));
            char_calc = JSON.parse(JSON.stringify(char));


            var battle_round = Object.keys(battle.log||{}).length+1;

            log.word += "<span class=battle_log_memo id="+battle_round+">顯示數值明細</span><h4>第"+battle_round+"回合</h4><ul><li>參戰玩家：【"+char.name+" LV"+char.lv+"】</li><li>討伐目標：【"+enemy.name+" LV"+enemy.lv+"】</li></ul>";

            

            //log.word += "<hr><h4>【"+char.name+"】持續型效果</h4>";
            

            BuffDebuffStart(System,char,enemy,char_calc,enemy_calc,log);

            /*
            var char_status = {
                "1":"物攻",
                "2":"物防",
                "3":"敏捷",
                "4":"魔攻",
                "5":"魔防",
                "6":"詠唱",
            }*/

            log.word += "<hr><h4>骰子能力加成</h4>";

            DiceCalc(System,log,char,char_calc);
            

            if( enemy.hp<=0 )
            {
                postMessage( 
                    {
                        "act":"battle_act",
                        "battle":battle,
                        "char":System.char
                    }
                );
                return;
            }


            log.word += "<hr><h4>【"+System.char.name+"】預備階段</h4><ul>";

            //玩家被動技能
            var effect_cost_word = "";
            var buff_use_check;

            for(var name in skill_list)
            {
                var buff = JSON.parse(JSON.stringify(skill_list[name]));

                buff_use_check = true;

                if(buff.type.active=="buff" && buff.use=="use")
                {
                    for(var _n in buff.need)
                    {
                        if( char[_n]*1<buff.need[_n]*1 )
                        {
                            buff_use_check = false;
                        }
                    }
                    if(buff_use_check==false) continue;

                    for(var _c in buff.cost)
                    {
                        if(_c=="hp" || _c=="mp")
                        {
                            if( char[_c]*1<buff.cost[_c]*1 )
                            {
                                buff_use_check = false;
                            }
                            else
                            {
                                char[_c]-=buff.cost[_c];

                                effect_cost_word += 
                                "(【"+System.c_s_word[_c]+"】↓"+buff.cost[_c]+")";
                            }
                        }
                        else
                        {
                            char_calc[_c]-=buff.cost[_c];

                            effect_cost_word += 
                            "(【"+System.c_s_word[_c]+"】↓"+buff.cost[_c]+")";
                        }
                    }
                    if(buff_use_check==false) continue;

                    if(buff_use_check===true)
                    {
                        for(var _e in buff.effect)
                        {
                            var _value = B_V_C(char_calc[_e],buff.effect[_e]);
                            if(_e=="hp" || _e=="mp")
                            {
                                char[_e]-=-1*_value;
                                if(char[_e]>char[_e+"m"]) char[_e] = char[_e+"m"];

                                effect_cost_word += " (【"+System.c_s_word[_e]+"】↑"+_value+")";
                            }
                            else
                            {
                                char_calc[_e]-=-1*_value;

                                effect_cost_word += " (【"+System.c_s_word[_e]+"】↑"+_value+")";
                            }
                        }

                        char.skill[buff.id].exp-=-1;

                        log.word += "<li>被動【"+buff.name+" LV"+buff.lv+"】</li><li class=memo>"+effect_cost_word+"</li>";
                    }              
                }
            }



            //裝備能力加成
            var equipment_use_check;
            var equipment;
            var effect_cost_word;

            for(var key in char.equipment)
            {
                equipment_use_check = true;
                effect_cost_word = "";

                equipment = char.equipment[key];
                if(equipment.use!="use") continue;

                for(var row in equipment.need)
                {
                    if( char[row]*1 < equipment.need[row]*1 )
                    {
                        equipment_use_check = false;
                    }
                }
                if(equipment_use_check==false) continue;

                for(var row in equipment.cost)
                {
                    if(row=="hp" || row=="mp")
                    {
                        if( char[row]*1 < equipment.cost[row]*1 )
                        {
                            equipment_use_check = false;
                        }
                        else
                        {
                            char[row]-=equipment.cost[row];
                            
                            effect_cost_word += " (【"+System.c_s_word[row]+"】↓"+equipment.cost[row]+")";
                        }
                    }
                    else
                    {
                        char_calc[row]-=equipment.cost[row];

                        effect_cost_word += " (【"+System.c_s_word[row]+"】↓"+equipment.cost[row]+")";
                    }
                }
                if(equipment_use_check==false) continue;

                if(equipment_use_check==true)
                {
                    for(var row in equipment.effect)
                    {
                        var _value = B_V_C(char_calc[row],equipment.effect[row]);
                        if(row=="hp" || row=="mp")
                        {
                            char[ row ]-=-1*_value;

                            if(char[ row ]>char[ row + "m"])
                                char[ row ] = char[ row + "m"];

                            effect_cost_word += " (【"+System.c_s_word[row]+"】↑"+_value+")";

                        }
                        else
                        {
                            char_calc[ row ]-=-1*_value;

                            effect_cost_word += " (【"+System.c_s_word[row]+"】↑"+_value+")";
                        }
                    }

                    char.equipment[equipment.id].exp-=-1;

                    log.word += "<li>裝備【"+equipment.name+" LV"+equipment.lv+"】</li><li class=memo>"+effect_cost_word+"</li>";

                }
                
            }


            //主動技能 or 攻擊
            var skill_use_check = true;
            var effect_cost_word;
            if(skill.type.active==="active" && skill.use==="use")
            {
                effect_cost_word = "";

                for(var _n in skill.need)
                {
                    if( char[_n]*1<skill.need[_n]*1 )
                    {
                        skill_use_check = false;
                    }
                }

                if(skill_use_check==true)
                for(var _c in skill.cost)
                {
                    if(_c=="hp" || _c=="mp")
                    {
                        if( char[_c]*1<skill.cost[_c]*1 )
                        {
                            skill_use_check = false;
                        }
                        else
                        {
                            char[_c]-=skill.cost[_c];

                            effect_cost_word += " (【"+System.c_s_word[_c]+"】↓"+skill.cost[_c]+")";
                        }
                    }
                    else
                    {
                        char_calc[_c]-=skill.cost[_c];

                        effect_cost_word += " (【"+System.c_s_word[_c]+"】↓"+skill.cost[_c]+")";
                    }
                }

                
                if(skill_use_check===true)
                {
                    for(var _e in skill.effect)
                    {
                        var _value = B_V_C(char_calc[_e],skill.effect[_e])
                        if(_e=="hp" || _e=="mp")
                        {
                            char[_e]-=-1*_value;
                            if(char[_e]>char[_e+"m"]) char[_e] = char[_e+"m"];

                            effect_cost_word += " (【"+System.c_s_word[_e]+"】↑"+_value+")";
                        }
                        else
                        {
                            char_calc[_e]-=-1*_value;

                            effect_cost_word += " (【"+System.c_s_word[_e]+"】↑"+_value+")";
                        }
                    }

                    char.skill[skill.id].exp-=-1;

                    c_active_word = "<li>【"+char.name+"】使用【"+skill.name+"】</li><li class=memo>"+effect_cost_word+"</li>";
                }
            }
            
            var _tmp = CharBuffSet(System,skill,char,char_calc,enemy,log);

            if(_tmp!=false) log.word += _tmp;


            log.word += "</ul>";
            
            log.word += "<hr><h4>【"+enemy.name+"】預備階段</h4><ul>";


            var enemy_skill_use_check;
            var e_skill;
            var effect_cost_word;

            var enemy_active_skill = [];
            var enemy_active_buff_skill = [];

            //怪物被動技先處理
            for(var name in enemy.skill)
            {
                enemy_skill_use_check = true;
                effect_cost_word = "";

                e_skill = enemy.skill[name];

                if(e_skill.use!="use") continue;

                
                if(e_skill.type.active!="buff")
                {
                    if(e_skill.type.active=="active")
                        enemy_active_skill.push( e_skill );
                    
                    if(e_skill.type.active!="active")
                        enemy_active_buff_skill.push( e_skill );

                    continue;
                }


                for(var row in e_skill.need)
                {
                    if(enemy[row]*1<e_skill.need[row]*1)
                    {
                        enemy_skill_use_check = false;
                    }
                }
                if(enemy_skill_use_check==false) continue;

                for(var row in e_skill.cost)
                {
                    if(row=="hp" || row=="mp")
                    {
                        if(enemy[row]*1<e_skill.cost[row]*1)
                        {
                            enemy_skill_use_check = false;
                        }
                        else
                        {
                            enemy[row]-=e_skill.cost[row];

                            effect_cost_word += " (【"+System.c_s_word[row]+"】↓"+e_skill.cost[row]+")";
                        }
                    }
                    else
                    {
                        enemy_calc[row]-=e_skill.cost[row];

                        effect_cost_word += " (【"+System.c_s_word[row]+"】↓"+e_skill.cost[row]+")";
                    }
                }
                if(enemy_skill_use_check==false) continue;
                

                for(var row in e_skill.effect)
                {
                    if(row=="hp" || row=="mp")
                    {
                        enemy[row]-=-1*e_skill.effect[row];
                        if(enemy[row]>enemy[row+"m"]) enemy[row] = enemy[row+"m"];
                        
                        effect_cost_word += " (【"+System.c_s_word[row]+"】↑"+e_skill.effect[row]+")";
                    }
                    else
                    {
                        enemy_calc[row]-=-1*e_skill.effect[row];

                        effect_cost_word += " (【"+System.c_s_word[row]+"】↑"+e_skill.effect[row]+")";
                    }
                }

                enemy.skill[e_skill.id].exp-=-1;

                log.word += "<li>被動【"+e_skill.name+"】</li><li class=memo>"+effect_cost_word+"</li>";
            }
            

            //裝備能力加成
            var equipment_use_check;
            var equipment;
            var effect_cost_word;

            for(var key in enemy.equipment)
            {
                equipment_use_check = true;
                effect_cost_word = "";

                equipment = enemy.equipment[key];
                if(equipment.use!="use") continue;

                for(var row in equipment.need)
                {
                    if( enemy[row]*1 < equipment.need[row]*1 )
                    {
                        equipment_use_check = false;
                    }
                }
                if(equipment_use_check==false) continue;

                for(var row in equipment.cost)
                {
                    if(row=="hp" || row=="mp")
                    {
                        if( enemy[row]*1 < equipment.cost[row]*1 )
                        {
                            equipment_use_check = false;
                        }
                        else
                        {
                            enemy[row] -= equipment.cost[row];
    
                            effect_cost_word += " (【"+System.c_s_word[row]+"】↓"+equipment.cost[row]+")";
                        }
                    }
                    else
                    {
                        enemy_calc[row] -= equipment.cost[row];

                        effect_cost_word += " (【"+System.c_s_word[row]+"】↓"+equipment.cost[row]+")";
                    }
                    
                }
                if(equipment_use_check==false) continue;

                if(equipment_use_check==true)
                {
                    for(var row in equipment.effect)
                    {
                        if(row=="hp" || row=="mp")
                        {
                            enemy[ row ]-=-1*equipment.effect[row];

                            if(enemy[ row ]>enemy[ row + "m"])
                                enemy[ row ] = enemy[ row + "m"];

                            effect_cost_word += " (【"+System.c_s_word[row]+"】↑"+equipment.effect[row]+")";

                        }
                        else
                        {
                            enemy_calc[ row ]-=-1*equipment.effect[ row ];

                            effect_cost_word += " (【"+System.c_s_word[row]+"】↑"+equipment.effect[row]+")";
                        }
                    }

                    enemy.equipment[equipment.id].exp-=-1;

                    log.word += "<li>裝備【"+equipment.name+" LV"+equipment.lv+"】</li><li class=memo>"+effect_cost_word+"</li>";
                }
            }


            Shuffle( enemy_active_skill );
            var enemy_skill;//記錄怪物使用主動技

            //怪物主動技&攻擊 隨機選一個
            for(var i=0;i<enemy_active_skill.length;i++)
            {
                enemy_skill_use_check = true;
                effect_cost_word = "";

                e_skill = enemy.skill[ enemy_active_skill[i].id ];

                for(var row in e_skill.need)
                {
                    if(enemy[row]*1<e_skill.need[row]*1)
                    {
                        enemy_skill_use_check = false;
                    }
                }
                if(enemy_skill_use_check==false) continue;

                for(var row in e_skill.cost)
                {
                    if(row=="hp" || row=="mp")
                    {
                        if(enemy[row]*1<e_skill.cost[row]*1)
                        {
                            enemy_skill_use_check = false;
                        }
                        else
                        {
                            enemy[row]-=e_skill.cost[row];

                            effect_cost_word += " (【"+System.c_s_word[row]+"】↓"+e_skill.cost[row]+")";
                        }
                    }
                    else
                    {
                        enemy_calc[row]-=e_skill.cost[row];

                        effect_cost_word += " (【"+System.c_s_word[row]+"】↓"+e_skill.cost[row]+")";
                    }
                }
                if(enemy_skill_use_check==false) continue;
                
                for(var row in e_skill.effect)
                {
                    if(row=="hp" || row=="mp")
                    {
                        enemy[row]-=-1*e_skill.effect[row];
                        if(enemy[row]>enemy[row+"m"]) enemy[row] = enemy[row+"m"];
                        
                        effect_cost_word += " (【"+System.c_s_word[row]+"】↑"+e_skill.effect[row]+")";
                    }
                    else
                    {
                        enemy_calc[row]-=-1*e_skill.effect[row];

                        effect_cost_word += " (【"+System.c_s_word[row]+"】↑"+e_skill.effect[row]+")";
                    }
                }

                enemy.skill[e_skill.id].exp-=-1;

                e_active_word = "<li>【"+enemy.name+"】使用【"+e_skill.name+"】</li><li class=memo>"+effect_cost_word+"</li>";

                enemy_skill = e_skill;
                break;
            }

            Shuffle(enemy_active_buff_skill);
            enemy_active_buff_skill = enemy_active_buff_skill.pop();

            if(enemy_active_buff_skill!=undefined)
            EnemyBuffSet(System,enemy_active_buff_skill,enemy,enemy_calc,char,log)



            log.word += "</ul>";

            log.word+="<hr><h4>戰況</h4><ul>";


            //加成完的數值
            var c = JSON.parse(JSON.stringify(char_calc));
            var e = JSON.parse(JSON.stringify(enemy_calc));

            if(skill.type.atk=="matk")
            {
                c.atk = c.matk;
                c.agi = c.magi;
                c.hit = c.mhit;

                e.def = e.mdef;
            }
            if(enemy_skill.type.atk=="matk")
            {
                e.atk = e.matk;
                e.agi = e.magi;
                e.hit = e.mhit;

                c.def = c.mdef;
            }


            var c_word = {
                "atk":"",
                "def":"",
                "agi":""
            };
            var e_word = {
                "atk":"",
                "def":"",
                "agi":""
            };


            if(skill.type.active=="active")
            if( Atk(c.atk,e.def)==true )
            {
                c.atk = Math.floor(c.atk*1.5);
                c_word.atk = "<li>發生爆擊，攻擊1.5倍</li>";
            }

            if(enemy_skill.type.active=="active")
            if( Atk(e.atk,c.def)==true )
            {
                e.atk = Math.floor(e.atk*1.5);
                e_word.atk = "<li>發生爆擊，攻擊1.5倍</li>";
            }
            
            if( Def(c.def,e.atk)==true )
            {
                c.def = Math.floor(c.def*2);
                c_word.def = "<li>【"+char.name+"】格擋成功，防禦2倍</li>";
            }

            if( Def(e.def,c.atk)==true )
            {
                e.def = Math.floor(e.def*2);
                e_word.def = "<li>【"+enemy.name+"】格擋成功，防禦2倍</li>";
            }
            

            if( Agi(c.agi,e.hit)==true )
            {
                e.atk = "miss";
                c_word.agi = "<li>【"+char.name+"】迴避攻擊</li>";
            }

            if( Agi(e.agi,c.hit)==true )
            {
                c.atk = "miss";
                e_word.agi = "<li>【"+enemy.name+"】迴避攻擊</li>";
            }
            
            c_hit = HitCalc(c.atk,e.def);
            e_hit = HitCalc(e.atk,c.def);

            
            if(c.agi>e.agi)
            {
                if(skill.type.active=="active")
                {
                    log.word += "<li>【"+System.char.name+"】先攻</li>";
                    log.word += c_active_word;

                    log.word += c_word.atk;
                    log.word += e_word.agi;
                    log.word += e_word.def;

                    enemy.hp -= c_hit;
                    
                    log.word += "<li>【"+enemy.name+"】受到"+c_hit+"傷害。</li>";
                }


                if(enemy.hp>0)
                {
                    log.word += e_word.atk;
                    char.hp-=e_hit;

                    log.word += e_active_word;

                    log.word += c_word.agi;
                    log.word += c_word.def;

                    log.word += "<li>【"+System.char.name+"】受到"+e_hit+"傷害。</li>";

                }

            }
            else
            {
                log.word += "<li>【"+enemy.name+"】先攻</li>";
                log.word += e_active_word;
                
                log.word += e_word.atk;
                log.word += c_word.agi;
                log.word += c_word.def;

                char.hp-=e_hit;

                log.word += "<li>【"+System.char.name+"】受到"+e_hit+"傷害。</li>";

                if(char.hp>0)
                {
                    if(skill.type.active=="active")
                    {
                        log.word += "<li>【"+System.char.name+"】先攻</li>";
                        log.word += c_active_word;

                        log.word += c_word.atk;
                        log.word += e_word.agi;
                        log.word += e_word.def;

                        enemy.hp -= c_hit;

                        log.word += "<li>【"+enemy.name+"】受到"+c_hit+"傷害。<li>";
                    }
                }
            }

            log.word += "</ul>";


            log.word+="<hr><h4>結算</h4><ul>";

            log.word += "<li>【"+System.char.name+"】剩餘"+char.hp+"生命、"+char.mp+"魔力。</li>";
            log.word += "<li>【"+enemy.name+"】剩餘"+enemy.hp+"生命、"+enemy.mp+"魔力。</li>";


            char.time_last.attack = System.time+System.config.sec_config.attack_sec*1000;


            if(char.hp<=0)
            {
                log["word"] += "<li>【"+System.char.name+"】死亡，倒數追加"+ System.config.sec_config.dead_sec +"秒。生命魔力恢復全滿。</li>";

                char.time_last.attack -= -1*System.config.sec_config.dead_sec*1000;
            }


            if(enemy.hp<=0)
            {
                c_hit -= -1*enemy.hp;

                log["word"] += "<li>【"+enemy.name+"】死亡，戰鬥結束。</li>";
            }

            log.word += "</ul>";

            log.c = 
            {
                "1":c.atk,
                "2":c.def,
                "3":c.agi,
                "4":c.matk,
                "5":c.mdef,
                "6":c.magi,
            };

            log.e = 
            {
                "1":e.atk,
                "2":e.def,
                "3":e.agi,
                "4":e.matk,
                "5":e.mdef,
                "6":e.magi,
            };


            log.c_hit = c_hit;
            log.e_hit = e_hit;
            log.time = firebase.database.ServerValue.TIMESTAMP;
            

            log.char = {
                "account":System.member.account,
                "name":char.name,
                "lv":char.lv
            };
            
            battle.log = battle.log||{};
            var log_idx = Object.keys(battle.log).length;
            battle.log[ log_idx ] = log;
            battle.enemy = enemy;


           

            if(enemy.hp<=0)
            {
                DB.ref(_db.db_path+char.battle_sn).remove();

                //戰鬥結束轉移到battle
                _db.db_path = "battle/";

                
                battle.time_end = firebase.database.ServerValue.TIMESTAMP;
                battle.char_end = 
                {
                    "name":char.name,
                    "lv":char.lv,
                    "account":System.member.account
                };

                battle.log_end = {};
                var log_end = {};
                for(var key in battle.log)
                {
                    var _data = battle.log[key];

                    var _ary = {
                        "drop":{},
                        "c_hit":0,
                        "e_hit":0
                    };

                    log_end[ _data.char.account ] = 
                        log_end[ _data.char.account ]||_ary;

                    for(var _drop in battle.enemy.drop)
                    {
                        var _tmp = battle.enemy.drop[_drop];
                        var give_drop = false;

                        if(_drop!="exp")
                        {
                            var seed = [];
                            for(var x=1;x<=100;x++)
                                seed.push(x);
                    
                            Shuffle(seed);

                            if(seed.pop()<=_tmp.probability)
                            {
                                var drop_data = {"drop_enemy":{}};

                                drop_data.drop_enemy.id = battle.enemy.id;
                                drop_data.drop_enemy.name = battle.enemy.name;
                                drop_data.id = _drop;
                                drop_data.name = _tmp.name;
                                drop_data.count = 1;
                                drop_data.money = _tmp.money;
                                drop_data.type = "item";
                                drop_data.on = "on";
                                drop_data.soldcount = 0;

                                _tmp = drop_data;
                                give_drop = true;
                            }
                        }
                        else
                        {
                            give_drop = true;
                        }

                        if(give_drop==true)
                        {
                            log_end[ _data.char.account ].drop[ _drop ] = _tmp;

                            if(_drop=="exp")
                                log_end[ _data.char.account ].drop.money = _tmp;
                        }
                    }

                    log_end[ _data.char.account ].c_hit-= -1 * _data.c_hit;
                    log_end[ _data.char.account ].e_hit-= -1 * _data.e_hit;

                }
                for(var account in log_end)
                {
                    battle.log_end[ account ] = log_end[account];
                }

                char.buff[battle.id] = {};//清除該場戰鬥BUFF


                DB.ref(_db.db_path+char.battle_sn).update(battle);

                postMessage( 
                    {
                        "act":"battle_act",
                        "battle":battle,
                        "char":char
                    }
                );
                
                return;
            }


            DB.ref(_db.db_path+char.battle_sn).update(battle);

           
            postMessage( 
                {
                    "act":"battle_act",
                    "battle":battle,
                    "char":char
                }
            );
        });
    }
}

//cfg 越大於2 傷害越高
//不可等於1 會是單純攻防相減
function HitCalc(atk,def,cfg = 1.5)
{
    if(atk=="miss") return 0;

    if(atk==0) atk = 1;
    if(def==0) def = 1;

    var _r = atk - Math.floor(def/atk*atk/cfg);

    if(_r<1) _r = 1;

    return _r;
}

//cfg 參數設定 越小成功機率越大
function Atk(atk,def,cfg = 100)
{
    if(atk==0) atk = 1;
    if(def==0) def = 1;

    var _r = ((atk/def) - 1) * cfg + 1;

    return Calc(_r,cfg);
}

//cfg 參數設定 越小成功機率越大
function Def(def,atk,cfg = 50)
{
    if(atk==0) atk = 1;
    if(def==0) def = 1;

    var _r = ((def/atk) - 1) * cfg + 1;

    return Calc(_r,cfg);
}

//cfg 參數設定 越小成功機率越大
function Agi(agi,hit,cfg = 50)
{
    if(agi==0) agi = 1;
    if(hit==0) hit = 1;

    var _r = ((agi/hit) - 1) * cfg + 1;

    return Calc(_r,cfg);
}



function Calc(_r,cfg)
{
    var seed = [];
    for(var i=_r;;i++)
    {
        seed.push( Math.floor(i) );
        if( Math.floor(i)>=cfg ) break;
    }

    if(seed.length==1) seed.push(-1);

    Shuffle(seed);
    
    if(seed.pop()>=cfg) return true;

    return false;
}


function Shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
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

function Rad(number)
{
    return 1+Math.floor(Math.random()*number);
}


//BattleValueCalc
function B_V_C(org_value,add_value)
{
    return (Math.ceil(org_value * add_value / 100)>add_value) ? 
    Math.ceil(org_value * add_value / 100) : 
    add_value;
}


function BuffDebuffStart(System,char,enemy,char_calc,enemy_calc,log)
{
    char.buff = char.buff||{};
    char.debuff = char.debuff||{};
    char.buff[char.battle_sn] = char.buff[char.battle_sn]||{};
    char.debuff[char.battle_sn] = char.debuff[char.battle_sn]||{};

    enemy.buff = enemy.buff||{};
    enemy.debuff = enemy.debuff||{};
    enemy.buff = enemy.buff||{};
    enemy.debuff = enemy.debuff||{};


    if( Object.keys(char.buff[char.battle_sn]).length>0 || 
        Object.keys(char.debuff[char.battle_sn]).length>0)
        log.word += "<hr><h4>【"+char.name+"】持續型效果</h4><ul>";
    

    var effect_cost_word = "";
    for(var _id in char.buff[char.battle_sn])
    {
        var buff = char.buff[char.battle_sn][_id];
        for(var _e in buff.effect)
        {
            var _value = B_V_C(char_calc[_e],buff.effect[_e]);
            if(_e=="hp" || _e=="mp")
            {
                char[_e]-=-1*_value;
                if(char[_e]>char[_e+"m"]) char[_e] = char[_e+"m"];

                effect_cost_word += " (【"+System.c_s_word[_e]+"】↑"+_value+")";
            }
            else
            {
                char_calc[_e]-=-1*_value;

                effect_cost_word += " (【"+System.c_s_word[_e]+"】↑"+_value+")";
            }
        }

        log.word += "<li>增益【"+buff.name+" LV"+buff.lv+"】("+buff.round+"回合)</li><li class=memo>"+effect_cost_word+"</li>";

        buff.round--;

        if(buff.round==0) delete char.buff[char.battle_sn][_id];
    }

    var effect_cost_word = "";
    for(var _id in char.debuff[char.battle_sn])
    {
        var buff = char.debuff[char.battle_sn][_id];
        for(var _e in buff.effect)
        {
            var _value = B_V_C(char_calc[_e],buff.effect[_e]);
            if(_e=="hp" || _e=="mp")
            {
                char[_e]-=_value;
                if(char[_e]>char[_e+"m"]) char[_e] = char[_e+"m"];

                effect_cost_word += " (【"+System.c_s_word[_e]+"】↓"+_value+")";
            }
            else
            {
                char_calc[_e]-=_value;

                effect_cost_word += " (【"+System.c_s_word[_e]+"】↓"+_value+")";
            }
        }

        log.word += "<li>減益【"+buff.name+" LV"+buff.lv+"】("+buff.round+"回合)</li><li class=memo>"+effect_cost_word+"</li>"

        buff.round--;

        if(buff.round==0) delete char.debuff[char.battle_sn][_id];
    }

    if( Object.keys(char.buff[char.battle_sn]).length>0 || 
        Object.keys(char.debuff[char.battle_sn]).length>0)
        log.word += "</ul>";



    if( Object.keys(enemy.buff).length>0 || 
        Object.keys(enemy.debuff).length>0)
        log.word += "<hr><h4>【"+enemy.name+"】持續型效果</h4><ul>";


    var effect_cost_word = "";
    for(var _id in enemy.buff)
    {
        var buff = enemy.buff[_id];
        for(var _e in buff.effect)
        {
            var _value = B_V_C(enemy_calc[_e],buff.effect[_e]);
            if(_e=="hp" || _e=="mp")
            {
                enemy[_e]-=-1*_value;
                if(enemy[_e]>enemy[_e+"m"]) enemy[_e] = enemy[_e+"m"];

                effect_cost_word += " (【"+System.c_s_word[_e]+"】↑"+_value+")";
            }
            else
            {
                enemy_calc[_e]-=-1*_value;

                effect_cost_word += " (【"+System.c_s_word[_e]+"】↑"+_value+")";
            }
        }

        log.word += "<li>增益【"+buff.name+" LV"+buff.lv+"】("+buff.round+"回合)</li><li class=memo>"+effect_cost_word+"</li>";

        buff.round--;

        if(buff.round==0) delete enemy.buff[_id];
    }

    var effect_cost_word = "";
    for(var char_id in enemy.debuff)
    {
        for(var _id in enemy.debuff[char_id])
        {
            var buff = enemy.debuff[char_id][_id];
            for(var _e in buff.effect)
            {
                var _value = B_V_C(enemy_calc[_e],buff.effect[_e]);
                if(_e=="hp" || _e=="mp")
                {
                    enemy[_e]-=_value;
                    if(enemy[_e]>enemy[_e+"m"]) enemy[_e] = enemy[_e+"m"];

                    effect_cost_word += " (【"+System.c_s_word[_e]+"】↓"+_value+")";
                }
                else
                {
                    enemy_calc[_e]-=_value;

                    effect_cost_word += " (【"+System.c_s_word[_e]+"】↓"+_value+")";
                }
            }

            log.word += "<li>減益【"+buff.name+" LV"+buff.lv+"】("+buff.round+"回合)</li><li class=memo>"+effect_cost_word+"</li>";

            buff.round--;

            if(buff.round==0) delete enemy.debuff[char_id][_id];
        }
    }

    if( Object.keys(enemy.buff).length>0 || 
    Object.keys(enemy.debuff).length>0) log.word += "</ul>";
}



function CharBuffSet(System,skill,char,char_calc,enemy,log)
{
    if(skill.type.active!="self_buff" && skill.type.active!="enemy_debuff")
    return false;
    if(skill.use!="use") return false;


    var effect_cost_word = "";

    for(var _n in skill.need)
    {
        if( char[_n]*1<skill.need[_n]*1 )
        {
            return false;
        }
    }

    for(var _c in skill.cost)
    {
        if(_c=="hp" || _c=="mp")
        {
            if( char[_c]*1<skill.cost[_c]*1 )
            {
                return false;
            }
            else
            {
                char[_c]-=skill.cost[_c];

                effect_cost_word += " (【"+System.c_s_word[_c]+"】↓"+skill.cost[_c]+")";
            }
        }
        else
        {
            char_calc[_c]-=skill.cost[_c];

            effect_cost_word += " (【"+System.c_s_word[_c]+"】↓"+skill.cost[_c]+")";
        }
    }

    var _buff = {
        "name":skill.name,
        "lv":skill.lv,
        "effect":{},
        "round":Rad(6)
    }

    for(var _e in skill.effect)
    {
        _buff.effect[_e] = skill.effect[_e];
    }

    if(skill.type.active=="self_buff")
    {
        char.buff[char.battle_sn] = char.buff[char.battle_sn]||{};
        char.buff[char.battle_sn][skill.id] = _buff;
    }

    if(skill.type.active=="enemy_debuff")
    {
        enemy.debuff[char.id] = 
        enemy.debuff[char.id]||{};
        enemy.debuff[char.id][skill.id] = _buff;
    }


    return "<li>使用【"+skill.name+"】("+_buff.round+"回合)</li><li class=memo>"+effect_cost_word+"</li>";
}


function EnemyBuffSet(System,skill,enemy,enemy_calc,char,log)
{
    if(skill.type.active!="self_buff" && skill.type.active!="enemy_debuff")
    return false;
    if(skill.use!="use") return false;

    var effect_cost_word = "";

    for(var _n in skill.need)
    {
        if( enemy[_n]*1<skill.need[_n]*1 )
        {
            return false;
        }
    }

    for(var _c in skill.cost)
    {
        if(_c=="hp" || _c=="mp")
        {
            if( enemy[_c]*1<skill.cost[_c]*1 )
            {
                return false;
            }
            else
            {
                enemy[_c]-=skill.cost[_c];

                effect_cost_word += " (【"+System.c_s_word[_c]+"】↓"+skill.cost[_c]+")";
            }
        }
        else
        {
            enemy_calc[_c]-=skill.cost[_c];

            effect_cost_word += " (【"+System.c_s_word[_c]+"】↓"+skill.cost[_c]+")";
        }
    }

    var _buff = {
        "name":skill.name,
        "lv":skill.lv,
        "effect":{},
        "round":Rad(6)
    }

    for(var _e in skill.effect)
    {
        _buff.effect[_e] = skill.effect[_e];
    }

    if(skill.type.active=="self_buff")
    {
        enemy.buff[skill.id] = _buff;
    }

    if(skill.type.active=="enemy_debuff")
    {
        char.debuff[char.battle_sn] = 
        char.debuff[char.battle_sn]||{};
        char.debuff[char.battle_sn][skill.id] = _buff;
    }

    log.word += "<li>使用【"+skill.name+"】("+_buff.round+"回合)</li><li class=memo>"+effect_cost_word+"</li>";
}


function DiceCalc(System,log,char,char_calc)
{
    var char_status = System.member.dice_rand_six;

    var dice_select = System.dice_select;
    var row = {};
    var up_num = {};
    var number_fill = false;

    for(var i=0;i<Object.keys(dice_select).length;i++ )
    {
        if(dice_select[i]=="10") dice_select[i] = "0";
        
        var row_length = Object.keys(row).length;

        if( row_length==0 || number_fill==true)
        {
            number_fill = false;
            
            row[ row_length ] = char_status[ dice_select[i] ];
        }
        else
        {
            up_num[ row_length-1 ] = up_num[ row_length-1 ]||"";
            up_num[ row_length-1 ] += dice_select[i];

            if( up_num[ row_length-1 ].length>=2 )
                number_fill = true;
        }
    }

    log.dice_select = {};

    var seed;
    var row_name = "";

    
    if(Object.keys(row).length>0) log.word += "<ul>";

    for(var key in row)
    {
        seed = ["atk","def","agi","matk","mdef","magi","hit","mhit"];

        if(System.c_s_word[ row[key] ]==undefined) 
        {
            Shuffle(seed);
            row[key] = seed.pop();
        }

        if(up_num[key]==undefined) up_num[key] = 0;

        char_calc[ row[key] ] += Math.ceil(
            char[ row[key] ] * parseInt(up_num[key]) / 100
        );

        //log.dice_select[ row[key] ] = parseInt(up_num[key]);

        log.dice_select[ key ] = {};
        log.dice_select[ key ]["key"] = row[key];
        log.dice_select[ key ]["val"] = parseInt(up_num[key]);
        

        row_name = System.c_s_word[ row[key] ]

        if(seed.length!=8) row_name += "(隨機)";

        log.word += "<li>【"+row_name+"】↑"+up_num[key]+
        "% (↑"+Math.ceil(char[ row[key] ]*parseInt(up_num[key])/100)+")</li>";
    }

    if(Object.keys(row).length>0) log.word += "</ul>";


    log.dice = {};
    for(var key in System.member.dice)
    {
        var _value = System.member.dice[key];
        log.dice[ key ] = _value.dice+":"+_value.value;
    }
}

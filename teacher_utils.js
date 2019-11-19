'use strict'

// -------------------------------------------------------------------------------- TOOLS

var global = {
    get_studs:async function() {
        if(! await boolMaster.key_exists('studs'))
            await global.save_studs({})
        return await boolMaster.read_key('studs')
    },
    update_studs:function() {
        boolMaster.trigger_checker('studs')
    },
    save_studs:async function(studs) {
        await boolMaster.write_key('studs',studs)
    },
    create_btn:function(name, important=false) {
        let btn_JQ = $('<div>').addClass('btn')
        .html(name)
        if(important)
            btn_JQ.addClass('important')
        return btn_JQ
    },
    create_capsule:function(inline=false) {
        let capsule_JQ = $('<div>').addClass('capsule')
        if(inline)
            capsule_JQ.addClass('inline')
        return capsule_JQ
    },
    create_info:function(text) {
        let info_JQ = $('<div>').addClass('info')
        .html(text)
        return info_JQ
    },
    color: {
        blue:'#0097e6',
        red:'#e84118'
    }
}

var tools = {
    // ----------------------------------------
    'students': {
        // ----------------------------------
        inner:{
            add_stud:async function(id, fname, lname, netu=null) {
                let stud = {
                    id:id,
                    fname:fname,
                    lname:lname,
                    netu:netu
                }
                let studs = await global.get_studs()
                studs[id] = stud
                await global.save_studs(studs)
                global.update_studs()
            },
            remove_stud:async function(id) {
                let studs = await global.get_studs()
                delete studs[id]
                global.save_studs(studs)
                global.update_studs()
            },
            prompt_stud_data:function() {
                let names = prompt("prénom nom de l'étudiant")
                let sp_name = names.split(' ')
                let fname = sp_name[0]
                let lname = sp_name[1]
                return [fname,lname]
            },
            display_add_btn:function() {
                let btn = global.create_btn('ajouter',true)
                tool_panel_JQ.append(btn)
                let tthis = this
                btn.click(async function() {
                    let sp_name = tthis.prompt_stud_data()
                    let fname = sp_name[0]
                    let lname = sp_name[1]
                    let id = Math.random()+Date.now()
                    await tthis.add_stud(id, fname, lname)
                })
            },
            display_stud:function(stud, stud_panel_JQ) {
                let fullname = stud.fname+' '+stud.lname
                let name_btn = global.create_btn(fullname)
                let capsule = global.create_capsule()
                .append(name_btn)
                let del_btn = global.create_btn('supprimer')
                .css('color',global.color.red).css('float','right')
                capsule.append(del_btn)
                stud_panel_JQ.append(capsule)
                let tthis = this
                del_btn.click(function() {
                    tthis.remove_stud(stud.id)
                })
                name_btn.click(function() {
                    let sp_name = tthis.prompt_stud_data()
                    let fname = sp_name[0]
                    let lname = sp_name[1]
                    tthis.add_stud(stud.id,fname,lname)
                })
            },
            display_studs:function(studs, stud_panel_JQ) {
                for(let id in studs) {
                    let stud = studs[id]
                    this.display_stud(stud, stud_panel_JQ)
                }
            }
        },
        // ----------------------------------
        run:async function(inner) {

            inner.display_add_btn()
            let stud_panel_JQ = $('<div>')
            tool_panel_JQ.append(stud_panel_JQ)
            inner.check_id = boolMaster.register_checker('studs',function(studs) {
                stud_panel_JQ.html('')
                inner.display_studs(studs,stud_panel_JQ)
            })
        },
        // ----------------------------------
        stop:async function(inner) {
            boolMaster.unregister_checker(inner.check_id)
        }
        // ----------------------------------
    },
    'randomize': {
        inner:{
            get_rand_dist:async function() {
                let studs = await global.get_studs()
                let ret_stud = []
                let full_len = Object.keys(studs).length
                while(Object.keys(ret_stud).length < full_len) {
                    let len = Object.keys(studs).length
                    let index = parseInt(Math.random()*len)
                    let id = Object.keys(studs)[index]
                    let stud = studs[id]
                    delete studs[id]
                    ret_stud.push(stud)
                }
                return ret_stud
            }
        },
        run:function(inner) {

            let rand_btn = global.create_btn('randomize',true)
            tool_panel_JQ.append(rand_btn)

            let studs_panel = $('<div>')
            tool_panel_JQ.append(studs_panel)

            async function disp_rand() {
                studs_panel.html('')
                let studs = await inner.get_rand_dist()
                for(let id in studs) {
                    let stud = studs[id]
                    let name = stud.fname+' '+stud.lname
                    let capsule = global.create_capsule()
                    .append(global.create_btn(name))
                    studs_panel.append(capsule)
                }
                
            }
            rand_btn.click(disp_rand)
            disp_rand()
        },
        stop() {

        }
    }
    // ----------------------------------------
}

// -------------------------------------------------------------------------------- CORE

// ------------------------------------------------------------ DATA

var boolMaster = new BoolMaster('boolMaster/api.php')
var tool_bar_JQ = $('.tool_bar')
var tool_panel_JQ = $('.tool_panel')

// ------------------------------------------------------------ GX

function create_tool_btn(tool) {
    let tool_btn_JQ = $('<div>').addClass('tool_btn')
    let hover_bar = $('<div>').addClass('hover')
    let btn_name = $('<div>').addClass('name').html(tool.tool_name)

    tool_btn_JQ.append(hover_bar).append(btn_name)

    tool_btn_JQ.click(async function(){
        await launch_tool(tool)
    })

    return tool_btn_JQ
}

// ------------------------------------------------------------ CORE FEATURES

function get_current_tool() {
    let current_tool_name = localStorage.getItem('current_tool_name')
    if(current_tool_name == null)
        return null
    return tools[current_tool_name]
}

async function set_current_tool(tool) {
    let current_tool = get_current_tool()
    if(current_tool != null) {
        await stop_tool(current_tool)
        current_tool.btn_JQ.removeClass('active')
        tool_panel_JQ.html('')
    }
    localStorage.setItem('current_tool_name',tool.tool_name)
    tool.btn_JQ.addClass('active')
}

// -------------------------------

async function launch_tool(tool) {
    await set_current_tool(tool)
    await tool.run(tool.inner)
}

async function stop_tool(tool) {
    await tool.stop(tool.inner)
}

// ------------------------------------------------------------ CORE

async function main() {
    for(let tool_name in tools) {
        let tool = tools[tool_name]
        tool.tool_name = tool_name
        tool.btn_JQ = create_tool_btn(tool)
        tool_bar_JQ.append(tool.btn_JQ)
    }
    let current_tool = get_current_tool()
    if(current_tool != null)
        await launch_tool(current_tool)
}

// ---------------------------------------------------------------------- INIT

main()
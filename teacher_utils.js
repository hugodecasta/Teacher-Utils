'use strict'

// -------------------------------------------------------------------------------- TOOLS

var global = {
    get_studs:async function() {
        if(! await boolMaster.key_exists('studs'))
            await global.save_studs({})
        return await boolMaster.read_key('studs')
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
    create_panel:function(inline=false) {
        let panel_JQ = $('<div>').addClass('panel')
        if(inline)
            panel_JQ.addClass('inline')
        return panel_JQ
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
            },
            remove_stud:async function(id) {
                let studs = await global.get_studs()
                delete studs[id]
                global.save_studs(studs)
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
            display_stud:function(stud) {
                let fullname = stud.fname+' '+stud.lname
                let name_btn = global.create_btn(fullname)
                let panel = global.create_panel()
                .append(name_btn)
                let del_btn = global.create_btn('supprimer')
                .css('color',global.color.red).css('float','right')
                panel.append(del_btn)
                tool_panel_JQ.append(panel)
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
            display_studs:function(studs) {
                console.log(studs)
                for(let id in studs) {
                    let stud = studs[id]
                    this.display_stud(stud)
                }
            }
        },
        // ----------------------------------
        run:async function(inner) {

            inner.display_add_btn()
            inner.display_studs(await global.get_studs())

        },
        // ----------------------------------
        stop:async function() {
        }
        // ----------------------------------
    },
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
    await tool.stop()
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
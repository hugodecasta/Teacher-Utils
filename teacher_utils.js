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

var tools = {}

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
    let tools_name = []
    let tool_set = false
    setInterval(async function() {
        if(Object.keys(tools).length != tools_name) {
            for(let tool_name in tools) {
                if(tools_name.indexOf(tool_name) == -1) {
                    tools_name.push(tool_name)
                    let tool = tools[tool_name]
                    tool.tool_name = tool_name
                    tool.btn_JQ = create_tool_btn(tool)
                    tool_bar_JQ.append(tool.btn_JQ)
                }
            }
        }
        if(tool_set)
            return
        let current_tool = get_current_tool()
        if(current_tool != null) {
            tool_set = true
            await launch_tool(current_tool)
        }
    },500)
}

// ---------------------------------------------------------------------- INIT

main()
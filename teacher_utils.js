'use strict'

// -------------------------------------------------------------------------------- TOOLS

var global = {

    // --------------------------------------------------

    get_local:async function(name, def=null) {
        let value = localStorage.getItem(name)
        if(value == null)
            await global.set_local(name, def)
        return localStorage.getItem(name)
    },
    set_local:async function(name, value) {
        localStorage.setItem(name, value)
        if(value == null)
            localStorage.removeItem(name)
    },
    id_to_gxid:function(id) {
        let str = id
        while(str.indexOf(' ') > -1)
            str = str.replace(' ','_')
        return str
    },

    // --------------------------------------------------

    get_table:async function(key,def={}) {
        if(! await boolMaster.key_exists(key))
            await global.set_table(key, def)
        return await boolMaster.read_key(key)
    },
    set_table:async function(key, data) {
        let ret = await boolMaster.write_key(key,data)
        global.update_table(key)
        return ret
    },
    element_exists:async function(key,id) {
        let table = await global.get_table(key)
        return table.hasOwnProperty(id)
    },
    get_element:async function(table, id) {
        let found = await global.get_by_prop(table, 'id', id)
        let instance = found[id]
        return instance
    },
    get_by_prop:async function(key,prop,value) {
        let table = await global.get_table(key)
        let ret_obj = {}
        for(let id in table) {
            if(table[id][prop] == value)
                ret_obj[id] = table[id]
        }
        return ret_obj
    },
    get_one_by_prop:async function(key,prop,value,def=null) {
        let rets = await global.get_by_prop(key,prop,value)
        let instance = def
        console.log(rets)
        if(Object.keys(rets).length > 0)
            instance = rets[Object.keys(rets)[0]]
        else if(def!=null) {
            await global.set_element(key, def.id, def)
        }
        return instance
    },

    // -------------------------------------

    register_source:async function(table, my_source) {
        let source_table = await global.get_table('table_sourcing')
        if(!source_table.hasOwnProperty(my_source)) {
            source_table[my_source] = []
        }
        if(my_source == null)
            return
        if(source_table[my_source].indexOf(table) == -1)
            source_table[my_source].push(table)
        await global.set_table('table_sourcing',source_table)
    },
    find_sourcers:async function(source) {
        let source_table = await global.get_table('table_sourcing')
        if(!source_table.hasOwnProperty(source)) {
            source_table[source] = []
            await global.set_table('table_sourcing',source_table)
        }
        return source_table[source]
    },
    remove_from_source:async function(source_table, source_id) {
        let sources = await global.find_sourcers(source_table)
        for(let table of sources) {
            let linked = await global.get_by_prop(table,'@sourceid',source_id)
            let ids_to_remove = Object.keys(linked)
            for(let id of ids_to_remove)
                await global.unset_element(table,id)
        }
    },


    // -------------------------------------

    current_registers:[],

    update_table:function(table) {
        boolMaster.trigger_checker(table)
    },

    register_table_change:async function(table, callback, source_id=null) {
        let rid = await boolMaster.register_checker(table, async function() {
            if(source_id == null)
                callback(await global.get_table(table))
            else
                callback(await global.get_by_prop(table,'@sourceid',source_id))
        })
        global.current_registers.push(rid)
    },

    clear_current_registers:function() {
        for(let rid of global.current_registers) {
            boolMaster.unregister_checker(rid)
        }
    },

    // --------------------------------------------------

    set_element:async function(table, name, info={}) {
        let elements = await global.get_table(table)
        let element = {
            id:name,
            name:name
        }
        for(let prop in info)
            element[prop] = info[prop]

        elements[name] = element
        await global.set_table(table,elements)
    },

    unset_element:async function(table, id) {
        let elements = await global.get_table(table)
        delete elements[id]
        await global.set_table(table,elements)
        await global.remove_from_source(table, id)
    },

    create_table_methods:function(table,source=null,info_data=[]) {
        global.get_table(table)
        global.register_source(table,source)
        let prompt_add_meth = async function(source_id='',instance=null) {
            let name = prompt('name',instance==null?'':instance.name)
            if(name == null)
                return null
            let obj = {name:name,id:name}
            obj['source_table'] = source
            if(source != null) {
                while(! await global.element_exists(source,source_id)) {
                    source_name = prompt(source)
                    if(source_name == null)
                        return null
                    source_id = global.get_by_prop(source,'name',source_name)
                    source_id = Object.keys(source_id)[0]
                }
                obj['@sourceid'] = source_id
                obj.id = source_id+'_'+name
            }
            if(info_data.length > 0) {
                for(let prop of info_data) {
                    let filled = instance==null?'':instance[prop]
                    let value = prompt(name+': '+prop,filled)
                    if(value == null)
                        return null
                    obj[prop] = value
                }
            }
            return obj

        }
        global['prompt_add_'+table] = prompt_add_meth
    },

    // --------------------------------------------------

    // -------------------------------------------------- GX

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
        red:'#e84118',
        green:'#0f0'
    },
    create_separate_panels:function(number) {
        let panels = []
        for(let i=0;i<number;++i) {
            let panel = $('<div>').css('float','left')
            .css('width',(100/number)+'%')
            panels.push(panel)
        }
        return panels
    },

    // -------------------------------------------------- table GX

    create_instance_btn:function(table, instance, source_id=null, activate=false, callback=function(){}) {

        function main_btn() {
            let btn = global.create_btn(instance.name)
            .attr('id','btn_'+global.id_to_gxid(instance.id))
            btn.click(function() {
                callback(instance, true)
                let sub_btn = global.create_btn(instance.name)
                .addClass('close_btn')
                let alt_btn = global.create_btn('alter', true)
                let del_btn = global.create_btn('delete', true)
                .css('background',global.color.red)
                let capsule = $('<div>').append(sub_btn)
                .append(alt_btn).append(del_btn)
                btn.replaceWith(capsule)
                sub_btn.click(function() {
                    callback(instance, false)
                    capsule.replaceWith(main_btn())
                })
                del_btn.click(async function() {
                    callback(instance, false)
                    await global.unset_element(table,instance.id)
                })
                alt_btn.click(async function() {
                    let obj = await global['prompt_add_'+table](source_id,instance)
                    if(obj == null)
                        return
                    obj.id = instance.id
                    await global.set_element(table, instance.id, obj)
                })
            })
            return btn
        }
        let btn = main_btn()
        if(activate)
            btn.ready(function(){btn.click()})
        return global.create_capsule().append(btn)
    },
    create_add_btn:function(table,source_id=null) {
        let btn = global.create_btn('+ '+table,true)
        btn.click(async function() {
            let obj = await global['prompt_add_'+table](source_id)
            if(obj == null)
                return
            await global.set_element(table,obj.id, obj)
        })
        return btn
    },
    create_table_display:function(table, source_id=null, current=null, callback=function(){}) {
        let display = $('<div>')

        let add_btn = global.create_add_btn(table, source_id)
        let instance_panel = $('<div>')

        display.append(add_btn).append(instance_panel)

        global.register_table_change(table,function(instances) {
            let all_capsules = []
            instance_panel.html('')
            for(let id in instances) {
                let instance = instances[id]
                let caps = global.create_instance_btn(table, instance, source_id, current == id, function(instance, open) {
                    if(open)
                        for(let subbtn of all_capsules) {
                            let found = subbtn.find('.close_btn')
                            if(found.length > 0) {
                                found[0].click()
                            }
                        }
                    callback(instance, open, caps)
                })
                all_capsules.push(caps)
                instance_panel.append(caps)
            }
        },source_id)

        return display
    }

    // --------------------------------------------------
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
    let btn_name = $('<div>').addClass('name').html(tool.name)

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
    if(!tools.hasOwnProperty(current_tool_name)) {
        return null
    }
    return tools[current_tool_name]
}

async function set_current_tool(tool) {
    let current_tool = get_current_tool()
    if(current_tool != null) {
        await stop_tool(current_tool)
        current_tool.btn_JQ.removeClass('active')
        tool_panel_JQ.html('')
    }
    localStorage.setItem('current_tool_name',tool.name)
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

// -------------------------------

async function get_tools_file() {
    let resp = await fetch('tools.php')
    return resp.json()
}

async function load_tool(tool_file) {
    return new Promise((ok)=>{
        $.ajax({
            url: 'tools/'+tool_file,
            dataType: 'script',
            success: function(data) {
                eval(data)
                ok(tool)
            },
            async: true
        });
    })
}

// ------------------------------------------------------------ CORE

async function main() {

    let tools_file = await get_tools_file()
    for(let tool_file of tools_file) {
        let tool = await load_tool(tool_file)
        tools[tool.name] = tool
        tool.btn_JQ = create_tool_btn(tool)
        tool_bar_JQ.append(tool.btn_JQ)
    }

    let current_tool = get_current_tool()
    if(current_tool != null) {
        await launch_tool(current_tool)
    }
}

// ---------------------------------------------------------------------- INIT

main()
'use strict'

var tool = {
    // ------------------------------- DATA
    name:'Academy',
    inner:{},
    // ------------------------------- RUN
    run:async function(inner) {

        global.create_table_methods('formations')
        global.create_table_methods('UEs','formations')

        let panels = global.create_separate_panels(2)

        let form_panel = panels[0]
        let UEse_panel = panels[1]

        tool_panel_JQ.append(form_panel).append(UEse_panel)

        let current_formation = await global.get_local('current_formation')

        form_panel.html(global.create_table_display('formations',null,current_formation,async function(form, open) {
            let current_UE = await global.get_local('current_UE')
            global.set_local('current_formation',open?form.id:null)
            if(!open) {
                UEse_panel.html('')
                return
            }
            UEse_panel.html(global.create_table_display('UEs',form.id,current_UE,function(ue, open) {
                global.set_local('current_UE',open?ue.id:null)
            }))
        }))

    },
    // ------------------------------- STOP
    stop:async function(inner){
        global.clear_current_registers()
    }
}
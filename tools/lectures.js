'use strict'

var tool = {
    // ------------------------------- DATA
    name:'Lectures',
    inner:{},
    // ------------------------------- RUN
    run:async function(inner) {

        let current_ue = await global.get_local('current_UE')
        if(! await global.element_exists('UEs',current_ue)) {
            await global.set_local('current_UE',null)
            tool_panel_JQ.html(global.create_info('Aucune UE sélectionnée'))
            return
        }

        global.create_table_methods('cours','UEs',['type','description'])

        let panels = global.create_separate_panels(2)

        let cours_panel = panels[0]
        let info_panel = panels[1]

        tool_panel_JQ.append(cours_panel).append(info_panel)

        let current_cours = await global.get_local('current_cours')

        let name_current_ue = (await global.get_element('UEs',current_ue)).name

        cours_panel.append(global.create_info('UE - '+name_current_ue))
        .append(global.create_table_display('cours',current_ue,current_cours,async function(cours, open) {
            global.set_local('current_cours',open?cours.id:null)
            if(!open) {
                info_panel.html('')
                return
            }
        }))

    },
    // ------------------------------- STOP
    stop:async function(inner){
        global.clear_current_registers()
    }
}
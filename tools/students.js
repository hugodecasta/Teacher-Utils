'use strict'

var tool = {
    // ------------------------------- DATA
    name:'Students',
    inner:{},
    // ------------------------------- RUN
    run:async function(inner) {

        let current_formation = await global.get_local('current_formation')
        if(current_formation == null) {
            tool_panel_JQ.html(global.create_info('Aucune formation sélectionnée'))
            return
        }

        global.create_table_methods('promotions','formations')
        global.create_table_methods('étudiants','promotions')

        let panels = global.create_separate_panels(2)

        let promos_panel = panels[0]
        let studs_panel = panels[1]

        tool_panel_JQ.append(promos_panel).append(studs_panel)

        let current_promo = await global.get_local('current_promotion')

        promos_panel.html(global.create_table_display('promotions',current_formation,current_promo,async function(promo, open) {
            let current_stud = await global.get_local('current_stud')
            global.set_local('current_promotion',open?promo.id:null)
            if(!open) {
                studs_panel.html('')
                return
            }
            studs_panel.html(global.create_table_display('étudiants',promo.id,current_stud,function(stud, open) {
                global.set_local('current_stud',open?stud.id:null)
            }))
        }))

    },
    // ------------------------------- STOP
    stop:async function(inner){
        global.clear_current_registers()
    }
}
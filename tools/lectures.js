'use strict'

var tool = {
    // ------------------------------- DATA
    name:'Lectures',
    inner:{
        draw_cours:async function(jQ, cours, cours_caps) {

            let full_name = cours.type+' - '+cours.titre
            let desc = cours.description

            jQ.append(global.create_info(full_name).addClass('big'))
            .append('<br>')
            .append(global.create_info(desc)).append('<br>')

            let advance = await global.get_one_by_prop('cours_advances','@sourceid',cours.id)

            let last_slide = $('<textarea>').html(advance.last_slide).css('margin-left','20px')
            let notes_box = $('<textarea>').html(advance.notes).css('margin-left','20px')
            let done_box = $('<input>').attr('type','checkbox').attr('checked',advance.done?'true':null)

            let area_divs = global.create_separate_panels(2)
            jQ.append(area_divs[0]).append(area_divs[1])

            area_divs[0].append(global.create_info('Dernière information')).append('<br>')
            .append(last_slide)

            area_divs[1].append(global.create_info('Notes')).append('<br>')
            .append(notes_box)

            jQ.append(global.create_info('Terminé ?'))
            .append(done_box).append('<br><br>')

            last_slide.keyup(async function() {
                advance.last_slide = last_slide.val()
                await global.set_element('cours_advances',advance.id,advance)
            })

            notes_box.keyup(async function() {
                advance.notes = notes_box.val()
                await global.set_element('cours_advances',advance.id,advance)
            })

            done_box.click(async function() {
                let done = !advance.done
                advance.done = done
                await global.set_element('cours_advances',advance.id,advance)
                if(advance.done)
                    cours_caps.css('background',global.color.green)
                else
                    cours_caps.css('background','none')
            })

        }
    },
    // ------------------------------- RUN
    run:async function(inner) {

        let current_ue = await global.get_local('current_UE')
        if(! await global.element_exists('UEs',current_ue)) {
            await global.set_local('current_UE',null)
            tool_panel_JQ.html(global.create_info('Aucune UE sélectionnée'))
            return
        }

        global.create_table_methods('cours','UEs',['type','titre','description'])

        let panels = global.create_separate_panels(2)

        let cours_panel = panels[0]
        let info_panel = panels[1]

        tool_panel_JQ.append(cours_panel).append(info_panel)

        let current_cours = await global.get_local('current_cours')

        let name_current_ue = (await global.get_element('UEs',current_ue)).name
        
        let disp_panel = global.create_table_display('cours',current_ue,current_cours,async function(cours, open, cours_caps) {
            global.set_local('current_cours',open?cours.id:null)
            info_panel.html('')
            if(!open) {
                return
            }
            await inner.draw_cours(info_panel,cours,cours_caps)
        },
        async function(cours, cours_caps) {

            global.create_table_methods('cours_advances','cours',['done','last','description'])
            let def = {
                id:cours.id+'_advance',
                name:cours.name+' : advance',
                '@sourceid':cours.id,
                done:false,
                last_slide:'aucune information',
                notes:'pas de notes'
            }
            let advance = await global.get_one_by_prop('cours_advances','@sourceid',cours.id,def)
            if(advance.done)
                cours_caps.css('background',global.color.green)
        })

        cours_panel.append(global.create_info('UE - '+name_current_ue)).append(disp_panel)

    },
    // ------------------------------- STOP
    stop:async function(inner){
        global.clear_current_registers()
    }
}
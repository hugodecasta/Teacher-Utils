tools['students'] = {
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
}
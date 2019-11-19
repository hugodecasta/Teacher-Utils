tools['randomize'] = {
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
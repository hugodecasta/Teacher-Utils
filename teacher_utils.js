'use strict'

let boolMaster = new BoolMaster('100.115.92.201/teacherUtils/boolMaster/api.php','http')

async function main() {
    console.log('ex',await boolMaster.key_exists('caca'))
    console.log('wr',await boolMaster.write_key('caca','coco'))
    console.log('ex',await boolMaster.key_exists('caca'))
    console.log('rd',await boolMaster.read_key('caca'))
    console.log('rm',await boolMaster.key_remove('caca'))
    console.log('ex',await boolMaster.key_exists('caca'))
}

main()
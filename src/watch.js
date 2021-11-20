const { NjSuper } = require('njsuper')
const { NjFile, NjFiles } = require('njfile')


class NjWatch extends NjSuper {
    constructor(dt, objx, t) {
        super(dt, objx, t)
        this.rec = true
        this.scanned = []
        this.fls = {}

        for (const nm in this.dt) {
            const options = {construct: false}
            Object.assign(options, this.dt[nm])

            this[nm] = new NjFiles(nm, options)
            for (const i in this.dt[nm].dirs) {
                const folder = this.dt[nm].dirs[i].split('/').pop()
                this[nm].add(folder, 'dirs')
                if(!this.scanned.includes(folder)) {
                    
                    this.fls[folder] = new NjFiles(folder, {construct: false})
                    this.fls[folder].setDir(this.dt[nm].dirs[i], {entity: nm})
                    for (const l in this.dt[nm].ext) {
                        this.fls[folder].setExt(this.dt[nm].ext[l], folder, this.rec)
                    }
                    this.scanned.push(folder)
                }     
            }
        }


    }

    scan() {
        for (const i in this.fls) {
            for (const l in this.fls[i]) {
                if (this.fls[i][l] instanceof NjFile) {
                    if (this.fls[i][l].isEdited()) {
                        for (const key in this.fls[i][l].entity) {

                            this[this.fls[i][l].entity[key]].rsp(this.fls[i][l])
                        }
                    }
                    this.fls[i][l].updateTime()
                } else if (this.fls[i][l] instanceof NjFiles) {
                    for (const y in this.fls[i][l]) {
                        if (this.fls[i][l][y] instanceof NjFile) {
                            if (this.fls[i][l][y].isEdited()) {
                                for (const key in this.fls[i][l][y].entity) {
        
                                    this[this.fls[i][l][y].entity[key]].rsp(this.fls[i][l][y])
                                }
                            }
                            this.fls[i][l][y].updateTime()
                        }
                        
                    }
                    
                }
            }
        }
    }

    start() {
        this.scan()
    }
}

module.exports = { NjWatch }
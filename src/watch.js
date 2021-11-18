const { NjSuper } = require('njsuper')
const { NjFile, NjFiles } = require('njfile')


class NjWatch extends NjSuper {
    constructor(dt, objx, t) {
        super(dt, objx, t)
        this.rec = true
        this.scanned = []
        this.files = {}

        for (const nm in this.dt) {
            this[nm] = new NjFiles(nm, this.dt[nm])
            for (const i in this.dt[nm].dirs) {
                const folder = this.dt[nm].dirs[i].split('/').pop()
                this[nm].add(folder, 'dirs')
                if(!this.scanned.includes(folder)) {
                    
                    this.files[folder] = new NjFiles(folder)
                    this.files[folder].setDir(this.dt[nm].dirs[i], {entity: nm})
                    for (const l in this.dt[nm].ext) {
                        this.files[folder].setExt(this.dt[nm].ext[l], folder, this.rec)
                    }
                    this.scanned.push(folder)
                }     
            }
        }

    }

    scan() {
        for (const i in this.files) {
            for (const l in this.files[i]) {
                if (this.files[i][l] instanceof NjFile) {
                    if (this.files[i][l].isEdited()) {
                        for (const key in this.files[i][l].entity) {
                            this[this.files[i][l].entity[key]].rsp(this.files[i][l])
                        }
                    }
                    this.files[i][l].updateTime()
                }
            }
        }
    }

    start() {
        this.scan()
    }
}

module.exports = { NjWatch }
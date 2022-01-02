const { NjSuper } = require('njsuper')
const { NjFile, NjFiles } = require('njfile')
const { exec } = require('child_process')

class NjWatch extends NjSuper {
    constructor(dt, objx, t) {
        super(dt, objx, t)
        this.rec = true
        this.scanned = []
        this.fls = {}
        this.packages = require('../../../package.json')
        if (this.packages.njreload && !this.packed) {
            let cmd = ''
            for (var i in this.dt) {
                if (this.dt[i].batch) cmd = this.dt[i].batch
            }
            let packagedirs = {}
            for (var i in this.packages.njreload) {
                if (this.packages.njreload[i].includes('.js')) {
                    packagedirs[i+'_node'] =  {
                        dirs: ['./node_modules/' + i ],
                        ext: ['js'],
                        reloader: 'njreload',
                        batch: cmd,
                        name: i,
                        njwatch: this.dt,
                        script: this.packages.njreload[i],
                        response: function (rec) {
                            const scriptRun = (p, s, recur) => {
                                if (recur) {
                                    if (recur[recur[0]].length - 1 > 0) {
                                        p = '/node_modules/' + this.name
                                        s = recur[recur[0]][1]
                                        exec('cd '+process.cwd()+ p +' && node ' + s,
                                        (error, stdout, stderr) => {
                                        if (error) {
                                            console.error(`exec error: ${error}`)
                                            return
                                        }
                                        console.log('\x1b[91m%s\x1b[0m', `${p}/${s}`, `stdout: \n${stdout}`)
                                        recur[0] = recur[0] + 1
                                        if(recur[recur[0]]) this.njwatch[recur[recur[0]][0]].response(recur)
                                       })
                                    } else {
                                        exec('cd '+process.cwd()+ p +' && node ' + s,
                                        (error, stdout, stderr) => {
                                         if (error) {
                                           console.error(`exec error: ${error}`)
                                           return
                                         }
                                        console.log('\x1b[91m%s\x1b[0m', `${p}/${s}`, `stdout: \n${stdout}`)
                                        recur[0] = recur[0] + 1
                                        if(recur[recur[0]]) this.njwatch[recur[recur[0]][0]].response(recur)
                                       })
                                    }
                                } else {
                                    exec('cd '+process.cwd()+ p +' && node ' + s,
                                    (error, stdout, stderr) => {
                                        if (error) {
                                            console.error(`exec error: ${error}`)
                                            return
                                        }
                                        console.log('\x1b[91m%s\x1b[0m', `${p}/${s}`, `stdout: \n${stdout}`)
                                    })
                                }
                            }

                            if (Array.isArray(rec)) {
                                scriptRun('/node_modules/'+this.name, this.script, rec)
                            } else
                            if (this.script.includes(',')) {
                                let scripts = this.script.split(',')
                                let path = [1]
                                for (const i in scripts) {
                                    if (scripts[i].includes('.js')) {
                                        path.push([this.name+'_node', scripts[i]])
                                    } else {
                                        path.push([scripts[i].trim()+'_node'])
                                    }
                                }

                                scriptRun('', '', path)
                            } else {
                                scriptRun('/node_modules/'+this.name, this.script)
                            }

                        } }
                } else {
                    packagedirs[i+'_node'] =  {
                        dirs: ['./node_modules/' + i ],
                        ext: ['js'],
                        batch: cmd,
                        reloader: 'njreload'
                    }
                }
            }
            this.packages = packagedirs
            for (var i in this.packages) {
                if (!this.dt[i]) {
                    this.dt[i] = this.packages[i]
                }
            }
        }

        for (const nm in this.dt) {
            const options = {construct: false}
            Object.assign(options, this.dt[nm])
            const colored = '"' + nm + '"'

            console.log('\x1b[95m%s\x1b[0m', 'Started watching',  '\x1b[32m', colored, '\x1b[0m', '\x1b[95m', 'folders', '\x1b[0m')

            this[nm] = new NjFiles(nm, options)
            for (const i in this.dt[nm].dirs) {
                const colored = '"' + this.dt[nm].dirs[i] + '"'
                console.log('scanning ', colored, 'directory for changes')
                const folder = this.dt[nm].dirs[i].split('/').pop()
                this[nm].add(folder, 'dirs')
                if(!this.scanned.includes(folder)) {

                    this.fls[folder] = new NjFiles(folder, {decimal: true, recursive: true, construct: false})
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
        if (this)
        for (const i in this.fls) {
            for (const l in this.fls[i]) {
                if (this.fls[i][l] instanceof NjFile) {
                    if (this.fls[i][l].isEdited()) {
                        this.fls[i][l].updateTime()
                        for (const key in this.fls[i][l].entity) {
                            const colored = '"' + this.fls[i][l].name + '.' + this.fls[i][l].ext + '"'
                            console.log('\x1b[32m%s\x1b[0m', 'Found update on',  '\x1b[37m', colored, '\x1b[0m', '\x1b[32m', 'file.', '\x1b[0m')

                            this[this.fls[i][l].entity[key]].rsp(this.fls[i][l])
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

const { NjWatch } = require('./watch')
const net = require('net')
const { NjFile, NjFiles } = require('njfile')
const { spawn } = require('child_process')

class NjReload extends NjWatch {
    constructor(dt, objx) {
        super(dt, objx)

        for (const nm in this.dt) {
            console.log(nm)
            for (const i in this.dt[nm].dirs) {
                const folder = this.dt[nm].dirs[i].split('/').pop()
                console.log(folder)
                for (const i in this.fls[folder]) {
                    if (this.fls[folder][i] instanceof NjFiles) {

                        for (const l in this.fls[folder][i]) {
                            if ( this.fls[folder][i][l] instanceof NjFile) {
                                this.fls[folder][i][l].add([nm], 'entity')
                            }

                        }
                    } else if (this.fls[folder][i] instanceof NjFile) {
                        this.fls[folder][i].add([nm], 'entity')
                    }
                }
            }
        }


    }

    set(name, res) {
        for (const i in this.dt) {
            if(name === i) {
                if (res === 'restartServer') {
                    this[name].add(this.restartServer, 'rsp')
                } else if (res === 'jinupdate') {
                    this[name].add(this.update, 'rsp')
                } else {
                    this[name].add(this.rsp, 'rsp')
                }
            }
        }
    }

    rsp(file) {
        if (this.response) {
            this.response(file)
        } else {
            console.log('No Response have been provided')
        }
    }

    update(file) {
        if (this.response) {
            this.response(file)
        }

        const clconn = net.createConnection({
            host: this.localhost,
            port: this.port,
        }, () => {
            clconn.write('RELOAD /jinload/' + file.name + '.' + file.ext + '/' + file.editedMs + ' LOCAL/0.2')
            clconn.end()
        })
    }

    restartServer(file) {
        if (this.response) {
            this.response(file)
        }

        const windows = (batch) => {
            const bat = spawn('cmd.exe', ['/c', '@echo off | ', batch], { shell: true })

            bat.stdout.on('data', (data) => {

                data.toString()
            })

            bat.stderr.on('data', (data) => {
                console.error(data.toString())
            });

            bat.on('exit', (code) => {

                // console.log(`Child exited with code ${code}`)
            })
        }

        const clconn = net.createConnection({
            host: this.localhost,
            port: this.port,
        }, () => {
            clconn.write('RELOAD ' + file.name + '.' + file.ext + ' LOCAL/0.2')
            clconn.end()
        })

        clconn.on('data', (data) => {
            console.log('Restarting the server')
            clconn.end()
            windows(this.batch)
        })

        clconn.on('error', (err) => {
            console.log(err.code)
            if (err.code === 'ECONNREFUSED') {
                console.log('Server is down, starting...')
                setTimeout(() => {
                    windows(this.batch)
                }, 250)
            }
        })



    }

}

module.exports = { NjReload, NjWatch }

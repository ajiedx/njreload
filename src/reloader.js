const { NjWatch } = require('./watch')
const http = require('http')
const { NjFile, NjFiles } = require('njfile')
const { spawn } = require('child_process')

class NjReloader extends NjWatch {
    constructor(dt, objx) {
        super(dt, objx)

        for (const nm in this.dt) {
            for (const i in this.dt[nm].dirs) {
                const folder = this.dt[nm].dirs[i].split('/').pop()
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
                } else if (res === 'updateJs') {
                    this[name].add(this.updateJs, 'rsp')
                } else {
                    this[name].add(res, 'rsp')

                }

            }
        }
    }

    updateJs(file) {
        this.backOpt = {
            hostname: this.localhost,
            port: this.port,
            path: '/jinload',
            method: 'GET',
            headers: {
                'Content-Type': 'text/javascript',
                'jinreload': file.name + '/' + file.editedMs
            }
        }

        this.clconn = http.request(
            this.backOpt,
            (rsp) => {
                rsp.setEncoding('utf8');
                rsp.on('data', (d) => {
                    process.stdout.write(d);
                });
            })
        this.clconn.on('error', (e) => {
            console.error(e);
        });

        this.clconn.end()

    }

    restartServer(file) {
        this.backOpt = {
            hostname: this.localhost,
            port: this.port,
            path: '/s',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'watcher': 'restartServer'
            }
        }

        this.clconn = http.request(
            this.backOpt,
            (rsp) => {
                rsp.setEncoding('utf8');
                rsp.on('data', (d) => {
                    process.stdout.write(d);

                });
            })
        this.clconn.on('error', (e) => {
            console.error(e);
        });

        this.clconn.end()

        const bat = spawn('cmd.exe', ['/c', '@echo off | ', this.batch], { shell: true })

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

}

module.exports = { NjReloader, NjWatch }
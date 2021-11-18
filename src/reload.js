const { NjWatch } = require('./watch')
const http = require('http')
const { NjFile } = require('njfile')
const { spawn } = require('child_process')

class NjReload extends NjWatch {
    constructor(dt, objx) {
        super(dt, objx)
        for (const nm in this.dt) {
            for (const i in this.dt[nm].dirs) {
                const folder = this.dt[nm].dirs[i].split('/').pop()
                for (const i in this.files[folder]) {
                    if (this.files[folder][i] instanceof NjFile) {
                        this.files[folder][i].add([nm], 'entity')
                    }
                }
            }
        }

    }

    set(name, res) {
        for (const i in this.dt) {
            console.log(i)
            if(name === i) {
                if (res === 'restartServer') {
                    this[name].add(this.restartServer, 'rsp')
                } else {
                    this[name].add(res, 'rsp')

                }

            }
        }
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

        console.log(this)
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

        const bat = spawn('cmd.exe', ['/c', this.batch], { shell: true })

        bat.stdout.on('data', (data) => {
            console.log(data.toString())
        });

        bat.stderr.on('data', (data) => {
            console.error(data.toString())
        });

        bat.on('exit', (code) => {
            console.log(`Child exited with code ${code}`)
        });
    }

}

module.exports = { NjReload, NjWatch }
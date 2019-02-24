const Nucleoid = require('nucleoid')

module.exports = Nucleoid.createGene('event', {

    timeoutMode: {
        ms: 20000,
        enable: true,
        action: (base, exit, fail) => {
            base.$io.set(408, 'timeout')
            exit()
        }
    },

    catchMode: {
        enable: true,
        action: (base, exception, exit, fail) => {
            base.$error = exception.stack
            exit()
        }
    },

    uncaughtCatchMode: {
        enable: true,
        action: (base, exception, exit, fail) => {
            base.$error = exception.stack
            exit()
        }
    },

    traceBaseMode: {
        enable: true,
        action: (cloneBase, status) => {
            const used = process.memoryUsage().heapUsed / 1024 / 1024;
            status.addAttr('memoryUsage', Math.round(used * 100) / 100)
            status.addAttr('traceBase', cloneBase)
        }
    },

    initiation: {
        enable: true,
        action: (base, skill, next, exit, fail) => {
            skill.addBase('$error', '')
            if (base.$io.check()) {
                next()
            } else {
                base.$io.set(500, 'Unknown error.')
                exit()
            }
        }
    },

    elongation: {
        enable: true,
        action: (base, exit, fail) => {
            if (base.$io.isComplete()) {
                exit()
            }
        }
    },

    termination: {
        enable: true,
        action: (base, status) => {
            status.addAttr('error', base.$error)
            base.$io.set(200, status.html())
        }
    }

})

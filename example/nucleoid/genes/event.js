const Nucleoid = require('nucleoid')

module.exports = Nucleoid.createGene('event', {

    timeoutMode: {
        ms: 55000,
        enable: true,
        action: (base, exit, fail) => {
            base.$io.set(1)
            exit()
        }
    },

    catchMode: {
        enable: false,
        action: (base, exception, exit, fail) => {
            base.$io.set(2)
            exit()
        }
    },

    uncaughtCatchMode: {
        enable: true,
        action: (base, exception, exit, fail) => {
            base.$io.set(2)
            exit()
        }
    },

    traceBaseMode: {
        enable: false,
        action: (cloneBase, status) => {
            status.addAttr('traceBase', cloneBase)
        }
    },

    initiation: {
        enable: true,
        action: (base, skill, next, exit, fail) => {
            if (base.$io.check()) {
                next()
            } else {
                base.$io.set(3)
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
            if (base.$io.isError()) {
                console.error(base.$io.getMessage())
            }
        }
    }

})

module.exports = {

    timeoutMode: {
        ms: 20000,
        enable: true,
        action: (base, exit, fail) => {
            base.$io.set(408, 'timeout')
            exit()
        }
    },


    uncaughtCatchMode: {
        enable: true,
        action: (base, exception, exit, fail) => {
            base.$io.set(500, 'Unknown error.')
            exit()
        }
    },

    initiation: {
        enable: true,
        action: (base, skill, next, exit, fail) => {
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
            if (base.$io.isError()) {
                console.error(base.$io.getMessage())
            }
        }
    }

}

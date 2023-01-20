/*
const timeConstantsMillis = {
    s: 1_000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
    w: 604_800_000
}
*/
const timeConstantsMillis = {
    s: 1_000,
    get m() { return this.s * 60 },
    get h() { return this.m * 60 },
    get d() { return this.h * 24 },
    get w() { return this.d * 7 }
}

function stringToMillis(input) {
    function isPositiveInteger(str) {
        const num = Number(str)
        if (!Number.isInteger(num) || num < 0) {
            return false
        }
        return true
    }

    let millis = 0
    let tokens = input.split(' ')
    for (const token of tokens) {
        if (token.length < 2) {
            throw ('Invalid Time Format')
        }

        const suffixUnit = token.substring(token.length - 1)
        if (!(suffixUnit in timeConstantsMillis)) {
            throw ('Invalid Time Format')
        }
        const prefixNum = token.substring(0, token.length - 1)
        
        if (!suffixUnit in timeConstantsMillis || !isPositiveInteger(prefixNum)) {
            throw ('Invalid Time Format')
        }

        millis += (timeConstantsMillis[suffixUnit] * prefixNum)
    }

    return millis
}

const run = async (client, interaction) => {
    const { options } = interaction
    const input = options.getString('length')
    let millis
    try {
        millis = stringToMillis(input)
    } catch (error) {
        interaction.reply({
            content: `${error}`,
            ephemeral: true,
        })
        return
    }
    interaction.reply({
        content: `\`${input}\` is ${millis} millis`,
        ephemeral: true,
    })
}

const init = (client) => {}

module.exports = {
    name: 'timer',
    description: 'Test timer.',
    options: [{
        name: 'length',
        description: 'eg: 1w 2d 3h 4m 5s',
        type: 3, //String
        required: true
    }],
    init,
    run,
    stringToMillis
}
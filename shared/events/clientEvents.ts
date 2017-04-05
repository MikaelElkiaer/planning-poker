export let CLIENT_EVENTS = {
    user: {
        connect: 'user:connect',
        disconnect: 'user:disconnect',
        changeUserName: 'user:changeUserName',
        joinGame: 'user:joinGame',
        leaveGame: 'user:leaveGame',
        chooseCard: 'user:chooseCard'
    },
    game: {
        stateChange: 'game:stateChange',
        hostQuit: 'game:hostQuit',
        create: 'game:create'
    },
    host: {
        changeGameState: 'host:changeGameState',
        changeGameConfig: 'host:changeGameConfig'
    }
}
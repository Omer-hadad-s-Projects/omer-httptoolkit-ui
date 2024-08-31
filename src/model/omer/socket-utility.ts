export class OmerSocketUtility {
    private socket: WebSocket;

    public constructor(port: number) {
        this.socket = new WebSocket('ws://localhost:' + port.toString());
    }

    public sendSocketMessage(jsonData: string) {
        this.socket.send(jsonData);
        console.log('Noder Message sent: ' + jsonData);
    }
}
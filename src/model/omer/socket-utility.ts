export class OmerSocketUtility {
    private socket: WebSocket | null = null;
    private port: number;

    public constructor(port: number) {
        this.port = port;
        this.connect();
    }

    private connect() {
        try {
            this.socket = new WebSocket(`ws://localhost:${this.port}`);
            
            this.socket.onopen = () => {
                console.log('WebSocket connected');
            };

            this.socket.onclose = () => {
                console.log('WebSocket disconnected');
            };

            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
        } catch (error) {
            console.error('Failed to create WebSocket:', error);
        }
    }

    public sendSocketMessage(jsonData: string) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(jsonData);
            console.log('Message sent:', jsonData);
        } else {
            console.error('WebSocket not connected. Cannot send message.');
        }
    }

    public close() {
        if (this.socket) {
            this.socket.close();
        }
    }
}
export class OmerWebhookUtility {
    private baseUrl: string;
    private port: number;

    public constructor(port: number) {
        this.port = port;
        // Resolve the baseUrl at construction time, not at class definition time
        this.baseUrl = (window as any).WEBHOOK_BASE_URL || process.env.WEBHOOK_BASE_URL || 'http://localhost:45459';

        console.log('Webhook utility using baseUrl:', this.baseUrl);
    }

    public async sendSocketMessage(jsonData: string) {
        try {
            const response = await fetch(`${this.baseUrl}/toolkit_request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: jsonData
            });

            // With no-cors mode, we can't read the response, but we can check if the request was sent
            console.log('Webhook message sent:', jsonData);
            return 'sent'; // Return a simple confirmation
        } catch (error) {
            console.error('Failed to send HTTP request:', error);
            throw error;
        }
    }

    public close() {
        // No connection to close for HTTP requests
        console.log('HTTP utility closed');
    }
}
declare module 'africastalking' {
  interface SMSParams {
    to: string[];
    message: string;
    from?: string;
    username?: string;
    apiKey?: string;
  }

  interface SMSService {
    send(params: SMSParams): Promise<any>;
  }

  interface AfricasTalkingClient {
    SMS: SMSService;
  }

  interface Credentials {
    apiKey: string;
    username: string;
  }

  function AfricasTalking(credentials: Credentials): AfricasTalkingClient;
  
  export default AfricasTalking;
}

import { Observable, of } from 'rxjs';

export class Backend {

    //private host = 'localhost:9000/';
    private host = 'jonas-chat-api.azurewebsites.net/';
    protected Url = `https://${this.host}`;
    protected wsUrl = `ws://${this.host}createWSConnection`;

    constructor() {}

    protected handleError<T> (result? : T) {
      return (error: any): Observable<T> => {
        console.log(error);
        return of(result as T);
      }
    }
}

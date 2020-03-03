import { Observable, of } from 'rxjs';
import { environment } from '../environments/environment';

export class Backend {

    private host = environment.backendUrl
    protected Url = `https://${this.host}`
    protected wsUrl = `wss://${this.host}createWSConnection`

    constructor() {}

    protected handleError<T> (result? : T) {
      return (error: any): Observable<T> => {
        console.log(error)
        return of(result as T)
      }
    }
}

import { Observable, of } from 'rxjs';
import { environment } from '../environments/environment';

export class Backend {

    private host = environment.backendUrl
    private s = environment.s
    protected Url = `http${this.s}://${this.host}`
    protected wsUrl = `ws${this.s}://${this.host}createWSConnection`

    constructor() {}

    protected handleError<T> (result? : T) {
      return (error: any): Observable<T> => {
        console.log(error)
        return of(result as T)
      }
    }
}

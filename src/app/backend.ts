import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export class Backend {

    private host = 'localhost:9000/';
    protected Url = `http://${this.host}`;
    protected wsUrl = `ws://${this.host}createWSConnection`;

    constructor() {}

    protected handleError<T> (result? : T) {
      return (error: any): Observable<T> => {
        console.log(error);
        return of(result as T);
      }
    }
}

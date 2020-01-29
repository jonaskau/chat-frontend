import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export class Backend {

    protected Url = 'http://localhost:8080/'

    constructor() {}

    protected handleError<T> (result? : T) {
      return (error: any): Observable<T> => {
        console.log(error);
        return of(result as T);
      }
    }
}

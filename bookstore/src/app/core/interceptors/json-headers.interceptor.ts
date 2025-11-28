import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class JsonHeadersInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let headers = req.headers;

    if (!headers.has('Accept')) {
      headers = headers.set('Accept', 'application/json');
    }

    const isWriteMethod = req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH';
    const isFormData = req.body instanceof FormData;

    if (isWriteMethod && !isFormData && !headers.has('Content-Type')) {
      headers = headers.set('Content-Type', 'application/json');
    }

    const cloned = req.clone({ headers });
    return next.handle(cloned);
  }
}

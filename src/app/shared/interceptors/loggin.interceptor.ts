import { HttpInterceptorFn } from '@angular/common/http';

export const logginInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req);
};

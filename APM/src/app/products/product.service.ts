import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { combineLatest, Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap, map, switchMap, filter, shareReplay } from 'rxjs/operators';

import { Product } from './product';
import { ProductResponse } from './product-data';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productListUrl = 'api/productList';
  private productsUrl = 'api/products';

  // List of products
  products$ = this.http.get<ProductResponse>(this.productListUrl)
    .pipe(
      tap(response => console.log(JSON.stringify(response))),
      map(response => response.data),
      shareReplay(1),
      catchError(this.handleError)
    );

  private productSelectedSubject = new BehaviorSubject<number>(0);
  productSelectedAction$ = this.productSelectedSubject.asObservable();

  // Simple map doesn't work
  productWithMap$ = this.productSelectedAction$
    .pipe(
      map(selectedProductId =>
        this.http.get<Product>(`${this.productsUrl}/${selectedProductId}`)
          .pipe(
            tap(response => console.log(JSON.stringify(response))),
            map(p => ({ ...p, profit: p.price - p.cost }) as Product),
            catchError(this.handleError)
          )
      ));

  // Try mergeMap, switchMap, concatMap
  product$ = this.productSelectedAction$
    .pipe(
      filter(id => !!id),
      switchMap(selectedProductId =>
        this.http.get<Product>(`${this.productsUrl}/${selectedProductId}`)
          .pipe(
            tap(response => console.log(JSON.stringify(response))),
            map(p => ({ ...p, profit: p.price - p.cost }) as Product),
            catchError(this.handleError)
          )
      ));

  // Mapping of one product
  product1$ = this.http.get<Product>(`${this.productsUrl}/1`)
    .pipe(
      map(p => ({ ...p, profit: p.price - p.cost }) as Product),
      catchError(this.handleError)
    );

  constructor(private http: HttpClient) { }

  changeSelectedProduct(selectedProductId: number): void {
    this.productSelectedSubject.next(selectedProductId);
  }

  private handleError(err: any) {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.body.error}`;
    }
    console.error(err);
    return throwError(errorMessage);
  }

}

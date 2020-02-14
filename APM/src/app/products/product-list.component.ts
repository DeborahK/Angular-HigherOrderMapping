import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { BehaviorSubject, combineLatest, EMPTY } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { ProductService } from './product.service';
import { Product } from './product';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent implements OnInit {
  pageTitle = 'Product List';
  imageWidth = 50;
  imageMargin = 2;
  showImage = false;
  errorMessage = '';
  listFilter = '';

  filterSubject = new BehaviorSubject<string>('');
  filterAction$ = this.filterSubject.asObservable();

  allProducts$ = this.productService.products$
    .pipe(
      catchError(error => {
        this.errorMessage = error;
        return EMPTY;
      }));

  products$ = combineLatest([
    this.allProducts$,
    this.filterAction$])
    .pipe(
      // Retain the current filter in a string for binding
      tap(([, filter]) => this.listFilter = filter),
      // Perform the filtering
      map(([products, filter]) => this.performFilter(products, filter)),
    );

  constructor(private productService: ProductService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.filterSubject.next(this.route.snapshot.queryParamMap.get('filterBy') || '');
    this.showImage = this.route.snapshot.queryParamMap.get('showImage') === 'true';
  }

  performFilter(products: Product[], filterBy: string) {
    filterBy = filterBy.toLocaleLowerCase();
    return products.filter((product: Product) =>
      product.productName.toLocaleLowerCase().indexOf(filterBy) !== -1);
  }

  toggleImage(): void {
    this.showImage = !this.showImage;
  }

}

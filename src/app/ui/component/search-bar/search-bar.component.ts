import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { RxState } from '@rx-angular/state';
import { select } from '@rx-angular/state/selections';
import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  filter,
  fromEvent,
  map,
  merge,
  Observable,
  startWith,
  switchMap,
  take,
  withLatestFrom,
} from 'rxjs';
import { RxActionFactory } from '@rx-angular/state/actions';
import { coerceObservable } from '@rx-angular/cdk/coercing';

type UiActions = {
  searchChange: string;
  formClick: Event;
  outsideFormClick: Event;
  formSubmit: Event;
};

@Component({
  selector: 'ui-search-bar',
  template: `
    <form
      (submit)="ui.formSubmit($event)"
      #form
      class="form"
      (click)="ui.formClick($event)"
    >
      <button
        type="submit"
        class="magnifier-button"
        aria-label="Search for a movie"
      >
        <fast-svg name="search" size="1.125em"></fast-svg>
      </button>
      <input
        *rxLet="search$; let search"
        aria-label="Search Input"
        #searchInput
        [value]="search"
        (change)="ui.searchChange(searchInput.value)"
        placeholder="Search for a movie..."
        class="input"
      />
    </form>
  `,
  styleUrls: ['search-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: SearchBarComponent,
    },
    RxState,
    RxActionFactory,
  ],
})
export class SearchBarComponent implements OnInit, ControlValueAccessor {
  @ViewChild('searchInput') inputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('form') formRef!: ElementRef<HTMLFormElement>;

  ui = this.actions.create({
    /*searchChange: String,*/
    formSubmit: (e: Event): Event => {
      e.preventDefault();
      return e;
    },
  });

  @Input()
  set query(v: string | Observable<string>) {
    this.state.connect('search', coerceObservable(v) as Observable<string>);
  }

  search$ = this.state.select('search');
  @Output() searchSubmit = this.ui.formSubmit$.pipe(
    withLatestFrom(this.state.select('search')),
    map(([_, search]) => search)
  );

  private onChange = (query: string) => {};

  private readonly closedFormClick$ = this.ui.formClick$.pipe(
    withLatestFrom(this.state.select('open')),
    filter(([_, opened]) => !opened)
  );

  private outsideClick(): Observable<Event> {
    // any click on the page (we can't use the option `once:true` as we might get multiple false trigger)
    return fromEvent(this.document, 'click').pipe(
      // forward if the form did NOT triggered the click
      // means we clicked somewhere else in the page but the form
      filter((e) => !this.formRef.nativeElement.contains(e.target as any))
    );
  }

  /**
   * **🚀 Perf Tip for TBT, TTI:**
   *
   * We avoid `@HostListener('document')` as it would add an event listener on component bootstrap no matter if we need it or not.
   * This obviously will not scale.
   *
   * To avoid this we only listen to document click events after we clicked on the closed form.
   * If the needed event to close the form is received we stop listening to the document.
   *
   * This way we reduce the active event listeners to a minimum.
   */
  private readonly outsideOpenFormClick$ = this.closedFormClick$.pipe(
    switchMap(() => this.outsideClick().pipe(take(1)))
  );

  private readonly classList = this.elementRef.nativeElement.classList;

  constructor(
    private state: RxState<{ search: string; open: boolean }>,
    private actions: RxActionFactory<UiActions>,
    @Inject(ElementRef) private elementRef: ElementRef,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.state.set({ open: false });
  }

  ngOnInit() {
    this.state.hold(this.state.select('open'), this.setOpenedStyling);
    this.state.hold(this.closedFormClick$, this.focusInput);

    this.state.connect('search', this.ui.searchChange$.pipe(startWith('')));
    this.state.connect(
      'open',
      merge(this.ui.formSubmit$, this.outsideOpenFormClick$),
      () => false
    );
    this.state.connect('open', this.closedFormClick$, () => true);
    this.state.hold(this.state.$.pipe(select('search')), (search) => {
      this.onChange(search);
    });
    /*this.state.hold(this.ui.formSubmit$, () => {
      this.onChange(this.state.get('search'));
    });*/
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {}
  setDisabledState(isDisabled: boolean): void {}
  writeValue(obj: any): void {
    this.state.set({ search: obj || '' });
  }

  private readonly focusInput = () => {
    return this.inputRef.nativeElement.focus();
  };

  private readonly setOpenedStyling = (opened: boolean) => {
    opened ? this.classList.add('opened') : this.classList.remove('opened');
  };
}

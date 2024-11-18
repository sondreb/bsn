import { Routes } from '@angular/router';
import { AccountsListComponent } from './components/accounts-list.component';
import { KnownTokensComponent } from './components/known-tokens.component';
import { VolunteersComponent } from './components/volunteers.component';
import { AccountDetailsComponent } from './components/account-details.component';

export const routes: Routes = [
  { path: '', redirectTo: 'accounts', pathMatch: 'full' },
  { path: 'accounts', component: AccountsListComponent },
  { path: 'accounts/:address', component: AccountDetailsComponent },
  { path: 'tokens', component: KnownTokensComponent },
  { path: 'volunteers', component: VolunteersComponent }
];

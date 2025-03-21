import { Routes } from '@angular/router';
import { AccountsListComponent } from './components/accounts-list.component';
import { KnownTokensComponent } from './components/known-tokens.component';
import { VolunteersComponent } from './components/volunteers.component';
import { AccountDetailsComponent } from './components/account-details.component';
import { TagsComponent } from './components/tags.component';
import { TagDetailsComponent } from './components/tag-details.component';
import { ProfileEditComponent } from './components/profile-edit.component';
import { BalancesComponent } from './components/balances.component';

export const routes: Routes = [
  { path: '', redirectTo: 'accounts', pathMatch: 'full' },
  { path: 'accounts', component: AccountsListComponent },
  { path: 'accounts/:address', component: AccountDetailsComponent },
  { path: 'tokens', component: KnownTokensComponent },
  { path: 'volunteers', component: VolunteersComponent },
  { path: 'tags', component: TagsComponent },
  { path: 'tags/:name', component: TagDetailsComponent },
  { path: 'accounts/:address/edit', component: ProfileEditComponent },
  { path: 'balances', component: BalancesComponent },
];

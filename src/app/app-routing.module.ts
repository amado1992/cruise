import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NotFoundComponent } from './not-found/not-found.component';

const appRoutes: Routes = [

  { path: 'cruisebrowser', loadChildren: 'src/app/cruise-browser/administration.module#AdministrationModule'},
  { path: '', redirectTo: '/cruisebrowser/selectagency', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}

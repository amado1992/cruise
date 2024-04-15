import { Injectable } from '@angular/core';
import { NotifierService } from 'angular-notifier';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(private notifierService: NotifierService,
              public translate: TranslateService) {
  }

  correctOperation() {
    let message;
    this.translate.get('commons.correct-operation').subscribe(
      (v) => {
        message = v;
        this.notify({message: message, type: 'success'});
      }
    );
  }

  wrongOperation(error) {
    const language = this.translate.currentLang;
    const message = error[language.toUpperCase()];
    this.notify({message: message, type: 'error'});
  }

  generalMessage(type: string, message: string) {
    this.notify({message: message, type: type});
  }

  private notify(response: {message: string, type: string}) {
    if (response.type == 'success') {
      this.notifierService.show( {
        type: 'success',
        message: response.message,
      } );
    }
    else if (response.type == 'error'){
      this.notifierService.show( {
        type: 'error',
        message: response.message,
      } );
    }
    else if (response.type == 'warning'){
      this.notifierService.show( {
        type: 'warning',
        message: response.message,
      } );
    }
    else
    {
      this.notifierService.show( {
        type: 'info',
        message: response.message,
      } );
    }

  }


  public hideNewest() {
      this.notifierService.hideNewest()
    }
    public hideAll() {
      this.notifierService.hideAll()
    }
}

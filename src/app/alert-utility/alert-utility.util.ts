import { Injectable } from '@angular/core';
import {
  ActionSheetController,
  AlertController,
  ToastController,
} from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class AlertUtil {
  constructor(
    public alertController: AlertController,
    private actionSheetController: ActionSheetController,
    private toastController: ToastController
  ) {}

  async presentAlert(header: string, subtitle: string, message: string) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: header,
      subHeader: subtitle,
      message: message,
      buttons: ['OK'],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }

  async presentConfirm(header: string, subtitle: string, message: string) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: header,
      subHeader: subtitle,
      message: message,
      buttons: [
        {
          text: 'OK',
          role: 'confirmed',
        },
        {
          text: 'Cancel',
          role: 'cancel',
        },
      ],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    return role == 'confirmed';
  }

  async presentToast(toastMsg: string) {
    const toast = await this.toastController.create({
      message: toastMsg,
      duration: 2000,
    });
    toast.present();
  }

  createButtons(inputButtons: any[]) {
    let buttons = [];
    inputButtons.forEach((item) => {
      buttons.push({
        text: item.text,
        icon: item.icon,
        handler: item.handler,
      });
    });

    return buttons;
  }

  async presentActionSheet(headerText: string, buttons: any[]) {
    const actionSheet = await this.actionSheetController.create({
      header: headerText,
      cssClass: 'my-custom-class',
      buttons: this.createButtons(buttons),
    });
    await actionSheet.present();

    const { role } = await actionSheet.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }
}

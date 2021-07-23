/* eslint-disable no-underscore-dangle */
import { Component, OnInit } from '@angular/core';
import { AlertUtil } from 'src/app/alert-utility/alert-utility.util';
import { Request } from 'src/app/models/request';
import { User } from 'src/app/models/user';
import { RequestService } from 'src/app/pages/request/request.service';
import { UserService } from 'src/app/pages/login/user.service';

@Component({
    selector: 'app-view-request',
    templateUrl: './view-request.component.html'
})
export class ViewRequestComponent implements OnInit  {
    requests: Request[];
    user: User;

    constructor(
        private requestService: RequestService,
        private userService: UserService,
        private alertUtil: AlertUtil
    ){
    }

    ngOnInit(){
        this.userService.loggedInUser.subscribe(user => this.user = user);
        this.getSubmittedRequests();
    }

    getSubmittedRequests(){
        this.requestService.viewRequests('Submitted')
            .subscribe(data => this.requests = data);
    }

    requestClicked(item: Request){
        console.log(item);
        const buttons = [
            { icon: 'trash', text: 'Assign', handler: () => { this.assignRequest(item); } },
            //{ icon: 'trash', text: 'Trash Collector2', handler: () => { this.callbackFn2() } },
            { icon: 'close', text: 'Cancel', handler: () => {  } }
        ];
        this.alertUtil.presentActionSheet(null, buttons);
    }

    assignRequest(request: Request){
        this.requestService.requestStatusList().toPromise().then(data => {
            request.requestStatus = data.find(x => x.desc === 'Processing');
            request.assignedTo = this.user._id;
            this.requestService.updateRequest(request)
                    .subscribe({
                        complete: () => {
                            this.alertUtil.presentToast('You has been assigned');
                            this.getSubmittedRequests();
                        },
                        error: (err) => { this.alertUtil.presentAlert('Error','An error occurred',`Error details: ${JSON.stringify(err)}`);}
                    });
        });
    }
}

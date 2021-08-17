import { Location } from './location';
import { User } from './user';

export class Request {
    _id: string;
    requestId: string;
    submittedBy: User;
    submittedOn: Date;
    requester: string;
    location: Location;
    contact: string;
    requestStatus: RequestStatus;
    assignedTo: User;
    updatedBy: User;
    updatedOn: Date;
    followUpRequired: boolean;
    distance: number;
}

export class RequestStatus {
    _id: string;
    desc: string;
}

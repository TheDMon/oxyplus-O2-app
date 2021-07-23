import { Address } from './address';
import { User } from './user';

export class Request {
    _id: string;
    submittedBy: User;
    requester: string;
    location: Address;
    contact: string;
    requestStatus: RequestStatus;
    assignedTo: string;
    updatedBy: User;
    followUpRequired: boolean;
    distance: number;
}

export class RequestStatus {
    _id: string;
    desc: string;
}

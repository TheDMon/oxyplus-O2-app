import { Location } from './location';
import { Role } from './role';
import { SubscriptionDetails } from './subscription-details';

export class User {
    _id: string;
    email: string;
    name: string;
    mobile: string;
    location: Location;
    role: Role;
    quantity: number;
    distance: number;
    subscriptionDetails: SubscriptionDetails;
}

import { Address } from './address';
import { Role } from './role';

export class User {
    _id: string;
    email: string;
    name: string;
    mobile: string;
    address: Address;
    role: Role;
    quantity: number;
    distance: number;
}

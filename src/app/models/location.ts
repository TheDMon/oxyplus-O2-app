export class Coordinate {
  lat: number;
  lng: number;
}

export class Location {
  position: Coordinate;
  address: string;
  addressComponent: AddressComponent;
}

export class AddressComponent {
  streetNumber: string;
  addressLine1: string;
  addressLine2: string;
  locality: string;
  city: string;
  district: string;
  state: string;
  country: string;
  pincode: number;
}

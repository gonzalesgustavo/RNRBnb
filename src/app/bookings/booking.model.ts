import { User } from "./user.model";
import { Place } from "../places/places.model";

export class Booking {
  constructor(
    public id: string,
    public accommodations: string,
    public guestNumber: number,
    public userId: string,
    public stay: object,
    public user: User,
    public place: Place
  ) {}
}

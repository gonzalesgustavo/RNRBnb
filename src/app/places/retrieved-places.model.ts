export class RetrievedPlaces {
  constructor(
    public userId: string,
    public id: string,
    public title: string,
    public description: string,
    public image: string,
    public price: number,
    public roomsAvailable: number,
    public availableFrom: Date,
    public availableTo: Date
  ) {}
}
